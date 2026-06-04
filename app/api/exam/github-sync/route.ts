import { NextRequest, NextResponse } from "next/server";

/**
 * Export exam questions as JSON for GitHub backup.
 * POST /api/exam/github-sync?action=export — returns JSON blob the user can commit to their repo.
 * GET  /api/exam/github-sync?action=import&url=... — pulls questions from a GitHub raw URL.
 */
export const runtime = "nodejs";

// GET — import questions from GitHub raw JSON URL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url param" }, { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    const data = await res.json();
    const questions = Array.isArray(data) ? data : data.questions ?? [];
    if (!Array.isArray(questions)) throw new Error("Invalid format — expected array of questions");

    return NextResponse.json({
      questions: questions.map((q: Record<string, unknown>) => ({
        subject: q.subject ?? "",
        topic: q.topic ?? "",
        type: q.type ?? "mcq",
        question: q.question ?? "",
        options: q.options ?? [],
        answer: String(q.answer ?? ""),
        explanation: q.explanation ?? "",
        difficulty: q.difficulty ?? "medium",
      })),
      count: questions.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Import failed" }, { status: 500 });
  }
}

// POST — export format instructions
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const questions = body.questions ?? [];
  const repo = body.repo ?? "tomerose/Mango-learning-os";
  const path = body.path ?? "data/exam-questions.json";

  // Return the export payload + instructions
  const exportData = {
    _meta: {
      description: "Mango Learning OS — Exam Question Bank Export",
      exportedAt: new Date().toISOString(),
      version: 2,
      instructions: [
        "1. Copy this JSON to your GitHub repo at: https://github.com/" + repo,
        "2. Create a file at: " + path,
        "3. To import back, use: GET /api/exam/github-sync?url=https://raw.githubusercontent.com/" + repo + "/main/" + path,
        "4. You can also use GitHub MCP tools in Claude Code to push this automatically.",
      ],
    },
    questions: Array.isArray(questions) ? questions : [],
  };

  return NextResponse.json(exportData);
}
