import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fromExamQuestionRow, type ExamQuestionRow } from "@/lib/supabase/mappers";

export const runtime = "nodejs";

// GET /api/exam/questions?subject=ai&topic=math
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ questions: [] });
  }
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const topic = searchParams.get("topic");

    let q = supabase.from("exam_questions").select("*").order("created_at", { ascending: false });
    if (subject) q = q.eq("subject", subject);
    if (topic) q = q.eq("topic", topic);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ questions: (data as ExamQuestionRow[]).map(fromExamQuestionRow) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Fetch failed" }, { status: 500 });
  }
}

// POST /api/exam/questions — create new question
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { subject, topic, type, question, options, answer, explanation, difficulty } = body;

    if (!subject || !topic || !type || !question || answer === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase.from("exam_questions")
      .insert({
        user_id: user.id, subject, topic, type,
        question, options: options ?? [],
        answer: String(answer), explanation: explanation ?? "",
        difficulty: difficulty ?? "medium",
      })
      .select("*").single();

    if (error) throw error;
    return NextResponse.json({ question: fromExamQuestionRow(data as ExamQuestionRow) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Create failed" }, { status: 500 });
  }
}
