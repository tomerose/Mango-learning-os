// ═══════════════════════════════════════════════════════════════
// V10 Data Ingestion Engine — Real RSS/API content pipelines
// Sources: Economist, BBC, HN, Reddit, Wikipedia
// NO HALLUCINATION: all content from real sources
// ═══════════════════════════════════════════════════════════════

export interface RawContent {
  id: string; source: string; url: string; title: string;
  content: string; timestamp: string; category: "english" | "world" | "tech" | "learning";
}

export interface CognitiveCard {
  type: "card"; keyConcept: string; explanation: string;
  example: string; misconception: string; actionableInsight: string;
  source: string; sourceUrl: string;
}

export interface LearningFlow {
  flow: "english" | "world" | "planning";
  title: string;
  content: CognitiveCard[];
  generatedAt: string;
}

// ═══ Data Source Configuration (RSS + Public APIs) ═══

const RSS_SOURCES = {
  english: [
    "https://feeds.bbci.co.uk/news/rss.xml",
  ],
  world: [
    "https://hnrss.org/frontpage?points=50",
  ],
  tech: [
    "https://hnrss.org/frontpage?points=100",
  ],
};

// Public APIs for enriched content (no API key needed)
export const PUBLIC_APIS = {
  dictionary: (word: string) => `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
  news: "https://api.spaceflightnewsapi.net/v4/articles/?limit=5",
  books: (query: string) => `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
  universities: (country: string) => `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`,
  quote: "https://zenquotes.io/api/today",
};

// ═══ Fetch enriched content from public APIs ═══

export async function fetchPublicAPI(type: keyof typeof PUBLIC_APIS, param?: string): Promise<unknown> {
  const url = typeof PUBLIC_APIS[type] === "function"
    ? (PUBLIC_APIS[type] as (p: string) => string)(param ?? "")
    : PUBLIC_APIS[type] as string;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ═══ Dictionary lookup for English Flow ═══

export async function lookupWord(word: string): Promise<{ definition: string; example: string; phonetic: string } | null> {
  try {
    const data = await fetchPublicAPI("dictionary", word) as Array<{ meanings: Array<{ definitions: Array<{ definition: string; example?: string }> }>; phonetic?: string }> | null;
    if (!data?.[0]) return null;
    const m = data[0].meanings[0]?.definitions[0];
    return {
      definition: m?.definition ?? "",
      example: m?.example ?? "",
      phonetic: data[0].phonetic ?? "",
    };
  } catch { return null; }
}

// ═══ Client-side RSS fetcher (via Next.js API route proxy) ═══

export async function fetchRSSFeed(url: string): Promise<RawContent[]> {
  try {
    const res = await fetch(`/api/data/rss?url=${encodeURIComponent(url)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

// ═══ Fetch all sources for a flow ═══

export async function fetchFlowContent(flow: "english" | "world" | "tech"): Promise<RawContent[]> {
  const sources = RSS_SOURCES[flow] ?? [];
  const results = await Promise.all(sources.map(fetchRSSFeed));
  return results.flat().slice(0, 20);
}

// ═══ Structure raw content into cognitive cards (client-side AI-assisted) ═══

export async function structureContent(raw: RawContent): Promise<CognitiveCard | null> {
  try {
    const res = await fetch("/api/data/structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: raw.content.slice(0, 2000), title: raw.title, source: raw.source }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Fallback: extract basic structure without AI
    return {
      type: "card",
      keyConcept: raw.title,
      explanation: raw.content.slice(0, 300),
      example: "",
      misconception: "",
      actionableInsight: `Read more: ${raw.url}`,
      source: raw.source,
      sourceUrl: raw.url,
    };
  }
}

// ═══ Generate complete learning flow ═══

export async function generateFlow(
  flow: "english" | "world" | "planning",
  userLevel?: number,
): Promise<LearningFlow> {
  const category = flow === "english" ? "english" : flow === "world" ? "world" : "tech";
  const rawItems = await fetchFlowContent(category);

  if (rawItems.length === 0) {
    return {
      flow,
      title: flow === "english" ? "English Flow" : flow === "world" ? "World Intelligence" : "Learning Plan",
      content: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // Structure top items
  const structured = await Promise.all(rawItems.slice(0, 3).map(structureContent));
  const cards = structured.filter(Boolean) as CognitiveCard[];

  return {
    flow,
    title: flow === "english" ? "English Flow" : flow === "world" ? "World Intelligence" : "Learning Plan",
    content: cards,
    generatedAt: new Date().toISOString(),
  };
}

// ═══ Caching ═══

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data as T;
  return null;
}

export function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}
