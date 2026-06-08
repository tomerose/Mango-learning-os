// /api/export — HTML/PDF export for Agent outcomes
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  try {
    const ssr = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } });
    const { data: { user } } = await ssr.auth.getUser();
    const body = await req.json();
    const { title, content, sources, qualityScore, format } = body as { title: string; content: string; sources?: any[]; qualityScore?: number; format: "html" | "pdf" };
    if (!title || !content) return NextResponse.json({ success: false, error: "Missing title or content" }, { status: 400 });

    const dateStr = new Date().toISOString().slice(0, 10);
    const sourceText = sources?.length ? sources.map((s: any, i: number) => `[${i + 1}] ${s.title} — ${s.url || "无链接"}`).join("\n") : "";

    if (format === "html") {
      const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:2rem auto;padding:0 1.5rem;line-height:1.8;color:#1a1a1a}h1{font-size:1.5rem;border-bottom:2px solid #e8e4dc;padding-bottom:.5rem}h2{font-size:1.2rem;margin-top:1.5rem}h3{font-size:1rem}pre{background:#f5f5f0;padding:1rem;border-radius:8px;overflow-x:auto}code{background:#f0f0eb;padding:.15em .4em;border-radius:3px}.src{font-size:.8rem;color:#666;border-top:1px solid #e8e4dc;margin-top:2rem;padding-top:1rem}.meta{font-size:.75rem;color:#999;margin-bottom:1.5rem}.footer{font-size:.7rem;color:#bbb;text-align:center;margin-top:2rem;border-top:1px solid #f0ece4;padding-top:1rem}@media print{body{margin:0;padding:0 1cm}}</style></head><body><h1>${title}</h1><div class=meta>MangoOS · ${dateStr} · 质量 ${qualityScore || 0}分</div><div>${content.replace(/\n/g, "<br>").replace(/## (.+)/g, "<h2>$1</h2>").replace(/# (.+)/g, "<h1>$1</h1>")}</div>${sourceText ? `<div class=src><h3>参考来源</h3><pre>${sourceText}</pre></div>` : ""}<div class=footer>第三自习室出品 · MangoOS</div></body></html>`;

      return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="${encodeURIComponent(title)}.html"` } });
    }

    if (format === "pdf") {
      // PDF via browser print — Puppeteer requires additional infrastructure
      // Return HTML that auto-opens print dialog
      const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1.5rem;line-height:1.8;color:#1a1a1a}h1{font-size:1.5rem;border-bottom:2px solid #e0e0e0;padding-bottom:.5rem}h2{font-size:1.2rem;margin-top:1.5rem}pre{background:#f5f5f0;padding:1rem;border-radius:8px}.src{font-size:.8rem;color:#666;border-top:1px solid #e0e0e0;margin-top:2rem;padding-top:1rem}.footer{font-size:.7rem;color:#bbb;text-align:center;margin-top:2rem;border-top:1px solid #f0ece4;padding-top:1rem}@media print{body{margin:0;padding:0 1cm}}</style></head><body><h1>${title}</h1><p style="color:#999;font-size:.8rem">MangoOS · ${dateStr} · 质量 ${qualityScore || 0}分</p><div>${content.replace(/\n/g, "<br>")}</div>${sourceText ? `<div class=src><h3>参考来源</h3><pre>${sourceText}</pre></div>` : ""}<div class=footer>第三自习室出品 · MangoOS</div><script>window.print()</script></body></html>`;

      return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return NextResponse.json({ success: false, error: "Invalid format" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "export failed" }, { status: 500 });
  }
}
