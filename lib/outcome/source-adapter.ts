/**
 * MangoOS V14.3 — Source Adapter Layer
 *
 * Connects the ArtifactSource system to real web retrieval.
 * Supports: Wikipedia, DuckDuckGo, Dictionary API, Open Library.
 * Each source includes: title, url, platform, reliability, relevance, summary, timestamp.
 */
import type { ArtifactSource } from "@/lib/artifact/types";

export interface SourceQuery {
  query: string;
  maxResults?: number;
  platforms?: string[];
}

export interface SourceResult {
  sources: ArtifactSource[];
  searchedPlatforms: string[];
  totalFound: number;
  elapsedMs: number;
}

// ── Platform adapters ──────────────────────────────────────────

async function searchWikipedia(query: string, max: number = 3): Promise<ArtifactSource[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=${max}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.query?.search ?? [];
    return results.map((r: any) => ({
      id: `wp_${r.pageid}`,
      title: r.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, "_"))}`,
      platform: "wikipedia" as const,
      relevance: 0.9,
      reliability: "high" as const,
      excerpt: r.snippet?.replace(/<[^>]+>/g, "").slice(0, 300) ?? "",
    }));
  } catch {
    return [];
  }
}

/** V14.7.5: Chinese Wikipedia — critical for Chinese-language search results */
async function searchWikipediaZH(query: string, max: number = 3): Promise<ArtifactSource[]> {
  try {
    const url = `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=${max}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.query?.search ?? [];
    return results.map((r: any) => ({
      id: `zhwp_${r.pageid}`,
      title: r.title,
      url: `https://zh.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
      platform: "wikipedia-zh" as const,
      relevance: 0.9,
      reliability: "high" as const,
      excerpt: r.snippet?.replace(/<[^>]+>/g, "").slice(0, 300) ?? "",
    }));
  } catch {
    return [];
  }
}

/** V14.7.5: Enhanced DuckDuckGo search — better Chinese support */
async function searchDuckDuckGoV2(query: string, max: number = 3): Promise<ArtifactSource[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = await res.json();
    const sources: ArtifactSource[] = [];
    if (data.AbstractText && data.AbstractText.length > 20) {
      sources.push({
        id: `ddg_abs_${Date.now()}`,
        title: data.Heading || query,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        platform: "duckduckgo" as const,
        relevance: 0.85,
        reliability: "medium" as const,
        excerpt: data.AbstractText.slice(0, 300),
      });
    }
    for (const topic of (data.RelatedTopics ?? []).slice(0, max - sources.length)) {
      if (topic.Text) {
        sources.push({
          id: `ddg_rel_${Date.now()}_${sources.length}`,
          title: topic.FirstURL?.split("/").pop()?.replace(/_/g, " ") ?? query,
          url: topic.FirstURL ?? "",
          platform: "duckduckgo" as const,
          relevance: 0.6,
          reliability: "medium" as const,
          excerpt: topic.Text.slice(0, 200),
        });
      }
    }
    return sources.slice(0, max);
  } catch {
    return [];
  }
}

// searchDuckDuckGoV2 above replaces this — kept for reference, removed duplicate

async function searchDictionary(word: string): Promise<ArtifactSource[]> {
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 1).map((entry: any) => ({
      id: `dict_${word}`,
      title: entry.word,
      url: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
      platform: "dictionary" as const,
      relevance: 0.95,
      reliability: "high" as const,
      excerpt: entry.meanings?.[0]?.definitions?.[0]?.definition?.slice(0, 200) ?? "",
    }));
  } catch {
    return [];
  }
}

// ── Main search orchestrator ────────────────────────────────────

export async function searchSources(query: SourceQuery): Promise<SourceResult> {
  const start = Date.now();
  const platforms = query.platforms ?? ["wikipedia", "duckduckgo"];
  const maxPer = Math.ceil((query.maxResults ?? 6) / platforms.length);
  const searched: string[] = [];
  const allSources: ArtifactSource[] = [];

  const tasks: Promise<ArtifactSource[]>[] = [];

  if (platforms.includes("wikipedia")) {
    searched.push("wikipedia");
    tasks.push(searchWikipedia(query.query, maxPer));
    // V14.7.5: Also search Chinese Wikipedia for better CN results
    if (/[一-鿿]/.test(query.query)) {
      searched.push("wikipedia-zh");
      tasks.push(searchWikipediaZH(query.query, maxPer));
    }
  }
  if (platforms.includes("duckduckgo")) {
    searched.push("duckduckgo");
    tasks.push(searchDuckDuckGoV2(query.query, maxPer));
  }
  if (platforms.includes("dictionary") && /^[a-zA-Z\s-]+$/.test(query.query)) {
    searched.push("dictionary");
    tasks.push(searchDictionary(query.query));
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "fulfilled") allSources.push(...r.value);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = allSources.filter(s => {
    if (seen.has(s.url ?? s.title)) return false;
    seen.add(s.url ?? s.title);
    return true;
  });

  return {
    sources: deduped.slice(0, query.maxResults ?? 6),
    searchedPlatforms: searched,
    totalFound: allSources.length,
    elapsedMs: Date.now() - start,
  };
}

/** Score source credibility for a batch of sources */
export function scoreSourceBatch(sources: ArtifactSource[]): number {
  if (sources.length === 0) return 0;
  let total = 0;
  for (const s of sources) {
    if (s.reliability === "high") total += 3;
    else if (s.reliability === "medium") total += 2;
    else if (s.reliability === "low") total += 1;
  }
  return Math.round((total / (sources.length * 3)) * 8);
}
