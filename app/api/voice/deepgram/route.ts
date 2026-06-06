// ═══════════════════════════════════════════════════════════════
// Deepgram Voice Route — Production-grade STT + TTS
// Get your free API key at: https://console.deepgram.com
// Set DEEPGRAM_API_KEY in .env.local
//
// POST /api/voice/deepgram
// Body: { text, personaId, history[] }
// Returns: streaming AI response (same as /api/voice/chat)
//
// Future upgrade path:
//   WebSocket STT: deepgram-starters/node-live-transcription
//   Voice Agent: deepgram-starters/node-voice-agent
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/ai/client";
import { createRateLimiter } from "@/lib/rate-limit";
import { buildEnrichedPrompt } from "@/lib/ai/search-enrichment";
import { BUILTIN_PERSONAS } from "@/lib/ai/identity-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

const limiter = createRateLimiter({ requests: 30, window: 60000 });

// Deepgram endpoint for future STT integration
// When DEEPGRAM_API_KEY is set, client can send audio → get text
// For now, works as enhanced text-based voice chat

export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(clientId)) {
    return new Response("Too many requests", { status: 429 });
  }

  const hasDeepgram = !!process.env.DEEPGRAM_API_KEY;

  let body: { text?: string; personaId?: string; history?: { role: "user" | "assistant"; content: string }[] };
  try { body = await req.json(); } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { text, personaId = "ai-mentor", history = [] } = body;
  if (!text?.trim()) {
    return new Response("text is required", { status: 400 });
  }

  // If Deepgram is available, return config for client to use
  if (hasDeepgram && req.headers.get("x-deepgram-config") === "1") {
    return new Response(JSON.stringify({
      deepgram: {
        available: true,
        websocketUrl: "wss://api.deepgram.com/v1/listen",
        model: "nova-3",
        language: "zh-CN",
      },
    }), { headers: { "Content-Type": "application/json" } });
  }

  try {
    const systemPrompt = buildEnrichedPrompt(personaId, text);
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user", content: text },
    ];

    const stream = await streamChat(messages, { temperature: 0.7 });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-Deepgram-Available": hasDeepgram ? "true" : "false",
      },
    });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Voice failed", { status: 502 });
  }
}

// GET: Check Deepgram availability
export async function GET() {
  const hasDeepgram = !!process.env.DEEPGRAM_API_KEY;
  return new Response(JSON.stringify({
    deepgramAvailable: hasDeepgram,
    setupGuide: hasDeepgram ? null : {
      signup: "https://console.deepgram.com",
      envVar: "DEEPGRAM_API_KEY",
      starters: {
        stt: "deepgram-starters/node-live-transcription",
        voice: "deepgram-starters/node-voice-agent",
        flux: "deepgram-starters/node-flux",
      },
    },
  }), { headers: { "Content-Type": "application/json" } });
}
