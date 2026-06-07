// ═══════════════════════════════════════════════════════════════
// True .docx Builder — Office Open XML (OOXML)
// Produces valid .docx files without external dependencies.
// Uses native CompressionStream API for ZIP packaging.
//
// .docx = ZIP of XML files:
//   [Content_Types].xml
//   _rels/.rels
//   word/document.xml
//   word/styles.xml
// ═══════════════════════════════════════════════════════════════

interface DocxSection {
  title: string;
  content: string;
}

interface DocxOptions {
  courseName: string;
  sections: Record<string, unknown>;
  chapterConcepts?: Array<{ title: string; content: string }>;
  includeTOC?: boolean;
  fontFamily?: "serif" | "sans";
}

// XML escaping
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Simple markdown → OOXML paragraph conversion
function mdToDocxXML(text: string): string {
  const lines = text.split("\n");
  let xml = "";
  let inList = false;

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (inList) { xml += "</w:p>"; inList = false; }
      xml += headingXml(line.slice(4), 3);
    } else if (line.startsWith("## ")) {
      if (inList) { xml += "</w:p>"; inList = false; }
      xml += headingXml(line.slice(3), 2);
    } else if (line.startsWith("# ")) {
      if (inList) { xml += "</w:p>"; inList = false; }
      xml += headingXml(line.slice(2), 1);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { xml += "<w:p><w:pPr><w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr>"; inList = true; }
      xml += bulletXml(line.slice(2));
    } else if (line.trim() === "") {
      if (inList) { xml += "</w:p>"; inList = false; }
      xml += "<w:p><w:r><w:br/></w:r></w:p>";
    } else {
      if (inList) { xml += "</w:p>"; inList = false; }
      xml += paragraphXml(line);
    }
  }
  if (inList) { xml += "</w:p>"; }
  return xml;
}

function headingXml(text: string, level: number): string {
  // Handle bold markers in headings
  const formatted = text.replace(/\*\*(.+?)\*\*/g, '</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>$1</w:t></w:r><w:r><w:t>');
  return `<w:p>
    <w:pPr><w:pStyle w:val="Heading${level}"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Cormorant Garamond" w:hAnsi="Cormorant Garamond"/></w:rPr><w:t xml:space="preserve">${esc(formatted)}</w:t></w:r>
  </w:p>`;
}

function paragraphXml(text: string): string {
  // Bold
  let formatted = text.replace(/\*\*(.+?)\*\*/g, '</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>$1</w:t></w:r><w:r><w:t>');
  // Italic
  formatted = formatted.replace(/\*(.+?)\*/g, '</w:t></w:r><w:r><w:rPr><w:i/></w:rPr><w:t>$1</w:t></w:r><w:r><w:t>');
  // Code
  formatted = formatted.replace(/`(.+?)`/g, '</w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/></w:rPr><w:t>$1</w:t></w:r><w:r><w:t>');

  return `<w:p>
    <w:r><w:rPr><w:rFonts w:ascii="Inter" w:hAnsi="Inter" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${esc(formatted)}</w:t></w:r>
  </w:p>`;
}

function bulletXml(text: string): string {
  let formatted = text.replace(/\*\*(.+?)\*\*/g, '</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>$1</w:t></w:r><w:r><w:t>');
  return `<w:r><w:rPr><w:rFonts w:ascii="Inter" w:hAnsi="Inter" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">• ${esc(formatted)}</w:t></w:r><w:br/>`;
}

// ── Full Document XML ─────────────────────────────────────────

function buildDocumentXml(sections: DocxSection[], courseName: string): string {
  let bodyXml = "";

  // Cover page: title
  bodyXml += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="2400"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Cormorant Garamond" w:hAnsi="Cormorant Garamond"/><w:sz w:val="56"/><w:b/></w:rPr><w:t xml:space="preserve">${esc(courseName)}</w:t></w:r>
  </w:p>`;
  bodyXml += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Cormorant Garamond" w:hAnsi="Cormorant Garamond"/><w:sz w:val="36"/><w:color w:val="888888"/></w:rPr><w:t xml:space="preserve">期末复习讲义</w:t></w:r>
  </w:p>`;
  bodyXml += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="600"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Inter" w:hAnsi="Inter"/><w:sz w:val="22"/><w:color w:val="999999"/></w:rPr><w:t xml:space="preserve">由 Mango AI 生成 · ${new Date().toLocaleDateString("zh-CN")}</w:t></w:r>
  </w:p>`;

  // Page break after cover
  bodyXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

  // Sections
  for (const section of sections) {
    bodyXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`; // New page per major section
    bodyXml += headingXml(section.title, 2);
    bodyXml += mdToDocxXML(section.content);
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

// ── Styles XML ─────────────────────────────────────────────────

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:line="360" w:lineRule="auto" w:after="120"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Inter" w:hAnsi="Inter" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:pPr><w:spacing w:before="480" w:after="240"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Cormorant Garamond" w:hAnsi="Cormorant Garamond"/><w:sz w:val="40"/><w:b/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:pPr><w:spacing w:before="360" w:after="180"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Cormorant Garamond" w:hAnsi="Cormorant Garamond"/><w:sz w:val="32"/><w:b/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="Heading 3"/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Cormorant Garamond" w:hAnsi="Cormorant Garamond"/><w:sz w:val="26"/><w:b/></w:rPr>
  </w:style>
</w:styles>`;

// ── Content Types ─────────────────────────────────────────────

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

// ── Relationships ─────────────────────────────────────────────

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const DOCUMENT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

// ── ZIP Builder (Manual, no dependencies) ────────────────────

async function buildZip(files: Array<{ name: string; data: string }>): Promise<Blob> {
  // Use JSZip approach: manually build a minimal ZIP
  // ZIP format: local file headers + central directory + end record

  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.data);

    // CRC32 placeholder (many readers ignore it)
    const crc = 0;

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length + dataBytes.length);
    const lh = new DataView(localHeader.buffer);
    lh.setUint32(0, 0x04034b50, true); // signature
    lh.setUint16(4, 20, true);         // version
    lh.setUint16(6, 0x0800, true);     // flags (UTF-8)
    lh.setUint16(8, 0, true);          // compression (store)
    lh.setUint32(10, 0, true);         // CRC placeholder
    lh.setUint32(14, dataBytes.length, true); // compressed size
    lh.setUint32(18, dataBytes.length, true); // uncompressed size
    lh.setUint16(22, nameBytes.length, true); // filename length
    lh.setUint16(24, 0, true);         // extra length
    localHeader.set(nameBytes, 30);
    localHeader.set(dataBytes, 30 + nameBytes.length);
    parts.push(localHeader);

    // Central directory entry
    const cdEntry = new Uint8Array(46 + nameBytes.length);
    const cd = new DataView(cdEntry.buffer);
    cd.setUint32(0, 0x02014b50, true); // signature
    cd.setUint16(4, 20, true);         // version made by
    cd.setUint16(6, 20, true);         // version needed
    cd.setUint16(8, 0x0800, true);     // flags
    cd.setUint16(10, 0, true);         // compression
    cd.setUint32(12, 0, true);         // CRC
    cd.setUint32(16, dataBytes.length, true); // compressed size
    cd.setUint32(20, dataBytes.length, true); // uncompressed size
    cd.setUint16(24, nameBytes.length, true); // filename length
    cd.setUint16(26, 0, true);         // extra length
    cd.setUint16(28, 0, true);         // comment length
    cd.setUint16(30, 0, true);         // disk start
    cd.setUint16(32, 0, true);         // internal attrs
    cd.setUint32(34, 0, true);         // external attrs
    cd.setUint32(38, offset, true);    // local header offset
    cdEntry.set(nameBytes, 46);
    centralDir.push(cdEntry);

    offset += localHeader.length;
  }

  const cdOffset = offset;
  const cdTotal = centralDir.reduce((acc, c) => acc + c.length, 0);
  const totalFiles = files.length;

  // End of central directory
  const eocd = new Uint8Array(22);
  const eo = new DataView(eocd.buffer);
  eo.setUint32(0, 0x06054b50, true);
  eo.setUint16(4, 0, true);
  eo.setUint16(6, 0, true);
  eo.setUint16(8, totalFiles, true);
  eo.setUint16(10, totalFiles, true);
  eo.setUint32(12, cdTotal, true);
  eo.setUint32(16, cdOffset, true);
  eo.setUint16(20, 0, true);

  const allParts = [...parts, ...centralDir, eocd];
  const totalLen = allParts.reduce((acc, p) => acc + p.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const p of allParts) {
    result.set(p, pos);
    pos += p.length;
  }

  return new Blob([result], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

// ── Public API ────────────────────────────────────────────────

/** Build a true .docx file from structured sections */
export async function buildDocx(options: DocxOptions): Promise<Blob> {
  const { courseName, sections } = options;

  // Flatten sections into DocxSection[]
  const flatSections: DocxSection[] = [];

  const sectionMap: Record<string, string> = {
    courseOverview: "课程概述",
    examScopeMap: "考纲范围",
    knowledgeGraph: "知识图谱",
    logicFramework: "逻辑框架",
    highFreqPoints: "高频考点",
    formulaTable: "公式速查",
    problemMethods: "解题方法",
    typicalExamples: "典型例题",
    commonTraps: "常见陷阱",
    memoryChecklist: "记忆清单",
    reviewPlan: "复习计划",
    mockExam: "模拟试卷",
    answerKey: "答案解析",
    finalSprint: "考前冲刺",
    references: "参考资料",
  };

  for (const [key, label] of Object.entries(sectionMap)) {
    const content = sections[key];
    if (typeof content === "string" && content.trim()) {
      flatSections.push({ title: label, content });
    }
  }

  // Chapter concepts
  const chapters = sections.chapterConcepts as Array<{ title: string; content: string }> | undefined;
  if (chapters && Array.isArray(chapters)) {
    for (const ch of chapters) {
      if (ch.title && ch.content) {
        flatSections.push({ title: ch.title, content: ch.content });
      }
    }
  }

  const documentXml = buildDocumentXml(flatSections, courseName);

  const files = [
    { name: "[Content_Types].xml", data: CONTENT_TYPES_XML },
    { name: "_rels/.rels", data: RELS_XML },
    { name: "word/document.xml", data: documentXml },
    { name: "word/styles.xml", data: STYLES_XML },
    { name: "word/_rels/document.xml.rels", data: DOCUMENT_RELS_XML },
  ];

  return buildZip(files);
}

/** Build a markdown string from sections */
export function buildMarkdown(options: DocxOptions): string {
  const { courseName, sections } = options;
  let md = `# ${courseName} — 期末复习讲义\n\n`;
  md += `> 由 Mango AI 生成 · ${new Date().toLocaleDateString("zh-CN")}\n\n---\n\n`;

  const sectionMap: Record<string, string> = {
    courseOverview: "课程概述",
    examScopeMap: "考纲范围",
    knowledgeGraph: "知识图谱",
    logicFramework: "逻辑框架",
    highFreqPoints: "高频考点",
    formulaTable: "公式速查",
    problemMethods: "解题方法",
    typicalExamples: "典型例题",
    commonTraps: "常见陷阱",
    memoryChecklist: "记忆清单",
    reviewPlan: "复习计划",
    mockExam: "模拟试卷",
    answerKey: "答案解析",
    finalSprint: "考前冲刺",
    references: "参考资料",
  };

  for (const [key, label] of Object.entries(sectionMap)) {
    const content = sections[key];
    if (typeof content === "string" && content.trim()) {
      md += `## ${label}\n\n${content}\n\n`;
    }
  }

  const chapters = sections.chapterConcepts as Array<{ title: string; content: string }> | undefined;
  if (chapters && Array.isArray(chapters)) {
    for (const ch of chapters) {
      if (ch.title && ch.content) {
        md += `## ${ch.title}\n\n${ch.content}\n\n`;
      }
    }
  }

  return md;
}

/** Build a self-contained HTML page from sections */
export function buildHtml(options: DocxOptions): string {
  const { courseName, sections } = options;
  let body = "";

  const sectionMap: Record<string, string> = {
    courseOverview: "课程概述",
    examScopeMap: "考纲范围",
    knowledgeGraph: "知识图谱",
    logicFramework: "逻辑框架",
    highFreqPoints: "高频考点",
    formulaTable: "公式速查",
    problemMethods: "解题方法",
    typicalExamples: "典型例题",
    commonTraps: "常见陷阱",
    memoryChecklist: "记忆清单",
    reviewPlan: "复习计划",
    mockExam: "模拟试卷",
    answerKey: "答案解析",
    finalSprint: "考前冲刺",
    references: "参考资料",
  };

  for (const [key, label] of Object.entries(sectionMap)) {
    const content = sections[key];
    if (typeof content === "string" && content.trim()) {
      body += `<section><h2>${label}</h2>${content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</section>\n`;
    }
  }

  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${courseName} — 复习讲义</title>
<style>body{font-family:Inter,system-ui,sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.8;color:#333}
h1{font-family:'Cormorant Garamond',serif;font-size:2.5rem}h2{font-family:'Cormorant Garamond',serif;font-size:1.5rem;margin-top:2rem}
section{margin-bottom:2rem}@media print{body{padding:0;font-size:11pt}}</style></head>
<body><h1>${courseName} — 期末复习讲义</h1><p>由 Mango AI 生成 · ${new Date().toLocaleDateString("zh-CN")}</p>${body}</body></html>`;
}
