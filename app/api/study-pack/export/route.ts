// ═══════════════════════════════════════════════════════════════
// POST /api/study-pack/export — Export study pack to various formats
// Supports: docx (true OOXML), md (Markdown), html (self-contained page)
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { buildDocx, buildMarkdown, buildHtml } from "@/lib/export/docx-builder";

export const runtime = "nodejs";

interface ExportRequest {
  format: "docx" | "pdf" | "md" | "html";
  courseName: string;
  sections: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExportRequest;
    const { format, courseName, sections } = body;

    if (!courseName || !sections) {
      return NextResponse.json({ error: "Missing courseName or sections" }, { status: 400 });
    }

    switch (format) {
      case "docx": {
        const blob = await buildDocx({ courseName, sections });
        return new NextResponse(blob, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(courseName)}_复习讲义.docx"`,
          },
        });
      }

      case "md": {
        const md = buildMarkdown({ courseName, sections });
        return new NextResponse(md, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(courseName)}_复习讲义.md"`,
          },
        });
      }

      case "html": {
        const html = buildHtml({ courseName, sections });
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(courseName)}_复习讲义.html"`,
          },
        });
      }

      case "pdf": {
        // PDF: return a print-optimized HTML page
        const html = buildHtml({ courseName, sections });
        const printHtml = html.replace("</head>",
          "<style>@media print{@page{size:A4;margin:2cm}body{font-size:11pt}}</style></head>");
        return new NextResponse(printHtml, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      }

      default:
        return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Export failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 },
    );
  }
}
