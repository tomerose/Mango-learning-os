// POST /api/mango-code/redeem — Redeem a Mango Code
// V14.7.5: Supabase atomic redemption via redeem_mango_code() RPC
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveSession } from "@/lib/auth/session";
import { redeemCode, validateCode } from "@/lib/mango-code/mango-code";
import { getPlanInfo } from "@/lib/plan/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(req: NextRequest) {
  const session = await resolveSession(req);

  if (!session.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: { code: "AUTH_REQUIRED", message: "请先注册或登录后再兑换" } },
      { status: 401 },
    );
  }

  try {
    const { code, validateOnly } = await req.json() as { code: string; validateOnly?: boolean };

    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "请输入兑换码" } },
        { status: 400 },
      );
    }

    // validateOnly: check without consuming
    if (validateOnly) {
      const validation = validateCode(code.trim());
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: { code: "INVALID_CODE", message: validation.error! } }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { valid: true, planGranted: validation.planGranted } });
    }

    // Actual redemption (Supabase atomic or localStorage)
    const result = await redeemCode(code.trim(), session.userId!);

    if (!result.success) {
      const statusMap: Record<string, number> = { INVALID_CODE: 404, ALREADY_USED: 409, EXPIRED: 410, DISABLED: 403 };
      return NextResponse.json(
        { success: false, error: { code: result.errorCode || "SERVER_ERROR", message: result.error! } },
        { status: statusMap[result.errorCode ?? "INVALID_CODE"] ?? 400 },
      );
    }

    // Also update profiles via service_role if Supabase is configured
    if (isSupabaseConfigured() && result.newPlan) {
      try {
        const sb = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { cookies: { getAll: () => [], setAll: () => {} } },
        );
        await sb.from("profiles").update({
          plan: result.newPlan,
          plan_expires_at: result.planExpiresAt ?? null,
          updated_at: new Date().toISOString(),
        }).eq("id", session.userId);
      } catch { /* code already consumed via RPC, profile update is best-effort */ }
    }

    const planInfo = getPlanInfo(result.newPlan!, result.planExpiresAt);
    const expiryText = result.planExpiresAt
      ? `有效期至 ${new Date(result.planExpiresAt).toLocaleDateString("zh-CN")}`
      : "永久有效";

    return NextResponse.json({
      success: true,
      data: {
        plan: planInfo,
        message: `成功兑换 ${planInfo.name}！${expiryText}`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "兑换处理失败，请重试" } },
      { status: 500 },
    );
  }
}
