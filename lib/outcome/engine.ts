/**
 * MangoOS V14.3 — Production Outcome Engine
 *
 * Pipeline: normalize→infer→search→parse→template→generate→quality→repair→persist→export
 * V14.3 adds: real source search, material parsing, targeted quality repair, artifact→actions bridge
 */
import type { Artifact, ArtifactInput } from "@/lib/artifact/types";
import { createArtifactFromInput, saveArtifact } from "@/lib/artifact/artifact-store";
import { evaluateArtifactQuality, qualityGate, generateFallbackArtifact } from "@/lib/artifact/quality-gate";
import { TASK_TEMPLATES, inferTaskType } from "./templates";
import { resolveIdentityContext, identityContextToPrompt, type IdentityContext } from "./identity-context";
import { searchSources } from "./source-adapter";
import { parseMaterials, materialContextToPrompt, type MaterialContext } from "./material-parser";
import type { PlanTier } from "@/lib/plan/types";

// ── Pipeline stages ───────────────────────────────────────────

export interface PipelineStage {
  name: string;
  status: "pending" | "running" | "done" | "failed";
  startedAt?: string;
  completedAt?: string;
  details?: string;
}

export interface OutcomeResult {
  artifact: Artifact;
  stages: PipelineStage[];
  qualityPassed: boolean;
  retriesUsed: number;
  message: string;
}

// ── Build system prompt from template + identity ────────────────

function buildSystemPrompt(
  templateType: string,
  identity: IdentityContext,
  input: ArtifactInput,
  materialContext?: MaterialContext | null,
  sources?: Artifact["sources"],
): string {
  const template = TASK_TEMPLATES[templateType as keyof typeof TASK_TEMPLATES];
  if (!template) throw new Error(`Unknown template: ${templateType}`);

  const sections = template.requiredSections
    .map(s => `### ${s.title}\n${s.description}（最少 ${s.minLength} 字）`)
    .join("\n\n");

  const identityPrompt = identityContextToPrompt(identity);
  const materialPrompt = materialContext ? materialContextToPrompt(materialContext) : "";
  const sourcePrompt = sources?.length
    ? `\n## 搜索到的参考来源\n${sources.map(s => `- [${s.title}](${s.url ?? ""}) — ${s.platform} (${s.reliability})`).join("\n")}\n\n请参考以上来源增强内容可信度。标注来源时使用 [来源: 平台名] 格式。`
    : "";

  return `${template.systemPromptIntro}

## 学习者背景
${identityPrompt}

## 用户输入
${input.prompt}
${input.course ? `\n课程：${input.course}` : ""}
${input.school ? `\n学校：${input.school}` : ""}
${sourcePrompt}
${materialPrompt}

## 必须包含的章节
${sections}

## 输出格式
请以 Markdown 格式输出。每个章节使用 ## 标题。必须包含所有上述章节。
在末尾添加一个 "📋 元数据" 章节，包含你的质量自评（1-10 分）和一个一句话总结。

## 重要要求
- 不要使用 lorem ipsum 或占位文本
- 所有内容必须是可实际使用的真实学习内容
- 例题必须完整（题目 + 解答）
- 练习必须有明确步骤
- 如果信息不足，请标注"建议补充以下资料：..."
- 如果搜索到了来源，请在相关内容处标注 [来源: 平台名]`
}

// ── Parse AI response into artifact sections ───────────────────

function parseResponseToSections(
  content: string,
  templateType: string,
): Array<{ id: string; title: string; content: string; order: number; importance: "critical" | "high" | "medium" | "reference" }> {
  const template = TASK_TEMPLATES[templateType as keyof typeof TASK_TEMPLATES];
  const sections: Array<{ id: string; title: string; content: string; order: number; importance: "critical" | "high" | "medium" | "reference" }> = [];

  // Split by ## headings
  const parts = content.split(/(?=^## )/m);
  let order = 0;

  for (const part of parts) {
    const headerMatch = part.match(/^##\s*(.+)/m);
    const title = headerMatch ? headerMatch[1].trim() : `Section ${order + 1}`;
    const body = part.replace(/^##\s*.+\n?/m, "").trim();

    if (body.length < 20) continue; // skip empty sections

    // Match to template section
    const templateSection = template?.requiredSections.find(
      s => title.includes(s.title.replace(/^[📋🧠🎯📝📐⚠️📅✏️📦📑🔑📖🔬💭💡📂🔗❓🕳️🔄🔍📊🗣️🏗️🎙️🎤💪🎨🌳🗺️🏊📋🔧💡📖📝]/g, "").trim().slice(0, 4))
    );

    sections.push({
      id: `sec_${order}`,
      title,
      content: body,
      order,
      importance: templateSection?.importance ?? "medium",
    });
    order++;
  }

  return sections;
}

// ── Main pipeline ──────────────────────────────────────────────

export async function runOutcomePipeline(
  input: ArtifactInput,
): Promise<OutcomeResult> {
  const stages: PipelineStage[] = [];
  let retries = 0;
  const maxRetries = 2;

  // Stage 1: Normalize + Infer
  stages.push({ name: "normalize", status: "running", startedAt: new Date().toISOString() });
  const taskType = inferTaskType(input.prompt);
  input.type = taskType;
  stages[0].status = "done";
  stages[0].completedAt = new Date().toISOString();
  stages[0].details = `Detected type: ${taskType}`;

  // Stage 1b: Source search (V14.3 — real web retrieval)
  stages.push({ name: "search", status: "running", startedAt: new Date().toISOString() });
  let sources: Artifact["sources"] = [];
  const isPro = input.planTier === "pro" || input.planTier === "admin";
  try {
    const searchResult = await searchSources({
      query: input.prompt.slice(0, 200),
      maxResults: isPro ? 8 : 4,
      platforms: isPro ? ["wikipedia", "duckduckgo", "dictionary"] : ["wikipedia", "duckduckgo"],
    });
    sources = searchResult.sources;
    stages[1].status = "done";
    stages[1].details = `${sources.length} sources from ${searchResult.searchedPlatforms.join(", ")} · ${searchResult.elapsedMs}ms`;
  } catch {
    stages[1].status = "done";
    stages[1].details = "Source search skipped (network unavailable)";
  }
  stages[1].completedAt = new Date().toISOString();

  // Stage 1c: Material parsing (V14.3)
  stages.push({ name: "parse", status: "running", startedAt: new Date().toISOString() });
  let materialContext: MaterialContext | null = null;
  if (input.files?.length) {
    materialContext = parseMaterials(input.files);
    stages[2].details = `${materialContext.materials.length} files · ${materialContext.totalLength} chars`;
  } else {
    stages[2].details = "No files attached";
  }
  stages[2].status = "done";
  stages[2].completedAt = new Date().toISOString();

  // Stage 2: Select template + resolve identity
  stages.push({ name: "template", status: "running", startedAt: new Date().toISOString() });
  const template = TASK_TEMPLATES[taskType];
  const identity = resolveIdentityContext(input.identityContext, input.planTier);
  const systemPrompt = buildSystemPrompt(taskType, identity, input, materialContext, sources);
  stages[3].status = "done";
  stages[3].completedAt = new Date().toISOString();
  stages[3].details = `Template: ${template.label} · Identity: ${identity.name}`;

  // Stage 3: Generate artifact
  stages.push({ name: "generate", status: "running", startedAt: new Date().toISOString() });
  const artifact = createArtifactFromInput(input);
  artifact.type = taskType;
  artifact.title = input.prompt.slice(0, 80);
  artifact.identityContext = identity.name;

  let content = "";
  let generationOk = false;

  try {
    const aiResponse = await callAI(systemPrompt, input.prompt, input.planTier);
    content = aiResponse;
    generationOk = true;
  } catch {
    // AI failed — will use fallback after retries
    content = "";
  }

  if (!generationOk || content.length < 200) {
    // Stage 3a: Retry
    while (retries < maxRetries && (!generationOk || content.length < 200)) {
      retries++;
      stages[2].details = `Retry ${retries}/${maxRetries}`;
      try {
        const retryResponse = await callAI(systemPrompt, input.prompt, input.planTier);
        if (retryResponse.length >= 200) {
          content = retryResponse;
          generationOk = true;
          break;
        }
      } catch {}
    }

    // Stage 3b: Fallback if all retries exhausted
    if (!generationOk || content.length < 200) {
      const fallback = generateFallbackArtifact(input.prompt, template.label, input.prompt);
      artifact.title = fallback.title!;
      artifact.summary = fallback.summary!;
      artifact.content = fallback.content!;
      artifact.sections = fallback.sections!;
      artifact.status = "draft";
      artifact.generationTrace = {
        startedAt: stages[0].startedAt!,
        completedAt: new Date().toISOString(),
        durationMs: 0,
        model: "fallback",
        intent: taskType,
        template: template.label,
        retries,
        fallbackUsed: true,
      };

      stages[2].status = "done";
      stages[2].details = `Fallback used after ${retries} retries`;

      // Save fallback artifact
      await saveArtifact(artifact);

      return {
        artifact,
        stages,
        qualityPassed: false,
        retriesUsed: retries,
        message: "AI 服务暂时不可用，已生成离线备用学习框架。功能完整，可编辑和导出。",
      };
    }
  }

  // Parse content into sections
  const sections = parseResponseToSections(content, taskType);
  artifact.content = content;
  artifact.sections = sections;
  artifact.summary = sections[0]?.content?.slice(0, 200) ?? content.slice(0, 200);
  artifact.status = "complete";
  artifact.generationTrace = {
    startedAt: stages[0].startedAt!,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - new Date(stages[0].startedAt!).getTime(),
    model: "deepseek",
    intent: taskType,
    template: template.label,
    retries,
    fallbackUsed: false,
  };

  stages[2].status = "done";
  stages[2].completedAt = new Date().toISOString();
  stages[2].details = `${sections.length} sections · ${content.length} chars`;

  // Stage 4: Quality review
  stages.push({ name: "quality", status: "running", startedAt: new Date().toISOString() });
  const gate = qualityGate(artifact);
  artifact.qualityBreakdown = gate.score;
  artifact.qualityScore = gate.score.total;
  stages[3].status = "done";
  stages[3].completedAt = new Date().toISOString();

  if (!gate.passed && retries < maxRetries) {
    // Stage 4b: Targeted repair — retry with specific fix instructions
    stages[4].status = "running";
    stages[4].details = `Repairing: ${gate.failures.join(", ")}`;
    const repairPrompt = `${systemPrompt}\n\n## ⚠️ 质量未达标，重新生成\n以下维度需要改进：\n${gate.failures.map(f => `- ${f}`).join("\n")}\n\n请针对以上不足重新生成完整内容。`;
    try {
      const repairedResponse = await callAI(repairPrompt, input.prompt, input.planTier);
      if (repairedResponse.length >= 500) {
        const repairedSections = parseResponseToSections(repairedResponse, taskType);
        artifact.content = repairedResponse;
        artifact.sections = repairedSections;
        const reGate = qualityGate(artifact, retries + 1);
        artifact.qualityBreakdown = reGate.score;
        artifact.qualityScore = reGate.score.total;
        stages[4].details = `Repaired · Score ${reGate.score.total}/100`;
        retries++;
      }
    } catch { /* repair failed, keep original */ }
    stages[4].status = "done";
    stages[4].completedAt = new Date().toISOString();
  } else if (!gate.passed) {
    stages[4].details = `Score ${gate.score.total}/100 · Failed after retries: ${gate.failures.join(", ")}`;
    artifact.status = "reviewed";
  } else {
    stages[4].details = `Score ${gate.score.total}/100 · Passed`;
  }

  // Inject sources into artifact
  artifact.sources = sources;

  // Stage 5: Persist
  stages.push({ name: "persist", status: "running", startedAt: new Date().toISOString() });
  await saveArtifact(artifact);
  stages[4].status = "done";
  stages[4].completedAt = new Date().toISOString();
  stages[4].details = `Saved · ID: ${artifact.id}`;

  // Stage 6: Export ready
  stages.push({ name: "export", status: "done", startedAt: new Date().toISOString(), completedAt: new Date().toISOString() });
  stages[5].details = `Formats: ${template.exportDefaults.join(", ")}`;

  return {
    artifact,
    stages,
    qualityPassed: gate.passed,
    retriesUsed: retries,
    message: gate.passed
      ? `生成完成 · 质量评分 ${gate.score.total}/100`
      : `生成完成 · 质量评分 ${gate.score.total}/100（未达 75 分阈值，建议查看后手动优化）`,
  };
}

// ── AI Call ────────────────────────────────────────────────────

async function callAI(
  systemPrompt: string,
  userPrompt: string,
  planTier: PlanTier,
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || process.env.AI_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_AI_BASE_URL || process.env.AI_BASE_URL || "https://api.deepseek.com";
  const model = process.env.NEXT_PUBLIC_AI_MODEL || process.env.AI_MODEL || "deepseek-chat";

  // Client-side path: use /api/ai/generate proxy
  if (typeof window !== "undefined") {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "artifact", systemPrompt, input: userPrompt, planTier }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.content ?? data.text ?? "";
  }

  // Server-side path: direct API call
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: planTier === "pro" || planTier === "admin" ? 8192 : 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
