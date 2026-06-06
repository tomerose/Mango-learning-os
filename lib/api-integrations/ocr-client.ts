// ═══════════════════════════════════════════════════════════════
// OCR Client — PaddleOCR Integration
// Uses PaddleOCR.js in browser OR hosted API via paddleocr.com
// Reference: github.com/PaddlePaddle/PaddleOCR
// ═══════════════════════════════════════════════════════════════

// ── Browser-side OCR via PaddleOCR.js ─────────────────────────

export async function ocrFromImage(imageFile: File): Promise<string> {
  // PaddleOCR.js CDN — loads on demand
  if (typeof window === "undefined") return "";

  try {
    // Load PaddleOCR.js dynamically
    const script = document.createElement("script");
    script.src = "https://paddlejs.bj.bcebos.com/paddleocr/2.6.0/paddleocr.min.js";
    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("PaddleOCR.js 加载失败"));
      document.head.appendChild(script);
    });

    const img = await fileToImage(imageFile);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (window as any).PaddleOCR?.recognize(img);
    if (result?.text) return result.text;
    return result?.data?.map((r: { text: string }) => r.text).join("\n") ?? "";
  } catch (err) {
    console.error("[OCR] browser OCR failed:", err);
    return "";
  }
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

// ── Server-side OCR via PaddleOCR hosted API ──────────────────

export async function ocrServerSide(imageBase64: string): Promise<string> {
  try {
    // Use PaddleOCR's hosted API (paddleocr.com)
    const res = await fetch("https://paddleocr.com/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
    });
    if (!res.ok) throw new Error(`OCR API error: ${res.status}`);
    const data = await res.json();
    return data.text ?? data.data?.map((r: { text: string }) => r.text).join("\n") ?? "";
  } catch {
    // Fallback: return empty, caller should handle
    return "";
  }
}

// ── Image to base64 helper ────────────────────────────────────

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("读取失败"));
    reader.readAsDataURL(file);
  });
}
