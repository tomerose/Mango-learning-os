// ═══════════════════════════════════════════════════════════════
// Content Quality Engine v2 — Production-grade output validation
// Every long-form output passes through quality gates before delivery.
//
// Checks: feature relevance, source grounding, structure,
//   completeness, anti-generic, formatting, actionability
// ═══════════════════════════════════════════════════════════════

export interface QualityGate {
  name: string;
  passed: boolean;
  score: number;            // 0-100
  details: string[];
  suggestions: string[];
}

export interface QualityReport {
  passed: boolean;          // All critical gates passed?
  overallScore: number;     // 0-100
  gates: QualityGate[];
  needsRegeneration: boolean;
  regenerated: boolean;
  regeneratedAt?: string;
}

export type ContentType = "exam-review" | "tutor-explanation" | "mind-garden" |
  "knowledge-note" | "career-roadmap" | "research-report" | "flashcard-deck" |
  "study-plan";

interface GateDefinition {
  name: string;
  critical: boolean; // Must pass for overall pass
  minScore: number;  // Minimum score to pass (0-100)
  checkFn: (content: string, metadata?: Record<string, unknown>) => { score: number; details: string[]; suggestions: string[] };
}

// ═══════════════════════════════════════════════════════════════
// Gate Definitions
// ═══════════════════════════════════════════════════════════════

const FEATURE_PATTERNS: Record<ContentType, string[]> = {
  "exam-review": ["考试", "讲义", "复习", "知识点", "例题", "答案", "考纲", "学习计划"],
  "tutor-explanation": ["概念", "定义", "例子", "步骤", "易错", "练习"],
  "mind-garden": ["情绪", "感受", "心情", "放松", "呼吸", "反思", "安全", "隐私"],
  "knowledge-note": ["核心概念", "要点", "例子", "标签", "总结"],
  "career-roadmap": ["技能", "路径", "就业", "薪资", "学习", "项目", "面试"],
  "research-report": ["背景", "方法", "发现", "结论", "参考", "来源"],
  "flashcard-deck": ["问", "答", "概念", "记忆"],
  "study-plan": ["目标", "时间", "阶段", "任务", "检查点"],
};

const GENERIC_PATTERNS = [
  "作为一个人工智能",
  "作为AI",
  "作为一个AI助手",
  "希望这些",
  "希望以上",
  "请注意",
  "需要注意的是",
  "值得注意的是",
  "当然可以",
  "很高兴",
  "乐意为您",
  "here are some",
  "let me know if you need",
];

const STRUCTURE_CHECKS: Record<ContentType, string[]> = {
  "exam-review": ["# ", "## ", "考试", "知识点", "复习计划", "例题"],
  "tutor-explanation": ["概念", "定义", "例子", "步骤"],
  "mind-garden": ["感受", "情绪", "建议", "安全"],
  "knowledge-note": ["#", "概念", "要点"],
  "career-roadmap": ["技能", "路径", "阶段"],
  "research-report": ["背景", "方法", "结论"],
  "flashcard-deck": ["问", "答"],
  "study-plan": ["阶段", "任务", "时间"],
};

// ── Individual gate check functions ──────────────────────────

function checkFeatureRelevance(
  content: string, contentType: ContentType
): { score: number; details: string[]; suggestions: string[] } {
  const patterns = FEATURE_PATTERNS[contentType] ?? [];
  if (patterns.length === 0) return { score: 100, details: ["无相关性模式定义"], suggestions: [] };

  const hits = patterns.filter(p => content.includes(p));
  const score = Math.round((hits.length / patterns.length) * 100);
  const details = [`匹配特征词: ${hits.length}/${patterns.length} (${hits.slice(0, 5).join(", ")})`];
  const suggestions: string[] = [];

  if (score < 50) {
    suggestions.push(`内容与"${contentType}"特征不匹配。应包含: ${patterns.join(", ")}`);
  }
  return { score, details, suggestions };
}

function checkSourceGrounding(
  content: string, metadata?: Record<string, unknown>
): { score: number; details: string[]; suggestions: string[] } {
  const hasSources = (metadata?.sourceCount as number) ?? 0 > 0;
  const hasCitations = /\[(\d+)\]|参考|来源|References|引用|出处/i.test(content);
  const hasUrls = /https?:\/\/\S+/.test(content);

  let score = 0;
  const details: string[] = [];
  const suggestions: string[] = [];

  if (hasSources) { score += 40; details.push("使用了外部数据源"); }
  else { suggestions.push("无外部数据源 — 内容可能缺乏事实支撑"); }

  if (hasCitations) { score += 30; details.push("包含引用标注"); }
  else { suggestions.push("缺少引用标注 — 添加 [1], [2] 或参考链接"); }

  if (hasUrls) { score += 30; details.push("包含具体URL"); }
  else { suggestions.push("缺少具体资源链接"); }

  return { score, details, suggestions };
}

function checkStructure(
  content: string, contentType: ContentType
): { score: number; details: string[]; suggestions: string[] } {
  const required = STRUCTURE_CHECKS[contentType] ?? ["#"];
  const hits = required.filter(p => content.includes(p));
  const score = Math.round((hits.length / required.length) * 100);
  const details = [`结构元素: ${hits.length}/${required.length} (${hits.join(", ")})`];
  const suggestions: string[] = [];

  if (score < 60) {
    suggestions.push(`结构不完整。需要: ${required.filter(r => !hits.includes(r)).join(", ")}`);
  }
  return { score, details, suggestions };
}

function checkCompleteness(
  content: string, _contentType: ContentType
): { score: number; details: string[]; suggestions: string[] } {
  const wordCount = content.length;
  const hasHeaders = (content.match(/^#/gm) ?? []).length;
  const hasBulletPoints = (content.match(/^[-*]\s/gm) ?? []).length;
  const paragraphCount = content.split(/\n\n+/).length;

  let score = 0;
  const details: string[] = [];
  const suggestions: string[] = [];

  if (wordCount > 500) { score += 30; details.push(`长度充足: ${wordCount}字符`); }
  else { suggestions.push(`内容过短(${wordCount}字符)，建议至少500字符`); }

  if (hasHeaders >= 3) { score += 25; details.push(`标题数量: ${hasHeaders}`); }
  else { suggestions.push(`标题太少(${hasHeaders})，建议至少3个层级标题`); }

  if (hasBulletPoints >= 3) { score += 20; details.push(`列表项: ${hasBulletPoints}`); }
  else { suggestions.push("缺少列表或要点格式"); }

  if (paragraphCount >= 5) { score += 25; details.push(`段落数: ${paragraphCount}`); }
  else { suggestions.push("段落太少，建议分段内容"); }

  return { score, details, suggestions };
}

function checkAntiGeneric(
  content: string
): { score: number; details: string[]; suggestions: string[] } {
  const hits = GENERIC_PATTERNS.filter(p =>
    content.toLowerCase().includes(p.toLowerCase())
  );
  // More hits = worse. Score starts at 100, deduct for each hit.
  const score = Math.max(0, 100 - hits.length * 25);
  const details = hits.length === 0
    ? ["未检测到AI套话"]
    : [`检测到 ${hits.length} 处AI套话: ${hits.join(", ")}`];
  const suggestions: string[] = [];

  if (hits.length > 0) {
    suggestions.push(`移除AI套话。替换为具体的、有信息量的表述。`);
  }
  return { score, details, suggestions };
}

function checkFormatting(
  content: string
): { score: number; details: string[]; suggestions: string[] } {
  let score = 0;
  const details: string[] = [];
  const suggestions: string[] = [];

  const hasMarkdown = /[#*>`|$]/.test(content) || content.includes("```");
  if (hasMarkdown) { score += 30; details.push("使用了Markdown格式"); }
  else { suggestions.push("建议使用Markdown格式化(标题/列表/代码块)"); }

  const hasTables = content.includes("|");
  if (hasTables) { score += 15; details.push("包含表格"); }

  const hasCodeBlocks = content.includes("```");
  if (hasCodeBlocks) { score += 15; details.push("包含代码块"); }

  const isReadable = content.split("\n").every(l => l.length < 300);
  if (isReadable) { score += 20; details.push("行长度合理"); }
  else { suggestions.push("部分行过长(>300字符)，请分段"); }

  const hasSections = /^#{1,3}\s/m.test(content);
  if (hasSections) { score += 20; details.push("有层级标题"); }
  else { suggestions.push("缺少层级标题"); }

  return { score, details, suggestions };
}

function checkActionability(
  content: string
): { score: number; details: string[]; suggestions: string[] } {
  let score = 0;
  const details: string[] = [];
  const suggestions: string[] = [];

  const hasNextSteps = /下一步|接下来|行动计划|练习|任务|检查清单/i.test(content);
  if (hasNextSteps) { score += 40; details.push("包含下一步行动"); }
  else { suggestions.push("缺少可操作的下一步"); }

  const hasChecklist = /\[ \]|TODO|待办|检查/.test(content);
  if (hasChecklist) { score += 30; details.push("包含检查清单"); }
  else { suggestions.push("建议添加检查清单"); }

  const hasPractice = /练习|题目|习题|测验/i.test(content);
  if (hasPractice) { score += 30; details.push("包含练习内容"); }

  return { score, details, suggestions };
}

// ═══════════════════════════════════════════════════════════════
// Gate Registry
// ═══════════════════════════════════════════════════════════════

function getGates(contentType: ContentType): GateDefinition[] {
  return [
    {
      name: "特征相关性",
      critical: true,
      minScore: 50,
      checkFn: (c, m) => checkFeatureRelevance(c, contentType),
    },
    {
      name: "信息来源",
      critical: false,
      minScore: 30,
      checkFn: (c, m) => checkSourceGrounding(c, m),
    },
    {
      name: "结构完整性",
      critical: true,
      minScore: 40,
      checkFn: (c) => checkStructure(c, contentType),
    },
    {
      name: "内容充实度",
      critical: false,
      minScore: 50,
      checkFn: (c) => checkCompleteness(c, contentType),
    },
    {
      name: "反套话检查",
      critical: true,
      minScore: 75,
      checkFn: (c) => checkAntiGeneric(c),
    },
    {
      name: "格式规范",
      critical: false,
      minScore: 40,
      checkFn: (c) => checkFormatting(c),
    },
    {
      name: "可操作性",
      critical: false,
      minScore: 30,
      checkFn: (c) => checkActionability(c),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export function validateContent(
  content: string,
  contentType: ContentType,
  metadata?: Record<string, unknown>
): QualityReport {
  const gates = getGates(contentType);
  const results: QualityGate[] = [];
  let totalScore = 0;

  for (const gate of gates) {
    const { score, details, suggestions } = gate.checkFn(content, metadata);
    const passed = score >= gate.minScore;
    results.push({
      name: gate.name,
      passed,
      score,
      details,
      suggestions,
    });
    totalScore += score;
  }

  const overallScore = Math.round(totalScore / results.length);
  const criticalPassed = gates
    .filter(g => g.critical)
    .every((_, i) => results[i]?.passed ?? true);

  return {
    passed: criticalPassed,
    overallScore,
    gates: results,
    needsRegeneration: !criticalPassed || overallScore < 50,
    regenerated: false,
  };
}

/** Generate a regeneration prompt based on quality feedback */
export function buildRegenerationPrompt(
  originalPrompt: string,
  previousOutput: string,
  report: QualityReport
): string {
  const failedGates = report.gates.filter(g => !g.passed);
  const allSuggestions = failedGates.flatMap(g => g.suggestions);

  return `之前的输出未通过质量检查。请重新生成。

失败的质量门:
${failedGates.map(g => `- ${g.name} (${g.score}分): ${g.suggestions.join("; ")}`).join("\n")}

改进要求:
${allSuggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

原始需求: ${originalPrompt}

请重新生成高质量、结构化、具体的内容。避免AI套话。`;
}

/** Lightweight inline check — just score, no full report */
export function quickCheck(content: string, contentType: ContentType): number {
  const report = validateContent(content, contentType);
  return report.overallScore;
}

/** Generate a quality badge for display */
export function qualityBadge(report: QualityReport): {
  label: string;
  color: string;
  textColor: string;
} {
  if (report.overallScore >= 85) return { label: "✓ 优质", color: "#ecfdf5", textColor: "#059669" };
  if (report.overallScore >= 70) return { label: "✓ 合格", color: "#eff6ff", textColor: "#2563eb" };
  if (report.overallScore >= 50) return { label: "⚠ 需改进", color: "#fffbeb", textColor: "#d97706" };
  return { label: "✗ 不合格", color: "#fef2f2", textColor: "#dc2626" };
}
