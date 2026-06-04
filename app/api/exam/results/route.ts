import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fromExamResultRow, type ExamResultRow } from "@/lib/supabase/mappers";

// GET /api/exam/results — fetch history, optionally filtered by subject
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ results: [] });
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ results: [] });

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    let q = supabase.from("exam_results").select("*").order("created_at", { ascending: false }).limit(50);
    if (subject) q = q.eq("subject", subject);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ results: (data as ExamResultRow[]).map(fromExamResultRow) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Fetch failed" }, { status: 500 });
  }
}
