// ═══════════════════════════════════════════════════════════════
// POST /api/notes/enrich — AI-enrich note content with knowledge bases
// Uses Wikipedia + DuckDuckGo + AI to generate richer body and tags
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { completeChat } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 30;

async function searchWikipedia(query: string): Promise<string> {
  try {
    const res = await fetch(
      `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3&origin=*`
    );
    const data = await res.json();
    const results = data.query?.search ?? [];
    if (results.length === 0) return "";

    // Get extracts for top results
    const titles = results.slice(0, 2).map((r: {title:string}) => r.title).join("|");
    const extractRes = await fetch(
      `https://zh.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(titles)}&format=json&origin=*`
    );
    const extractData = await extractRes.json();
    const pages = extractData.query?.pages ?? {};
    return Object.values(pages).map((p: any) => (p as {extract?:string}).extract ?? "").filter(Boolean).join("\n\n").slice(0, 2000);
  } catch {
    return "";
  }
}

async function searchWeb(query: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query + " 概念 解释")}&format=json&no_html=1`
    );
    const data = await res.json();
    const results = (data.RelatedTopics ?? []).slice(0, 5);
    return results.map((r: any) => r.Text ?? "").filter(Boolean).join("\n").slice(0, 1500);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  let body: { title?: string; topic?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = body.title ?? "";
  const topic = body.topic ?? title;

  if (!title.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  try {
    // Fetch from knowledge bases
    const [wikiContent, webContent] = await Promise.all([
      searchWikipedia(title),
      searchWeb(title),
    ]);

    const knowledgeContext = [wikiContent, webContent].filter(Boolean).join("\n\n---\n\n");

    // AI synthesizes structured note content
    const aiPrompt = knowledgeContext
      ? `基于以下知识库内容，生成一篇结构化的学习笔记。

主题：${title}
知识库参考：
${knowledgeContext.slice(0, 3000)}

要求：
1. 【核心概念】1-2句话定义
2. 【深入理解】3-5个要点，每个要点有解释
3. 【实际应用】1-2个具体例子
4. 【易错点】1个常见误解
5. 用中文写，术语带英文
6. 总字数300-500字
7. 末尾附加3-5个标签，格式：【标签】标签1,标签2,标签3`

      : `生成一篇关于「${title}」的入门学习笔记。包括：核心概念定义、3个关键要点、1个例子、1个易错点。300字左右。末尾附加3-5个标签。`;

    const raw = await completeChat(
      [
        { role: "system", content: "你是知识整理引擎。输出结构化笔记，中文，术语带英文。" },
        { role: "user", content: aiPrompt },
      ],
      { temperature: 0.4, maxTokens: 800 }
    );

    // Extract tags from the response
    const tagMatch = raw.match(/【标签】(.+)/);
    const extractedTags: string[] = tagMatch
      ? tagMatch[1].split(/[,，\s]+/).map((t: string) => t.trim()).filter(Boolean)
      : [];

    // Clean body (remove the 【标签】 line)
    const cleanBody = raw.replace(/【标签】.+/g, "").trim();

    return NextResponse.json({
      body: cleanBody || raw,
      tags: extractedTags,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Enrichment failed",
    }, { status: 500 });
  }
}
