import { NextRequest, NextResponse } from "next/server";
import { stripHtml } from "@/lib/text-utils";

// ─────────────────────────────────────────────────────────────
// Notes import — URL fetcher.
// Fetches a public URL and extracts clean text from the HTML.
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 25;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "请输入 URL" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "无效的 URL 格式" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "仅支持 http/https 链接" }, { status: 400 });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(parsed.href, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MangoLearningOS/1.0; +https://mangoleaningos.top)",
        },
      });
    } catch (err) {
      clearTimeout(timer);
      const msg = err instanceof Error && err.name === "AbortError" ? "请求超时（15 秒）" : "无法访问该链接";
      return NextResponse.json({ error: msg }, { status: 502 });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `目标网站返回 HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    const html = await res.text();

    // Extract <title> as a hint
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : null;

    let text: string;
    if (contentType.includes("json")) {
      // JSON endpoint — stringify key fields
      try {
        const obj = JSON.parse(html);
        text = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
      } catch {
        text = html;
      }
    } else {
      text = stripHtml(html);
    }

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "页面内容过短，无法提取有效文本" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: text.slice(0, 80000),
      title: pageTitle,
      url: parsed.href,
      source: "url",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "链接抓取失败" },
      { status: 500 }
    );
  }
}
