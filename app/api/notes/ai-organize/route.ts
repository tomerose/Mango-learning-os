import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson, type ChatMessage } from "@/lib/ai/client";
import { isAIConfigured } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// AI note organizer — calls DeepSeek to generate title, tags,
// subject classification, and summary from raw imported text.
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 45;

const MAX_TEXT_LENGTH = 6000;
const MAX_RETRY = 2;

function buildOrganizePrompt(
  text: string,
  subjectHint?: string
): ChatMessage[] {
  const hintLine = subjectHint
    ? `用户倾向于将这篇笔记归类为「${subjectHint}」，但不强制——请根据内容实际判断。`
    : "";

  return [
    {
      role: "system" as const,
      content:
        "你是一个知识管理助手。根据用户提供的文本内容，自动生成笔记的标题、学科分类、标签和摘要。只输出严格合法的 JSON，不要任何额外文字。",
    },
    {
      role: "user" as const,
      content: `请分析以下文本，生成：
1. 标题（简洁概括，不超过 30 字）
2. 学科分类（从 ai / economics / finance / math / english 中选择最匹配的一个）
${hintLine}
3. 标签（3-5 个关键词组成的数组）
4. 摘要（2-3 句话概括核心内容，不超过 150 字）

输出 JSON 格式：
{"title":"标题","subject":"ai","tags":["标签1","标签2","标签3"],"summary":"摘要内容"}

文本内容：
${text.slice(0, MAX_TEXT_LENGTH)}`,
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI 服务未配置，请在 .env.local 中设置 AI_API_KEY" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const subjectHint = typeof body?.subjectHint === "string" ? body.subjectHint : undefined;

    if (!text) {
      return NextResponse.json({ error: "请提供文本内容" }, { status: 400 });
    }

    let lastError = "";
    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      try {
        const messages = buildOrganizePrompt(text, subjectHint);
        const raw = await completeChat(messages, { temperature: 0.4 });
        const json = JSON.parse(extractJson(raw));

        // Validate required fields
        const title = typeof json.title === "string" ? json.title.trim().slice(0, 80) : "";
        const subject = ["ai", "economics", "finance", "math", "english"].includes(json.subject)
          ? json.subject
          : subjectHint ?? "ai";
        const tags: string[] = Array.isArray(json.tags)
          ? json.tags.map((t: unknown) => String(t).trim().slice(0, 30)).filter(Boolean).slice(0, 5)
          : [];
        const summary =
          typeof json.summary === "string" ? json.summary.trim().slice(0, 200) : "";

        if (!title) throw new Error("AI 未返回有效标题");

        return NextResponse.json({ title, subject, tags, summary });
      } catch (err) {
        lastError = err instanceof Error ? err.message : "AI 解析失败";
        if (attempt < MAX_RETRY) continue;
      }
    }

    return NextResponse.json({ error: lastError || "AI 处理失败，请重试" }, { status: 422 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI 处理失败" },
      { status: 500 }
    );
  }
}
