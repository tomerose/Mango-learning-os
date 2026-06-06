// ═══════════════════════════════════════════════════════════════
// POST /api/wechat/menu — Create WeChat bottom menu
// Called once during setup, or to update menu
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { createMenu } from "@/lib/wechat/client";

export const runtime = "nodejs";

export async function POST() {
  const ok = await createMenu();
  return NextResponse.json({
    success: ok,
    message: ok ? "菜单已创建" : "菜单创建失败，请检查 access_token",
    note: ok ? "在微信中重新关注测试号即可看到菜单" : "",
  });
}
