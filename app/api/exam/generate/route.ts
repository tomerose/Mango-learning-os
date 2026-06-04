import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

export const runtime = "nodejs";
const MAX_RETRY = 2;

function buildGenPrompt(subject: string, topic: string, count: number, difficulty: string, types: string, extra: string): string {
  return `你是资深出题专家，为「${subject}」学科就「${topic}」主题生成 ${count} 道${difficulty}难度的题目。
题目类型要求：${types}。
额外要求：${extra || "无"}

输出严格合法的 JSON，格式如下：
{"questions":[{"type":"mcq|fill_blank|problem","question":"题干","options":["A.选项1","B.选项2","C.选项3","D.选项4"],"answer":"正确答案","explanation":"解析"}],"total":${count}}

规则：
- MCQ 必须 4 个选项，options 为字符串数组，answer 为正确选项文本（与options中完全一致）
- fill_blank answer 为正确答案，可接受多个等价答案用 | 分隔
- problem answer 为关键得分点，逗号分隔
- 中文出题，专业术语带英文
- 考查理解而非记忆，解析要点明易错点`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, topic, count = 5, difficulty = "medium", types = "mcq", extra = "" } = body;

    if (!subject || !topic) {
      return NextResponse.json({ error: "学科和主题不能为空" }, { status: 400 });
    }

    if (!process.env.AI_API_KEY) {
      return NextResponse.json({ error: "AI 未配置，请在环境变量中设置 AI_API_KEY" }, { status: 503 });
    }

    const safeCount = Math.min(Math.max(count, 1), 15);

    // Retry loop for malformed JSON
    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      try {
        const prompt = buildGenPrompt(subject, topic, safeCount, difficulty, types, extra);
        const raw = await completeChat(
          [{ role: "user", content: prompt }],
          { temperature: 0.6 }
        );

        const json = extractJson(raw);
        const parsed = JSON.parse(json);
        const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];

        const valid = questions.filter((q: Record<string, unknown>) =>
          q.type && q.question && q.answer && (q.type !== "mcq" || (Array.isArray(q.options) && q.options.length >= 2))
        );

        if (valid.length === 0) {
          if (attempt < MAX_RETRY) continue;
          return NextResponse.json({ error: "AI 未生成有效题目，请调整主题或要求后重试", raw: raw.slice(0, 300) }, { status: 502 });
        }

        return NextResponse.json({
          questions: valid.map((q: Record<string, unknown>) => ({
            subject,
            topic,
            type: q.type ?? "mcq",
            question: q.question ?? "",
            options: q.options ?? [],
            answer: String(q.answer ?? ""),
            explanation: q.explanation ?? "",
            difficulty,
          })),
          total: valid.length,
        });
      } catch (err) {
        if (attempt >= MAX_RETRY) throw err;
      }
    }

    return NextResponse.json({ error: "生成失败，请重试" }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "生成失败" }, { status: 500 });
  }
}
