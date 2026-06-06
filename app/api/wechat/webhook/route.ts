// ═══════════════════════════════════════════════════════════════
// WeChat Official Account Webhook — Ultra-Fast Cognitive Reply
// Setup: https://mangoleaningos.top/api/wechat/webhook
// Token: mango_wechat_token_2025
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { cognitiveFast } from "@/lib/ai/cognitive-engine";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 10;

const WECHAT_TOKEN = process.env.WECHAT_TOKEN ?? "mango_wechat_token_2025";

// ═══ Signature Verification ═══

function verifySignature(signature: string, timestamp: string, nonce: string): boolean {
  const arr = [WECHAT_TOKEN, timestamp, nonce].sort();
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

// ═══ POST: Ultra-fast cognitive reply (<5s guaranteed) ═══

export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const signature = params.get("signature") ?? "";
  const timestamp = params.get("timestamp") ?? "";
  const nonce = params.get("nonce") ?? "";

  if (!verifySignature(signature, timestamp, nonce)) {
    return new Response("Invalid signature", { status: 403 });
  }

  const xml = await req.text();

  const toUser = (xml.match(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/) ?? [])[1] ?? "";
  const fromUser = (xml.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/) ?? [])[1] ?? "";
  const msgType = (xml.match(/<MsgType><!\[CDATA\[(.*?)\]\]><\/MsgType>/) ?? [])[1] ?? "";
  const content = (xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/) ?? [])[1] ?? "";

  if (msgType !== "text" || !content.trim()) {
    return new Response("success", { headers: { "Content-Type": "text/plain" } });
  }

  // Ultra-fast AI: 150 max tokens, 2.5s timeout, temp=0
  const result = await cognitiveFast(content.trim());
  const reply = result.fullResponse;

  const xmlResponse = buildTextResponse(fromUser, toUser, reply);

  return new Response(xmlResponse, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
