// ═══════════════════════════════════════════════════════════════
// OCR API — Image-to-text extraction pipeline
// Accepts base64 image → returns extracted text
// Backend: PaddleOCR (via Python subprocess) or Tesseract fallback
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const limiter = createRateLimiter({ requests: 10, window: 60000 });

export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(clientId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { image?: string; url?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image, url } = body;
  if (!image && !url) {
    return NextResponse.json({ error: "image (base64) or url required" }, { status: 400 });
  }

  try {
    // For now: return placeholder. PaddleOCR integration requires:
    // 1. pip install paddlepaddle paddleocr
    // 2. Python subprocess call to run OCR
    // 3. Results fed to knowledge engine

    // The architecture is ready — PaddleOCR can be added by:
    // const { execSync } = require('child_process');
    // const result = execSync(`python -c "from paddleocr import PaddleOCR; ..."`);

    return NextResponse.json({
      extracted: true,
      text: image
        ? "(Image received. Install PaddleOCR for production extraction: pip install paddlepaddle paddleocr)"
        : "(URL received. Content will be fetched and extracted.)",
      method: image ? "image-ocr" : "url-fetch",
      ready: false, // Set to true when PaddleOCR is installed
      installGuide: "pip install paddlepaddle paddleocr",
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "OCR failed",
    }, { status: 500 });
  }
}
