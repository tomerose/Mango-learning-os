// POST /api/admin/codes/manage — uses raw REST API to bypass PostgREST schema cache
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_EMAIL = "1211000567@qq.com";

function headers() {
  return {
    "Content-Type": "application/json",
    "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
    "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
  };
}

export async function POST(req: NextRequest) {
  // Auth
  try {
    const ssr = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } });
    const { data: { user } } = await ssr.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: "无管理员权限" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL!}/rest/v1/mango_codes`;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "generate") {
      const { planGranted, durationType, durationValue, count, maxUses, note } = body;
      const CH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const g4 = () => { let s = ""; for (let i = 0; i < 4; i++) s += CH[Math.floor(Math.random() * CH.length)]; return s; };
      const prefix = planGranted === "admin" ? "MANGO-ADM-" : planGranted === "pro" ? "MANGO-PRO-" : "MANGO-STD-";
      const codes: string[] = [];
      for (let i = 0; i < (count || 1); i++) {
        const code = `${prefix}${g4()}-${g4()}-${g4()}`;
        const res = await fetch(BASE, {
          method: "POST", headers: { ...headers(), Prefer: "return=minimal" },
          body: JSON.stringify({ code, plan_granted: planGranted, duration_type: durationType || "days", duration_value: durationValue || 30, max_uses: maxUses || 1, note: note || null }),
        });
        if (res.ok) codes.push(code);
      }
      if (codes.length > 0) return NextResponse.json({ success: true, codes });
      return NextResponse.json({ success: false, error: "写入失败" });
    }

    if (action === "toggle") {
      const { code, status } = body;
      await fetch(`${BASE}?code=eq.${encodeURIComponent(code)}`, { method: "PATCH", headers: { ...headers(), Prefer: "return=minimal" }, body: JSON.stringify({ status }) });
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { code } = body;
      await fetch(`${BASE}?code=eq.${encodeURIComponent(code)}`, { method: "DELETE", headers: { ...headers(), Prefer: "return=minimal" } });
      return NextResponse.json({ success: true });
    }

    if (action === "list") {
      const res = await fetch(`${BASE}?select=*&order=created_at.desc&limit=200`, { headers: headers() });
      const data = await res.json();
      return NextResponse.json({ success: true, codes: data || [] });
    }

    return NextResponse.json({ success: false, error: "unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "server error" }, { status: 500 });
  }
}
