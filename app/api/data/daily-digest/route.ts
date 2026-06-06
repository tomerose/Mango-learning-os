// ═══════════════════════════════════════════════════════════════
// Daily Digest API — Generates 3-flow daily learning content
// For email pipeline (06:30/12:00/21:30) and Web UI
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

interface DigestItem {
  title: string; content: string; url: string; source: string;
}

interface DailyDigest {
  generatedAt: string;
  englishFlow: { articles: DigestItem[]; vocabulary: string[]; sentenceStructures: string[] };
  worldFlow: { items: DigestItem[]; keyEvent: string };
  planFlow: { mainTask: string; subTasks: string[]; timeAllocation: string; risk: string };
}

// English RSS sources
const ENGLISH_SOURCES = [
  "https://feeds.bbci.co.uk/news/rss.xml",
];

// World RSS sources
const WORLD_SOURCES = [
  "https://hnrss.org/frontpage?points=50",
];

async function fetchRSS(url: string): Promise<DigestItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MangoOS/10.0", "Accept": "application/rss+xml" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: DigestItem[] = [];
    const regex = /<item>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = regex.exec(xml)) !== null) {
      const t = (m[1].match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
      if (t) items.push({ title: t, content: "", url: "", source: new URL(url).hostname });
    }
    return items.slice(0, 5);
  } catch { return []; }
}

export async function GET(req: NextRequest) {
  const flow = req.nextUrl.searchParams.get("flow") ?? "all";

  try {
    const [englishItems, worldItems] = await Promise.all([
      flow === "all" || flow === "english" ? Promise.all(ENGLISH_SOURCES.map(fetchRSS)) : Promise.resolve([[]]),
      flow === "all" || flow === "world" ? Promise.all(WORLD_SOURCES.map(fetchRSS)) : Promise.resolve([[]]),
    ]);

    const digest: DailyDigest = {
      generatedAt: new Date().toISOString(),
      englishFlow: {
        articles: englishItems.flat().slice(0, 3),
        vocabulary: englishItems.flat().slice(0, 2).map(a => a.title.split(" ").filter(w => w.length > 5).slice(0, 3).join(", ")),
        sentenceStructures: ["被动语态结构: [Subject] + [be] + [past participle] + [by agent]", "条件句: If + [present], [will + verb]"],
      },
      worldFlow: {
        items: worldItems.flat().slice(0, 3),
        keyEvent: worldItems.flat()[0]?.title ?? "No data available",
      },
      planFlow: {
        mainTask: "基于今日数据源完成1个认知单元学习",
        subTasks: ["阅读1篇English Flow文章", "完成世界情报理解", "执行学习计划任务"],
        timeAllocation: "English 20min | World 15min | Plan 10min",
        risk: "低 — 数据源正常",
      },
    };

    return NextResponse.json(digest);
  } catch {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      englishFlow: { articles: [], vocabulary: [], sentenceStructures: [] },
      worldFlow: { items: [], keyEvent: "No data available — check network" },
      planFlow: { mainTask: "完成一次学习会话", subTasks: [], timeAllocation: "30分钟", risk: "数据源不可用" },
    });
  }
}
