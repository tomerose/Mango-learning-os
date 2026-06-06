// ═══════════════════════════════════════════════════════════════
// WeCom (企业微信) Bot Callback
// Setup: WeCom Admin → Apps → Bot → Callback URL
// Or: Group Bot → configure receive URL
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { cognitiveFast } from "@/lib/ai/cognitive-engine";

export const runtime = "nodejs";
export const maxDuration = 15;

interface WeComMessage {
  msgtype?: string;
  text?: { content?: string };
  Content?: string;
  MsgType?: string;
}

export async function POST(req: NextRequest) {
  let body: WeComMessage;
  try { body = await req.json(); } catch {
    return NextResponse.json({
      msgtype: "text",
      text: { content: "请发送文字消息，芒宝会帮你进行认知分析。" },
    });
  }

  const content = body.text?.content ?? body.Content ?? "";

  if (!content.trim()) {
    return NextResponse.json({
      msgtype: "text",
      text: { content: "你好！我是芒宝🧠 发送任何学习问题，我会帮你进行认知分析。\n\n🌐 完整体验：mangoleaningos.top" },
    });
  }

  try {
    const result = await cognitiveFast(content.trim());
    return NextResponse.json({
      msgtype: "text",
      text: { content: result.fullResponse },
    });
  } catch {
    return NextResponse.json({
      msgtype: "text",
      text: { content: "芒宝正在思考，请稍后再试。\n\n访问 mangoleaningos.top 获得完整体验。" },
    });
  }
}

// GET: Verification
export async function GET() {
  return NextResponse.json({
    service: "MangoOS Cognitive WeCom Bot",
    status: "active",
    setup: "Use this URL as WeCom Bot callback URL",
  });
}
