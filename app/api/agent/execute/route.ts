// POST /api/agent/execute — Agent execution with Pro Research Pipeline
// V14.7.5: Pro/Admin 90-point Quality Gate with auto-deepen (max 2 rounds)
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { evaluateQualityV3, buildDeependPrompt, TIER_THRESHOLDS, MAX_DEEPEN_ROUNDS } from "@/lib/agent/quality-gate-v3";
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
    const { intent, files, forceResearch, noResearch } = (await req.json()) as ExecuteRequest;
    if (!intent?.trim()) {
      return NextResponse.json({ error: "Intent is required" }, { status: 400 });
    }

    // V14.7.5: DEV_FORCE_PLAN override (development only)
    let effectivePlan = session.plan;
    const devForcePlan = process.env.DEV_FORCE_PLAN;
    const isDev = process.env.NODE_ENV === "development";
    if (isDev && devForcePlan && ["pro", "admin", "standard", "guest"].includes(devForcePlan)) {
      effectivePlan = devForcePlan as typeof session.plan;
    }

    const blocked = guard({ plan: effectivePlan }, "canUseMangoAgent");
    if (blocked) return blocked;

    const quotaResult = recordQuotaUse(session.userId ?? "guest", "agentTasks", effectivePlan);
    if (!quotaResult.allowed) {
      return guardQuota({ plan: effectivePlan }, "maxDailyAgentTasks", quotaResult.current)!;
    }

    const isPro = effectivePlan === "pro" || effectivePlan === "admin";
    // V14.8.1: Pro/Admin ALWAYS research — noResearch escape hatch removed
    const shouldResearch = isPro || forceResearch;
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
        plan: effectivePlan,
        taskType,
        files: files ?? [],
        toolsUsed: ["web_research" as AgentToolName, "notes_writer" as AgentToolName],
      });

      // V14.7.5: Auto-deepen loop (max 2 rounds)
      let finalContent = proArtifact.artifactMarkdown ?? "";
      let deepenRound = 0;
      let qualityV3 = evaluateQualityV3(finalContent, intent.trim(), {
        sourcesCount: rankedSources.length,
        evidenceCount: evidenceMap.length,
        networkAvailable: collectorResult.networkAvailable,
        structureSectionCount: structure.sections.length,
        tier: effectivePlan,
        deepenRound: 0,
      });

      // Auto-deepen: regenerate if below Pro/Admin threshold
      while (qualityV3.willAutoDeepen && deepenRound < MAX_DEEPEN_ROUNDS) {
        deepenRound++;
        allStages.push({
          name: `deepen_${deepenRound}`, label: `第 ${deepenRound} 次继续深化`,
          status: "running",
          detail: `当前质量 ${qualityV3.percentage}/100 · 要求 ≥${qualityV3.thresholdRequired} · 正在定向改进...`,
          startedAt: new Date().toISOString(),
        });

        const deepenPrompt = buildDeependPrompt(intent.trim(), qualityV3, finalContent);
        const deepenedArtifact = await generateArtifact({
          id: `${taskId}_deepen_${deepenRound}`,
          intent: deepenPrompt.slice(0, 4000),
          plan: effectivePlan,
          taskType,
          files: files ?? [],
          toolsUsed: ["web_research" as AgentToolName, "notes_writer" as AgentToolName],
        });

        finalContent = deepenedArtifact.artifactMarkdown ?? finalContent;
        allStages[allStages.length - 1].status = "done";
        allStages[allStages.length - 1].completedAt = new Date().toISOString();

        // Re-evaluate
        qualityV3 = evaluateQualityV3(finalContent, intent.trim(), {
          sourcesCount: rankedSources.length,
          evidenceCount: evidenceMap.length,
          networkAvailable: collectorResult.networkAvailable,
          structureSectionCount: structure.sections.length,
          tier: effectivePlan,
          deepenRound,
        });

        allStages[allStages.length - 1].detail = deepenRound >= MAX_DEEPEN_ROUNDS
          ? `深化完成 · ${qualityV3.percentage}/100 · 已达最大深化次数`
          : qualityV3.passed
            ? `深化完成 · ${qualityV3.percentage}/100 ✅`
            : `深化完成 · ${qualityV3.percentage}/100 · 仍未达标，建议补充资料`;
      }

      // Stage: Quality gate final
      allStages.push({
        name: "quality", label: "质量检查", status: "done",
        detail: qualityV3.passed
          ? `质量评分 ${qualityV3.percentage}/100 ✅ · 通过 ${TIER_THRESHOLDS[effectivePlan]} 分门槛`
          : `质量评分 ${qualityV3.percentage}/100 · 未达 ${TIER_THRESHOLDS[effectivePlan]} 分 · ${qualityV3.improvementHints.length} 项待改善`,
        completedAt: new Date().toISOString(),
      });

      proArtifact.artifactMarkdown = finalContent;
      proArtifact.qualityScore = qualityV3.percentage;
      proArtifact.qualityCheck = {
        passed: qualityV3.passed,
        score: qualityV3.percentage,
        checks: {
          hasContent: finalContent.length > 500,
          hasStructure: structure.sections.length >= 3,
          hasExamples: /例题|案例|示例|example/i.test(finalContent),
          hasActions: /练习|任务|步骤|行动|下一步/i.test(finalContent),
          sectionsPresent: structure.sections.map(s => s.title),
          sectionsMissing: [],
        },
      };
      // V14.8.1: Pro/Admin hard gate — below 90 = FAILED, never "partial"
      const proPassed = qualityV3.passed;
      proArtifact.status = proPassed ? "completed" : "failed";
      proArtifact.qualityCheck = {
        passed: proPassed,
        score: qualityV3.percentage,
        checks: {
          hasContent: finalContent.length > 500,
          hasStructure: structure.sections.length >= 3,
          hasExamples: /例题|案例|示例|example/i.test(finalContent),
          hasActions: /练习|任务|步骤|行动|下一步/i.test(finalContent),
          sectionsPresent: structure.sections.map(s => s.title),
          sectionsMissing: [],
        },
      };

      // Inject research + quality data
      (proArtifact as any).researchSources = rankedSources;
      (proArtifact as any).evidenceMap = evidenceMap;
      (proArtifact as any).networkAvailable = collectorResult.networkAvailable;
      (proArtifact as any).pipelineStages = allStages;
      (proArtifact as any).qualityV3 = qualityV3;
      (proArtifact as any).deepenRounds = deepenRound;

      proArtifact.updatedAt = new Date().toISOString();

      // V14.8.1: Save full outcome to all 5 tables
      let savedDocId: string | null = null;
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        const now = new Date().toISOString();

        // agent_runs
        const { data: runData } = await sb.from("agent_runs").insert({
          user_id: session.userId, user_email: session.email, tier: effectivePlan,
          prompt: intent.trim(), task_type: taskType,
          status: proPassed ? "completed" : "needs_review",
          quality_score: qualityV3.percentage, source_count: rankedSources.length,
          citation_count: (finalContent.match(/\[\d+\]/g) || []).length,
          export_status: "pending", created_at: now, updated_at: now
        }).select("id").single();

        // outcome_documents
        const { data: docData } = await sb.from("outcome_documents").insert({
          user_id: session.userId, run_id: runData?.id,
          title: proArtifact.artifactTitle || intent.slice(0, 80),
          summary: proArtifact.artifactSummary || finalContent.slice(0, 300),
          content: finalContent,
          sections: structure.sections.map(s => ({ title: s.title, content: "" })),
          status: proPassed ? "completed" : "needs_review",
          quality_score: qualityV3.percentage, tier: effectivePlan,
          latest_version: 1, created_at: now, updated_at: now
        }).select("id").single();
        if (docData) savedDocId = docData.id;

        // outcome_versions v1
        await sb.from("outcome_versions").insert({
          document_id: docData?.id, version_number: 1,
          content: finalContent,
          sections: structure.sections.map(s => ({ title: s.title, content: "" })),
          quality_score: qualityV3.percentage, source_count: rankedSources.length,
          citation_count: (finalContent.match(/\[\d+\]/g) || []).length,
          created_at: now
        });

        // outcome_sources
        if (rankedSources.length > 0) {
          await sb.from("outcome_sources").insert(
            rankedSources.map(s => ({
              document_id: docData?.id, title: s.title, url: s.url,
              platform: s.platform, summary: s.snippet?.slice(0, 300),
              relevance_reason: `score:${s.compositeScore}`, used: true,
              created_at: now
            }))
          );
        }

        // outcome_exports
        await sb.from("outcome_exports").insert({
          document_id: docData?.id, export_type: "html",
          status: "pending", created_at: now, updated_at: now
        });
        await sb.from("outcome_exports").insert({
          document_id: docData?.id, export_type: "pdf",
          status: "pending", created_at: now, updated_at: now
        });

      } catch (e) { console.error("[outcome save]", e); }

      return NextResponse.json({
        success: proPassed,
        artifact: proArtifact,
        qualityV3,
        failedDimensions: qualityV3.dimensions.filter((d: any) => !d.passed).map((d: any) => ({ key: d.key, label: d.label, score: d.score, suggestion: d.suggestion })),
        researchPipeline: {
          stages: allStages, sources: rankedSources, evidenceMap,
          networkAvailable: collectorResult.networkAvailable,
        },
        message: proPassed
          ? `「${proArtifact.artifactTitle || intent.slice(0, 30)}」已生成 · ${qualityV3.percentage}分 · ${rankedSources.length}条来源${deepenRound > 0 ? ` · 深化${deepenRound}次` : ""}`
          : `❌ 未达标 ${qualityV3.percentage}分（要求≥${TIER_THRESHOLDS[effectivePlan]}）· 已深化${deepenRound}次`,
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
      plan: effectivePlan,
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
