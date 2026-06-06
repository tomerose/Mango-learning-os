// ═══════════════════════════════════════════════════════════════
// Content Structure API — AI-powered knowledge structuring
// Transforms raw content → Cognitive Cards / Reasoning Chains / Decision Trees
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const limiter = createRateLimiter({ requests: 15, window: 60000 });

const STRUCTURE_SYSTEM = `你是知识结构化引擎。将原始内容转化为结构化认知单元。

输出严格JSON（3种类型之一）：

类型1 — 认知卡片 (CognitiveCard):
{
  "type": "card",
  "keyConcept": "核心概念（一句话）",
  "explanation": "结构化解释（2-3句）",
  "example": "具体例子",
  "misconception": "常见误区",
  "actionableInsight": "可执行的行动建议"
}

类型2 — 推理链 (ReasoningChain):
{
  "type": "chain",
  "topic": "主题",
  "steps": [
    {"step": 1, "logic": "推理步骤", "conclusion": "阶段性结论"},
    {"step": 2, "logic": "推理步骤", "conclusion": "阶段性结论"}
  ],
  "finalConclusion": "最终结论",
  "application": "实际应用"
}

类型3 — 决策树 (DecisionTree):
{
  "type": "tree",
  "scenario": "场景",
  "branches": [
    {"condition": "如果...", "action": "则...", "outcome": "结果"},
    {"condition": "如果...", "action": "则...", "outcome": "结果"}
  ],
  "recommendation": "推荐方案"
}

根据内容自动选择最合适的类型。中文输出，术语带英文。`;

export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(clientId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { content: string; title: string; source: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { content, title, source } = body;
  if (!content?.trim()) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  try {
    const raw = await completeChat([
      { role: "system", content: STRUCTURE_SYSTEM },
      { role: "user", content: `标题：${title}\n来源：${source}\n内容：${content.slice(0, 1500)}` },
    ], { temperature: 0.3 });

    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    return NextResponse.json({
      ...parsed,
      source,
      sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
    });
  } catch {
    // Fallback: return basic cognitive card
    return NextResponse.json({
      type: "card",
      keyConcept: title,
      explanation: content.slice(0, 300),
      example: "",
      misconception: "",
      actionableInsight: "",
      source,
      sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
    });
  }
}
