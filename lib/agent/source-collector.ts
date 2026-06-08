/**
 * MangoOS V14.5 — Source Collector
 *
 * Unified search across all available data sources:
 * Web APIs (Wikipedia, DuckDuckGo, Dictionary), and logs availability.
 * Pro Agent uses this for mandatory research. Standard uses it optionally.
 */
import type { ResearchQuery, RankedSource, PipelineStageStatus } from "./research-pipeline";
import { searchSources } from "@/lib/outcome/source-adapter";

export interface CollectorResult {
  sources: Omit<RankedSource, "relevanceScore" | "credibilityScore" | "timelinessScore" | "infoDensityScore" | "compositeScore" | "usedInSections">[];
  stages: PipelineStageStatus[];
  networkAvailable: boolean;
  totalFound: number;
}

export async function collectSources(
  queries: ResearchQuery[],
  isPro: boolean,
): Promise<CollectorResult> {
  const stages: PipelineStageStatus[] = [];
  const allSources: CollectorResult["sources"] = [];
  let networkAvailable = false;

  // Stage: Query generation
  stages.push({
    name: "query_gen", label: "拆解检索方向", status: "done",
    detail: `生成 ${queries.length} 个搜索方向: ${queries.slice(0, 3).map(q => q.query).join("、")}`,
  });

  // Stage: Web search
  stages.push({ name: "search", label: "联网搜索资料", status: "running", detail: "正在搜索..." });

  let searchedCount = 0;
  const maxQueries = isPro ? Math.max(8, queries.length) : Math.min(3, queries.length);
  const maxResults = isPro ? 3 : 2;

  try {
    for (const query of queries.slice(0, maxQueries)) {
      // Skip if already have enough sources
      if (!isPro && allSources.length >= 6) break;
      if (isPro && allSources.length >= 12) break;

      try {
        const result = await searchSources({
          query: query.query,
          maxResults,
          platforms: isPro
            ? ["wikipedia", "duckduckgo", "dictionary"]
            : ["wikipedia", "duckduckgo"],
        });

        searchedCount++;
        if (result.sources.length > 0) networkAvailable = true;

        for (const src of result.sources) {
          allSources.push({
            id: src.id,
            title: src.title,
            url: src.url ?? "",
            platform: src.platform,
            snippet: src.excerpt ?? "",
          } as CollectorResult["sources"][number]);
        }
      } catch {
        // Individual query failed, continue
      }

      // Brief pause between queries (rate limit)
      if (isPro && queries.indexOf(query) < maxQueries - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    stages[1].status = "done";
    stages[1].detail = networkAvailable
      ? `搜索 ${searchedCount}/${maxQueries} 个方向，找到 ${allSources.length} 条来源`
      : "网络检索工具当前不可用，将使用离线知识生成";
  } catch {
    stages[1].status = "failed";
    stages[1].detail = "网络检索失败，将使用离线知识生成";
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = allSources.filter(s => {
    const key = s.url || s.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    sources: deduped,
    stages,
    networkAvailable,
    totalFound: allSources.length,
  };
}
