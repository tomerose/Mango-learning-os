import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

// ─────────────────────────────────────────────────────────────
// AI flashcard generation from a topic + content.
// POST { topic, content, count?: 5 }
// Returns { flashcards: Array<{front, back, deck, subject}> }
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 60;

interface GeneratedCard {
  front: string;
  back: string;
  deck: string;
  subject: string;
}

function mockCards(topic: string, count: number): GeneratedCard[] {
  const base: GeneratedCard[] = [
    { front: `${topic} 的核心定义是什么？`, back: `${topic} 是指...（配置 AI 后可生成真实内容）`, deck: `${topic} 速记`, subject: "general" },
    { front: `${topic} 的关键组成部分？`, back: `主要包含几个方面：（1）理论基础（2）实践应用（3）常见误区`, deck: `${topic} 速记`, subject: "general" },
    { front: `${topic} 的实际应用场景？`, back: `在实际中，${topic} 被广泛应用于多个领域，需要结合具体语境理解`, deck: `${topic} 速记`, subject: "general" },
    { front: `${topic} 的常见误区？`, back: `初学者容易混淆的概念对比，建议通过练习加深理解`, deck: `${topic} 速记`, subject: "general" },
    { front: `${topic} 与相关概念的关系？`, back: `${topic} 与其他知识点相互关联，形成完整的知识体系`, deck: `${topic} 速记`, subject: "general" },
  ];
  return base.slice(0, count);
}

function buildPrompt(topic: string, content: string, count: number): string {
  return `你是一个教育内容创作专家。请根据以下内容生成 ${count} 张闪卡（flashcards）。

主题：${topic}
参考内容：
"""
${content.slice(0, 3000)}
"""

返回一个 JSON 对象，格式如下：
{
  "flashcards": [
    { "front": "问题面（提问）", "back": "答案面（简洁准确的回答）", "deck": "${topic} 速记", "subject": "学科ID" }
  ]
}

要求：
1. front 是问题/概念，back 是简洁准确的答案
2. 每张卡聚焦一个知识点
3. 覆盖核心定义、关键公式、常见误区和应用场景
4. 答案控制在 150 字以内
5. 只返回 JSON`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const topic = body?.topic ?? "未命名主题";
    const content = body?.content ?? "";
    const count = Math.min(10, Math.max(1, body?.count ?? 5));
    const subject = body?.subject ?? "general";

    if (!content || content.length < 20) {
      const cards = mockCards(topic, count);
      return NextResponse.json({ flashcards: cards });
    }

    const prompt = buildPrompt(topic, content, count);
    const raw = await completeChat([
      { role: "system", content: "你是一个教育闪卡创作AI。只返回JSON，不要包含任何额外文字。" },
      { role: "user", content: prompt },
    ], { temperature: 0.5 });

    const jsonStr = extractJson(raw);
    let parsed: { flashcards?: GeneratedCard[] } = {};
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const cards = mockCards(topic, count);
      return NextResponse.json({ flashcards: cards });
    }

    const flashcards: GeneratedCard[] = (parsed.flashcards ?? [])
      .filter((c: GeneratedCard) => typeof c.front === "string" && typeof c.back === "string")
      .slice(0, count)
      .map((c: GeneratedCard) => ({
        front: c.front,
        back: c.back,
        deck: c.deck ?? `${topic} 速记`,
        subject: c.subject ?? subject,
      }));

    return NextResponse.json({
      flashcards: flashcards.length > 0 ? flashcards : mockCards(topic, count),
    });
  } catch (err) {
    console.error("[flashcard-generate] error:", err);
    return NextResponse.json({ flashcards: mockCards("通用", 5) });
  }
}
