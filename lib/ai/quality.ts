// Content Quality Engine — validation, scoring, and feedback loop
// Every AI generation goes through this pipeline before returning to user.

export interface QualityCheck {
  passed: boolean;
  score: number; // 0-100
  checks: {
    hasConcept: boolean;
    hasExample: boolean;
    hasSteps: boolean;
    hasExercise: boolean;
    hasAnswer: boolean;
    hasPitfall: boolean;
    hasNextStep: boolean;
    isChinese: boolean;
    hasMarkdown: boolean;
  };
  missingFields: string[];
  suggestions: string[];
}

/** 7 required elements for any learning content */
const REQUIRED_ELEMENTS = [
  { key: "hasConcept", patterns: ["概念", "定义", "什么是", "核心", "本质"] },
  { key: "hasExample", patterns: ["例子", "例如", "案例", "比如", "假设", "场景"] },
  { key: "hasSteps", patterns: ["步骤", "Step", "推导", "流程", "首先", "然后", "最后", "1.", "2.", "3."] },
  { key: "hasExercise", patterns: ["练习", "题目", "习题", "测验", "思考题"] },
  { key: "hasAnswer", patterns: ["答案", "解析", "解答", "参考答案", "解释"] },
  { key: "hasPitfall", patterns: ["易错", "陷阱", "注意", "常见错误", "误区", "不要"] },
  { key: "hasNextStep", patterns: ["下一步", "延伸", "进阶", "推荐", "继续"] },
] as const;

/** Check if text contains at least one pattern from the list */
function containsAny(text: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

/** Check if text is predominantly Chinese */
function isChinese(text: string): boolean {
  const chineseChars = text.match(/[一-鿿]/g);
  if (!chineseChars) return false;
  // Allow mixed CN/EN content, but at least 20% Chinese for Chinese-mode content
  return chineseChars.length > text.length * 0.05;
}

/** Check if text uses Markdown formatting */
function hasMarkdown(text: string): boolean {
  return /[#*>`|$]/.test(text) || text.includes("```") || text.includes("---");
}

export function validateContent(text: string): QualityCheck {
  const checks = {
    hasConcept: containsAny(text, REQUIRED_ELEMENTS[0].patterns),
    hasExample: containsAny(text, REQUIRED_ELEMENTS[1].patterns),
    hasSteps: containsAny(text, REQUIRED_ELEMENTS[2].patterns),
    hasExercise: containsAny(text, REQUIRED_ELEMENTS[3].patterns),
    hasAnswer: containsAny(text, REQUIRED_ELEMENTS[4].patterns),
    hasPitfall: containsAny(text, REQUIRED_ELEMENTS[5].patterns),
    hasNextStep: containsAny(text, REQUIRED_ELEMENTS[6].patterns),
    isChinese: isChinese(text),
    hasMarkdown: hasMarkdown(text),
  };

  const missingFields = Object.entries(checks)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  const passedCount = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const score = Math.round((passedCount / totalChecks) * 100);

  return {
    passed: score >= 60 && checks.hasConcept, // Must have at least concept + 60%
    score,
    checks,
    missingFields,
    suggestions: missingFields.map((f) => {
      const map: Record<string, string> = {
        hasConcept: "缺少核心概念定义",
        hasExample: "缺少具体例子或案例",
        hasSteps: "缺少推导步骤或流程说明",
        hasExercise: "缺少练习题或思考题",
        hasAnswer: "缺少参考答案或解析",
        hasPitfall: "缺少易错点提醒",
        hasNextStep: "缺少下一步学习建议",
        isChinese: "内容中中文比例过低",
        hasMarkdown: "建议使用Markdown格式化内容",
      };
      return map[f] ?? `缺少: ${f}`;
    }),
  };
}

/** Build a retry prompt with quality feedback */
export function buildRetryPrompt(
  originalPrompt: string,
  previousOutput: string,
  check: QualityCheck,
): string {
  return [
    "前一次生成的内容质量未达标，请重新生成。",
    "",
    "缺失的内容要素:",
    ...check.suggestions.map((s) => `- ${s}`),
    "",
    "要求:",
    "1. 必须包含: 概念定义、具体例子、推导步骤、练习题、答案解析、易错点、下一步建议",
    "2. 使用中文讲解，专业术语首次出现给出英文",
    "3. 使用Markdown格式化（标题、列表、代码块、公式用$...$）",
    "4. 不要输出JSON，直接输出教学内容",
    "",
    `原始需求: ${originalPrompt}`,
  ].join("\n");
}

/** Rate the output quality based on user feedback (thumbs up/down) */
export interface UserFeedback {
  messageId: string;
  rating: "up" | "down";
  comment?: string;
}

/** Simple in-memory LRU cache for AI generations */
export class GenerationCache {
  private cache = new Map<string, { result: string; timestamp: number }>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /** Generate a cache key from the prompt fingerprint */
  key(mode: string, input: string): string {
    // Normalize: lowercase, trim, remove extra whitespace
    const normalized = input.toLowerCase().trim().replace(/\s+/g, " ");
    return `${mode}::${normalized.slice(0, 200)}`;
  }

  get(k: string): string | null {
    const entry = this.cache.get(k);
    if (!entry) return null;
    // Cache expires after 30 minutes (DeepSeek responses may improve)
    if (Date.now() - entry.timestamp > 30 * 60 * 1000) {
      this.cache.delete(k);
      return null;
    }
    return entry.result;
  }

  set(k: string, result: string): void {
    // LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(k, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Singleton cache instance
export const generationCache = new GenerationCache(100);
