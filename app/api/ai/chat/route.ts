import { NextRequest } from "next/server";

import { streamChat, type ChatMessage } from "@/lib/ai/client";
import { buildTutorMessages } from "@/lib/ai/prompts";
import { createRateLimiter } from "@/lib/rate-limit";
import type { SubjectId } from "@/lib/types";

export const runtime = "nodejs";

const VALID_SUBJECTS: SubjectId[] = [
  "ai",
  "economics",
  "finance",
  "math",
  "english",
];

// Rate limit: 20 requests per IP per minute (prevents abuse)
const limiter = createRateLimiter({ requests: 20, window: 60000 });

export async function POST(req: NextRequest) {
  // Rate limiting (use forwarded IP from Vercel/proxy or fall back to "unknown")
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

  let body: { subject?: string; messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const subject = body.subject as SubjectId;
  const messages = body.messages;

  if (!VALID_SUBJECTS.includes(subject)) {
    return new Response(`Unknown subject: ${subject}`, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages must be a non-empty array", { status: 400 });
  }
  // Guard against unbounded context / abuse
  if (messages.length > 50) {
    return new Response("Conversation too long", { status: 413 });
  }

  try {
    const fullMessages = buildTutorMessages(subject, messages);
    const stream = await streamChat(fullMessages, { subject });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return new Response(message, { status: 502 });
  }
}
