// GET /api/auth/plan — Current user plan info
// Returns plan tier, features, quota status
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { getPlanInfo } from "@/lib/plan/types";
import { getQuotaStatus } from "@/lib/quota/quota";

export async function GET(req: NextRequest) {
  const session = await resolveSession(req);
  const planInfo = getPlanInfo(session.plan, session.planExpiresAt ?? undefined);
  const quota = getQuotaStatus(session.userId ?? "guest", session.plan);

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    isAuthenticated: session.isAuthenticated,
    plan: planInfo,
    quota,
  });
}
