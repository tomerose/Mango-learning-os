import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

export const runtime = "nodejs";

// POST /api/ai/project-review — AI project review endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, submissionContent, learningGoals } = body as {
      title: string;
      description?: string;
      submissionContent: string;
      learningGoals?: string[];
    };

    if (!title?.trim() || !submissionContent?.trim()) {
      return NextResponse.json(
        { error: "Title and submission content are required" },
        { status: 400 }
      );
    }

    if (!process.env.AI_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured. Set AI_API_KEY in .env.local." },
        { status: 503 }
      );
    }

    const goalsText = learningGoals?.length
      ? learningGoals.map((g, i) => `${i + 1}. ${g}`).join("\n")
      : "未指定学习目标";

    const prompt = `你是一位资深技术导师和项目评审专家。请对学生的项目进行全面、建设性的评审。

**项目名称**：${title}
**项目描述**：${description ?? "未提供"}
**学习目标**：
${goalsText}

**提交内容**：
"""
${submissionContent.slice(0, 6000)}
"""

请从以下四个维度评分（每个维度 1-10 分）并给出具体建议。返回严格 JSON（不要 markdown 代码块）：

{
  "scores": {
    "correctness": 8,
    "completeness": 7,
    "creativity": 9,
    "bestPractices": 7
  },
  "suggestions": [
    "具体改进建议1（要具体可操作，带示例更好）",
    "具体改进建议2",
    "具体改进建议3"
  ],
  "summary": "一段 3-5 句的总体评价，语气鼓励但诚实，点出最强和最需要改进的方面。开头先肯定学生的努力和亮点。"
}

评分说明：
- correctness: 逻辑/代码/分析是否正确
- completeness: 是否覆盖了学习目标，是否有遗漏
- creativity: 是否有独立思考和创新点
- bestPractices: 代码规范/结构/可读性/文档等工程实践

请用中文回复。语气温暖鼓励，像一位关心学生成长的导师。`;

    const raw = await completeChat(
      [{ role: "user", content: prompt }],
      { temperature: 0.4 }
    );
    const json = JSON.parse(extractJson(raw));
    return NextResponse.json(json);
  } catch (err) {
    console.error("[project-review] error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate review",
      },
      { status: 500 }
    );
  }
}
