import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

function scoreAnswer(userAnswer: string, correctAnswer: string, type: string, maxPoints: number): { isCorrect: boolean; points: number; feedback: string } {
  const u = userAnswer.trim().toLowerCase();
  const c = correctAnswer.trim().toLowerCase();

  if (type === "mcq") {
    const correct = u === c;
    return { isCorrect: correct, points: correct ? maxPoints : 0, feedback: correct ? "正确！" : `正确答案是：${correctAnswer}` };
  }
  if (type === "fill_blank") {
    const accepted = correctAnswer.split("|").map(s => s.trim().toLowerCase());
    const matched = accepted.some(a => u.includes(a) || a.includes(u));
    return { isCorrect: matched, points: matched ? maxPoints : 0, feedback: matched ? "正确！" : `可接受的答案：${correctAnswer}` };
  }
  // problem — AI-like keyword match
  const keywords = correctAnswer.split(",").map(s => s.trim().toLowerCase());
  const hits = keywords.filter(k => u.includes(k)).length;
  const ratio = keywords.length > 0 ? hits / keywords.length : 0;
  const points = Math.round(ratio * maxPoints);
  const isCorrect = ratio >= 0.5;
  return {
    isCorrect,
    points,
    feedback: isCorrect
      ? `得分 ${points}/${maxPoints} — 覆盖了 ${hits}/${keywords.length} 个关键点`
      : `得分 ${points}/${maxPoints} — 缺少这些关键点：${keywords.filter(k => !u.includes(k)).join("、")}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, topic, questions } = body as {
      subject: string; topic: string;
      questions: { id: string; question: string; type: string; userAnswer: string; correctAnswer: string; maxPoints?: number }[];
    };

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions submitted" }, { status: 400 });
    }

    const MAX_PER_Q = 4;
    const details: {
      questionId: string; question: string; userAnswer: string; correctAnswer: string;
      isCorrect: boolean; feedback: string; points: number; maxPoints: number;
    }[] = [];
    let score = 0;
    let total = 0;

    for (const qi of questions) {
      const mp = qi.maxPoints ?? MAX_PER_Q;
      const { isCorrect, points, feedback } = scoreAnswer(qi.userAnswer, qi.correctAnswer, qi.type, mp);
      details.push({ questionId: qi.id, question: qi.question, userAnswer: qi.userAnswer, correctAnswer: qi.correctAnswer, isCorrect, feedback, points, maxPoints: mp });
      score += points;
      total += mp;
    }

    // Save to DB if configured
    let savedResult = null;
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from("exam_results")
          .insert({ user_id: user.id, subject: subject ?? "", topic: topic ?? "", score, total, details })
          .select("*").single();
        if (!error && data) savedResult = { id: data.id };
      }
    }

    return NextResponse.json({
      score, total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      details,
      saved: savedResult,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Scoring failed" }, { status: 500 });
  }
}
