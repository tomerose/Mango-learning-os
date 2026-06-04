import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

export const runtime = "nodejs";
const MAX_RETRY = 2;

function buildGenPrompt(
  subject: string, topic: string, count: number, difficulty: string,
  types: string, extra: string, sourceText: string
): string {
  let context = "";
  if (sourceText) {
    context = `\n参考资料（请基于此资料出题）：\n${sourceText.slice(0, 8000)}\n`;
  }

  return `你是资深出题专家，为「${subject}」学科就「${topic}」主题生成 ${count} 道${difficulty}难度的题目。
题目类型要求：${types}。
额外要求：${extra || "无"}${context}

输出严格合法的 JSON，格式如下：
{"questions":[{"type":"mcq|fill_blank|problem","question":"题干","options":["A.选项1","B.选项2","C.选项3","D.选项4"],"answer":"正确答案","explanation":"解析"}],"total":${count}}

规则：
- MCQ 必须 4 个选项，options 为字符串数组，answer 为正确选项文本（与options中完全一致）
- fill_blank answer 为正确答案，可接受多个等价答案用 | 分隔
- problem answer 为关键得分点，逗号分隔
- 中文出题，专业术语带英文
- 考查理解而非记忆，解析要点明易错点${sourceText ? "\n- 严格基于参考资料内容出题，不要编造参考资料中没有的知识点" : ""}`;
}

async function fetchSources(urls: string[]): Promise<{ text: string; errors: string[] }> {
  const errors: string[] = [];
  const parts: string[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url.trim(), { signal: AbortSignal.timeout(15000) });
      if (!res.ok) { errors.push(`${url}: HTTP ${res.status}`); continue; }
      const html = await res.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 6000);
      if (text.length > 50) {
        parts.push(`[来源: ${url}]\n${text}`);
      } else {
        errors.push(`${url}: 提取内容过短`);
      }
    } catch {
      errors.push(`${url}: 请求超时或网络错误`);
    }
  }

  return { text: parts.join("\n\n"), errors };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject, topic, count = 5, difficulty = "medium",
      types = "mcq", extra = "",
      sourceUrls = [],   // URLs to fetch for source material
      sourceText = "",   // pre-extracted text (from file upload)
    } = body;

    if (!subject || !topic) {
      return NextResponse.json({ error: "学科和主题不能为空" }, { status: 400 });
    }

    if (!process.env.AI_API_KEY) {
      return NextResponse.json({ error: "AI 未配置，请在环境变量中设置 AI_API_KEY" }, { status: 503 });
    }

    const safeCount = Math.min(Math.max(count, 1), 15);

    // ── Web research: fetch URLs if provided ────────────────
    let combinedSourceText = sourceText ? String(sourceText).slice(0, 8000) : "";
    const fetchErrors: string[] = [];

    if (Array.isArray(sourceUrls) && sourceUrls.length > 0) {
      const { text, errors } = await fetchSources(sourceUrls as string[]);
      if (text) {
        combinedSourceText = combinedSourceText
          ? `${combinedSourceText}\n\n---\n${text}`
          : text;
      }
      fetchErrors.push(...errors);
    }

    // ── Generate ────────────────────────────────────────────
    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      try {
        const prompt = buildGenPrompt(subject, topic, safeCount, difficulty, types, extra, combinedSourceText);
        const raw = await completeChat(
          [{ role: "user", content: prompt }],
          { temperature: 0.6 }
        );

        const json = extractJson(raw);
        const parsed = JSON.parse(json);
        const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];

        const valid = questions.filter((q: Record<string, unknown>) =>
          q.type && q.question && q.answer &&
          (q.type !== "mcq" || (Array.isArray(q.options) && q.options.length >= 2))
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
          fetchErrors: fetchErrors.length > 0 ? fetchErrors : undefined,
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
