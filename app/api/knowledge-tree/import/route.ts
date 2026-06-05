import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// Knowledge tree — file upload handler.
// Reuses the same text-extraction pipeline as /api/notes/import/file
// but returns a flat { text, fileName, fileType, pageCount? } shape
// that the knowledge extraction AI endpoint consumes.
// Supported: .pdf, .docx, .pptx, .txt, .md
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 30;

interface ExtractResult {
  text: string;
  pageCount?: number;
}

async function extractFromBuffer(
  buf: Buffer,
  mime: string,
  ext: string
): Promise<ExtractResult> {
  // .txt / .md — plain text
  if (mime === "text/plain" || mime === "text/markdown" || ext === ".md" || ext === ".txt") {
    return { text: buf.toString("utf-8").slice(0, 80000) };
  }

  // .docx — mammoth
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf as never });
    return { text: result.value.slice(0, 80000) };
  }

  // .pdf — pdf-parse
  if (mime === "application/pdf" || ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    const result = await parser.getText();
    const text = typeof result?.text === "string" ? result.text : "";
    // pdf-parse may include numpages on the result object
    const rawResult = result as unknown as Record<string, unknown>;
    const pageCount =
      typeof rawResult?.numpages === "number"
        ? (rawResult.numpages as number)
        : undefined;
    return { text: text.slice(0, 80000), pageCount };
  }

  // .pptx — try officeparser if available, else raw text
  if (
    mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    ext === ".pptx"
  ) {
    try {
      // officeparser is an optional dependency; silently degrade when unavailable
      // @ts-expect-error — optional dependency may not be installed
      const officeparser = await import("officeparser");
      const text = String((await officeparser.parseOfficeAsync(buf)) ?? "");
      if (text.length >= 20) return { text: text.slice(0, 80000) };
    } catch {
      // officeparser unavailable — fall through
    }
    // Fallback: raw text extraction from PPTX (XML inside ZIP)
    const raw = buf.toString("utf-8");
    if (raw.length < 20) throw new Error("无法从 PPTX 文件中提取文本，请转换为 PDF 后重试");
    return { text: raw.slice(0, 80000) };
  }

  // Fallback: treat as utf-8 text
  const raw = buf.toString("utf-8");
  if (raw.length < 20) throw new Error("无法识别文件格式，或文件内容过短");
  return { text: raw.slice(0, 80000) };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    // JSON body — raw text paste
    if (!contentType.includes("multipart/form-data")) {
      const body = await req.json().catch(() => null);
      if (body?.text && typeof body.text === "string") {
        return NextResponse.json({
          text: String(body.text).slice(0, 80000),
          fileName: "pasted-text.txt",
          fileType: "text/plain",
        });
      }
      return NextResponse.json(
        { error: "请上传文件或提供文本内容" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    if (pastedText) {
      return NextResponse.json({
        text: pastedText.slice(0, 80000),
        fileName: "pasted-text.txt",
        fileType: "text/plain",
      });
    }

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "text/plain";
    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : "";

    const result = await extractFromBuffer(buffer, mime, ext);

    if (!result.text || result.text.length < 10) {
      return NextResponse.json(
        { error: "无法从文件中提取文本内容，请尝试粘贴文本" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: result.text,
      fileName: file.name,
      fileType: file.type || ext,
      pageCount: result.pageCount,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "文件处理失败" },
      { status: 500 }
    );
  }
}
