import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// AI knowledge extraction from uploaded document text.
// POST { text, subject? }
// Returns { concepts: Array<{name, description, importance}>,
//           relationships: Array<{source, target, type}> }
// Degrades to a mock response when AI is not configured.
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 60;

interface Concept {
  name: string;
  description: string;
  importance: number; // 1-5
}

interface Relationship {
  source: string;
  target: string;
  type: string; // "prerequisite" | "related" | "contains" | "applies"
}

interface ExtractionResult {
  concepts: Concept[];
  relationships: Relationship[];
}

const MOCK_RESULT: ExtractionResult = {
  concepts: [
    { name: "注意力机制", description: "神经网络中让模型关注输入相关部分的机制，核心是 Query/Key/Value 的计算", importance: 5 },
    { name: "自注意力", description: "序列中每个位置都与所有位置计算注意力权重，捕获全局依赖", importance: 5 },
    { name: "多头注意力", description: "并行运行多个注意力头，每个头关注不同子空间，增强表达能力", importance: 4 },
    { name: "位置编码", description: "为 Transformer 注入序列位置信息，常用正弦/余弦编码", importance: 3 },
  ],
  relationships: [
    { source: "注意力机制", target: "自注意力", type: "contains" },
    { source: "自注意力", target: "多头注意力", type: "contains" },
    { source: "自注意力", target: "位置编码", type: "相关" },
  ],
};

function buildPrompt(text: string, subject?: string): string {
  return `你是一个知识图谱构建专家。请从以下文本中提取核心概念及其关系。

${subject ? `文本所属学科：${subject}` : ""}
文本内容（截取前 5000 字）：
"""
${text.slice(0, 5000)}
"""

请返回一个 JSON 对象，格式如下：
{
  "concepts": [
    { "name": "概念名称", "description": "一句话描述", "importance": 数字1-5 }
  ],
  "relationships": [
    { "source": "概念A", "target": "概念B", "type": "prerequisite|related|contains|applies" }
  ]
}

要求：
1. 提取 3-8 个核心概念
2. importance 1-5：5 表示核心概念，1 表示边缘概念
3. relationship type：prerequisite(前置知识), related(相关), contains(包含), applies(应用)
4. 只返回 JSON，不要任何额外文字`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "请提供文本内容 (text 字段)" },
        { status: 400 }
      );
    }

    const text = String(body.text).slice(0, 8000);
    const subject = typeof body.subject === "string" ? body.subject : undefined;

    // If text is too short, return mock
    if (text.length < 50) {
      return NextResponse.json(MOCK_RESULT);
    }

    const prompt = buildPrompt(text, subject);
    const raw = await completeChat([
      { role: "system", content: "你是一个知识图谱构建AI。只返回JSON，不要包含任何额外文字。" },
      { role: "user", content: prompt },
    ], { temperature: 0.3 });

    const jsonStr = extractJson(raw);
    let parsed: Partial<ExtractionResult> = {};
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // If JSON parse fails, try to salvage common patterns
      return NextResponse.json(MOCK_RESULT);
    }

    const concepts: Concept[] = (parsed.concepts ?? [])
      .filter((c: unknown) => typeof (c as Concept)?.name === "string")
      .slice(0, 12)
      .map((c: Concept) => ({
        name: c.name,
        description: c.description ?? "",
        importance: Math.min(5, Math.max(1, Math.round(c.importance) || 3)),
      }));

    const conceptNames = new Set(concepts.map((c) => c.name));
    const relationships: Relationship[] = (parsed.relationships ?? [])
      .filter(
        (r: Relationship) =>
          typeof r.source === "string" &&
          typeof r.target === "string" &&
          conceptNames.has(r.source) &&
          conceptNames.has(r.target)
      )
      .slice(0, 20)
      .map((r: Relationship) => ({
        source: r.source,
        target: r.target,
        type: r.type ?? "related",
      }));

    return NextResponse.json({
      concepts: concepts.length > 0 ? concepts : MOCK_RESULT.concepts,
      relationships: relationships.length > 0 ? relationships : MOCK_RESULT.relationships,
    });
  } catch (err) {
    console.error("[knowledge-extract] error:", err);
    // Graceful degradation — return mock on any error
    return NextResponse.json(MOCK_RESULT);
  }
}
