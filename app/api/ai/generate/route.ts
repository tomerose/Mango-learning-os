// Unified AI Generation API — replaces /ai/magic, /ai/exam-package, /ai/exam-search,
// /ai/knowledge-extract, /ai/flashcard-generate, /ai/summary-generate, /ai/mind-journal,
// /ai/project-review, /ai/voice-soul
//
// POST { mode, input, subject?, options?, context? }
// All 12 generation modes through one endpoint.

import { NextRequest, NextResponse } from "next/server";
import { generate, type GenerationRequest, type GenerationMode } from "@/lib/ai/content-engine";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 90;

const VALID_MODES: GenerationMode[] = [
  "tutor", "quiz", "exam", "notes", "plan", "learn",
  "recommend", "flashcards", "summary", "analyze", "review",
];

const limiter = createRateLimiter({ requests: 20, window: 60000 });

export async function POST(req: NextRequest) {
  const clientId =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!limiter.check(clientId)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: GenerationRequest & { mode: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { mode, input } = body;

  if (!mode || !input?.trim()) {
    return NextResponse.json({ error: "mode and input are required" }, { status: 400 });
  }

  if (!VALID_MODES.includes(mode as GenerationMode)) {
    return NextResponse.json(
      { error: `Invalid mode: ${mode}. Valid: ${VALID_MODES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const result = await generate({
      mode: mode as GenerationMode,
      input: input.trim(),
      subject: body.subject,
      options: body.options,
      context: body.context,
    });

    return NextResponse.json({
      mode: result.mode,
      content: result.content,
      parsed: result.parsed,
      quality: result.quality,
      cached: result.cached,
      retries: result.retries,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 502 },
    );
  }
}
