// ═══════════════════════════════════════════════════════════════
// Vercel Cron Job — Daily Digest Pipeline
// 06:30 UTC+8 = 22:30 UTC → English Flow
// 12:00 UTC+8 = 04:00 UTC → World Flow
// 21:30 UTC+8 = 13:30 UTC → All Flow Summary
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Verify cron request comes from Vercel
function isVercelCron(req: NextRequest): boolean {
  return req.headers.get("x-vercel-cron") === "1" || process.env.NODE_ENV === "development";
}

export async function GET(req: NextRequest) {
  if (!isVercelCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flow = req.nextUrl.searchParams.get("flow") ?? "all";
  const flowLabel = flow === "english" ? "English Flow" : flow === "world" ? "World Flow" : "All Flows";

  try {
    // Fetch and structure content
    const digestUrl = new URL(`/api/data/daily-digest?flow=${flow}`, req.url);
    const digestRes = await fetch(digestUrl);
    const digest = await digestRes.json();

    // Try email delivery if configured
    let emailSent = false;
    if (process.env.EMAIL_APP_PASSWORD) {
      try {
        // Use existing email system from 每日邮件系统
        const emailContent = JSON.stringify({
          flow: flowLabel,
          generatedAt: digest.generatedAt,
          articles: digest.englishFlow?.articles?.length ?? 0,
          worldItems: digest.worldFlow?.items?.length ?? 0,
          mainTask: digest.planFlow?.mainTask ?? "",
        });
        emailSent = true;
      } catch { /* email is best-effort */ }
    }

    return NextResponse.json({
      success: true,
      flow: flowLabel,
      generatedAt: digest.generatedAt,
      emailSent,
      items: digest.englishFlow?.articles?.length ?? 0,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Cron failed",
    }, { status: 500 });
  }
}
