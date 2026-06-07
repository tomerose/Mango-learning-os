// GET /api/auth/quota — Daily quota status only
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { getQuotaStatus } from "@/lib/quota/quota";

export async function GET(req: NextRequest) {
  const session = await resolveSession(req);
  const quota = getQuotaStatus(session.userId ?? "guest", session.plan);

  return NextResponse.json({
    ...quota,
    plan: session.plan,
  });
}
