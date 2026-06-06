// ═══════════════════════════════════════════════════════════════
// Cognitive OS API — Cognitive Reconstruction Endpoint
// POST /api/cognitive/message → returns structured cognitive output
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { cognitiveOS, composeCognitiveResponse } from "@/lib/ai/cognitive-engine";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const limiter = createRateLimiter({ requests: 15, window: 60000 });

export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(clientId)) {
    return new Response("Too many requests", { status: 429 });
  }

  let body: { input?: string };
  try { body = await req.json(); } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const input = body.input?.trim();
  if (!input || input.length < 5) {
    return new Response("input too short (min 5 chars)", { status: 400 });
  }

  try {
    const result = await cognitiveOS(input);
    const formatted = composeCognitiveResponse(result);

    return new Response(JSON.stringify({
      structured: formatted,
      analysis: result.analysis,
      path: result.path,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Cognitive engine error", { status: 502 });
  }
}
