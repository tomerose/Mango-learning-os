/**
 * MangoOS V14.5 — Research-first Pro Agent Pipeline
 *
 * Pro Agent flow:
 * intent → query generation → search → source filtering
 * → evidence map → structured outline → outcome generation → quality gate
 *
 * Standard users keep lightweight generation. Pro users MUST go through research.
 */
import type { PlanTier } from "@/lib/plan/types";

// ── Types ──────────────────────────────────────────────────────

export interface ResearchQuery {
  query: string;
  language: "zh" | "en";
  domain: string;        // "学术" | "技术" | "金融" | "通用" etc.
  priority: "high" | "medium" | "low";
}

export interface RankedSource {
  id: string;
  title: string;
  url: string;
  platform: string;
  snippet: string;
  relevanceScore: number;    // 0-1
  credibilityScore: number;  // 0-1
  timelinessScore: number;   // 0-1
  infoDensityScore: number;  // 0-1
  compositeScore: number;    // weighted average
  usedInSections: string[];
}

export interface EvidenceItem {
  id: string;
  concept: string;
  type: "definition" | "data" | "case" | "method" | "quote" | "example" | "framework";
  content: string;
  sourceIds: string[];
  confidence: "high" | "medium" | "low";
}

export interface OutcomeStructure {
  userGoal: string;
  evidenceBasis: string;
  coreFramework: string;
  sections: OutcomeSection[];
}

export interface OutcomeSection {
  title: string;
  content: string;
  evidenceRefs: string[];
  importance: "critical" | "high" | "medium";
}

export interface ProPipelineResult {
  intent: string;
  taskType: string;
  queries: ResearchQuery[];
  sources: RankedSource[];
  evidenceMap: EvidenceItem[];
  structure: OutcomeStructure;
  finalContent: string;
  qualityPassed: boolean;
  qualityScore: number;
  networkAvailable: boolean;
  stages: PipelineStageStatus[];
}

export interface PipelineStageStatus {
  name: string;
  label: string;
  status: "pending" | "running" | "done" | "failed" | "skipped";
  detail: string;
  startedAt?: string;
  completedAt?: string;
}

// ── Query Generation ───────────────────────────────────────────

export function generateResearchQueries(intent: string, taskType: string): ResearchQuery[] {
  const queries: ResearchQuery[] = [];
  const lower = intent.toLowerCase();

  // Extract key concepts from intent
  const concepts = intent
    .split(/[，,。\.、\s]+/)
    .filter(w => w.length >= 2)
    .filter(w => !["帮我", "生成", "一个", "一份", "一下", "这个", "那个", "什么", "怎么", "如何", "请", "的", "了", "是"].includes(w));

  // Generic概念 → search queries
  const uniqueConcepts = [...new Set(concepts)].slice(0, 5);

  // Build query patterns based on task type
  const patterns: Record<string, string[]> = {
    exam_review: ["知识点总结", "考试重点", "典型例题", "复习大纲", "常见错误"],
    study_pack: ["学习资料", "核心概念", "练习题", "参考书目", "知识框架"],
    document_reading: ["论文摘要", "关键发现", "方法论", "参考文献", "批评分析"],
    mistake_training: ["常见错误", "解题技巧", "知识点巩固", "错题分析"],
    english_speaking: ["口语话题", "高分词汇", "模板回答", "练习方法"],
    presentation: ["演讲结构", "论点支撑", "视觉设计", "案例研究"],
    concept_explanation: ["概念定义", "实际应用", "相关概念", "历史背景"],
    knowledge_forest: ["知识体系", "学习路径", "前置知识", "进阶方向"],
    notes_organize: ["笔记方法", "知识分类", "总结技巧", "思维导图"],
    general: ["核心概念", "最新发展", "实践应用", "学习资源"],
  };

  const pattern = patterns[taskType] ?? patterns.general;

  // CN queries
  for (const concept of uniqueConcepts.slice(0, 3)) {
    for (const p of pattern.slice(0, 2)) {
      queries.push({
        query: `${concept} ${p}`,
        language: "zh",
        domain: "通用",
        priority: "high",
      });
    }
  }

  // EN queries for academic/technical topics
  if (/AI|金融|经济|计算机|数学|物理|化学|生物|论文|paper|research/i.test(intent)) {
    for (const concept of uniqueConcepts.slice(0, 2)) {
      queries.push({
        query: `${concept} study guide key concepts`,
        language: "en",
        domain: "学术",
        priority: "medium",
      });
    }
  }

  // Ensure at least 3 queries
  if (queries.length < 3) {
    queries.push(
      { query: intent.slice(0, 80), language: "zh", domain: "通用", priority: "high" },
      { query: `${uniqueConcepts[0] ?? intent.slice(0, 40)} 学习方法`, language: "zh", domain: "通用", priority: "medium" },
      { query: `${uniqueConcepts[0] ?? intent.slice(0, 40)} tutorial guide`, language: "en", domain: "通用", priority: "low" },
    );
  }

  return queries.slice(0, 8);
}

// ── Source Ranking ─────────────────────────────────────────────

export function rankSources(
  sources: Omit<RankedSource, "relevanceScore" | "credibilityScore" | "timelinessScore" | "infoDensityScore" | "compositeScore" | "usedInSections">[],
  intent: string,
): RankedSource[] {
  const intentWords = new Set(intent.toLowerCase().split(/[\s，,。\.、]+/));

  return sources.map(s => {
    // Relevance: how many intent words appear in title+snippet
    const text = (s.title + " " + s.snippet).toLowerCase();
    const matchCount = [...intentWords].filter(w => w.length >= 2 && text.includes(w)).length;
    const relevanceScore = Math.min(1, matchCount / Math.max(1, intentWords.size) * 1.5);

    // Credibility: platform-based
    const credibilityMap: Record<string, number> = {
      wikipedia: 0.85, duckduckgo: 0.6, dictionary: 0.9,
      openlibrary: 0.8, github: 0.75, arxiv: 0.9,
      "user-upload": 0.5, "ai-generated": 0.3,
    };
    const credibilityScore = credibilityMap[s.platform] ?? 0.5;

    // Timeliness: default (would need date parsing for real implementation)
    const timelinessScore = 0.7;

    // Info density: snippet length / 500
    const infoDensityScore = Math.min(1, s.snippet.length / 500);

    // Composite (weighted)
    const compositeScore = Math.round(
      (relevanceScore * 0.4 + credibilityScore * 0.3 + timelinessScore * 0.15 + infoDensityScore * 0.15) * 100
    );

    return {
      ...s,
      relevanceScore: Math.round(relevanceScore * 100),
      credibilityScore: Math.round(credibilityScore * 100),
      timelinessScore: Math.round(timelinessScore * 100),
      infoDensityScore: Math.round(infoDensityScore * 100),
      compositeScore,
      usedInSections: [],
    };
  }).filter(s => s.compositeScore >= 30) // Drop low-quality
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 10);
}

// ── Evidence Map Builder ────────────────────────────────────────

export function buildEvidenceMap(sources: RankedSource[], intent: string): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];
  let id = 0;

  for (const source of sources) {
    const snippet = source.snippet;

    // Extract definitions (pattern: "X 是/指/即 Y" or "X is/refers to Y")
    const defMatch = snippet.match(/([一-龥\w]+)[是为即指]|(?:is|refers to|means)\s+/g);
    if (defMatch) {
      evidence.push({
        id: `ev_${id++}`,
        concept: source.title.slice(0, 60),
        type: "definition",
        content: snippet.slice(0, 300),
        sourceIds: [source.id],
        confidence: source.credibilityScore > 70 ? "high" : "medium",
      });
    }

    // Extract data/numbers
    if (/\d+[%％]|\d+\.\d+|[0-9]+[万亿千百]/.test(snippet)) {
      evidence.push({
        id: `ev_${id++}`,
        concept: `数据点: ${source.title.slice(0, 40)}`,
        type: "data",
        content: snippet.slice(0, 200),
        sourceIds: [source.id],
        confidence: source.credibilityScore > 60 ? "high" : "medium",
      });
    }

    // Extract key concepts (noun phrases)
    const keyPhrases = snippet.match(/[一-龥]{2,6}(?:法|论|理|学|式|律|则|器|机|制|度|性|化|体|系|型|模|态)/g);
    if (keyPhrases) {
      for (const phrase of [...new Set(keyPhrases)].slice(0, 3)) {
        evidence.push({
          id: `ev_${id++}`,
          concept: phrase,
          type: "concept" as any,
          content: snippet.slice(0, 200),
          sourceIds: [source.id],
          confidence: "medium",
        });
      }
    }

    if (evidence.length >= 30) break;
  }

  // Deduplicate by concept
  const seen = new Set<string>();
  return evidence.filter(e => {
    const key = e.concept.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 20);
}

// ── Outcome Compiler ───────────────────────────────────────────

export function compileOutcomeStructure(
  intent: string,
  taskType: string,
  evidence: EvidenceItem[],
  sources: RankedSource[],
): OutcomeStructure {
  const highConfidenceEvidence = evidence.filter(e => e.confidence === "high");
  const sourceCount = sources.length;

  const sectionTemplates: Record<string, Omit<OutcomeSection, "evidenceRefs">[]> = {
    exam_review: [
      { title: "📋 考试范围与知识框架", content: "", importance: "critical" },
      { title: "🎯 重点考点分析", content: "", importance: "critical" },
      { title: "📝 典型例题精讲", content: "", importance: "critical" },
      { title: "📐 公式/定理速查", content: "", importance: "high" },
      { title: "⚠️ 常见错误与避坑", content: "", importance: "high" },
      { title: "📅 复习冲刺计划", content: "", importance: "high" },
    ],
    study_pack: [
      { title: "📋 学习目标与范围", content: "", importance: "critical" },
      { title: "🧠 知识框架", content: "", importance: "critical" },
      { title: "📖 核心概念与讲义", content: "", importance: "critical" },
      { title: "✏️ 配套练习", content: "", importance: "high" },
      { title: "📊 总结与复盘", content: "", importance: "high" },
      { title: "📚 推荐资料", content: "", importance: "medium" },
    ],
    general: [
      { title: "📋 任务概览", content: "", importance: "critical" },
      { title: "📖 核心内容", content: "", importance: "critical" },
      { title: "💡 关键洞察", content: "", importance: "high" },
      { title: "✏️ 行动建议", content: "", importance: "high" },
    ],
  };

  const template = sectionTemplates[taskType] ?? sectionTemplates.general;
  const sections: OutcomeSection[] = template.map(s => ({
    ...s,
    evidenceRefs: highConfidenceEvidence.slice(0, 5).map(e => e.id),
  }));

  return {
    userGoal: intent.slice(0, 200),
    evidenceBasis: `基于 ${sourceCount} 条来源、${evidence.length} 条证据构建`,
    coreFramework: `${sections.length} 个章节，覆盖关键知识点与行动建议`,
    sections,
  };
}

// ── Pro Content Quality Gate ───────────────────────────────────

export interface ProQualityGateResult {
  passed: boolean;
  score: number;
  checks: { name: string; passed: boolean; detail: string }[];
}

export function proContentQualityGate(
  result: ProPipelineResult,
): ProQualityGateResult {
  const checks = [
    {
      name: "联网检索完成",
      passed: result.sources.length >= 5,
      detail: result.networkAvailable
        ? `已检索 ${result.sources.length} 条来源（需要 ≥ 5）`
        : "当前网络检索工具不可用，已使用离线知识库",
    },
    {
      name: "资料来源充足",
      passed: result.sources.filter(s => s.credibilityScore >= 50).length >= 3,
      detail: `${result.sources.filter(s => s.credibilityScore >= 50).length} 条高可信来源`,
    },
    {
      name: "资料筛选完成",
      passed: result.sources.every(s => s.compositeScore >= 30),
      detail: "低质量来源已过滤",
    },
    {
      name: "证据映射生成",
      passed: result.evidenceMap.length >= 5,
      detail: `${result.evidenceMap.length} 条结构化证据`,
    },
    {
      name: "结构化内容",
      passed: result.structure.sections.length >= 3,
      detail: `${result.structure.sections.length} 个章节`,
    },
    {
      name: "内容可用性",
      passed: result.finalContent.length >= 2000,
      detail: `${result.finalContent.length} 字符`,
    },
    {
      name: "避免空话",
      passed: !/根据网络资料|众所周知|不言而喻|显然|显而易见|值得注意/.test(result.finalContent.slice(0, 500)),
      detail: "未检测到模板化空话",
    },
    {
      name: "包含行动步骤",
      passed: /练习|任务|步骤|行动|下一步|建议|计划/.test(result.finalContent),
      detail: "检测到可执行内容",
    },
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    passed: score >= 75,
    score,
    checks,
  };
}
