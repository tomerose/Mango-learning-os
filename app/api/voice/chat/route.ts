// ═══════════════════════════════════════════════════════════════
// Voice Chat API — Platform-agnostic voice conversation
// Accepts text input, returns AI response + TTS-ready text.
// Desktop/Mobile/Web all call the same endpoint.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { completeChat, streamChat } from "@/lib/ai/client";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const limiter = createRateLimiter({ requests: 20, window: 60000 });

// Persona system prompts
const PERSONAS: Record<string, string> = {
  "ielts-examiner": "你是IELTS口语考官。按Part1/2/3流程提问，评分4维度。每次回答后给简短反馈。用英语对话。",
  "korean-teacher": "你是韩语老师。根据学生水平用韩语和中文混合教学。纠正发音，讲解语法。",
  "ai-mentor": "你是AI/ML技术导师。从数学直觉出发讲解概念。批判性思维优先——反问引导。中文讲解，术语带英文。",
  "startup-advisor": "你是创业顾问。帮助分析市场、验证想法、设计MVP。结合实际案例给出可操作建议。中文对话。",
  "research-supervisor": "你是学术研究导师。指导论文选题、文献综述、研究方法、学术写作。中文对话。",
};

interface VoiceChatRequest {
  text: string;
  personaId?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(clientId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: VoiceChatRequest;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, personaId = "ai-mentor", history = [] } = body;
  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const personaPrompt = PERSONAS[personaId] ?? PERSONAS["ai-mentor"];

  try {
    // Use streaming for faster first response
    const messages = [
      { role: "system" as const, content: `${personaPrompt}\n\n保持回复简洁（2-4句话），适合语音朗读。` },
      ...history.slice(-10),
      { role: "user" as const, content: text },
    ];

    const stream = await streamChat(messages, { temperature: 0.7 });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Persona": personaId,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Voice chat failed" },
      { status: 502 },
    );
  }
}
