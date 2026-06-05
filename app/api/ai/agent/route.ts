import { NextRequest } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/ai/client";
import { createRateLimiter } from "@/lib/rate-limit";
import { summarizeContext, remember, recall } from "@/lib/ai/agent-memory";
import { buildSystemPrompt } from "@/lib/ai/templates";
import type { WeakArea } from "@/lib/types";

export const runtime = "nodejs";

const limiter = createRateLimiter({ requests: 15, window: 60000 });

const AGENT_PERSONA = `你是 MangoOS 的 Personal Learning Agent（个人学习助手），一位专业、亲切的 AI 导师。

核心特点：
- 你了解用户的学习历史、薄弱领域、目标和最近学习内容（上下文会提供）
- 每次对话开始时，如果你发现了用户的具体薄弱领域，主动询问："上次你在 XXX 的准确率是 YY%，要不要针对练习一下？"
- 中文讲解，专业术语首次出现给出 English + 中文
- 逻辑优先，结构清晰，不说废话
- 主动关联用户已知的内容
- 讲解后给出可操作的下一步建议
- 诊断思维误区而不只是给出正确答案

绝对不要显露 AI 特征。不说"作为 AI"、"根据数据"、"分析显示"。`;

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

export async function POST(req: NextRequest) {
  const clientId =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!limiter.check(clientId)) {
    return new Response("Too many requests.", { status: 429, headers: { "Retry-After": "60" } });
  }

  let body: AgentRequestBody;
  try { body = await req.json(); } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const subject = body.subject ?? "general";
  const messages = body.messages;
  const context = body.context;
  const userId = body.userId;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }
  if (messages.length > 50) {
    return new Response("Conversation too long", { status: 413 });
  }

  try {
    // ── READ MEMORY LOOP (the fix) ──
    let memoryContext = "";
    if (userId) {
      try {
        memoryContext = await summarizeContext(userId);
      } catch (e) {
        console.error("[agent] summarizeContext failed:", e);
      }
    }

    // Build system prompt with unified template engine + memory
    const systemContent = buildSystemPrompt({
      mode: "tutor",
      subject,
      context: {
        weakAreas: context?.weakAreas,
        goals: context?.goals,
        recentTopics: context?.recentTopics,
        memories: memoryContext || undefined,
      },
    });

    // Prepend agent persona before the template system prompt
    const fullSystem = [AGENT_PERSONA, "", systemContent].join("\n");

    const fullMessages: ChatMessage[] = [
      { role: "system", content: fullSystem },
      ...messages,
    ];

    const stream = await streamChat(fullMessages, {
      temperature: 0.7,
      subject: subject as never,
    });

    // ── WRITE MEMORY (async, fire-and-forget) ──
    if (userId) {
      // Store conversation summary
      const firstUser = messages.find((m) => m.role === "user");
      const title = firstUser
        ? firstUser.content.trim().slice(0, 60)
        : "New conversation";
      remember(userId, "summary", `conv:${Date.now()}`, title).catch((e) =>
        console.error("[agent] remember summary:", e),
      );

      // Store last topic
      const lastUserMsg = [...messages].reverse().find(
        (m) => m.role === "user",
      );
      if (lastUserMsg) {
        remember(
          userId,
          "topic",
          `topic:${Date.now()}`,
          lastUserMsg.content.slice(0, 100),
        ).catch((e) => console.error("[agent] remember topic:", e));
      }

      // Store weak areas if context has them
      if (context?.weakAreas && context.weakAreas.length > 0) {
        for (const w of context.weakAreas.slice(0, 3)) {
          remember(
            userId,
            "weak_area",
            `weak:${w.topic}`,
            `accuracy:${w.accuracy}, attempts:${w.attempts}`,
          ).catch((e) => console.error("[agent] remember weak:", e));
        }
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
