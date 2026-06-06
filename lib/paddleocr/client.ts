// ═══════════════════════════════════════════════════════════════
// PaddleOCR Integration Client
// Deploy PaddleOCR as a Docker HTTP service, then call from MangoOS.
//
// Setup: docker run -d -p 8866:8866 paddlecloud/paddleocr:latest
// Docs: https://github.com/PaddlePaddle/PaddleOCR
// ═══════════════════════════════════════════════════════════════

export interface OCRResult {
  text: string;
  confidence: number;
  boxes?: Array<{ text: string; confidence: number; box: number[] }>;
  tables?: Array<{ html: string; cells: string[][] }>;
  markdown?: string;
}

export interface PaddleOCRConfig {
  baseUrl: string;       // e.g. "http://localhost:8866"
  timeout?: number;      // default 30000ms
  language?: string;     // default "ch"
}

// ── Default config from env ─────────────────────────────────────

export function getPaddleOCRConfig(): PaddleOCRConfig | null {
  const baseUrl = process.env.PADDLEOCR_URL;
  if (!baseUrl) return null;
  return {
    baseUrl,
    timeout: 30000,
    language: process.env.PADDLEOCR_LANG ?? "ch",
  };
}

export function isPaddleOCRAvailable(): boolean {
  return !!process.env.PADDLEOCR_URL;
}

// ── OCR an image/file ───────────────────────────────────────────

export async function ocrImage(
  imageBase64: string,
  config?: PaddleOCRConfig
): Promise<OCRResult> {
  const cfg = config ?? getPaddleOCRConfig();
  if (!cfg) throw new Error("PaddleOCR not configured. Set PADDLEOCR_URL env var.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.timeout ?? 30000);

  try {
    const res = await fetch(`${cfg.baseUrl}/predict/ocr_system`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [imageBase64],
        lang: cfg.language ?? "ch",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`PaddleOCR error: ${res.status}`);

    const data = await res.json();
    const results = data.results?.[0] ?? {};

    const boxes = (results.text_region ?? []).map((r: any) => ({
      text: r.text ?? "",
      confidence: r.confidence ?? 0,
      box: r.text_region_rect ?? [],
    }));

    const fullText = boxes.map((b: any) => b.text).join("\n");

    return {
      text: fullText,
      confidence: boxes.length > 0
        ? boxes.reduce((sum: number, b: any) => sum + b.confidence, 0) / boxes.length
        : 0,
      boxes,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── OCR a PDF (requires PP-StructureV3) ─────────────────────────

export async function ocrPDF(
  pdfBase64: string,
  config?: PaddleOCRConfig
): Promise<OCRResult> {
  const cfg = config ?? getPaddleOCRConfig();
  if (!cfg) throw new Error("PaddleOCR not configured. Set PADDLEOCR_URL env var.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.timeout ?? 60000);

  try {
    const res = await fetch(`${cfg.baseUrl}/predict/pp_structure_v3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: pdfBase64,
        fileType: "pdf",
        lang: cfg.language ?? "ch",
        returnMarkdown: true,
        returnTableHtml: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`PaddleOCR PDF error: ${res.status}`);

    const data = await res.json();
    const result = data.result ?? {};

    return {
      text: result.text ?? result.markdown ?? "",
      confidence: result.confidence ?? 0,
      tables: result.tables ?? [],
      markdown: result.markdown ?? "",
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Structured document parse (PP-StructureV3 → Markdown/JSON) ──

export async function parseDocument(
  fileBase64: string,
  fileType: "pdf" | "image" | "docx",
  config?: PaddleOCRConfig
): Promise<{ markdown: string; tables: Array<{ html: string }>; text: string }> {
  const cfg = config ?? getPaddleOCRConfig();
  if (!cfg) throw new Error("PaddleOCR not configured.");

  const endpoint = fileType === "pdf" || fileType === "docx"
    ? "/predict/pp_structure_v3"
    : "/predict/ocr_system";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.timeout ?? 60000);

  try {
    const res = await fetch(`${cfg.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: fileBase64,
        fileType,
        returnMarkdown: true,
        returnTableHtml: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`PaddleOCR error: ${res.status}`);

    const data = await res.json();
    return {
      markdown: data.result?.markdown ?? "",
      tables: data.result?.tables ?? [],
      text: data.result?.text ?? "",
    };
  } finally {
    clearTimeout(timeout);
  }
}
