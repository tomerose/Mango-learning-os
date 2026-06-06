// ═══════════════════════════════════════════════════════════════
// Vercel Cron — Daily WeChat Push
// 08:30 UTC+8 = 00:30 UTC → Daily English
// 12:30 UTC+8 = 04:30 UTC → Daily Econ+AI
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { sendCustomerMsg, getFollowers } from "@/lib/wechat/client";
import { completeChat } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 30;

function isVercelCron(req: NextRequest): boolean {
  return req.headers.get("x-vercel-cron") === "1" || process.env.NODE_ENV === "development";
}

async function generateDailyContent(flow: string): Promise<string> {
  const prompt = flow === "english"
    ? "生成今日英语学习内容（50词）：1个高级词汇+释义+例句，1个实用短语。中文标注。格式简洁。"
    : "生成今日经济学+AI各1条快讯（各100字内）。格式：【经济】... 【AI】...。中文。";

  try {
    const raw = await completeChat(
      [
        { role: "system", content: "你是学习内容生成器。输出精简、有干货。" },
        { role: "user", content: prompt },
      ],
      { temperature: 0.5, maxTokens: 300 }
    );
    return raw.trim();
  } catch {
    return flow === "english"
      ? "📖 今日英语\n\n【词汇】Resilience /rɪˈzɪliəns/ n. 韧性\n例句：Her resilience helped her overcome the setback.\n\n【短语】Think outside the box — 打破常规思考"
      : "📰 今日经济+AI\n\n【经济】美联储维持利率不变，市场预期年内降息2次。关注6月CPI数据。\n【AI】DeepSeek发布新推理模型，数学能力提升30%。开源社区反响热烈。";
  }
}

export async function GET(req: NextRequest) {
  if (!isVercelCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flow = req.nextUrl.searchParams.get("flow") ?? "econ";
  const flowLabel = flow === "english" ? "Daily English" : "Daily Econ+AI";

  try {
    const content = await generateDailyContent(flow);
    const followers = await getFollowers();

    let sent = 0;
    for (const openid of followers) {
      const ok = await sendCustomerMsg(openid, `🧠 MangoLearningOS · ${flowLabel}\n\n${content}`);
      if (ok) sent++;
    }

    return NextResponse.json({
      success: true,
      flow: flowLabel,
      followers: followers.length,
      sent,
      content: content.slice(0, 100),
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Cron failed",
    }, { status: 500 });
  }
}
