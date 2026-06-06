// GET /api/admin/codes — List all Mango Codes (admin only)
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { listCodes } from "@/lib/mango-code/mango-code";

export async function GET(req: NextRequest) {
  const session = await resolveSession(req);

  if (session.plan !== "admin") {
    return NextResponse.json(
      { error: "需要管理员权限", code: "ADMIN_REQUIRED" },
      { status: 403 },
    );
  }

  const codes = listCodes();
  return NextResponse.json({ codes });
}
