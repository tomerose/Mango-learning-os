// ═══════════════════════════════════════════════════════════════
// OCR API — Image-to-text via PaddleOCR
// Reference: github.com/PaddlePaddle/PaddleOCR
// Try hosted API first, fallback to local placeholder
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { guard } from "@/lib/plan/guard";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await resolveSession(req);
  const blocked = guard({ plan: session.plan }, "canUseOCR");
  if (blocked) return blocked;

  let body: { image?: string; url?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image, url } = body;
  if (!image && !url) {
    return NextResponse.json({ error: "image (base64) or url required" }, { status: 400 });
  }

  // ── Try PaddleOCR hosted API ──
  try {
    const ocrRes = await fetch("https://www.paddleocr.com/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: image ?? url }),
      signal: AbortSignal.timeout(15000),
    });
    if (ocrRes.ok) {
      const data = await ocrRes.json();
      const text = data?.result?.map((r: { text: string }) => r.text).join("\n") ?? data?.text ?? "";
      if (text) {
        return NextResponse.json({ success: true, text, method: "paddleocr-api" });
      }
    }
  } catch { /* hosted API unavailable */ }

  // ── Fallback: PaddleOCR.js browser-side hint ──
  return NextResponse.json({
    success: false,
    ready: false,
    message: "PaddleOCR 服务暂未连接。可通过以下方式启用：",
    options: [
      "1. PaddleOCR Docker: docker run -p 8866:8866 paddlecloud/paddleocr:latest",
      "2. 浏览器端: 使用 PaddleOCR.js CDN（自动加载）",
      "3. pip install paddlepaddle paddleocr（本地部署）",
    ],
    browserFallback: "请在前端直接使用 PaddleOCR.js 进行浏览器端 OCR",
    reference: "https://github.com/PaddlePaddle/PaddleOCR",
  }, { status: 503 });
}
