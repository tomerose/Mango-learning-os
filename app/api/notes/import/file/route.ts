import { NextRequest, NextResponse } from "next/server";
import { stripHtml, extractFirstHeading, parseCsvToNotes } from "@/lib/text-utils";

// ─────────────────────────────────────────────────────────────
// Notes import — file upload handler.
// Supported: .docx (mammoth), .pdf (pdf-parse), .md, .enex
//            (Evernote export XML), .csv, .txt
// Returns { text } for single-note sources or
//          { notes: Array<{title, body, tags}> } for multi-note.
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 30;

interface NoteItem {
  title: string;
  body: string;
  tags: string[];
}

async function extractFromBuffer(
  buf: Buffer,
  mime: string,
  ext: string
): Promise<{ text?: string; notes?: NoteItem[] }> {
  // .txt / .md — plain text
  if (mime === "text/plain" || mime === "text/markdown" || ext === ".md" || ext === ".txt") {
    const raw = buf.toString("utf-8").slice(0, 80000);
    const { title, body } = extractFirstHeading(raw);
    return { notes: [{ title, body, tags: [] }] };
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
    return { text: text.slice(0, 80000) };
  }

  // .enex — Evernote export XML
  if (mime === "application/xml" || ext === ".enex") {
    const { XMLParser } = await import("fast-xml-parser");
    const xml = buf.toString("utf-8");
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const doc = parser.parse(xml);
    const rawNotes = doc?.["en-export"]?.note;
    const noteList: Record<string, unknown>[] = Array.isArray(rawNotes) ? rawNotes : rawNotes ? [rawNotes] : [];
    const notes: NoteItem[] = noteList.map((n) => {
      const rawTitle = typeof n.title === "string" ? n.title : "";
      const rawContent =
        typeof n.content === "string"
          ? n.content
          : typeof n.content === "object" && (n.content as Record<string, unknown>)?.["#text"]
          ? String((n.content as Record<string, unknown>)["#text"])
          : "";
      const rawTags = Array.isArray(n.tag) ? n.tag : n.tag ? [n.tag] : [];
      const body = stripHtml(rawContent).slice(0, 50000);
      const tags: string[] = rawTags.map((t: unknown) => (typeof t === "string" ? t : ""));
      const title = rawTitle || body.slice(0, 50);
      return { title, body, tags };
    });
    return { notes };
  }

  // .csv → multi-note
  if (mime === "text/csv" || ext === ".csv") {
    const csv = buf.toString("utf-8");
    return { notes: parseCsvToNotes(csv) };
  }

  // Fallback: treat as utf-8 text
  const raw = buf.toString("utf-8");
  if (raw.length < 20) throw new Error("无法识别文件格式，或文件内容过短");
  return { text: raw.slice(0, 80000) };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      const body = await req.json().catch(() => null);
      if (body?.text && typeof body.text === "string") {
        const text = String(body.text).slice(0, 80000);
        const { title, body: b } = extractFirstHeading(text);
        return NextResponse.json({ text: b, title, source: "paste" });
      }
      return NextResponse.json({ error: "请上传文件或提供文本内容" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    if (pastedText) {
      const { title, body } = extractFirstHeading(pastedText.slice(0, 80000));
      return NextResponse.json({ text: body, title, source: "paste" });
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

    if (result.notes && result.notes.length > 0) {
      return NextResponse.json({
        notes: result.notes,
        fileName: file.name,
        fileSize: file.size,
        source: "file",
        multi: true,
      });
    }

    const text = result.text ?? "";
    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: "无法从文件中提取文本内容，请尝试粘贴文本" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      fileName: file.name,
      fileSize: file.size,
      source: "file",
      multi: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "文件处理失败" },
      { status: 500 }
    );
  }
}
