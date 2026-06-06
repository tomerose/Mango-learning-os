// ═══════════════════════════════════════════════════════════════
// WeChat Official Account / WeCom Webhook
// User sends message → Cognitive Engine → Returns structured response
//
// Setup:
// 1. Register WeChat Official Account at mp.weixin.qq.com
// 2. Set server URL to: https://mangoleaningos.top/api/wechat/webhook
// 3. Set Token in .env.local: WECHAT_TOKEN=your_token
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { cognitiveOS, composeCognitiveResponse } from "@/lib/ai/cognitive-engine";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

// ═══ WeChat Signature Verification ═══

function verifySignature(signature: string, timestamp: string, nonce: string): boolean {
  const token = process.env.WECHAT_TOKEN ?? "mango_wechat_token_2025";
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join("");
  const hash = createHash("sha1").update(str).digest("hex");
  return hash === signature;
}

function buildTextResponse(toUser: string, fromUser: string, content: string): string {
  return `<xml>
<ToUserName><![CDATA[${toUser}]]></ToUserName>
<FromUserName><![CDATA[${fromUser}]]></FromUserName>
<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${content}]]></Content>
</xml>`;
}

// ═══ GET: Server verification ═══

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const signature = params.get("signature") ?? "";
  const timestamp = params.get("timestamp") ?? "";
  const nonce = params.get("nonce") ?? "";
  const echostr = params.get("echostr") ?? "";

  if (verifySignature(signature, timestamp, nonce)) {
    return new Response(echostr, { headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Invalid signature", { status: 403 });
}

// ═══ POST: Handle incoming messages ═══

export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const signature = params.get("signature") ?? "";
  const timestamp = params.get("timestamp") ?? "";
  const nonce = params.get("nonce") ?? "";

  if (!verifySignature(signature, timestamp, nonce)) {
    return new Response("Invalid signature", { status: 403 });
  }

  const xml = await req.text();

  // Parse WeChat XML message
  const toUser = (xml.match(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/) ?? [])[1] ?? "";
  const fromUser = (xml.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/) ?? [])[1] ?? "";
  const msgType = (xml.match(/<MsgType><!\[CDATA\[(.*?)\]\]><\/MsgType>/) ?? [])[1] ?? "";
  const content = (xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/) ?? [])[1] ?? "";

  // Only handle text messages
  if (msgType !== "text" || !content.trim()) {
    return new Response("success", { headers: { "Content-Type": "text/plain" } });
  }

  try {
    // Process through Cognitive Engine
    const result = await cognitiveOS(content.trim());
    const response = composeCognitiveResponse(result);

    // Truncate to WeChat's 2048 char limit for text messages
    const truncated = response.slice(0, 1800) + (response.length > 1800 ? "\n\n...（内容过长，请访问 mangoleaningos.top 查看完整分析）" : "");

    const xmlResponse = buildTextResponse(fromUser, toUser, truncated);

    return new Response(xmlResponse, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch {
    // Fallback response
    const fallback = buildTextResponse(fromUser, toUser, "芒宝正在处理你的问题，请稍后再试。\n\n或访问 https://mangoleaningos.top 获得完整体验。");
    return new Response(fallback, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
