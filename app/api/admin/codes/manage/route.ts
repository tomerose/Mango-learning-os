// /api/admin/codes/manage — Supabase client with explicit schema
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "1211000567@qq.com";

export async function POST(req: NextRequest) {
  try {
    const ssr = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } });
    const { data: { user } } = await ssr.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: "无管理员权限" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: "public" }, auth: { persistSession: false } }
  );

  const body = await req.json();
  const { action } = body;

  try {
    if (action === "generate") {
      const { planGranted, durationType, durationValue, count, maxUses, note } = body;
      const CH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const g4 = () => { let s = ""; for (let i = 0; i < 4; i++) s += CH[Math.floor(Math.random() * CH.length)]; return s; };
      const mk = (p: string) => `MANGO-${p === "admin" ? "ADM" : p === "pro" ? "PRO" : "STD"}-${g4()}-${g4()}-${g4()}`;
      const codes: string[] = [];
      for (let i = 0; i < (count || 1); i++) {
        const code = mk(planGranted);
        const { error } = await sb.from("mango_codes").insert({ code, plan_granted: planGranted, status: "active" });
        if (!error) codes.push(code);
      }
      return codes.length > 0 ? NextResponse.json({ success: true, codes }) : NextResponse.json({ success: false, error: "写入失败" });
    }
    if (action === "toggle") {
      await sb.from("mango_codes").update({ status: body.status }).eq("code", body.code);
      return NextResponse.json({ success: true });
    }
    if (action === "delete") {
      await sb.from("mango_codes").delete().eq("code", body.code);
      return NextResponse.json({ success: true });
    }
    if (action === "list") {
      const { data, error } = await sb.from("mango_codes").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) return NextResponse.json({ success: false, error: error.message });
      return NextResponse.json({ success: true, codes: data || [] });
    }
    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "server error" }, { status: 500 });
  }
}
