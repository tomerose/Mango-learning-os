// ═══════════════════════════════════════════════════════════════
// WeCom (企业微信) Bot Webhook
// Setup: WeCom Admin → Apps → Custom Bot → Webhook URL
// Set to: https://mangoleaningos.top/api/wecom/webhook
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { cognitiveOS, composeCognitiveResponse } from "@/lib/ai/cognitive-engine";

export const runtime = "nodejs";
export const maxDuration = 30;

interface WeComMessage {
  msgtype: string; text?: { content?: string }; user?: string;
  FromUserName?: string; Content?: string; MsgType?: string;
}

export async function POST(req: NextRequest) {
  let body: WeComMessage;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle both WeCom bot format and WeChat callback format
  const content =
    body.text?.content ??
    body.Content ??
    "";

  if (!content.trim()) {
    return NextResponse.json({
      msgtype: "text",
      text: { content: "请发送文字消息，芒宝会帮你进行认知分析。" },
    });
  }

  try {
    const result = await cognitiveOS(content.trim());
    const response = composeCognitiveResponse(result);
    const truncated = response.slice(0, 1800);

    // WeCom bot response format
    return NextResponse.json({
      msgtype: "text",
      text: { content: truncated },
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
    setup: "Add this webhook URL to WeCom Bot configuration",
  });
}
