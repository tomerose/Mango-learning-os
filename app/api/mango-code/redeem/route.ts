// POST /api/mango-code/redeem — Redeem a Mango Code
// Anti-double-spend: atomic check-then-update
// Supports validateOnly mode for client-side live validation
import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/session";
import { redeemCode, validateCode } from "@/lib/mango-code/mango-code";
import { getPlanInfo } from "@/lib/plan/types";

export async function POST(req: NextRequest) {
  const session = await resolveSession(req);

  // Guest users cannot redeem
  if (!session.isAuthenticated) {
    return NextResponse.json(
      { error: "请先注册或登录后再兑换", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  try {
    const { code, validateOnly } = await req.json() as { code: string; validateOnly?: boolean };

    if (!code?.trim()) {
      return NextResponse.json(
        { error: "请输入兑换码", code: "INVALID_INPUT" },
        { status: 400 },
      );
    }

    // ── validateOnly: check validity WITHOUT consuming the code ──
    if (validateOnly) {
      const validation = validateCode(code.trim());
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error, code: "INVALID_CODE" },
          { status: 404 },
        );
      }
      const planInfo = getPlanInfo(validation.planGranted!);
      return NextResponse.json({
        success: true,
        valid: true,
        message: `有效兑换码 · ${planInfo.name}`,
        plan: { tier: validation.planGranted, name: planInfo.name },
      });
    }

    // ── Actual redemption ──
    const result = redeemCode(code.trim(), session.userId!);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        INVALID_CODE: 404,
        ALREADY_USED: 409,
        EXPIRED: 410,
        DISABLED: 403,
        CONFLICT: 409,
      };
      return NextResponse.json(
        { error: result.error, code: result.errorCode },
        { status: statusMap[result.errorCode ?? "INVALID_CODE"] ?? 400 },
      );
    }

    // Get updated plan info
    const planInfo = getPlanInfo(result.newPlan!, result.planExpiresAt);

    return NextResponse.json({
      success: true,
      message: `成功兑换 ${planInfo.name}！`,
      plan: planInfo,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "兑换处理失败，请重试", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
