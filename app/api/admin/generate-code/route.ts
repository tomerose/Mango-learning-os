// POST /api/admin/generate-code — Generate Mango Code(s)
// Admin only — gated by ADMIN_EMAILS or plan=admin
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { generateCodes, isAdminSession } from "@/lib/mango-code/mango-code";
import type { GenerateCodeRequest } from "@/lib/mango-code/types";

export async function POST(req: NextRequest) {
  const session = await resolveSession(req);

  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } }, { status: 401 });
  }
  if (!isAdminSession(session.plan, session.email)) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } }, { status: 403 });
  }

  try {
    const body = await req.json() as GenerateCodeRequest & { durationType?: string; maxUses?: number };

    if (!body.planGranted || !["standard", "pro", "admin"].includes(body.planGranted)) {
      return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "请选择有效等级" } }, { status: 400 });
    }

    const result = await generateCodes({
      planGranted: body.planGranted,
      durationDays: body.durationDays ?? 30,
      durationType: body.durationType ?? "days",
      count: body.count ?? 5,
      maxRedemptions: body.maxUses ?? 1,
      notes: body.notes,
      expiresAt: body.expiresAt,
    }, session.userId!);

    return NextResponse.json({
      success: true,
      data: {
        codes: result.codes,
        planGranted: result.planGranted,
        durationDays: result.durationDays,
        count: result.codes.length,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "生成失败" } }, { status: 500 });
  }
}
