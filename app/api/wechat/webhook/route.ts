// ═══════════════════════════════════════════════════════════════
// WeChat Official Account Webhook
// Text → cognitiveFast (AI reply)
// Voice → Deepgram STT → cognitiveFast
// Event → menu click handlers
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { cognitiveFast } from "@/lib/ai/cognitive-engine";
import { downloadMedia, sendCustomerMsg } from "@/lib/wechat/client";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 25;

const WECHAT_TOKEN = process.env.WECHAT_TOKEN ?? "mango_wechat_token_2025";
const DEEPGRAM_KEY = process.env.DEEPGRAM_API_KEY ?? "8a29bca2aa208a2f439aaeff833d71dfcbc90ee2";

// ═══ Signature ═══

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

// ═══ Deepgram Transcription ═══

async function transcribeVoice(audioBuffer: ArrayBuffer): Promise<string> {
  try {
    const res = await fetch("https://api.deepgram.com/v1/listen?model=nova-3&language=zh&smart_format=true", {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_KEY}`,
        "Content-Type": "audio/amr",
      },
      body: Buffer.from(audioBuffer),
    });
    const data = await res.json();
    return data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  } catch {
    return "";
  }
}

// ═══ Menu Click Responses ═══

const MENU_RESPONSES: Record<string, string> = {
  DAILY_ECON: "📰 今日经济\n\n正在为你生成今日经济快讯，请稍后...",
  DAILY_ENGLISH: "📖 今日英语\n\n正在为你准备今日英语学习内容，请稍后...",
  DAILY_AI: "🤖 今日AI\n\n正在为你整理今日AI行业快讯，请稍后...",
  ANALYZE: "🧠 认知分析\n\n请直接发送你想分析的概念或问题，芒宝会帮你进行认知重构。\n\n例如：「什么是机会成本」「解释边际效用递减」",
  PLAN: "📋 学习计划\n\n发送「计划」+ 你的目标，芒宝会为你生成学习路径。\n\n例如：「计划 两周内掌握微积分基础」",
  STATE: "📊 认知状态\n\n你的学习记录保存在 mangoleaningos.top，登录后在「MangoDNA」页面查看完整认知档案。",
  HELP: "💡 使用帮助\n\n1. 发送任何学习问题 → 获得认知分析\n2. 发送语音 → 自动转文字分析\n3. 底部菜单 → 每日推荐/学习计划\n4. 访问 mangoleaningos.top 获得完整体验\n\n🌟 芒宝是你的认知伙伴，不是答题机器。聚焦理解本质，而非获取答案。",
};

// ═══ GET ═══

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

// ═══ POST ═══

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

  // ── Event (menu clicks, follow, etc.) ──

  if (msgType === "event") {
    const event = (xml.match(/<Event><!\[CDATA\[(.*?)\]\]><\/Event>/) ?? [])[1] ?? "";
    const eventKey = (xml.match(/<EventKey><!\[CDATA\[(.*?)\]\]><\/EventKey>/) ?? [])[1] ?? "";

    // Follow event
    if (event === "subscribe") {
      const welcome = "🌟 欢迎来到 MangoLearningOS！\n\n我是芒宝，你的认知伙伴。\n\n发送任何学习问题，我会帮你：\n• 识别认知盲区\n• 重构理解结构\n• 给出验证练习\n\n🎤 也支持语音消息\n📱 完整体验：mangoleaningos.top";
      return new Response(buildTextResponse(fromUser, toUser, welcome), {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    }

    // Menu click
    if (event === "CLICK") {
      const reply = MENU_RESPONSES[eventKey] ?? "未知操作";
      return new Response(buildTextResponse(fromUser, toUser, reply), {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    }

    return new Response("success", { headers: { "Content-Type": "text/plain" } });
  }

  // ── Voice message ──

  if (msgType === "voice") {
    const mediaId = (xml.match(/<MediaId><!\[CDATA\[(.*?)\]\]><\/MediaId>/) ?? [])[1] ?? "";

    if (!mediaId) {
      return new Response("success", { headers: { "Content-Type": "text/plain" } });
    }

    try {
      // Download voice from WeChat, transcribe with Deepgram
      const audioBuffer = await downloadMedia(mediaId);
      const transcript = await transcribeVoice(audioBuffer);

      if (!transcript.trim()) {
        const reply = buildTextResponse(fromUser, toUser, "没有听清，请再说一次或发送文字消息。");
        return new Response(reply, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
      }

      // Cognitive analysis on transcribed text
      const result = await cognitiveFast(transcript.trim());
      const reply = buildTextResponse(fromUser, toUser, `🎤 ${transcript}\n\n${result.fullResponse}`);
      return new Response(reply, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
    } catch {
      const reply = buildTextResponse(fromUser, toUser, "语音处理失败，请发送文字消息。");
      return new Response(reply, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
    }
  }

  // ── Text message ──

  const content = (xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/) ?? [])[1] ?? "";

  if (!content.trim()) {
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
