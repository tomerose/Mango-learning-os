import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

export const runtime = "nodejs";
const MAX_CONTENT = 12000;

function extractText(buf: Buffer, mime: string): string {
  const t = buf.toString("utf-8").slice(0, 80000);
  if (mime.includes("html") || t.includes("<html")) return t.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  return t;
}

// POST /api/exam-master — parse files or generate exam package
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, unknown> = {};
    let fileText = "";

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      const file = fd.get("file") as File | null;
      const action = fd.get("action") as string;
      body = { action, subject: fd.get("subject"), topic: fd.get("topic"), extra: fd.get("extra") };
      if (file) { const buf = Buffer.from(await file.arrayBuffer()); fileText = extractText(buf, file.type || "text/plain"); }
    } else {
      body = await req.json().catch(() => ({}));
    }

    const { action, subject, topic, extra, content } = body as Record<string, string>;

    if (!process.env.AI_API_KEY) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

    if (action === "parse-file") {
      const text = fileText || content || "";
      if (!text || text.length < 20) return NextResponse.json({ error: "No content to parse" }, { status: 400 });
      return NextResponse.json({ text: text.slice(0, MAX_CONTENT), length: Math.min(text.length, MAX_CONTENT) });
    }

    if (action === "generate") {
      const prompt = `你是资深教育专家，为课程「${subject || "学科"}」${topic ? `的「${topic}」主题` : ""}生成期末考试复习包。
${content ? `参考以下资料：\n${String(content).slice(0, 8000)}\n` : ""}${extra ? `额外要求：${extra}\n` : ""}

返回严格合法 JSON：
{
  "package": {
    "title": "复习包标题",
    "subject": "${subject || ""}",
    "topic": "${topic || ""}",
    "overview": "课程概述 (2-3句话)"
  },
  "knowledgeMap": {
    "description": "知识体系概况",
    "nodes": [{"name":"核心概念","children":["子概念1","子概念2"]}]
  },
  "chapters": [
    {"title":"章节名","keyPoints":["重点1","重点2"],"summary":"章节概述","commonMistakes":["易错点1"],"examples":[{"problem":"题目","solution":"解答步骤","tips":"技巧提示"}]}
  ],
  "examPrep": {
    "highFrequencyTopics": ["高频考点1"],
    "predictedQuestions": ["可能考题1"],
    "studyStrategy": "复习策略建议"
  },
  "cheatSheet": "一页纸速查表（Markdown格式，精简核心公式/概念）"
}`;

      const raw = await completeChat([{ role: "user", content: prompt }], { temperature: 0.3 });
      const json = JSON.parse(extractJson(raw));
      return NextResponse.json(json);
    }

    return NextResponse.json({ error: "Unknown action: " + action }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
