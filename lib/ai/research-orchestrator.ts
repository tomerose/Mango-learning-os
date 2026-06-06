// ═══════════════════════════════════════════════════════════════
// Research Orchestrator v1 — Multi-source research pipeline
// Used by Exam Review, Knowledge Capture, Mango Tutor, Career modules
//
// Pipeline: Query Expansion → Multi-Provider Search →
//   Source Dedup & Rank → Source Reliability Scoring →
//   Source Summaries → Citation Extraction → Final Context
//
// Providers: WebSearch, OfficialSite, Academic, YouTube,
//   GitHub, LocalFile (Zhihu via web search fallback)
// ═══════════════════════════════════════════════════════════════

import { completeChat } from "@/lib/ai/client";

// ── Types ───────────────────────────────────────────────────────

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  platform: "web" | "academic" | "github" | "youtube" | "official" | "local" | "zhihu";
  relevanceScore: number;     // 0-1
  reliabilityScore: number;   // 0-1
  summary: string;            // AI-generated summary of full content
  citations: string[];        // Extracted citations / references
  fetchedAt: string;
}

export interface ResearchQuery {
  original: string;
  expanded: string[];         // Query expansion results
}

export interface ResearchResult {
  id: string;
  query: ResearchQuery;
  sources: ResearchSource[];
  synthesizedContext: string; // Combined context for downstream AI
  referenceList: string[];    // Formatted citations
  fallbackUsed: boolean;
  warnings: string[];
  elapsedMs: number;
}

export interface ResearchOptions {
  maxSources?: number;        // Default 10
  minReliability?: number;    // Default 0.3
  timeoutMs?: number;         // Per-provider timeout, default 8000
  includeLocalFiles?: boolean;
  localFileContents?: Array<{ name: string; text: string }>;
  providers?: ProviderType[];
}

export type ProviderType = "web" | "academic" | "github" | "youtube" | "official" | "local";

// ── Provider Interface ──────────────────────────────────────────

interface SearchProvider {
  type: ProviderType;
  name: string;
  search(query: string, opts: { timeoutMs: number }): Promise<RawSearchResult[]>;
}

interface RawSearchResult {
  title: string;
  url: string;
  snippet: string;
  platform: ResearchSource["platform"];
}

// ═══════════════════════════════════════════════════════════════
// Provider implementations
// ═══════════════════════════════════════════════════════════════

// ── Web Search (DuckDuckGo — free, no API key) ───────────────
class WebSearchProvider implements SearchProvider {
  type: ProviderType = "web";
  name = "Web Search";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];

    // DuckDuckGo Instant Answer API
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), _opts.timeoutMs);
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        // Related topics
        const topics = (data.RelatedTopics ?? []).slice(0, 8);
        for (const t of topics) {
          const text = typeof t === "string" ? t : t.Text ?? "";
          const url = typeof t === "string" ? "" : t.FirstURL ?? "";
          if (text) {
            results.push({ title: text.slice(0, 80), url, snippet: text, platform: "web" });
          }
        }
        // Abstract
        if (data.AbstractText) {
          results.push({
            title: data.Heading ?? query,
            url: data.AbstractURL ?? "",
            snippet: data.AbstractText,
            platform: "web",
          });
        }
      }
    } catch { /* provider failure → graceful degradation */ }

    return results;
  }
}

// ── GitHub Search ──────────────────────────────────────────────
class GitHubProvider implements SearchProvider {
  type: ProviderType = "github";
  name = "GitHub";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), _opts.timeoutMs);
      const res = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "MangoOS-ResearchOrchestrator",
            ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        for (const repo of (data.items ?? []).slice(0, 5)) {
          results.push({
            title: repo.full_name,
            url: repo.html_url,
            snippet: `${repo.description ?? "No description"} | ⭐${repo.stargazers_count} | ${repo.language ?? "N/A"}`,
            platform: "github",
          });
        }
      }
    } catch { /* graceful */ }
    return results;
  }
}

// ── Academic Search (arXiv) ─────────────────────────────────────
class AcademicProvider implements SearchProvider {
  type: ProviderType = "academic";
  name = "Academic (arXiv)";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), _opts.timeoutMs);
      const res = await fetch(
        `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5&sortBy=relevance`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const text = await res.text();
        // Parse arXiv Atom XML (simple regex)
        const entries = text.split("<entry>").slice(1);
        for (const entry of entries.slice(0, 5)) {
          const title = entry.match(/<title[^>]*>([^<]+)<\/title>/)?.[1]?.trim() ?? "";
          const summary = entry.match(/<summary[^>]*>([^<]+)<\/summary>/)?.[1]?.trim() ?? "";
          const id = entry.match(/<id[^>]*>([^<]+)<\/id>/)?.[1]?.trim() ?? "";
          if (title) {
            results.push({
              title,
              url: id,
              snippet: summary.slice(0, 300),
              platform: "academic",
            });
          }
        }
      }
    } catch { /* graceful */ }
    return results;
  }
}

// ── Bilibili Search (free, no API key needed) ─────────────────
class BilibiliProvider implements SearchProvider {
  type: ProviderType = "youtube";
  name = "Bilibili (哔哩哔哩)";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), _opts.timeoutMs);
      const res = await fetch(
        `https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${encodeURIComponent(query)}&search_type=video&page=1`,
        {
          headers: {
            "User-Agent": "MangoOS-ResearchOrchestrator/1.0",
            "Referer": "https://www.bilibili.com",
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const videos = data?.data?.result?.find((r: any) => r.result_type === "video")?.data ?? [];
        for (const video of (videos as any[]).slice(0, 5)) {
          results.push({
            title: video.title?.replace(/<[^>]+>/g, "") ?? "",
            url: `https://www.bilibili.com/video/${video.bvid ?? video.aid}`,
            snippet: `${video.author ?? ""} | ▶${(video.play ?? 0).toLocaleString()} | 💬${(video.danmaku ?? 0).toLocaleString()} | ⏱${video.duration ?? ""}`,
            platform: "youtube",
          });
        }
      }
    } catch { /* graceful */ }

    // Fallback: construct search URL
    if (results.length === 0) {
      results.push({
        title: `B站搜索: ${query}`,
        url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`,
        snippet: "在哔哩哔哩上搜索相关学习视频",
        platform: "youtube",
      });
    }
    return results;
  }
}

// ── Douyin Search (free, search URL fallback) ──────────────────
class DouyinProvider implements SearchProvider {
  type: ProviderType = "youtube";
  name = "抖音";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    // Douyin doesn't have a stable public API. Use search URL.
    results.push({
      title: `抖音搜索: ${query}`,
      url: `https://www.douyin.com/search/${encodeURIComponent(query + " 学习 教程")}`,
      snippet: "在抖音上搜索相关学习短视频",
      platform: "youtube",
    });
    return results;
  }
}

// ── Local File Provider ─────────────────────────────────────────
class LocalFileProvider implements SearchProvider {
  type: ProviderType = "local";
  name = "Local Files";
  private fileContents: Array<{ name: string; text: string }> = [];

  setFiles(files: Array<{ name: string; text: string }>) {
    this.fileContents = files;
  }

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    if (!this.fileContents.length) return [];
    const qLower = query.toLowerCase();
    const keywords = qLower.split(/\s+/).filter(k => k.length > 1);

    return this.fileContents
      .filter(f => {
        const text = (f.name + " " + f.text).toLowerCase();
        return keywords.some(k => text.includes(k));
      })
      .slice(0, 5)
      .map(f => ({
        title: f.name,
        url: `local://${f.name}`,
        snippet: f.text.slice(0, 300),
        platform: "local" as const,
      }));
  }
}

// ── Open Library Provider (free, no API key) ──────────────────
class OpenLibraryProvider implements SearchProvider {
  type: ProviderType = "official";
  name = "Open Library";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), _opts.timeoutMs);
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        for (const doc of (data.docs ?? []).slice(0, 5)) {
          const title = doc.title ?? "";
          const author = doc.author_name?.join(", ") ?? "";
          const year = doc.first_publish_year ?? "";
          const subjects = doc.subject?.slice(0, 3).join(", ") ?? "";
          results.push({
            title: `${title}${author ? ` — ${author}` : ""}${year ? ` (${year})` : ""}`,
            url: doc.key ? `https://openlibrary.org${doc.key}` : "",
            snippet: `${subjects ? `主题: ${subjects}. ` : ""}${doc.edition_count ?? 0} 个版本`,
            platform: "official",
          });
        }
      }
    } catch { /* graceful */ }
    return results;
  }
}

// ── Free Dictionary Provider (free, no API key) ───────────────
class DictionaryProvider implements SearchProvider {
  type: ProviderType = "web";
  name = "Free Dictionary";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    // Extract the first English word from query
    const wordMatch = query.match(/[a-zA-Z]+/);
    const word = wordMatch ? wordMatch[0] : query.split(/\s+/)[0];
    if (!word || word.length < 2) return results;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), _opts.timeoutMs);
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        for (const entry of (data as any[]).slice(0, 2)) {
          const wordStr = entry.word ?? word;
          const phonetic = entry.phonetic ?? "";
          for (const meaning of (entry.meanings ?? []).slice(0, 2)) {
            const pos = meaning.partOfSpeech ?? "";
            const defs = (meaning.definitions ?? []).slice(0, 3)
              .map((d: any) => d.definition)
              .join("; ");
            const synonyms = (meaning.synonyms ?? []).slice(0, 5).join(", ");
            results.push({
              title: `${wordStr}${phonetic ? ` /${phonetic}/` : ""} (${pos})`,
              url: `https://en.wiktionary.org/wiki/${encodeURIComponent(wordStr)}`,
              snippet: `${defs}${synonyms ? ` [同: ${synonyms}]` : ""}`,
              platform: "web",
            });
          }
        }
      }
    } catch { /* graceful */ }
    return results;
  }
}

// ── Gutendex (Project Gutenberg) Provider (free, no API key) ──
class GutendexProvider implements SearchProvider {
  type: ProviderType = "official";
  name = "Project Gutenberg";

  async search(query: string, _opts: { timeoutMs: number }): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), _opts.timeoutMs);
      const res = await fetch(
        `https://gutendex.com/books?search=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        for (const book of (data.results ?? []).slice(0, 5)) {
          const title = book.title ?? "";
          const author = book.authors?.map((a: any) => a.name).join(", ") ?? "";
          const lang = book.languages?.join(", ") ?? "";
          const downloads = book.download_count ?? 0;
          const formats = Object.keys(book.formats ?? {}).slice(0, 3).join(", ");
          results.push({
            title: `${title}${author ? ` by ${author}` : ""}`,
            url: book.formats?.["text/html"] ?? `https://www.gutenberg.org/ebooks/${book.id}`,
            snippet: `📚 ${lang} | ⬇${downloads}次下载 | 格式: ${formats || "多种"}`,
            platform: "official",
          });
        }
      }
    } catch { /* graceful */ }
    return results;
  }
}

// ── Provider Registry ───────────────────────────────────────────

const providers: SearchProvider[] = [
  new WebSearchProvider(),
  new GitHubProvider(),
  new AcademicProvider(),
  new BilibiliProvider(),
  new DouyinProvider(),
  new OpenLibraryProvider(),
  new DictionaryProvider(),
  new GutendexProvider(),
];

function getLocalProvider(files?: Array<{ name: string; text: string }>): LocalFileProvider | null {
  if (!files?.length) return null;
  const p = new LocalFileProvider();
  p.setFiles(files);
  return p;
}

// ═══════════════════════════════════════════════════════════════
// Core Pipeline
// ═══════════════════════════════════════════════════════════════

/** Generate a unique ID for a research session */
function researchId(): string {
  return `research-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Query expansion: generate 3-5 related search queries */
async function expandQuery(original: string): Promise<string[]> {
  try {
    const raw = await completeChat([
      { role: "system", content: "你是一个搜索查询扩展引擎。根据用户的学习问题，生成3-5个相关的搜索查询（每个不超过20个词），用不同的角度和关键词组合。输出JSON数组，如[\"query1\",\"query2\"]。" },
      { role: "user", content: `生成搜索查询扩展：${original}` },
    ], { temperature: 0.3, maxTokens: 300 });
    const json = raw.match(/\[[\s\S]*\]/)?.[0];
    if (json) {
      const arr = JSON.parse(json) as string[];
      return [original, ...arr.filter(q => q !== original)].slice(0, 8);
    }
  } catch { /* fall through */ }
  return [original]; // Fallback: just the original query
}

/** Score source relevance to the query (0-1) */
function scoreRelevance(source: RawSearchResult, query: string): number {
  const qTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  const text = (source.title + " " + source.snippet).toLowerCase();
  const matchCount = qTerms.filter(t => text.includes(t)).length;
  return qTerms.length > 0 ? Math.min(1, matchCount / qTerms.length) : 0.5;
}

/** Score source reliability based on platform (0-1) */
function scoreReliability(platform: ResearchSource["platform"]): number {
  const scores: Record<ResearchSource["platform"], number> = {
    academic: 0.95,
    official: 0.9,
    github: 0.75,
    local: 0.7,
    web: 0.5,
    zhihu: 0.4,
    youtube: 0.5,
  };
  return scores[platform] ?? 0.5;
}

/** Deduplicate sources by URL similarity */
function deduplicate(sources: RawSearchResult[]): RawSearchResult[] {
  const seen = new Set<string>();
  return sources.filter(s => {
    const key = s.url || s.title.slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Generate AI summary for a source */
async function summarizeSource(source: RawSearchResult, query: string): Promise<string> {
  if (!source.snippet || source.snippet.length < 30) return source.snippet;
  try {
    const raw = await completeChat([
      { role: "system", content: "用1-2句中文总结以下搜索结果的要点，包含关键信息。最多50字。" },
      { role: "user", content: `查询: ${query}\n标题: ${source.title}\n内容: ${source.snippet.slice(0, 500)}` },
    ], { temperature: 0.2, maxTokens: 120 });
    return raw.trim();
  } catch {
    return source.snippet.slice(0, 100);
  }
}

/** Extract formal citations from source */
function extractCitation(source: ResearchSource): string {
  const date = new Date().toLocaleDateString("zh-CN");
  switch (source.platform) {
    case "academic":
      return `${source.title}. arXiv. Retrieved ${date} from ${source.url}`;
    case "github":
      return `${source.title}. GitHub Repository. Retrieved ${date} from ${source.url}`;
    case "youtube":
      return `${source.title}. YouTube. Retrieved ${date} from ${source.url}`;
    default:
      return `${source.title}. Retrieved ${date} from ${source.url}`;
  }
}

/** Synthesize all sources into a combined context for AI */
async function synthesizeContext(
  query: string,
  sources: ResearchSource[]
): Promise<string> {
  if (sources.length === 0) return "";

  const sourceText = sources
    .slice(0, 10)
    .map((s, i) =>
      `[${i + 1}] ${s.title} (${s.platform}, 可信度:${Math.round(s.reliabilityScore * 100)}%)\n${s.summary}`
    )
    .join("\n\n");

  try {
    const raw = await completeChat([
      {
        role: "system",
        content: "你是研究整合引擎。基于提供的搜索结果，为后续AI生成整合一个全面的、结构化的知识上下文。包含：关键概念、不同观点、数据点、争议。中文输出，300-600字。",
      },
      {
        role: "user",
        content: `主题: ${query}\n\n搜索资料:\n${sourceText}\n\n请整合为结构化的研究上下文。`,
      },
    ], { temperature: 0.3, maxTokens: 1000 });
    return raw.trim();
  } catch {
    return sourceText;
  }
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export async function executeResearch(
  query: string,
  options: ResearchOptions = {}
): Promise<ResearchResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  let fallbackUsed = false;

  const {
    maxSources = 10,
    minReliability = 0.3,
    timeoutMs = 8000,
    includeLocalFiles = false,
    localFileContents,
    providers: enabledProviders,
  } = options;

  // Step 1: Query expansion
  let expanded: string[];
  try {
    expanded = await expandQuery(query);
  } catch {
    expanded = [query];
    warnings.push("查询扩展失败，使用原始查询");
  }

  // Step 2: Multi-provider search
  let allRaw: RawSearchResult[] = [];
  const activeProviders = providers.filter(p =>
    !enabledProviders || enabledProviders.includes(p.type)
  );

  // Add local file provider if requested
  const localProvider = includeLocalFiles ? getLocalProvider(localFileContents) : null;
  const allProviders = localProvider
    ? [...activeProviders, localProvider]
    : activeProviders;

  // Search with each query expansion across all providers
  const searchQueries = expanded.slice(0, 3); // Limit to 3 queries to keep it fast

  const searchPromises = searchQueries.flatMap(q =>
    allProviders.map(async (provider) => {
      try {
        const results = await provider.search(q, { timeoutMs });
        return { provider: provider.name, results };
      } catch {
        warnings.push(`${provider.name} 搜索失败`);
        return { provider: provider.name, results: [] };
      }
    })
  );

  const searchOutcomes = await Promise.all(searchPromises);
  for (const outcome of searchOutcomes) {
    allRaw.push(...outcome.results);
  }

  // Step 3: Deduplicate
  allRaw = deduplicate(allRaw);

  if (allRaw.length === 0) {
    fallbackUsed = true;
    warnings.push("所有搜索提供商返回空结果，使用 AI 知识作为后备");
  }

  // Step 4: Score relevance & reliability
  let scored = allRaw.map(r => ({
    ...r,
    relevanceScore: scoreRelevance(r, query),
    reliabilityScore: scoreReliability(r.platform),
  }));

  // Step 5: Filter by minimum reliability
  scored = scored.filter(s => s.reliabilityScore >= minReliability);

  // Step 6: Sort by combined score
  scored.sort((a, b) => {
    const aScore = a.relevanceScore * 0.6 + a.reliabilityScore * 0.4;
    const bScore = b.relevanceScore * 0.6 + b.reliabilityScore * 0.4;
    return bScore - aScore;
  });

  // Step 7: Limit sources
  scored = scored.slice(0, maxSources);

  // Step 8: Generate summaries for top sources
  const sources: ResearchSource[] = await Promise.all(
    scored.map(async (r, i) => {
      const summary = await summarizeSource(r, query);
      const source: ResearchSource = {
        id: `src-${i}-${Date.now()}`,
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        platform: r.platform,
        relevanceScore: r.relevanceScore,
        reliabilityScore: r.reliabilityScore,
        summary,
        citations: [],
        fetchedAt: new Date().toISOString(),
      };
      source.citations = [extractCitation(source)];
      return source;
    })
  );

  // Step 9: Synthesize context
  let synthesizedContext = "";
  if (sources.length > 0) {
    synthesizedContext = await synthesizeContext(query, sources);
  }

  // Step 10: Reference list
  const referenceList = sources.map(s => s.citations[0] ?? s.title);

  const elapsedMs = Date.now() - startTime;

  return {
    id: researchId(),
    query: { original: query, expanded },
    sources,
    synthesizedContext,
    referenceList,
    fallbackUsed,
    warnings,
    elapsedMs,
  };
}

// ── Quick helpers ───────────────────────────────────────────────

/** Lightweight research — just sources, no synthesis (faster) */
export async function quickResearch(
  query: string,
  maxSources = 5
): Promise<ResearchSource[]> {
  const result = await executeResearch(query, { maxSources, timeoutMs: 5000 });
  return result.sources;
}

/** Research with local file content */
export async function researchWithFiles(
  query: string,
  files: Array<{ name: string; text: string }>,
  options?: ResearchOptions
): Promise<ResearchResult> {
  return executeResearch(query, {
    ...options,
    includeLocalFiles: true,
    localFileContents: files,
  });
}

/** Check which providers are configured */
export function getProviderStatus(): Record<ProviderType, { available: boolean; message: string }> {
  return {
    web: { available: true, message: "DuckDuckGo — 免费，无需 API Key" },
    academic: { available: true, message: "arXiv — 免费，无需 API Key" },
    github: {
      available: !!process.env.GITHUB_TOKEN,
      message: process.env.GITHUB_TOKEN ? "已配置 GITHUB_TOKEN" : "未配置 GITHUB_TOKEN，请求频率受限(60 req/h)。设置后 5000 req/h。",
    },
    youtube: {
      available: true,
      message: "Bilibili API + 抖音搜索 — 免费中文学习视频，无需 API Key",
    },
    official: {
      available: true,
      message: "Open Library + Project Gutenberg — 免费书籍/教材搜索，无需 API Key",
    },
    local: { available: true, message: "本地文件搜索 — 需用户上传文件" },
  };
}
