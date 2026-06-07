// POST /api/agent/execute — Agent execution with Pro Research Pipeline
// V14.5: Pro users go through mandatory research pipeline.
// Standard users keep lightweight generation.
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { guard, guardQuota } from "@/lib/plan/guard";
import { recordQuotaUse } from "@/lib/quota/quota";
import { detectTaskType, generateArtifact } from "@/lib/agent/generators";
import type { AgentArtifact } from "@/lib/agent/artifact-types";
import type { AgentToolName } from "@/lib/agent/types";
import {
  generateResearchQueries, rankSources, buildEvidenceMap,
  compileOutcomeStructure, proContentQualityGate,
  type ProPipelineResult, type PipelineStageStatus,
} from "@/lib/agent/research-pipeline";
import { collectSources } from "@/lib/agent/source-collector";
// System prompt builder is used inline below

export const runtime = "nodejs";
export const maxDuration = 120;

interface ExecuteRequest {
  intent: string;
  files?: Array<{ name: string; text: string }>;
  forceResearch?: boolean;   // user override: force research even if Standard
  noResearch?: boolean;      // user override: skip research even if Pro
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth + Plan + Quota ──
    const session = await resolveSession(req);
    const blocked = guard({ plan: session.plan }, "canUseMangoAgent");
    if (blocked) return blocked;

    const quotaResult = recordQuotaUse(session.userId ?? "guest", "agentTasks", session.plan);
    if (!quotaResult.allowed) {
      return guardQuota({ plan: session.plan }, "maxDailyAgentTasks", quotaResult.current)!;
    }

    const { intent, files, forceResearch, noResearch } = (await req.json()) as ExecuteRequest;
    if (!intent?.trim()) {
      return NextResponse.json({ error: "Intent is required" }, { status: 400 });
    }

    const isPro = session.plan === "pro" || session.plan === "admin";
    const shouldResearch = (isPro && !noResearch) || forceResearch;
    const taskType = detectTaskType(intent);
    const taskId = `artifact-${Date.now()}`;

    const allStages: PipelineStageStatus[] = [];

    // ── PRO PATH: Research-first pipeline ───────────────────────
    if (shouldResearch) {
      // Stage 1: Intent detection
      allStages.push({
        name: "query_gen", label: "分析任务意图", status: "running",
        detail: `识别任务类型: ${taskType} · 拆解搜索方向...`,
        startedAt: new Date().toISOString(),
      });

      const queries = generateResearchQueries(intent.trim(), taskType);
      allStages[0].status = "done";
      allStages[0].completedAt = new Date().toISOString();
      allStages[0].detail = `生成 ${queries.length} 个搜索方向 · 类型: ${taskType}`;

      // Stage 2: Web research
      allStages.push({
        name: "search", label: "联网搜索资料", status: "running",
        detail: "正在搜索 Wikipedia、DuckDuckGo...",
        startedAt: new Date().toISOString(),
      });

      const collectorResult = await collectSources(queries, isPro);
      allStages.push(...collectorResult.stages.slice(1)); // merge collector stages
      const rawSources = collectorResult.sources;

      // Stage 3: Source filtering + ranking
      allStages.push({
        name: "filter", label: "筛选高质量来源", status: "running",
        detail: `初步获取 ${collectorResult.totalFound} 条来源，正在筛选...`,
        startedAt: new Date().toISOString(),
      });

      const rankedSources = rankSources(rawSources, intent);
      allStages[allStages.length - 1].status = "done";
      allStages[allStages.length - 1].completedAt = new Date().toISOString();
      allStages[allStages.length - 1].detail = `保留 ${rankedSources.length} 条高质量来源（≥30分）`;

      // Stage 4: Evidence map
      allStages.push({
        name: "evidence", label: "构建知识证据", status: "running",
        detail: "提取概念、数据、案例...",
        startedAt: new Date().toISOString(),
      });

      const evidenceMap = buildEvidenceMap(rankedSources, intent);
      allStages[allStages.length - 1].status = "done";
      allStages[allStages.length - 1].completedAt = new Date().toISOString();
      allStages[allStages.length - 1].detail = `${evidenceMap.length} 条结构化证据`;

      // Stage 5: Structure
      allStages.push({
        name: "structure", label: "生成内容结构", status: "running",
        detail: "构建章节框架...",
        startedAt: new Date().toISOString(),
      });

      const structure = compileOutcomeStructure(intent, taskType, evidenceMap, rankedSources);
      allStages[allStages.length - 1].status = "done";
      allStages[allStages.length - 1].completedAt = new Date().toISOString();
      allStages[allStages.length - 1].detail = `${structure.sections.length} 个章节 · ${evidenceMap.length} 条证据支撑`;

      // Stage 6: Generate with research context
      allStages.push({
        name: "generate", label: "生成最终成品", status: "running",
        detail: "基于研究资料生成高质量内容...",
        startedAt: new Date().toISOString(),
      });

      // Build research-augmented prompt
      const sourceContext = rankedSources.slice(0, 5).map(s =>
        `### [${s.platform}] ${s.title}\n> ${s.snippet}\n`
      ).join("\n");

      const evidenceContext = evidenceMap
        .filter(e => e.confidence === "high")
        .slice(0, 10)
        .map(e => `- **${e.concept}**: ${e.content.slice(0, 150)}`)
        .join("\n");

      const researchAugmentedIntent = `## 研究任务\n${intent}\n\n## 搜索到的权威资料\n${sourceContext}\n\n## 提取的关键证据\n${evidenceContext}\n\n## 内容结构要求\n${structure.sections.map(s => `### ${s.title}\n（重要性: ${s.importance}）`).join("\n")}\n\n请基于以上研究资料生成完整内容。必须在正文中引用来源（用 [来源: 平台名] 标注）。每个章节必须包含至少一条资料支撑。`;

      // Use the existing generator but with research-augmented intent
      const proArtifact: AgentArtifact = await generateArtifact({
        id: taskId,
        intent: researchAugmentedIntent.slice(0, 4000),
        plan: session.plan,
        taskType,
        files: files ?? [],
        toolsUsed: ["web_research" as AgentToolName, "notes_writer" as AgentToolName],
      });

      // Stage 7: Quality gate
      allStages.push({
        name: "quality", label: "质量检查", status: "running",
        detail: "验证内容完整性...",
        startedAt: new Date().toISOString(),
      });

      const finalContent = proArtifact.artifactMarkdown ?? "";
      const qualityResult = proContentQualityGate({
        intent: intent.trim(), taskType,
        queries, sources: rankedSources, evidenceMap, structure,
        finalContent, qualityPassed: false, qualityScore: 0,
        networkAvailable: collectorResult.networkAvailable,
        stages: allStages,
      });

      proArtifact.qualityScore = qualityResult.score;
      proArtifact.qualityCheck = {
        passed: qualityResult.passed,
        score: qualityResult.score,
        checks: {
          hasContent: finalContent.length > 500,
          hasStructure: structure.sections.length >= 3,
          hasExamples: /例题|案例|示例|example/i.test(finalContent),
          hasActions: /练习|任务|步骤|行动|下一步/i.test(finalContent),
          sectionsPresent: structure.sections.map(s => s.title),
          sectionsMissing: [],
        },
      };
      proArtifact.status = qualityResult.passed ? "completed" : "partial";

      // Inject research data
      (proArtifact as any).researchSources = rankedSources;
      (proArtifact as any).evidenceMap = evidenceMap;
      (proArtifact as any).networkAvailable = collectorResult.networkAvailable;
      (proArtifact as any).pipelineStages = allStages;

      allStages[allStages.length - 1].status = "done";
      allStages[allStages.length - 1].completedAt = new Date().toISOString();
      allStages[allStages.length - 1].detail = qualityResult.passed
        ? `质量评分 ${qualityResult.score}/100 ✅`
        : `质量评分 ${qualityResult.score}/100 · ${qualityResult.checks.filter(c => !c.passed).length} 项待改善`;

      proArtifact.updatedAt = new Date().toISOString();

      return NextResponse.json({
        success: proArtifact.status === "completed" || proArtifact.status === "partial",
        artifact: proArtifact,
        researchPipeline: {
          stages: allStages,
          sources: rankedSources,
          evidenceMap,
          networkAvailable: collectorResult.networkAvailable,
          qualityResult,
        },
        message: qualityResult.passed
          ? `「${proArtifact.artifactTitle || intent.slice(0, 30)}」已生成 · 基于 ${rankedSources.length} 条来源`
          : "生成完成，部分质量指标未达标，建议查看详情",
        proMode: true,
      });
    }

    const isGuest = session.plan === "guest";

    // ── GUEST PATH: No search, local demo ─────────────────────────
    if (isGuest) {
      const guestArtifact: AgentArtifact = await generateArtifact({
        id: taskId, intent: intent.trim(), plan: "guest", taskType, files: files ?? [],
        toolsUsed: ["summary_generator" as AgentToolName],
      });
      guestArtifact.updatedAt = new Date().toISOString();
      return NextResponse.json({
        success: guestArtifact.status !== "failed",
        artifact: guestArtifact,
        message: "游客模式使用本地演示。登录后可获得联网研究 + 完整 AI 能力。",
        proMode: false,
        guestMode: true,
      });
    }

    // ── STANDARD PATH: Light search + generation ──────────────────
    const stdStages: PipelineStageStatus[] = [];
    const timeline: Array<{ id?: string; tool: string; status: string; message: string; timestamp: string }> = [];
    const addTimeline = (tool: string, status: string, message: string) => {
      timeline.push({ tool, status, message, timestamp: new Date().toISOString() });
    };

    addTimeline("brain", "running", `Agent 分析中 → Standard 轻量研究模式 · 任务类型: ${taskType}`);

    // Standard: light search (2 queries, max 3 results)
    let stdSources: any[] = [];
    let stdNetworkAvailable = true;
    try {
      stdStages.push({ name: "search", label: "联网搜索资料", status: "running", detail: "Standard 轻量搜索..." });
      const stdQueries = generateResearchQueries(intent.trim(), taskType).slice(0, 2);
      const collectorResult = await collectSources(stdQueries, false);
      stdSources = collectorResult.sources.map(s => ({
        id: s.id, title: s.title, url: s.url, platform: s.platform, snippet: s.snippet,
        relevanceScore: 60, credibilityScore: 50, compositeScore: 55,
      }));
      stdNetworkAvailable = collectorResult.networkAvailable;
      stdStages[0].status = "done";
      stdStages[0].detail = stdNetworkAvailable
        ? `Standard 轻量搜索完成 · ${stdSources.length} 条来源`
        : "网络不可用，使用离线知识生成";
      addTimeline("web_research", "done", `Standard 搜索: ${stdSources.length} 条来源`);
    } catch {
      stdStages.push({ name: "search", label: "联网搜索", status: "failed", detail: "搜索失败，继续生成" });
    }

    // Build search-augmented intent for Standard
    const stdSourceContext = stdSources.slice(0, 3).map(s =>
      `### [${s.platform}] ${s.title}\n> ${s.snippet}\n`
    ).join("\n");
    const stdAugmentedIntent = stdSources.length > 0
      ? `## 任务\n${intent}\n\n## 搜索到的参考资料\n${stdSourceContext}\n\n请基于以上资料生成内容。如资料不足，请标注。`
      : intent;

    const stdTools: AgentToolName[] = ["summary_generator" as AgentToolName];
    if (/exam|复习|冲刺|test/i.test(intent)) stdTools.push("study_pack_generator" as AgentToolName);
    if (stdSources.length > 0) stdTools.push("web_research" as AgentToolName);

    const stdArtifact: AgentArtifact = await generateArtifact({
      id: taskId,
      intent: stdAugmentedIntent.slice(0, 4000),
      plan: session.plan,
      taskType,
      files: files ?? [],
      toolsUsed: stdTools,
    });

    stdArtifact.updatedAt = new Date().toISOString();
    if (stdSources.length > 0) (stdArtifact as any).researchSources = stdSources;

    if (stdArtifact.status === "failed") {
      addTimeline("brain", "error", "生成未完全成功");
    } else {
      addTimeline("brain", "done", `Standard 生成完成 · 质量分: ${stdArtifact.qualityScore}/100 · ${stdSources.length} 条来源`);
    }

    return NextResponse.json({
      success: stdArtifact.status !== "failed",
      artifact: stdArtifact,
      message: stdArtifact.status === "completed"
        ? `「${stdArtifact.artifactTitle || intent.slice(0, 30)}」已生成 · Standard 轻量模式`
        : "生成部分完成",
      proMode: false,
      standardMode: true,
      researchPipeline: stdSources.length > 0 ? {
        stages: stdStages,
        sources: stdSources,
        networkAvailable: stdNetworkAvailable,
      } : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Agent execution failed",
        artifact: null,
        retryHint: "请检查 AI 服务配置后重试",
      },
      { status: 500 },
    );
  }
}
