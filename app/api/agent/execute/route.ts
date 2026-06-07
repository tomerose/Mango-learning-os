// POST /api/agent/execute — Real Agent execution with DeepSeek
// V14: Returns AgentArtifact (not just summary). Uses specialized generators.
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { guard, guardQuota } from "@/lib/plan/guard";
import { recordQuotaUse } from "@/lib/quota/quota";
import { detectTaskType, generateArtifact } from "@/lib/agent/generators";
import type { AgentArtifact } from "@/lib/agent/artifact-types";
import type { AgentToolName } from "@/lib/agent/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface ExecuteRequest {
  intent: string;
  files?: Array<{ name: string; text: string }>;
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

    const { intent, files } = (await req.json()) as ExecuteRequest;
    if (!intent?.trim()) {
      return NextResponse.json({ error: "Intent is required" }, { status: 400 });
    }

    // ── Detect task type ──
    const taskType = detectTaskType(intent);
    const taskId = `artifact-${Date.now()}`;

    const timeline: Array<{ id?: string; tool: string; status: string; message: string; timestamp: string }> = [];
    const addTimeline = (tool: string, status: string, message: string) => {
      timeline.push({ tool, status, message, timestamp: new Date().toISOString() });
    };

    addTimeline("brain", "running", `Agent 分析中 → 任务类型: ${taskType}`);

    // ── Generate artifact via specialized generator ──
    const toolsForTask: AgentToolName[] = [];
    if (/exam|复习|冲刺|test/i.test(intent)) toolsForTask.push("study_pack_generator", "quiz_generator", "flashcard_generator");
    if (/笔记|整理|notes/i.test(intent)) toolsForTask.push("file_parser", "notes_writer");
    if (/论文|文档|pdf|read/i.test(intent)) toolsForTask.push("file_parser", "summary_generator");
    if (/错题|mistake/i.test(intent)) toolsForTask.push("mistake_analyzer", "quiz_generator");
    if (/英语|口语|ielts|toefl/i.test(intent)) toolsForTask.push("concept_explainer", "quiz_generator");
    if (/展示|演讲|present/i.test(intent)) toolsForTask.push("summary_generator", "notes_writer");
    if (/概念|解释|explain/i.test(intent)) toolsForTask.push("concept_explainer", "web_research");
    if (/森林|知识.*[图网]|体系/i.test(intent)) toolsForTask.push("web_research", "notes_writer", "flashcard_generator");
    if (toolsForTask.length === 0) toolsForTask.push("summary_generator");

    const artifact: AgentArtifact = await generateArtifact({
      id: taskId,
      intent: intent.trim(),
      plan: session.plan,
      taskType,
      files: files ?? [],
      toolsUsed: toolsForTask,
    });

    // ── Merge timeline ──
    artifact.timeline = timeline.map(t => ({
      id: `ev-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: t.timestamp,
      type: t.status === "error" ? "error" as const : t.status === "running" ? "tool_start" as const : "tool_end" as const,
      message: t.message,
      toolName: t.tool as AgentToolName,
      status: t.status as "done" | "error" | "running" | "pending",
    }));
    artifact.updatedAt = new Date().toISOString();

    // ── Quality gate: failed artifact still returned, but status reflects it ──
    if (artifact.status === "failed") {
      addTimeline("brain", "error", "生成未完全成功，请查看详情或重试");
    } else if (!artifact.qualityCheck.passed) {
      addTimeline("brain", "done", `生成完成，质量分: ${artifact.qualityScore}/100（部分内容待完善）`);
    } else {
      addTimeline("brain", "done", `生成完成，质量分: ${artifact.qualityScore}/100 ✅`);
    }

    return NextResponse.json({
      success: artifact.status !== "failed",
      artifact,
      message: artifact.status === "completed"
        ? `「${artifact.artifactTitle || intent.slice(0, 30)}」已生成`
        : "生成部分完成，请查看详情",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Agent execution failed",
        artifact: null,
        retryHint: "请检查 AI 服务配置 (AI_API_KEY) 后重试",
      },
      { status: 500 },
    );
  }
}
