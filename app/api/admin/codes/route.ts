// GET /api/admin/codes — List all Mango Codes (admin only)
// PATCH /api/admin/codes — Update code status (disable/enable/revoke)
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { listCodes, getCodeByCode, updateCodeStatus } from "@/lib/mango-code/mango-code";

function adminGate(session: Awaited<ReturnType<typeof resolveSession>>) {
  if (session.plan !== "admin") {
    return NextResponse.json({ error: "需要管理员权限", code: "ADMIN_REQUIRED" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = await resolveSession(req);
  const gate = adminGate(session);
  if (gate) return gate;

  const codes = listCodes();
  return NextResponse.json({ codes });
}

export async function PATCH(req: NextRequest) {
  const session = await resolveSession(req);
  const gate = adminGate(session);
  if (gate) return gate;

  try {
    const { code, status } = await req.json() as { code: string; status: string };
    if (!code || !["active", "disabled", "revoked"].includes(status)) {
      return NextResponse.json({ error: "无效参数" }, { status: 400 });
    }

    const entry = getCodeByCode(code.toUpperCase().trim());
    if (!entry) {
      return NextResponse.json({ error: "兑换码不存在" }, { status: 404 });
    }

    updateCodeStatus(code.toUpperCase().trim(), status as "active" | "disabled" | "revoked");
    return NextResponse.json({ success: true, message: `码 ${code} → ${status}` });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
