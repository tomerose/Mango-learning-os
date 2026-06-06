// RSS Proxy API — fetches and parses RSS feeds server-side
// Avoids CORS issues and provides caching

import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const limiter = createRateLimiter({ requests: 20, window: 60000 });

// Simple in-memory cache
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 min

export async function GET(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(clientId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  // Check cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MangoLearningOS/10.0 RSS Reader", "Accept": "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();

    // Parse RSS XML (simple parser)
    const items: { title: string; content: string; url: string; source: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = (itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
      const link = (itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i) ?? [])[1]?.trim() ?? "";
      const desc = (itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ?? [])[1]?.replace(/<[^>]+>/g, "").trim() ?? "";

      if (title) {
        items.push({
          title,
          content: desc || title,
          url: link || url,
          source: new URL(url).hostname,
        });
      }
    }

    const data = { items: items.slice(0, 10), fetchedAt: new Date().toISOString() };
    cache.set(url, { data, ts: Date.now() });
    return NextResponse.json(data);
  } catch (err) {
    // Return empty on failure — no hallucination
    return NextResponse.json({
      items: [],
      error: err instanceof Error ? err.message : "Failed to fetch",
      fetchedAt: new Date().toISOString(),
    });
  }
}
