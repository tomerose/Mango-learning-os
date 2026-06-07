/**
 * MangoOS V14.7 — Quality Gate v2
 * Upgraded 8-dimension scoring with clearer thresholds and improvement suggestions.
 */
export interface QualityCheckV2 {
  dimension: string;
  label: string;
  score: number;      // 0-10
  maxScore: number;
  passed: boolean;
  threshold: number;
  suggestion?: string;
}

export interface QualityResultV2 {
  total: number;
  maxTotal: number;
  grade: "excellent" | "passed" | "partial" | "failed";
  checks: QualityCheckV2[];
  improvementHints: string[];
  isPro: boolean;
}

const PRO_THRESHOLDS: Record<string, number> = {
  inputCoverage: 6, fileUsage: 5, sourceEvidence: 6,
  structureCompleteness: 7, actionability: 7,
  specificity: 6, antiFluff: 7, exportReadiness: 7,
};

const STANDARD_THRESHOLDS: Record<string, number> = {
  inputCoverage: 4, fileUsage: 3, sourceEvidence: 3,
  structureCompleteness: 5, actionability: 5,
  specificity: 4, antiFluff: 5, exportReadiness: 5,
};

// ── Scoring functions ───────────────────────────────────────────

function checkInputCoverage(content: string, intent: string): QualityCheckV2 {
  const intentWords = intent.split(/[\s，,。\.、]+/).filter(w => w.length >= 2);
  const matchCount = intentWords.filter(w => content.includes(w)).length;
  const coverage = intentWords.length > 0 ? matchCount / intentWords.length : 0;
  const score = Math.round(Math.min(10, coverage * 12));

  return {
    dimension: "inputCoverage", label: "用户输入覆盖度",
    score, maxScore: 10, threshold: 4,
    passed: score >= 4,
    suggestion: score < 4 ? "内容未充分响应用户输入，请确保覆盖用户提到的核心主题" : undefined,
  };
}

function checkFileUsage(content: string, hasFiles: boolean): QualityCheckV2 {
  if (!hasFiles) return { dimension: "fileUsage", label: "文件内容利用", score: 10, maxScore: 10, threshold: 3, passed: true };
  const score = /上传|文档|文件|资料|原文|根据.*内容|from.*file/i.test(content) ? 7 : 2;
  return {
    dimension: "fileUsage", label: "文件内容利用",
    score, maxScore: 10, threshold: 3,
    passed: score >= 3,
    suggestion: score < 3 ? "生成结果未明显使用上传的文件内容" : undefined,
  };
}

function checkSourceEvidence(content: string, sourceCount: number, isPro: boolean): QualityCheckV2 {
  if (!isPro) return { dimension: "sourceEvidence", label: "来源证据", score: 10, maxScore: 10, threshold: 3, passed: true };
  const hasCitations = /\[来源[：:]|\[Source[：:]|参考资料|参考文献|根据.*研究/.test(content);
  const score = sourceCount >= 3 && hasCitations ? 8 : sourceCount >= 1 ? 5 : 2;
  return {
    dimension: "sourceEvidence", label: "来源证据使用",
    score, maxScore: 10, threshold: 6,
    passed: score >= 6,
    suggestion: score < 6 ? "Pro 生成应包含来源引用，建议开启联网研究模式" : undefined,
  };
}

function checkStructure(content: string): QualityCheckV2 {
  const headingCount = (content.match(/^#{1,3}\s/gm) ?? []).length;
  const hasTable = /\|.*\|/.test(content);
  const hasList = /^[\-*\d]+[.)]\s/gm.test(content);
  const score = Math.min(10, Math.round(headingCount * 1.5 + (hasTable ? 2 : 0) + (hasList ? 1 : 0)));

  return {
    dimension: "structureCompleteness", label: "结构完整性",
    score, maxScore: 10, threshold: 5,
    passed: score >= 5,
    suggestion: score < 5 ? "建议添加更多章节标题、表格或列表来组织内容" : undefined,
  };
}

function checkActionability(content: string): QualityCheckV2 {
  const hasTasks = /[\[【]\s*[xX\s]\s*[\]】]/g.test(content); // checkbox
  const hasSteps = /步骤|行动|任务|练习|下一步|建议|计划|安排/.test(content);
  const hasConcrete = /每天|第[一二三\d]+[天步]|Day\s*\d|分钟|小时|完成|提交/.test(content);
  const score = (hasTasks ? 4 : 0) + (hasSteps ? 3 : 0) + (hasConcrete ? 3 : 0);

  return {
    dimension: "actionability", label: "可执行性",
    score: Math.min(10, score), maxScore: 10, threshold: 5,
    passed: score >= 5,
    suggestion: score < 5 ? "缺少可执行的任务、步骤或行动计划" : undefined,
  };
}

function checkSpecificity(content: string): QualityCheckV2 {
  const genericPhrases = [
    "根据您的需求", "以下是", "好的，", "当然可以", "让我来",
    "需要注意的是", "总的来说", "值得注意", "众所周知",
  ];
  const genericCount = genericPhrases.filter(p => content.includes(p)).length;
  const hasNumbers = (content.match(/\d+/g) ?? []).length > 5;
  const score = Math.max(0, 10 - genericCount * 2 + (hasNumbers ? 2 : 0));

  return {
    dimension: "specificity", label: "内容具体性",
    score: Math.min(10, score), maxScore: 10, threshold: 4,
    passed: score >= 4,
    suggestion: score < 4 ? "内容包含较多通用套话，建议增加具体数据和案例" : undefined,
  };
}

function checkAntiFluff(content: string): QualityCheckV2 {
  const fluffWords = ["显而易见", "不言而喻", "众所周知", "值得注意", "重要的是", "需要强调的是"];
  const fluffCount = fluffWords.filter(w => content.includes(w)).length;
  const score = Math.max(0, 10 - fluffCount * 3);

  return {
    dimension: "antiFluff", label: "反空话检测",
    score: Math.min(10, score), maxScore: 10, threshold: 5,
    passed: score >= 5,
    suggestion: score < 5 ? "检测到较多空话套话，建议精简表达" : undefined,
  };
}

function checkExportReadiness(content: string): QualityCheckV2 {
  const len = content.length;
  const score = len < 500 ? 2 : len < 1500 ? 5 : len < 3000 ? 7 : 10;

  return {
    dimension: "exportReadiness", label: "导出可用性",
    score, maxScore: 10, threshold: 5,
    passed: score >= 5,
    suggestion: score < 5 ? "内容过短，导出后可能不够完整" : undefined,
  };
}

// ── Main function ───────────────────────────────────────────────

export function evaluateQualityV2(
  content: string,
  intent: string,
  options: { hasFiles?: boolean; sourceCount?: number; isPro?: boolean } = {},
): QualityResultV2 {
  const checks: QualityCheckV2[] = [
    checkInputCoverage(content, intent),
    checkFileUsage(content, options.hasFiles ?? false),
    checkSourceEvidence(content, options.sourceCount ?? 0, options.isPro ?? false),
    checkStructure(content),
    checkActionability(content),
    checkSpecificity(content),
    checkAntiFluff(content),
    checkExportReadiness(content),
  ];

  const thresholds = options.isPro ? PRO_THRESHOLDS : STANDARD_THRESHOLDS;

  // Apply per-dimension thresholds
  for (const c of checks) {
    const threshold = thresholds[c.dimension] ?? 5;
    c.threshold = threshold;
    c.passed = c.score >= threshold;
    if (!c.passed && !c.suggestion) {
      c.suggestion = `${c.label}未达标（${c.score}/${c.maxScore}，需要 ${threshold}）`;
    }
  }

  const total = checks.reduce((sum, c) => sum + c.score, 0);
  const maxTotal = checks.reduce((sum, c) => sum + c.maxScore, 0);
  const pct = Math.round((total / maxTotal) * 100);

  const grade = pct >= 85 ? "excellent" : pct >= 75 ? "passed" : pct >= 60 ? "partial" : "failed";

  const improvementHints = checks
    .filter(c => !c.passed && c.suggestion)
    .map(c => c.suggestion!);

  return { total: pct, maxTotal: 100, grade, checks, improvementHints, isPro: options.isPro ?? false };
}
