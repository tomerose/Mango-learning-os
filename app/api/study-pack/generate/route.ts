// V11 Study Pack Generate — With server-side plan/quota enforcement
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { guard, guardQuota } from "@/lib/plan/guard";
import { recordQuotaUse } from "@/lib/quota/quota";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // ── Server-side guard ──
  const session = await resolveSession(req);
  const blocked = guard({ plan: session.plan }, "canUseDeepStudyPack");
  if (blocked) return blocked;

  if (session.plan !== "guest") {
    const quotaResult = recordQuotaUse(session.userId ?? "guest", "studyPacks", session.plan);
    if (!quotaResult.allowed) {
      return guardQuota({ plan: session.plan }, "maxDailyStudyPacks", quotaResult.current)!;
    }
  }

  // Forward to the existing exam-review generate endpoint
  const body = await req.json();
  const res = await fetch(new URL("/api/exam-review/generate", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
