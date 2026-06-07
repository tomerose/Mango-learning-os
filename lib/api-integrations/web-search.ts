// ═══════════════════════════════════════════════════════════════
// Web Search Integration — Wikipedia + DuckDuckGo + Open Library
// Inspired by anthropics/knowledge-work-plugins knowledge retrieval
// and github.com/public-apis free API directory
// ═══════════════════════════════════════════════════════════════

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: "wikipedia" | "duckduckgo" | "openlibrary" | "dictionary";
  relevanceScore?: number;
}

// ── Wikipedia API ──────────────────────────────────────────────

export async function searchWikipedia(query: string, lang = "zh"): Promise<SearchResult[]> {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.query?.search ?? []).map((r: { title: string; snippet: string; pageid: number }) => ({
      title: r.title,
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
      snippet: stripHtml(r.snippet),
      source: "wikipedia" as const,
      relevanceScore: 90,
    }));
  } catch { return []; }
}

// ── DuckDuckGo Instant Answer ──────────────────────────────────

export async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    // DuckDuckGo Instant Answer API (no key required)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url);
    const data = await res.json();

    const results: SearchResult[] = [];
    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: data.AbstractText,
        source: "duckduckgo",
        relevanceScore: 85,
      });
    }
    // Related topics
    for (const topic of (data.RelatedTopics ?? []).slice(0, 4)) {
      if (topic.Text && topic.FirstURL) {
        results.push({ title: topic.Text.slice(0, 60), url: topic.FirstURL, snippet: topic.Text, source: "duckduckgo", relevanceScore: 60 });
      }
    }
    return results;
  } catch { return []; }
}

// ── Open Library ───────────────────────────────────────────────

export async function searchBooks(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.docs ?? []).slice(0, 5).map((doc: { title: string; author_name?: string[]; first_publish_year?: number }) => ({
      title: doc.title,
      url: `https://openlibrary.org/search?q=${encodeURIComponent(query)}`,
      snippet: `${doc.author_name?.join(", ") ?? "Unknown"} · ${doc.first_publish_year ?? "N/A"}`,
      source: "openlibrary" as const,
      relevanceScore: 50,
    }));
  } catch { return []; }
}

// ── Free Dictionary API ────────────────────────────────────────

export async function searchDictionary(word: string): Promise<SearchResult[]> {
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data as Array<{ word: string; meanings: Array<{ partOfSpeech: string; definitions: Array<{ definition: string; example?: string }> }> }>).flatMap(entry =>
      entry.meanings.slice(0, 3).flatMap(m =>
        m.definitions.slice(0, 2).map(d => ({
          title: `${entry.word} (${m.partOfSpeech})`,
          url: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`,
          snippet: `${d.definition}${d.example ? ` Example: "${d.example}"` : ""}`,
          source: "dictionary" as const,
          relevanceScore: 70,
        }))
      )
    );
  } catch { return []; }
}

// ── Combined Search ────────────────────────────────────────────

export async function combinedSearch(query: string, options?: {
  wikipedia?: boolean;
  duckduckgo?: boolean;
  books?: boolean;
  dictionary?: boolean;
  enDictionary?: boolean;
}): Promise<SearchResult[]> {
  const tasks: Promise<SearchResult[]>[] = [];
  const isEnglish = /^[a-zA-Z\s-]+$/.test(query.trim());

  if (options?.wikipedia !== false) tasks.push(searchWikipedia(query));
  if (options?.duckduckgo !== false) tasks.push(searchDuckDuckGo(query));
  if (options?.books) tasks.push(searchBooks(query));
  if (options?.dictionary !== false && isEnglish) tasks.push(searchDictionary(query));
  // Also search English Wikipedia for broader coverage
  if (options?.wikipedia !== false && !isEnglish) tasks.push(searchWikipedia(query, "en"));

  const results = await Promise.allSettled(tasks);
  return results
    .filter((r): r is PromiseFulfilledResult<SearchResult[]> => r.status === "fulfilled")
    .flatMap(r => r.value)
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
    .slice(0, 10);
}

// ── Format for LLM context ─────────────────────────────────────

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return "未找到相关结果。";
  return results.map((r, i) =>
    `${i + 1}. **${r.title}** [${r.source}]\n   ${r.snippet}\n   ${r.url}`
  ).join("\n\n");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
