// ═══════════════════════════════════════════════════════════════
// WeChat Official Account Webhook — Async Cognitive Reply
// Flow: receive → respond "success" immediately → process AI in bg → push via 客服消息
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { cognitiveFast } from "@/lib/ai/cognitive-engine";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

// ═══ Config ═══

const APPID = "wxdd2dbd4a69db4102";
const APPSECRET = "bb3e67ad594eb26dc9865f9881c09950";
const TOKEN = process.env.WECHAT_TOKEN ?? "mango_wechat_token_2025";

// ═══ Access Token Cache (token lives 7200s) ═══

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access_token: " + JSON.stringify(data));

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000; // refresh 5min early
  return cachedToken!;
}

// ═══ Send Customer Service Message ═══

async function sendCustomerMsg(openid: string, content: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        touser: openid,
        msgtype: "text",
        text: { content: content.slice(0, 2000) },
      }),
    }
  );
  const data = await res.json();
  if (data.errcode !== 0) console.error("Customer msg failed:", data);
}

// ═══ Signature Verification ═══

function verifySignature(signature: string, timestamp: string, nonce: string): boolean {
  const arr = [TOKEN, timestamp, nonce].sort();
  const str = arr.join("");
  const hash = createHash("sha1").update(str).digest("hex");
  return hash === signature;
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

// ═══ POST: Async cognitive reply ═══

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

  // Fire-and-forget: process AI in background, respond immediately
  processAndReply(fromUser, content.trim()).catch((err) => {
    console.error("Async cognitive reply failed:", err);
  });

  // Respond within 100ms — WeChat is happy
  return new Response("success", { headers: { "Content-Type": "text/plain" } });
}

// ═══ Background: Cognitive Engine → Customer Service Message ═══

async function processAndReply(openid: string, question: string): Promise<void> {
  // Step 1: AI analysis (no timeout — we have all the time now)
  let reply: string;
  try {
    // No AbortController — let it run naturally
    const result = await cognitiveFast(question, 0);
    reply = result.fullResponse;
  } catch {
    reply = "芒宝正在思考，请稍后再试。\n\n或访问 https://mangoleaningos.top 获得完整体验。";
  }

  // Step 2: Send via WeChat customer service API
  await sendCustomerMsg(openid, reply);
}
