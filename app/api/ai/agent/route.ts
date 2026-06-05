import { NextRequest } from "next/server";

import { streamChat, type ChatMessage } from "@/lib/ai/client";
import { createRateLimiter } from "@/lib/rate-limit";
import { summarizeContext, remember } from "@/lib/ai/agent-memory";
import type { SubjectId, WeakArea } from "@/lib/types";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────
// Personal Learning Agent — enhanced chat route with context.
//
// POST body:
//   subject: string        — current learning subject
//   messages: ChatMessage[] — conversation history
//   context?: {
//     weakAreas: WeakArea[]   — user's weak spots for this subject
//     goals: string[]         — active high-priority goals
//     recentTopics: string[]  — recently studied topics
//   }
//
// Builds a rich system prompt that includes the agent persona,
// the standard 6-step teaching framework, and the user's personal
// learning context. Streams the response via SSE (same pattern as
// /api/ai/chat), and stores a summary of the conversation in
// agent_memory when cloud mode is active.
// ─────────────────────────────────────────────────────────────

// Rate limit: 15 requests per IP per minute
const limiter = createRateLimiter({ requests: 15, window: 60000 });

// ─── Agent Persona ────────────────────────────────────────────

const AGENT_PERSONA = `你是 MangoOS 的 Personal Learning Agent（个人学习助手），一位专业、亲切的 AI 导师。

你的特点：
- 你了解用户的学习历史、薄弱领域和当前目标
- 你用中文讲解，专业术语首次出现时给出英文 + 中文
- 你逻辑优先，结构清晰，不说废话
- 你会主动关联用户已知的内容（如果上下文中有）
- 你会在讲解后给出可操作的下一步建议
- 当用户做错题时，你会诊断思维误区而不只是给出正确答案`;

const AGENT_FRAMEWORK = `请遵循以下教学结构（按需使用，不必每条都长篇）：
1. 核心概念 — 一句话点明本质
2. 直觉理解 — 类比 / 为什么这样设计
3. 推导或步骤 — 关键步骤拆解
4. 例子 — 一个具体、可验证的例子
5. 易错点 — 最常见的 1-2 个陷阱
6. 下一步 — 推荐的练习或延伸

格式：适当使用 Markdown（标题、列表、代码块、公式用 $...$）。`;

// ─── Context formatting ───────────────────────────────────────

function formatContext(
  context?: AgentRequestContext
): string {
  if (!context) return "";

  const parts: string[] = [];

  if (context.weakAreas && context.weakAreas.length > 0) {
    const areas = context.weakAreas
      .map((w) => `  - ${w.topic}（准确率 ${w.accuracy}%，${w.attempts} 次测验）`)
      .join("\n");
    parts.push(`\n【用户薄弱领域】\n${areas}`);
  }

  if (context.goals && context.goals.length > 0) {
    const goals = context.goals.map((g) => `  - ${g}`).join("\n");
    parts.push(`\n【当前学习目标】\n${goals}`);
  }

  if (context.recentTopics && context.recentTopics.length > 0) {
    const topics = context.recentTopics.map((t) => `  - ${t}`).join("\n");
    parts.push(`\n【最近学习主题】\n${topics}`);
  }

  return parts.join("\n");
}

// ─── Subject persona ──────────────────────────────────────────

const SUBJECT_PERSONA: Record<string, string> = {
  ai: "你是一位资深 AI/机器学习导师，擅长把 Transformer、反向传播、概率图模型等抽象概念讲到直觉层面，并给出可运行的代码示例。",
  economics:
    "你是一位经济学导师，擅长用真实案例和图形直觉讲解微观、宏观与计量经济学，强调机制与权衡。",
  finance:
    "你是一位金融学导师，擅长估值、公司金融、衍生品与量化方法，讲解时结合可计算的数值例子。",
  math: "你是一位数学导师，擅长线性代数、微积分、概率统计，重视严谨推导与几何直觉的结合。",
  english:
    "你是一位英语导师，面向雅思 7.5+ 目标，讲解词汇、长难句、写作与学术表达，给出可迁移的句型。",
};

// ─── Types ────────────────────────────────────────────────────

interface AgentRequestContext {
  weakAreas?: WeakArea[];
  goals?: string[];
  recentTopics?: string[];
}

interface AgentRequestBody {
  subject?: string;
  messages?: ChatMessage[];
  context?: AgentRequestContext;
  userId?: string;
}

// ─── Generate conversation title ──────────────────────────────

function generateTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New conversation";
  const content = firstUser.content.trim();
  return content.length > 60 ? content.slice(0, 60) + "…" : content;
}

// ─── Handler ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limiting
  const clientId =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!limiter.check(clientId)) {
    return new Response("Too many requests. Please try again later.", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // Content-Type check
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return new Response("Content-Type must be application/json", {
      status: 415,
    });
  }

  let body: AgentRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const subject = (body.subject ?? "general") as SubjectId;
  const messages = body.messages;
  const context = body.context;
  const userId = body.userId;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages must be a non-empty array", { status: 400 });
  }

  // Guard against unbounded context
  if (messages.length > 50) {
    return new Response("Conversation too long", { status: 413 });
  }

  try {
    // Build system prompt
    const subjectPersona = SUBJECT_PERSONA[subject] ?? SUBJECT_PERSONA.ai;
    const contextBlock = formatContext(context);

    const systemContent = [
      AGENT_PERSONA,
      "",
      `当前学科：${subject}`,
      subjectPersona,
      "",
      AGENT_FRAMEWORK,
      contextBlock,
    ]
      .filter(Boolean)
      .join("\n");

    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...messages,
    ];

    const stream = await streamChat(fullMessages, { subject });

    // Store a summary memory asynchronously (fire-and-forget)
    if (userId) {
      const title = generateTitle(messages);
      remember(userId, "summary", `conv:${Date.now()}`, title).catch((e) =>
        console.error("[agent/route] remember summary failed:", e)
      );

      // Also store the last topic mentioned (if any) for context
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        const topicWords = lastUserMsg.content.slice(0, 50);
        remember(userId, "topic", `topic:${Date.now()}`, topicWords).catch((e) =>
          console.error("[agent/route] remember topic failed:", e)
        );
      }
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent request failed";
    return new Response(message, { status: 502 });
  }
}
