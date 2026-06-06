// ═══════════════════════════════════════════════════════════════
// Voice Chat API v2 — Deepgram-grade architecture
// Cross-platform: Web / Desktop / Mobile / Mini-program
// Enriched with web search context for high-quality responses.
//
// POST { text, personaId, history[] }
// → Returns SSE stream with AI response chunks
//
// Future: add audio input (WebSocket for real-time STT)
// Future: add audio output (TTS audio bytes in response)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/ai/client";
import { createRateLimiter } from "@/lib/rate-limit";
import { buildEnrichedPrompt, generateSearchLinks } from "@/lib/ai/search-enrichment";
import { enrichWithSearch } from "@/lib/data/enriched-apis";

export const runtime = "nodejs";
export const maxDuration = 60;

const limiter = createRateLimiter({ requests: 30, window: 60000 });

interface VoiceChatRequest {
  text: string;
  personaId?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(clientId)) {
    return new Response("Too many requests", { status: 429, headers: { "Retry-After": "60" } });
  }

  let body: VoiceChatRequest;
  try { body = await req.json(); } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { text, personaId = "ai-mentor", history = [] } = body;
  if (!text?.trim()) {
    return new Response("text is required", { status: 400 });
  }

  try {
    // Build enriched system prompt
    const systemPrompt = buildEnrichedPrompt(personaId, text);

    // Fetch real-time search context (Wikipedia + DuckDuckGo)
    const searchContext = await enrichWithSearch(text).catch(() => "");

    const fullSystemPrompt = searchContext
      ? `${systemPrompt}\n\n【实时搜索参考】\n${searchContext}\n\n请结合以上真实搜索结果为用户提供准确回答。`
      : systemPrompt;

    const messages: ChatMessage[] = [
      { role: "system", content: fullSystemPrompt },
      ...history.slice(-10).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user", content: text },
    ];

    const stream = await streamChat(messages, { temperature: 0.7 });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-Persona": personaId,
      },
    });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Voice chat failed", { status: 502 });
  }
}

// ═══ GET: Search links for a topic ═══
export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("q");
  if (!topic) return new Response('{"links":[]}', { status: 400, headers: { "Content-Type": "application/json" } });

  const links = generateSearchLinks(topic);
  return new Response(JSON.stringify({ topic, links }), {
    headers: { "Content-Type": "application/json" },
  });
}
