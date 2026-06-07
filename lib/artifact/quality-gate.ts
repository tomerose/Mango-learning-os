/**
 * MangoOS V14.2 — Artifact Quality Gate
 *
 * Upgraded from V14's simple check (>200 chars, ≥3 sections)
 * to a multi-dimensional scoring system with auto-repair.
 */
import type { Artifact, QualityScore, ArtifactSection } from "./types";

// ── Quality thresholds ────────────────────────────────────────
const MIN_PASS_SCORE = 75;
const MAX_RETRIES = 2;

// Dimension weights (sum = 100)
const WEIGHTS: Record<keyof QualityScore, number> = {
  total: 0,
  completeness: 20,
  structure: 20,
  actionability: 18,
  exampleDensity: 14,
  personalization: 10,
  sourceCredibility: 8,
  languageQuality: 5,
  exportReadiness: 5,
};

// ── Scoring functions ─────────────────────────────────────────

function scoreCompleteness(artifact: Pick<Artifact, "content" | "sections">): number {
  const len = artifact.content.length;
  if (len < 500) return 3;
  if (len < 1200) return 8;
  if (len < 2500) return 13;
  if (len < 5000) return 16;
  return 20;
}

function scoreStructure(artifact: Pick<Artifact, "sections">): number {
  const count = artifact.sections.length;
  if (count < 3) return 5;
  if (count < 5) return 12;
  if (count < 8) return 16;
  return 20;
}

function scoreActionability(artifact: Pick<Artifact, "content" | "sections">): number {
  const text = artifact.content + artifact.sections.map(s => s.content).join(" ");
  let score = 3;
  // Check for action-oriented patterns
  if (/练习|习题|任务|步骤|行动|建议|下一步|作业|训练/.test(text)) score += 5;
  if (/每天|第[一二三四五六七八九\d]+天|Day\s*\d|日程|计划表/.test(text)) score += 4;
  if (/重点|考点|关键|核心|重要/.test(text)) score += 3;
  if (/检查|验证|测试|自测|评估/.test(text)) score += 3;
  return Math.min(18, score);
}

function scoreExampleDensity(artifact: Pick<Artifact, "content" | "sections">): number {
  const text = artifact.content + artifact.sections.map(s => s.content).join(" ");
  let score = 2;
  // Count examples and cases
  const exampleMatches = text.match(/例如|比如|举例|案例|Example|例题|示例/g);
  const exampleCount = exampleMatches ? exampleMatches.length : 0;
  if (exampleCount >= 1) score += 4;
  if (exampleCount >= 3) score += 4;
  if (exampleCount >= 6) score += 4;
  return Math.min(14, score);
}

function scorePersonalization(artifact: Pick<Artifact, "content" | "sections">): number {
  const text = artifact.content + artifact.sections.map(s => s.content).join(" ");
  let score = 2;
  if (/你|你的|针对|根据你的/.test(text)) score += 3;
  if (/UIBE|对外经贸|大学生|本科生|研究生/.test(text)) score += 3;
  if (/金融|经济|AI|英语|数学|计算机/.test(text)) score += 2;
  return Math.min(10, score);
}

function scoreSourceCredibility(artifact: Pick<Artifact, "sources">): number {
  const sources = artifact.sources;
  if (sources.length === 0) return 2;
  let score = 3;
  const reliable = sources.filter(s => s.reliability === "high" || s.reliability === "medium").length;
  score += Math.min(5, reliable * 2);
  return Math.min(8, score);
}

function scoreLanguageQuality(artifact: Pick<Artifact, "content">): number {
  const text = artifact.content;
  let score = 3;
  // Good structure markers
  if (/^#{1,3}\s/m.test(text)) score += 1;
  if (text.includes("|") && text.includes("---")) score += 1; // tables
  return Math.min(5, score);
}

function scoreExportReadiness(artifact: Pick<Artifact, "content" | "sections">): number {
  let score = 2;
  if (artifact.content.length > 500) score += 1;
  if (artifact.sections.length >= 3) score += 1;
  if (artifact.content.includes("#")) score += 1;
  return Math.min(5, score);
}

// ── Main scoring function ─────────────────────────────────────

export function evaluateArtifactQuality(
  artifact: Pick<Artifact, "content" | "sections" | "sources">
): QualityScore {
  const completeness = scoreCompleteness(artifact);
  const structure = scoreStructure(artifact);
  const actionability = scoreActionability(artifact);
  const exampleDensity = scoreExampleDensity(artifact);
  const personalization = scorePersonalization(artifact);
  const sourceCredibility = scoreSourceCredibility(artifact);
  const languageQuality = scoreLanguageQuality(artifact);
  const exportReadiness = scoreExportReadiness(artifact);

  const total =
    completeness * WEIGHTS.completeness / 20 +
    structure * WEIGHTS.structure / 20 +
    actionability * WEIGHTS.actionability / 18 +
    exampleDensity * WEIGHTS.exampleDensity / 14 +
    personalization * WEIGHTS.personalization / 10 +
    sourceCredibility * WEIGHTS.sourceCredibility / 8 +
    languageQuality * WEIGHTS.languageQuality / 5 +
    exportReadiness * WEIGHTS.exportReadiness / 5;

  return {
    total: Math.round(total),
    completeness,
    structure,
    actionability,
    exampleDensity,
    personalization,
    sourceCredibility,
    languageQuality,
    exportReadiness,
  };
}

// ── Gate check ────────────────────────────────────────────────

export interface GateResult {
  passed: boolean;
  score: QualityScore;
  failures: string[];
  retriesUsed: number;
  maxRetries: number;
}

export function qualityGate(artifact: Artifact, retriesUsed: number = 0): GateResult {
  const score = evaluateArtifactQuality(artifact);
  const failures: string[] = [];

  if (score.completeness < 10) failures.push("内容过短 (<1200字符)");
  if (score.structure < 10) failures.push("章节不足 (<5个)");
  if (score.actionability < 10) failures.push("缺少可执行行动/练习");
  if (score.exampleDensity < 7) failures.push("缺少例题/案例");
  if (score.sourceCredibility < 4) failures.push("缺少可靠来源");

  const passed = score.total >= MIN_PASS_SCORE && failures.length <= 1;

  return {
    passed,
    score,
    failures,
    retriesUsed,
    maxRetries: MAX_RETRIES,
  };
}

// ── Fallback artifact generator ───────────────────────────────

export function generateFallbackArtifact(
  title: string,
  type: string,
  prompt: string,
): Pick<Artifact, "title" | "summary" | "content" | "sections"> {
  const sections: ArtifactSection[] = [
    {
      id: "fb_overview",
      title: "📋 学习概览",
      content: `## 学习任务\n\n基于你输入「${prompt.slice(0, 100)}」的离线结构化结果。\n\n由于 AI 服务暂时不可用，以下是基础知识框架，供你参考和学习。`,
      order: 1,
      importance: "critical",
    },
    {
      id: "fb_keypoints",
      title: "🔑 核心知识点",
      content: `## 关键概念\n\n1. 回顾基础知识，建立概念之间的联系\n2. 查找教材或课堂笔记中的对应章节\n3. 尝试用自己的话重新解释每个概念\n\n> 💡 建议：手动整理 3-5 个核心概念，写下定义和一个例子`,
      order: 2,
      importance: "high",
    },
    {
      id: "fb_practice",
      title: "✏️ 练习建议",
      content: `## 练习方向\n\n1. 找到相关习题集，完成 5 道基础题\n2. 尝试总结公式/规律/答题模板\n3. 标注薄弱点，记录错因\n\n> 📌 下次生成时，可以附带更多资料以获得更精准的输出`,
      order: 3,
      importance: "high",
    },
    {
      id: "fb_next",
      title: "📅 下一步行动",
      content: `## 建议行动\n\n- [ ] 整理今天的学习笔记\n- [ ] 完成课后练习 3 题\n- [ ] 标记 2 个不懂的问题\n- [ ] 明天尝试调用 Agent 重新生成\n\n---\n*由 MangoOS 离线引擎生成 · 非 AI 完整输出*`,
      order: 4,
      importance: "medium",
    },
  ];

  return {
    title: title || `学习任务 · ${type}`,
    summary: `AI 服务暂时不可用的备用学习框架。`,
    content: sections.map(s => s.content).join("\n\n---\n\n"),
    sections,
  };
}
