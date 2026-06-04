import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function extractTextFromBuffer(buf: Buffer, mime: string): string {
  const text = buf.toString("utf-8");
  // Strip HTML tags if it's HTML
  if (mime.includes("html") || text.includes("<html") || text.includes("<body")) {
    return text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // Plain text — return as-is, truncated
  return text.slice(0, 50000);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      // Try JSON body with raw text
      const body = await req.json().catch(() => null);
      if (body?.text) {
        return NextResponse.json({
          text: String(body.text).slice(0, 50000),
          source: body.source ?? "manual",
        });
      }
      return NextResponse.json({ error: "请上传文件或提供文本内容" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    if (pastedText) {
      return NextResponse.json({ text: pastedText.slice(0, 50000), source: "paste" });
    }

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "text/plain";
    const text = extractTextFromBuffer(buffer, mime);

    if (!text || text.length < 10) {
      return NextResponse.json({ error: "无法从文件中提取文本内容，请尝试粘贴文本" }, { status: 422 });
    }

    return NextResponse.json({
      text: text.slice(0, 50000),
      fileName: file.name,
      fileSize: file.size,
      source: "file",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "文件处理失败" },
      { status: 500 }
    );
  }
}
