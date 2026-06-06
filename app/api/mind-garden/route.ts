import { NextRequest, NextResponse } from "next/server";
import { completeChat, extractJson } from "@/lib/ai/client";

export const runtime = "nodejs";

// POST /api/mind-garden — mood analysis + CBT reframing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, content, privacyMode, cloudConsent } = body as {
      action: string;
      content: string;
      privacyMode?: "local" | "cloud";
      cloudConsent?: boolean;
    };

    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    if (privacyMode !== "cloud" || cloudConsent !== true) {
      return NextResponse.json(
        { error: "Explicit cloud consent required for Mind Garden analysis." },
        { status: 403 }
      );
    }

    if (!process.env.AI_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    if (action === "analyze-mood") {
      const prompt = `你是一位持证心理咨询师（非医疗），用共情、结构化方式帮助用户反思情绪。以下是用户写的内容：
"${content.slice(0, 3000)}"

请返回严格 JSON：
{
  "mood": {"primary":"主要情绪","secondary":"次要情绪","intensity":1-10},
  "summary":"一段话总结用户的核心关切",
  "keyConcerns":["关切1","关切2","关切3"],
  "reflection":"共情的结构化反思，帮助用户从不同角度看待问题",
  "suggestions":[{"title":"行动建议","detail":"具体怎么做","category":"social|physical|cognitive|creative"}]
}`;

      const raw = await completeChat([{ role: "user", content: prompt }], { temperature: 0.4 });
      const json = JSON.parse(extractJson(raw));
      return NextResponse.json(json);
    }

    if (action === "cbt-reframe") {
      const prompt = `你是 CBT（认知行为疗法）引导师。用户分享了一个困扰他们的想法。请用以下 CBT 框架分析：
"${content.slice(0, 3000)}"

返回严格 JSON：
{
  "automaticThought":"用户最初自动产生的负面想法（用引号框出）",
  "evidenceFor":["支持该想法的证据1","证据2"],
  "evidenceAgainst":["反对该想法的证据1","证据2"],
  "cognitiveDistortion":"识别出的认知扭曲类型（如 灾难化思维、非黑即白、过度概括 等）",
  "alternativeInterpretation":"一个更平衡、更现实的替代解释",
  "actionPlan":{"immediate":"今天可以做的一件事","shortTerm":"本周目标","longTerm":"长期方向"},
  "affirmation":"一句温和的自我肯定"
}`;

      const raw = await completeChat([{ role: "user", content: prompt }], { temperature: 0.3 });
      const json = JSON.parse(extractJson(raw));
      return NextResponse.json(json);
    }

    if (action === "weekly-summary") {
      const prompt = `用户分享了本周的反思记录。请基于这些内容生成一周总结：
"${content.slice(0, 5000)}"

返回严格 JSON：
{
  "overallMood":"本周整体情绪描述",
  "weeklyTrend":[{"day":"周一","mood":5,"note":"..."},{"day":"周二","mood":6,"note":"..."}],
  "highlights":["亮点1","亮点2"],
  "growthAreas":["成长点1"],
  "nextWeekFocus":"下周可以关注的方向",
  "quote":"一句励志语句"
}`;

      const raw = await completeChat([{ role: "user", content: prompt }], { temperature: 0.5 });
      const json = JSON.parse(extractJson(raw));
      return NextResponse.json(json);
    }

    return NextResponse.json({ error: "Unknown action: " + action }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Analysis failed" }, { status: 500 });
  }
}
