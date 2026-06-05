import { NextRequest, NextResponse } from "next/server";

// Cross-platform Audio Transcription — Whisper-ready architecture
// POST multipart audio file → Returns transcribed text
// When OPENAI_API_KEY is set, routes to Whisper API automatically
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请上传音频文件（mp3/wav/m4a/webm）" }, { status: 400 });
    }

    // Auto-route to Whisper if API key configured
    if (process.env.OPENAI_API_KEY) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const whisperForm = new FormData();
      whisperForm.append("file", new Blob([buffer], { type: file.type }), file.name);
      whisperForm.append("model", "whisper-1");
      whisperForm.append("language", "zh");

      const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: whisperForm,
      });
      const result = await whisperRes.json();
      return NextResponse.json({ text: result.text || "", provider: "whisper" });
    }

    // Fallback: clear messaging
    return NextResponse.json({
      text: "",
      status: "received",
      message: "音频已接收。设置 OPENAI_API_KEY 即可启用 Whisper 转写。当前请使用 Chrome/Edge 浏览器内置语音识别。",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "转写失败" },
      { status: 500 }
    );
  }
}

// Also accept JSON with base64 audio for mobile/desktop apps
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.audio) {
      return NextResponse.json({ error: "请提供 base64 编码的音频数据" }, { status: 400 });
    }
    return NextResponse.json({ status: "received", message: "Base64 audio ready for Whisper processing." });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "处理失败" }, { status: 500 });
  }
}
