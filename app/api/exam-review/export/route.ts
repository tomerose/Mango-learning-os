// ═══════════════════════════════════════════════════════════════
// POST /api/exam-review/export — Export review package to Word/PDF
// Generates .docx (Word) and printable HTML (PDF via browser print)
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// ── Types ───────────────────────────────────────────────────────

interface ExportRequest {
  format: "docx" | "pdf" | "md" | "html";
  courseName: string;
  sections: {
    coverPage: string;
    tableOfContents: string;
    courseOverview: string;
    examScopeMap: string;
    knowledgeGraph: string;
    chapterConcepts: Array<{ title: string; content: string }>;
    logicFramework: string;
    highFreqPoints: string;
    formulaTable: string;
    problemMethods: string;
    typicalExamples: string;
    commonTraps: string;
    memoryChecklist: string;
    reviewPlan: string;
    mockExam: string;
    answerKey: string;
    finalSprint: string;
    references: string;
  };
}

// ── Markdown → Word HTML converter ──────────────────────────────

function mdToWordHtml(md: string): string {
  return md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;color:#333;margin-top:16px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:20px;color:#1a1a1a;border-bottom:2px solid #e0e0e0;padding-bottom:6px;margin-top:24px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:26px;color:#111;text-align:center;margin-top:32px;">$1</h1>')
    // Bold / Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-family:Consolas,monospace;">$1</code>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, "").replace(/```/g, "");
      return `<pre style="background:#f5f5f5;padding:12px;border-radius:8px;overflow-x:auto;font-family:Consolas,monospace;font-size:13px;border-left:3px solid #2563eb;">${code}</pre>`;
    })
    // Tables — wrap in styled container
    .replace(/(\|.+\|\n\|[-|\s]+\|\n(\|.+\|\n?)+)/g, (match) => {
      const rows = match.trim().split("\n").filter(r => r.includes("|") && !r.match(/^\|[-|\s]+\|$/));
      const headerCells = rows[0]?.split("|").filter(Boolean).map(c => c.trim()) ?? [];
      const dataRows = rows.slice(1).map(r => r.split("|").filter(Boolean).map(c => c.trim()));

      const thead = `<tr>${headerCells.map(c => `<th style="background:#f0f4ff;padding:8px 12px;text-align:left;font-weight:600;border-bottom:2px solid #2563eb;">${c}</th>`).join("")}</tr>`;
      const tbody = dataRows.map(r =>
        `<tr>${r.map(c => `<td style="padding:8px 12px;border-bottom:1px solid #eee;">${c}</td>`).join("")}</tr>`
      ).join("");

      return `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">${thead}${tbody}</table>`;
    })
    // Lists
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:4px;">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-bottom:4px;">$1</li>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #2563eb;padding:8px 16px;margin:12px 0;background:#f0f4ff;border-radius:0 8px 8px 0;color:#555;">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0;">')
    // Checkboxes
    .replace(/^- \[ \] (.+)$/gm, '<div style="margin:4px 0;"><input type="checkbox" style="margin-right:8px;" disabled> $1</div>')
    .replace(/^- \[x\] (.+)$/gm, '<div style="margin:4px 0;"><input type="checkbox" style="margin-right:8px;" checked disabled> <span style="text-decoration:line-through;color:#999;">$1</span></div>')
    // Paragraphs
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ── Callout card styling ────────────────────────────────────────

function wrapCallout(content: string, type: "info" | "warning" | "tip" | "example"): string {
  const colors: Record<string, string> = {
    info: "#eff6ff",
    warning: "#fef3c7",
    tip: "#ecfdf5",
    example: "#f3e8ff",
  };
  const borders: Record<string, string> = {
    info: "#3b82f6",
    warning: "#f59e0b",
    tip: "#10b981",
    example: "#8b5cf6",
  };
  return `<div style="background:${colors[type]};border-left:4px solid ${borders[type]};padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0;">${content}</div>`;
}

// ── Generate full Word HTML ─────────────────────────────────────

function generateWordHtml(data: ExportRequest): string {
  const s = data.sections;
  const now = new Date().toLocaleDateString("zh-CN");

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 2cm; }
  body {
    font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, sans-serif;
    line-height: 1.8;
    color: #1a1a1a;
    font-size: 14px;
    max-width: 100%;
  }
  h1 { font-size: 26px; color: #111; text-align: center; margin-top: 32px; }
  h2 { font-size: 20px; color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; margin-top: 24px; }
  h3 { font-size: 16px; color: #333; margin-top: 16px; }
  .cover-page { text-align: center; padding-top: 120px; page-break-after: always; }
  .cover-page h1 { font-size: 32px; margin-bottom: 24px; }
  .cover-page p { font-size: 14px; color: #666; margin: 4px 0; }
  .toc { page-break-after: always; }
  .section-divider { page-break-before: always; }
  .footer-note { text-align: center; color: #999; font-size: 11px; margin-top: 48px; border-top: 1px solid #eee; padding-top: 16px; }

  /* Print styles */
  @media print {
    body { font-size: 12px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<!-- ═══ COVER PAGE ═══ -->
<div class="cover-page">
  <h1>${escapeHtml(data.courseName)}<br>期末复习讲义</h1>
  <div style="margin-top:48px;color:#888;font-size:13px;line-height:2;">
    <p>📅 生成日期: ${now}</p>
    <p>🎓 由 MangoOS AI 研究引擎自动生成</p>
    <p>📚 基于多源在线研究和用户提供资料</p>
  </div>
  <div style="margin-top:80px;color:#aaa;font-size:11px;">
    <p>MangoLearningOS — AI-Native Learning Operating System</p>
  </div>
</div>

<!-- ═══ TABLE OF CONTENTS ═══ -->
<div class="toc">
  ${mdToWordHtml(s.tableOfContents)}
</div>

<!-- ═══ MAIN CONTENT ═══ -->
<div class="section-divider">
  ${mdToWordHtml(s.courseOverview)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.examScopeMap)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.knowledgeGraph)}
</div>

${s.chapterConcepts.map((ch, i) => `
<div class="section-divider">
  <h2>第${i + 1}章: ${escapeHtml(ch.title)}</h2>
  ${mdToWordHtml(ch.content)}
</div>
`).join("\n")}

<div class="section-divider">
  ${mdToWordHtml(s.logicFramework)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.highFreqPoints)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.formulaTable)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.problemMethods)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.typicalExamples)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.commonTraps)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.memoryChecklist)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.reviewPlan)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.mockExam)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.answerKey)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.finalSprint)}
</div>

<div class="section-divider">
  ${mdToWordHtml(s.references)}
</div>

<div class="footer-note">
  <p>📝 本讲义由 MangoOS AI 研究引擎生成 | 生成日期: ${now}</p>
  <p>⚠ 建议结合教材和课堂笔记使用 | AI生成内容仅供参考</p>
</div>

</body>
</html>`;
}

// ── Simple HTML escape ──────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── POST handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ExportRequest;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { format, courseName, sections } = body;

  if (!courseName || !sections) {
    return NextResponse.json({ error: "courseName and sections required" }, { status: 400 });
  }

  try {
    switch (format) {
      case "docx": {
        const html = generateWordHtml(body);
        const safeName = courseName.replace(/[/\\?%*:|"<>]/g, "_");
        return new NextResponse(html, {
          headers: {
            "Content-Type": "application/msword",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}_复习讲义.doc"`,
          },
        });
      }

      case "pdf": {
        // Return printable HTML that the browser can print to PDF
        const wordHtml = generateWordHtml(body);
        const printHtml = wordHtml.replace(
          '<style>',
          '<style>\n@media print { @page { size: A4; margin: 1.5cm; } }'
        );
        return new NextResponse(printHtml, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      }

      case "md": {
        // Concatenate all sections as Markdown
        const s = sections;
        const md = [
          s.coverPage, s.tableOfContents, s.courseOverview,
          s.examScopeMap, s.knowledgeGraph,
          ...s.chapterConcepts.map((ch, i) => `# 第${i + 1}章: ${ch.title}\n\n${ch.content}`),
          s.logicFramework, s.highFreqPoints, s.formulaTable,
          s.problemMethods, s.typicalExamples, s.commonTraps,
          s.memoryChecklist, s.reviewPlan, s.mockExam,
          s.answerKey, s.finalSprint, s.references,
        ].join("\n\n---\n\n");

        const safeName = courseName.replace(/[/\\?%*:|"<>]/g, "_");
        return new NextResponse(md, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}_复习讲义.md"`,
          },
        });
      }

      case "html": {
        const html = generateWordHtml(body);
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      }

      default:
        return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[exam-review/export]", err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Export failed",
    }, { status: 500 });
  }
}
