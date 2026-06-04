import { NextRequest, NextResponse } from "next/server";

import { completeChat, extractJson } from "@/lib/ai/client";
import { buildQuizPrompt } from "@/lib/ai/prompts";
import type { QuizQuestion, SubjectId } from "@/lib/types";

export const runtime = "nodejs";

const VALID_SUBJECTS: SubjectId[] = [
  "ai",
  "economics",
  "finance",
  "math",
  "english",
];

const VALID_DIFFICULTY = ["easy", "medium", "hard"] as const;

// Deterministic fallback when no API key is configured, so the quiz UI
// is fully demoable offline.
function mockQuiz(topic: string): QuizQuestion[] {
  return [
    {
      question: `（演示模式）关于「${topic}」，以下哪一项最准确？配置 AI_API_KEY 后将由 DeepSeek 生成真实题目。`,
      options: ["选项 A", "选项 B（正确）", "选项 C", "选项 D"],
      answerIndex: 1,
      explanation:
        "这是演示题。设置 .env.local 中的 AI_API_KEY 即可生成针对该主题的真实选择题与解析。",
    },
  ];
}

function isValidQuestion(q: unknown): q is QuizQuestion {
  if (!q || typeof q !== "object") return false;
  const obj = q as Record<string, unknown>;
  return (
    typeof obj.question === "string" &&
    Array.isArray(obj.options) &&
    obj.options.length >= 2 &&
    obj.options.every((o) => typeof o === "string") &&
    typeof obj.answerIndex === "number" &&
    obj.answerIndex >= 0 &&
    obj.answerIndex < obj.options.length &&
    typeof obj.explanation === "string"
  );
}

export async function POST(req: NextRequest) {
  let body: {
    subject?: string;
    topic?: string;
    count?: number;
    difficulty?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const subject = body.subject as SubjectId;
  const topic = (body.topic ?? "").trim();
  const count = Math.min(Math.max(body.count ?? 5, 1), 10);
  const difficulty = (
    VALID_DIFFICULTY.includes(body.difficulty as never)
      ? body.difficulty
      : "medium"
  ) as (typeof VALID_DIFFICULTY)[number];

  if (!VALID_SUBJECTS.includes(subject)) {
    return NextResponse.json(
      { error: `Unknown subject: ${subject}` },
      { status: 400 }
    );
  }
  if (!topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  try {
    if (!process.env.AI_API_KEY) {
      return NextResponse.json({ questions: mockQuiz(topic) });
    }

    const messages = buildQuizPrompt(subject, topic, count, difficulty);
    const raw = await completeChat(messages, { temperature: 0.5 });

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      return NextResponse.json(
        { error: "AI 返回的格式无法解析，请重试" },
        { status: 502 }
      );
    }

    const questionsRaw = (parsed as { questions?: unknown })?.questions;
    const questions = Array.isArray(questionsRaw)
      ? questionsRaw.filter(isValidQuestion)
      : [];

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "AI 未生成有效题目，请换个主题或重试" },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quiz generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
