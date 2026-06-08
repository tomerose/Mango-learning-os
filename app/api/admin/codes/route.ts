// GET /api/admin/codes — List codes + stats (admin only)
// PATCH /api/admin/codes — Update code status
// DELETE /api/admin/codes — Delete code
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { listCodes, getCodeStats, updateCodeStatus, deleteCode, isAdminSession } from "@/lib/mango-code/mango-code";

async function adminGuard(req: NextRequest) {
  const session = await resolveSession(req);
  if (!session.isAuthenticated) {
    return { error: NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 }) };
  }
  if (!isAdminSession(session.plan, session.email)) {
    return { error: NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } }, { status: 403 }) };
  }
  return { session };
}

export async function GET(req: NextRequest) {
  const guard = await adminGuard(req);
  if ("error" in guard) return guard.error;

  try {
    const [codes, stats] = await Promise.all([listCodes(), getCodeStats()]);
    return NextResponse.json({ success: true, data: { codes, stats } });
  } catch (err: any) {
    console.error("[admin/codes GET]", err?.message || err);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: err?.message || "查询失败" } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await adminGuard(req);
  if ("error" in guard) return guard.error;

  try {
    const { code, status } = await req.json();
    if (!code || !["active", "disabled", "revoked"].includes(status)) {
      return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "无效参数" } }, { status: 400 });
    }
    const ok = await updateCodeStatus(code.toUpperCase().trim(), status);
    if (!ok) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "兑换码不存在" } }, { status: 404 });
    return NextResponse.json({ success: true, data: { code, status } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "操作失败" } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await adminGuard(req);
  if ("error" in guard) return guard.error;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "缺少 code 参数" } }, { status: 400 });
    await deleteCode(code.toUpperCase().trim());
    return NextResponse.json({ success: true, data: { code } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "操作失败" } }, { status: 500 });
  }
}
