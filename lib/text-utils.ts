// ─────────────────────────────────────────────────────────────
// Shared text extraction utilities.
// Extracted from app/api/exam/generate/route.ts so both the
// exam module and the notes-import module share one HTML stripper.
// ─────────────────────────────────────────────────────────────

/** Strip HTML tags, scripts, styles, and entities; collapse whitespace. */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * If the first line of a markdown string starts with `# `,
 * return it as a title candidate and remove it from the body.
 * Returns the original string as both title and body if no heading found.
 */
export function extractFirstHeading(md: string): { title: string; body: string } {
  const m = md.match(/^\s*# (.+?)[\r\n]*(.*)/s);
  if (m) {
    return { title: m[1].trim(), body: m[2].trim() };
  }
  const firstLine = md.split(/[\r\n]+/)[0]?.trim() ?? "";
  const title = firstLine.slice(0, 60);
  return { title, body: md };
}

/** Truncate text to maxLen characters (default 50k), preserving word boundary when possible. */
export function truncate(text: string, maxLen = 50000): string {
  if (text.length <= maxLen) return text;
  const snipped = text.slice(0, maxLen);
  const lastSpace = snipped.lastIndexOf(" ");
  return lastSpace > maxLen * 0.8 ? snipped.slice(0, lastSpace) : snipped;
}

/** Basic CSV parser: first column = title, second = body, rest = tags (comma-separated in third col). */
export function parseCsvToNotes(
  csv: string
): Array<{ title: string; body: string; tags: string[] }> {
  const lines = csv
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return []; // header + at least 1 row

  const header = lines[0].toLowerCase();
  // Guess delimiter
  const delim = header.includes("\t") ? "\t" : ",";
  const headerCols = header.split(delim).map((h) => h.trim());

  const ti = headerCols.findIndex((h) => h === "title" || h === "标题");
  const bi = headerCols.findIndex((h) => h === "body" || h === "内容" || h === "content");
  const tgi = headerCols.findIndex((h) => h === "tags" || h === "标签");

  const rows = lines.slice(1).map((line) => line.split(delim).map((c) => c.trim()));
  return rows
    .map((cols) => {
      const title = ti >= 0 ? (cols[ti] ?? "").replace(/^"|"$/g, "") : (cols[0] ?? "");
      const body = bi >= 0 ? (cols[bi] ?? "").replace(/^"|"$/g, "") : (cols[1] ?? "");
      const tags =
        tgi >= 0
          ? (cols[tgi] ?? "")
              .replace(/^"|"$/g, "")
              .split(/[,;，；]/)
              .map((t) => t.trim())
              .filter(Boolean)
          : [];
      return { title, body, tags };
    })
    .filter((n) => n.title);
}
