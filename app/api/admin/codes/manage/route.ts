// POST /api/admin/codes/manage — Generate/Update/Delete codes (service_role)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "1211000567@qq.com";

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  // Auth: verify user is admin
  try {
    const ssr = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } });
    const { data: { user } } = await ssr.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: "无管理员权限" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  try {
    const sb = getServiceClient();
    const body = await req.json();
    const { action } = body;

    if (action === "generate") {
      const { planGranted, durationType, durationValue, count, maxUses, note } = body;
      const codes: string[] = [];
      const CH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const g4 = () => { let s = ""; for (let i = 0; i < 4; i++) s += CH[Math.floor(Math.random() * CH.length)]; return s; };
      const prefix = planGranted === "admin" ? "MANGO-ADM-" : planGranted === "pro" ? "MANGO-PRO-" : "MANGO-STD-";
      for (let i = 0; i < (count || 1); i++) {
        const code = `${prefix}${g4()}-${g4()}-${g4()}`;
        const { error } = await sb.from("mango_codes").insert({ code, plan_granted: planGranted, duration_type: durationType || "days", duration_value: durationValue || 30, max_uses: maxUses || 1, note: note || null });
        if (!error) codes.push(code);
      }
      return NextResponse.json({ success: true, codes });
    }

    if (action === "toggle") {
      const { code, status } = body;
      await sb.from("mango_codes").update({ status }).eq("code", code);
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { code } = body;
      await sb.from("mango_codes").delete().eq("code", code);
      return NextResponse.json({ success: true });
    }

    if (action === "list") {
      const { data } = await sb.from("mango_codes").select("*").order("created_at", { ascending: false }).limit(200);
      return NextResponse.json({ success: true, codes: data || [] });
    }

    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "server error" }, { status: 500 });
  }
}
