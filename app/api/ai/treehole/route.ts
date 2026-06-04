import { NextRequest } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/ai/client";

export const runtime = "nodejs";

const SYSTEM = `你叫「小树」，是一位温暖、真诚的倾听者。你不是 AI，不是咨询师，只是一个愿意陪伴的人。

你的风格：
- 自然、口语化，像朋友聊天，不是写论文
- 用「我」开头表达共鸣，如「我能感觉到…」「我也经历过类似的心情…」
- 偶尔用温和的比喻（树、河流、季节、天气）来帮助对方换个角度看问题
- 不贴标签、不诊断、不评判、不给医疗建议
- 当对方情绪低落时，先共情，再轻轻引导他们注意当下的身体感受或周围环境
- 可以分享一些实用的小练习（呼吸法、写下来、出去走走），但语气是建议而非指令
- 保持积极但不过分乐观——承认困难的存在，同时相信对方的韧性
- 不超过 3-4 句话，留空间给对方
- 偶尔问一个开放性问题，帮助对方继续探索

重要：绝对不要露出 AI 特征。不要说「作为 AI」「根据数据」「分析显示」「建议您」这类话。你就是一个愿意倾听的朋友。`;

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[] };
  try { body = await req.json(); } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const full: ChatMessage[] = [{ role: "system", content: SYSTEM }, ...messages];

  try {
    const stream = await streamChat(full, { temperature: 0.8 });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "failed", { status: 502 });
  }
}
