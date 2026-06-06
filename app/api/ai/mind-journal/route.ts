import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

export const runtime = "nodejs";

// POST /api/ai/mind-journal — unified mind garden AI endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, content, journalEntries, mood, privacyMode, cloudConsent } = body as {
      action: "chat" | "cbt-reframe" | "weekly-summary";
      content?: string;
      journalEntries?: string[];
      mood?: string;
      privacyMode?: "local" | "cloud";
      cloudConsent?: boolean;
    };

    if (privacyMode !== "cloud" || cloudConsent !== true) {
      return NextResponse.json(
        { error: "Explicit cloud consent required for Mind Garden AI processing." },
        { status: 403 }
      );
    }

    if (!process.env.AI_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured. Set AI_API_KEY in .env.local." },
        { status: 503 }
      );
    }

    // ─── Chat (AI emotional companion) ───────────────────────────
    if (action === "chat") {
      if (!content?.trim()) {
        return NextResponse.json(
          { error: "Content required" },
          { status: 400 }
        );
      }

      const systemPrompt = `你是小树，一个温暖的心灵陪伴者。你的对话风格融合了心理医生的共情能力和知心朋友的真诚：

核心原则：
- 先接纳情感，再给予温暖回应——永远先说"我听到了"或"这很正常"
- 不要连续提问或反问，每次最多 1 个轻柔问题
- 用肯定句代替疑问句：不说"你有没有想过..."，说"也许可以试试..."
- 像深夜聊天的老朋友，不是诊室里的医生

回应框架（自然地融合，不要机械套用）：
1. 接纳情绪："听起来你最近..."或"这种感觉我懂..."
2. 正常化："很多人都会这样"或"这不是你的问题"
3. 温暖陪伴："我会一直在这里"或"不管多久都可以"
4. 正向引导：用故事、比喻或温柔的建议（非命令）
5. 只在最后很轻柔地问一句（可选）："想和我多说说吗？"——不超过 1 问

语言风格：
- 温暖、口语化、像朋友发消息
- 适度使用"呀""呢""哦"等语气词让人觉得亲切
- 偶尔用自然隐喻（树、花、光、季节、成长）
- 2-5 句为宜，不要太长
- 永远不评判、不说教、不诊断
- 如果对方表达严重困扰，温和建议"和一个信任的人聊聊会更好"

你陪伴的是一位大学生，ta 可能面临学业压力、人际关系、未来焦虑或自我怀疑。你的存在就是为了让 ta 感到被理解、被接纳、不孤单。`;

      const raw = await completeChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.slice(0, 4000) },
        ],
        { temperature: 0.8 }
      );

      return NextResponse.json({ reply: raw });
    }

    // ─── CBT Reframe ─────────────────────────────────────────────
    if (action === "cbt-reframe") {
      if (!content?.trim()) {
        return NextResponse.json(
          { error: "Content required" },
          { status: 400 }
        );
      }

      const prompt = `你是一位 CBT（认知行为疗法）引导师。用户分享了一个困扰他们的想法。请用以下 CBT 框架分析：

"${content.slice(0, 3000)}"

返回严格 JSON（不要 markdown 代码块）：
{
  "cognitiveDistortion": "识别出的认知扭曲类型（如：灾难化思维、非黑即白、过度概括、情绪推理、贴标签、个人化、应该陈述、心理过滤、否定正面、妄下结论）",
  "evidenceFor": ["支持该想法的客观证据1", "证据2"],
  "evidenceAgainst": ["反对该想法的客观证据1", "证据2"],
  "alternativeInterpretation": "一个更平衡、更现实、更有帮助的替代解释或想法",
  "actionSuggestion": "一个具体可行的行动建议，帮助用户走出这个思维模式"
}`;

      const raw = await completeChat(
        [{ role: "user", content: prompt }],
        { temperature: 0.3 }
      );
      const json = JSON.parse(extractJson(raw));
      return NextResponse.json(json);
    }

    // ─── Weekly Summary ──────────────────────────────────────────
    if (action === "weekly-summary") {
      const entries = journalEntries?.join("\n---\n") ?? content ?? "";

      if (!entries.trim()) {
        return NextResponse.json(
          { error: "Journal entries or content required" },
          { status: 400 }
        );
      }

      const recentMood = mood ?? "未记录";

      const prompt = `用户本周的心情趋势为：${recentMood}。

以下是用户本周的日记/反思记录：
"""
${entries.slice(0, 5000)}
"""

请基于以上内容生成本周总结。返回严格 JSON（不要 markdown 代码块）：
{
  "moodPattern": "本周情绪总体趋势描述（如：逐渐好转 / 波动较大 / 稳定积极 / 有所下滑），一句话概括",
  "keyInsight": "从本周日记中发现的一个关键洞察或成长点",
  "focusArea": "下周可以重点关注的方向或一个小目标",
  "weeklyEncouragement": "一句温暖有力的鼓励话语，帮助用户以积极心态迎接新的一周"
}`;

      const raw = await completeChat(
        [{ role: "user", content: prompt }],
        { temperature: 0.5 }
      );
      const json = JSON.parse(extractJson(raw));
      return NextResponse.json(json);
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (err) {
    console.error("[mind-journal] error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}
