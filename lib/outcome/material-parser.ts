/**
 * MangoOS V14.3 — Material Parser
 *
 * Parses user-uploaded materials into structured context for artifact generation.
 * Supports: text, markdown, PDF (basic), DOCX fallback.
 * Distinguishes between: user material, web sources, AI reasoning.
 */
export interface ParsedMaterial {
  fileName: string;
  fileType: "text" | "markdown" | "pdf" | "docx" | "unknown";
  rawLength: number;
  parsedLength: number;
  summary: string;        // 1-2 sentence auto-summary
  keyTopics: string[];    // extracted key topics
  fullText: string;       // cleaned text content
  source: "user-upload";  // always tagged as user material
}

export interface MaterialContext {
  materials: ParsedMaterial[];
  combinedSummary: string;
  allTopics: string[];
  totalLength: number;
}

// ── Parse individual file ──────────────────────────────────────

export function parseMaterial(
  name: string,
  content: string,
): ParsedMaterial {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  let fileType: ParsedMaterial["fileType"] = "unknown";
  let cleaned = content;

  if (["md", "markdown"].includes(ext)) {
    fileType = "markdown";
  } else if (["txt", "text"].includes(ext)) {
    fileType = "text";
  } else if (ext === "pdf") {
    fileType = "pdf";
    // Basic: try to extract readable text, strip binary noise
    cleaned = content.replace(/[^\x20-\x7E一-鿿　-〿＀-￯\n\r]/g, "");
    if (cleaned.length < 50) {
      cleaned = `[PDF 文件 "${name}" — 文本提取有限，建议手动复制内容或使用 OCR]\n\n${content.slice(0, 1000)}`;
    }
  } else if (ext === "docx") {
    fileType = "docx";
    cleaned = content.replace(/[^\x20-\x7E一-鿿　-〿＀-￯\n\r]/g, "");
    if (cleaned.length < 50) {
      cleaned = `[DOCX 文件 "${name}" — 请导出为 .txt 或 .md 后重新上传]\n\n${content.slice(0, 1000)}`;
    }
  } else {
    fileType = "unknown";
    if (cleaned.length < 20) {
      cleaned = `[未知格式文件 "${name}" — 内容过短或无法解析]`;
    }
  }

  // Clean whitespace
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // Extract key topics (simple frequency-based)
  const topics = extractTopics(cleaned);

  // Generate brief summary
  const summary = cleaned.length > 200
    ? cleaned.slice(0, 200).replace(/\n/g, " ").trim() + "…"
    : cleaned.slice(0, 100);

  return {
    fileName: name,
    fileType,
    rawLength: content.length,
    parsedLength: cleaned.length,
    summary,
    keyTopics: topics.slice(0, 8),
    fullText: cleaned,
    source: "user-upload",
  };
}

/** Parse multiple files into combined context */
export function parseMaterials(
  files: { name: string; content: string }[],
): MaterialContext {
  const materials = files.map(f => parseMaterial(f.name, f.content));
  const allTopics = [...new Set(materials.flatMap(m => m.keyTopics))];
  const totalLength = materials.reduce((sum, m) => sum + m.parsedLength, 0);

  const combinedSummary = materials
    .map(m => `**${m.fileName}** (${m.fileType}, ${m.parsedLength}字符): ${m.summary}`)
    .join("\n\n");

  return { materials, combinedSummary, allTopics, totalLength };
}

/** Build material-aware system prompt section */
export function materialContextToPrompt(ctx: MaterialContext): string {
  if (ctx.materials.length === 0) return "";

  const parts = [
    "## 用户上传资料",
    `共 ${ctx.materials.length} 个文件，总计 ${ctx.totalLength} 字符。`,
    "",
    "### 资料摘要",
    ctx.combinedSummary,
    "",
    "### 关键主题",
    ctx.allTopics.join("、"),
    "",
    "### 资料全文",
    ctx.materials.map(m =>
      `#### ${m.fileName} (${m.fileType})\n${m.fullText.slice(0, 8000)}`
    ).join("\n\n---\n\n"),
  ];

  return parts.join("\n");
}

// ── Topic extraction helper ────────────────────────────────────

function extractTopics(text: string): string[] {
  const words = text.split(/[\s\n，。！？、；：""（）【】《》\-,.!?;:()\[\]{}]+/);
  const freq: Record<string, number> = {};

  const stopWords = new Set([
    "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一", "一个",
    "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有", "看", "好",
    "自己", "这", "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "or",
    "and", "that", "this", "it", "its", "not", "but", "we", "they", "he", "she",
  ]);

  for (const w of words) {
    const clean = w.trim().toLowerCase();
    if (clean.length < 2 || stopWords.has(clean)) continue;
    freq[clean] = (freq[clean] ?? 0) + 1;
  }

  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
}
