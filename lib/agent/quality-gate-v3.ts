/**
 * MangoOS V14.8 — Quality Gate v4 Hard Gate
 * Tier-based scoring with Pro/Admin 90-point enforcement.
 * Pro/Admin below threshold → auto-deepen (max 2 rounds).
 * Still below → "Needs Review" + Admin queue flag.
 */
import type { PlanTier } from "@/lib/plan/types";

export interface QualityDimension {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  passed: boolean;
  threshold: number;
  suggestion?: string;
}

export interface QualityResultV3 {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: "excellent" | "passed" | "partial" | "failed";
  passed: boolean;
  thresholdRequired: number;
  dimensions: QualityDimension[];
  improvementHints: string[];
  willAutoDeepen: boolean;
  deepenRound: number;
  tier: PlanTier;
  /** V14.8: Specific required fixes per failed dimension */
  requiredFixes: string[];
  /** V14.8: Flag for Admin Review queue if Pro/Admin still below threshold after deepening */
  needsAdminReview: boolean;
  /** V14.8: Citation count detected in output */
  citationCount: number;
  /** V14.8: Source count used */
  sourceCount: number;
}

// ═══ Tier-based thresholds ═══════════════════════════════════════
export const TIER_THRESHOLDS: Record<PlanTier, number> = {
  guest: 60,
  standard: 75,
  pro: 90,
  admin: 90,
};

export const TIER_LABELS: Record<PlanTier, string> = {
  guest: "游客演示",
  standard: "Standard 轻量",
  pro: "Pro 成品",
  admin: "Admin 成品",
};

export const MAX_DEEPEN_ROUNDS = 2;

// ═══ Dimension definitions ═══════════════════════════════════════

interface DimDef { key: string; label: string; weight: number; check: (ctx: QualityContext) => { score: number; suggestion?: string }; }

interface QualityContext {
  content: string;
  intent: string;
  sourcesCount: number;
  evidenceCount: number;
  networkAvailable: boolean;
  structureSectionCount: number;
  exportReady: boolean;
  savedToLibrary: boolean;
  tier: PlanTier;
  deepenRound: number;
}

const DIMENSIONS: DimDef[] = [
  {
    key: "inputCoverage", label: "用户需求覆盖度", weight: 12,
    check: (c) => {
      const intentWords = c.intent.split(/[\s，,。\.、]+/).filter(w => w.length >= 2);
      const matchCount = intentWords.filter(w => c.content.includes(w)).length;
      const coverage = intentWords.length > 0 ? matchCount / intentWords.length : 0;
      const score = Math.round(Math.min(12, coverage * 14));
      return { score, suggestion: score < 6 ? "内容未充分响应用户输入" : undefined };
    },
  },
  {
    key: "researchCompletion", label: "联网研究完成度", weight: 14,
    check: (c) => {
      if (!c.networkAvailable) return { score: 0, suggestion: "网络不可用，未执行实时联网研究" };
      if (c.tier === "guest") return { score: 0, suggestion: "游客模式无联网研究" };
      if (c.sourcesCount >= 5) return { score: 14 };
      if (c.sourcesCount >= 3) return { score: 9, suggestion: "来源≥5 更可靠" };
      if (c.sourcesCount >= 1) return { score: 4, suggestion: "来源过少，请至少搜索 2 轮" };
      return { score: 0, suggestion: "未获得任何来源，请检查网络或搜索配置" };
    },
  },
  {
    key: "sourceQuality", label: "来源质量", weight: 10,
    check: (c) => {
      if (c.sourcesCount === 0) return { score: 0, suggestion: "无来源" };
      if (c.sourcesCount >= 5) return { score: 10 };
      if (c.sourcesCount >= 3) return { score: 7 };
      return { score: 3, suggestion: "增加来源可提高可信度" };
    },
  },
  {
    key: "citationDensity", label: "证据引用密度", weight: 10,
    check: (c) => {
      const citationMatches = (c.content.match(/\[[\d]+\]/g) || []).length +
        (c.content.match(/来源[：:]/g) || []).length;
      if (citationMatches >= 5) return { score: 10 };
      if (citationMatches >= 3) return { score: 7 };
      if (citationMatches >= 1) return { score: 3, suggestion: "正文缺少引用标记，建议使用 [1] [2] 标注来源" };
      return { score: 0, suggestion: "正文完全没有引用来源，不给通过" };
    },
  },
  {
    key: "structureCompleteness", label: "结构完整性", weight: 12,
    check: (c) => {
      const hasTitle = /^#\s/.test(c.content);
      const hasSections = (c.content.match(/^##\s/gm) || []).length >= 3;
      const hasSummary = c.content.length > 200;
      const hasExamples = /例题|示例|案例|例[子题]/.test(c.content);
      let score = 0;
      if (hasTitle) score += 3;
      if (hasSections) score += 4;
      if (hasSummary) score += 2;
      if (hasExamples) score += 3;
      return {
        score: Math.min(12, score),
        suggestion: !hasSections ? "缺少结构化章节（## 标题）" : !hasExamples ? "缺少例题或案例" : undefined,
      };
    },
  },
  {
    key: "contentDepth", label: "内容深度", weight: 12,
    check: (c) => {
      const length = c.content.length;
      if (length >= 4000) return { score: 12 };
      if (length >= 2500) return { score: 9 };
      if (length >= 1500) return { score: 6, suggestion: "Pro 成品建议≥4000字符" };
      if (length >= 800) return { score: 3, suggestion: "内容太短，缺乏深度" };
      return { score: 0, suggestion: "内容过于浅薄" };
    },
  },
  {
    key: "actionability", label: "可执行性", weight: 10,
    check: (c) => {
      const hasActions = /练习|任务|步骤|行动|下一步|建议|计划/.test(c.content);
      const hasTimeline = /天|周|第[一二三]/.test(c.content);
      if (hasActions && hasTimeline) return { score: 10 };
      if (hasActions) return { score: 6, suggestion: "缺少时间线/计划" };
      return { score: 2, suggestion: "缺少可执行的行动步骤" };
    },
  },
  {
    key: "exportReadiness", label: "导出可用性", weight: 8,
    check: (c) => {
      if (c.exportReady) return { score: 8 };
      return { score: 0, suggestion: "尚未准备导出" };
    },
  },
  {
    key: "librarySaved", label: "Library 保存状态", weight: 4,
    check: (c) => {
      if (c.savedToLibrary) return { score: 4 };
      return { score: 0, suggestion: "未保存到 Library" };
    },
  },
];

// ═══ Main evaluation ═══════════════════════════════════════════

export function evaluateQualityV3(
  content: string,
  intent: string,
  opts: {
    sourcesCount?: number;
    evidenceCount?: number;
    networkAvailable?: boolean;
    structureSectionCount?: number;
    exportReady?: boolean;
    savedToLibrary?: boolean;
    tier?: PlanTier;
    deepenRound?: number;
  } = {},
): QualityResultV3 {
  const tier = opts.tier ?? "standard";
  const threshold = TIER_THRESHOLDS[tier];
  const maxScore = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);

  const ctx: QualityContext = {
    content,
    intent,
    sourcesCount: opts.sourcesCount ?? 0,
    evidenceCount: opts.evidenceCount ?? 0,
    networkAvailable: opts.networkAvailable ?? true,
    structureSectionCount: opts.structureSectionCount ?? 0,
    exportReady: opts.exportReady ?? false,
    savedToLibrary: opts.savedToLibrary ?? false,
    tier,
    deepenRound: opts.deepenRound ?? 0,
  };

  const dimensions: QualityDimension[] = DIMENSIONS.map(d => {
    const result = d.check(ctx);
    return {
      key: d.key,
      label: d.label,
      score: result.score,
      maxScore: d.weight,
      passed: result.score >= Math.ceil(d.weight * 0.5),
      threshold: Math.ceil(d.weight * 0.5),
      suggestion: result.suggestion,
    };
  });

  const totalScore = dimensions.reduce((s, d) => s + d.score, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const passed = percentage >= threshold;
  const willAutoDeepen = !passed && tier === "pro" || tier === "admin"
    ? (opts.deepenRound ?? 0) < MAX_DEEPEN_ROUNDS
    : false;

  let grade: QualityResultV3["grade"];
  if (percentage >= 90) grade = "excellent";
  else if (percentage >= threshold) grade = "passed";
  else if (percentage >= threshold - 15) grade = "partial";
  else grade = "failed";

  const improvementHints = dimensions
    .filter(d => d.suggestion)
    .map(d => `[${d.label}] ${d.suggestion}`);

  const requiredFixes = dimensions
    .filter(d => !d.passed && d.suggestion)
    .map(d => `[${d.label}] ${d.suggestion}`);

  const citationCount = (content.match(/\[[\d]+\]/g) || []).length +
    (content.match(/来源[：:]/g) || []).length;

  const sourceCount = opts.sourcesCount ?? 0;

  // V14.8: Needs admin review if Pro/Admin still fails after max deepening
  const needsAdminReview = !passed && (tier === "pro" || tier === "admin")
    && (opts.deepenRound ?? 0) >= MAX_DEEPEN_ROUNDS;

  return {
    totalScore, maxScore, percentage, grade, passed, thresholdRequired: threshold,
    dimensions, improvementHints, willAutoDeepen,
    deepenRound: opts.deepenRound ?? 0,
    tier,
    requiredFixes,
    needsAdminReview,
    citationCount,
    sourceCount,
  };
}

/** Build a deepening prompt incorporating failed dimension suggestions */
export function buildDeependPrompt(originalIntent: string, result: QualityResultV3, previousContent: string): string {
  const hints = result.improvementHints.slice(0, 5).join("\n");
  return `以下内容质量评分为 ${result.percentage}/100（${result.tier} 要求 ≥${result.thresholdRequired}），未达标。请根据改进建议重新生成更深度的内容：

## 原始任务
${originalIntent}

## 前次生成
${previousContent.slice(0, 1000)}

## 需要改进的维度
${hints}

## 要求
1. 内容必须≥4000字符
2. 每个关键章节必须引用至少一条来源
3. 必须包含至少 3 个例子/例题
4. 必须包含可执行的时间计划
5. 输出为中文 Markdown 结构化文档

请重新生成完整、深入、可引用的成品。`;
}
