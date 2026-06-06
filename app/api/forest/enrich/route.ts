// ═══════════════════════════════════════════════════════════════
// POST /api/forest/enrich — Multi-source forest content enrichment
// Fetches from Wikipedia, GitHub trending, web search → AI synthesis
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { completeChat } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Wikipedia search ──────────────────────────────────────────
async function wikiSearch(query: string, lang = "zh"): Promise<string> {
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=5&origin=*`
    );
    const data = await res.json();
    const pages = data.query?.search ?? [];
    if (!pages.length) return "";

    const titles = pages.slice(0, 3).map((p: { title: string }) => p.title).join("|");
    const extractRes = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(titles)}&format=json&origin=*`
    );
    const extractData = await extractRes.json();
    const extracts = Object.values(extractData.query?.pages ?? {})
      .map((p: any) => p.extract ?? "")
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 4000);
    return extracts;
  } catch { return ""; }
}

// ── Web search (DuckDuckGo) ────────────────────────────────────
async function webSearch(query: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query + " tutorial guide")}&format=json&no_html=1`
    );
    const data = await res.json();
    const results = (data.RelatedTopics ?? []).slice(0, 5);
    return results.map((r: any) => r.Text ?? "").filter(Boolean).join("\n").slice(0, 3000);
  } catch { return ""; }
}

// ── GitHub trending search for learning resources ──────────────
async function githubSearch(query: string): Promise<string> {
  try {
    // Search GitHub repos related to the topic
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query + " learning")}&sort=stars&order=desc&per_page=5`,
      { headers: { "Accept": "application/vnd.github.v3+json", "User-Agent": "MangoOS" } }
    );
    const data = await res.json();
    const repos = data.items ?? [];
    return repos.map((r: any) =>
      `- ${r.full_name} (⭐${r.stargazers_count}): ${r.description ?? "No description"} | ${r.html_url}`
    ).join("\n");
  } catch { return ""; }
}

// ── POST handler ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: { topic?: string; type?: "topics" | "notes" | "resources" | "flashcards" | "all" };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic = body.topic?.trim();
  const type = body.type ?? "all";

  if (!topic) {
    return NextResponse.json({ error: "topic required" }, { status: 400 });
  }

  try {
    // Parallel fetch from all sources
    const [zhWiki, enWiki, webResults, githubResults] = await Promise.all([
      wikiSearch(topic, "zh"),
      wikiSearch(topic, "en"),
      webSearch(topic),
      githubSearch(topic),
    ]);

    const knowledgeBase = [
      enWiki ? `=== English Wikipedia ===\n${enWiki}` : "",
      zhWiki ? `=== 中文维基 ===\n${zhWiki}` : "",
      webResults ? `=== Web Search ===\n${webResults}` : "",
      githubResults ? `=== GitHub Repos ===\n${githubResults}` : "",
    ].filter(Boolean).join("\n\n");

    if (!knowledgeBase.trim()) {
      return NextResponse.json({
        topics: [],
        notes: [],
        resources: [],
        flashcards: [],
        warning: "No external data found. Using AI knowledge only.",
      });
    }

    // AI synthesis prompt
    const systemPrompt = `你是知识森林充实引擎。基于提供的知识库内容，生成结构化的学习内容。

输出严格JSON格式：
{
  "topics": [
    {"name":"主题名","type":"concept|skill|book|paper|topic|formula","summary":"详细的一句话定义（含关键术语）","children":["子主题1","子主题2","子主题3"]}
  ],
  "resources": [
    {"title":"资源名","type":"book|course|video|paper|website|project","url":"真实URL","description":"详细描述（20-40字）","forTopic":"关联主题"}
  ],
  "notes": [
    {"title":"笔记标题","topic":"关联主题","body":"笔记内容（200-400字，含核心概念、要点、例子、易错点）","tags":["标签1","标签2"]}
  ],
  "flashcards": [
    {"front":"问题","back":"详细答案"}
  ],
  "learningPath": [
    {"phase":"学习阶段","duration":"时长","tasks":["具体任务"],"topics":["相关主题"]}
  ],
  "tutorPrompts": ["AI导师引导问题"],
  "estimatedWeeks": 数字
}

要求：
- topics: 生成10-15个知识主题，每个有清晰的定义和3-5个子主题
- resources: 6-10个真实学习资源，优先使用知识库中提到的GitHub仓库和网站
- notes: 8-12条笔记，每条200-400字，结构清晰（核心概念→要点→例子→易错点）
- flashcards: 10-15张闪卡，问题具体、答案完整
- learningPath: 4-6个学习阶段
- 内容必须准确、具体、可操作
- 中文为主，术语带英文`;

    const raw = await completeChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: `主题：${topic}\n\n知识库参考：\n${knowledgeBase.slice(0, 8000)}\n\n请生成完整的知识森林内容。` },
    ], { temperature: 0.4, maxTokens: 4000 });

    // Extract JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      topics: parsed.topics ?? [],
      resources: parsed.resources ?? [],
      notes: parsed.notes ?? [],
      flashcards: parsed.flashcards ?? [],
      learningPath: parsed.learningPath ?? [],
      tutorPrompts: parsed.tutorPrompts ?? [],
      estimatedWeeks: parsed.estimatedWeeks ?? 8,
      _sources: {
        wikiZh: zhWiki ? `${zhWiki.length} chars` : "unavailable",
        wikiEn: enWiki ? `${enWiki.length} chars` : "unavailable",
        web: webResults ? `${webResults.length} chars` : "unavailable",
        github: githubResults ? `${githubResults.length} chars` : "unavailable",
      },
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Enrichment failed",
    }, { status: 500 });
  }
}
