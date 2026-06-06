// GET /api/data/search?q=query — Combined web search
// Uses Wikipedia + DuckDuckGo + Dictionary (all free, no API key)
import { NextRequest, NextResponse } from "next/server";
import { combinedSearch, formatSearchResults } from "@/lib/api-integrations/web-search";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q?.trim()) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    const results = await combinedSearch(q.trim(), {
      wikipedia: true,
      duckduckgo: true,
      dictionary: /^[a-zA-Z\s-]+$/.test(q.trim()),
    });

    return NextResponse.json({
      query: q.trim(),
      count: results.length,
      results,
      formatted: formatSearchResults(results),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 },
    );
  }
}
