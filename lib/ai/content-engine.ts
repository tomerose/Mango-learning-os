// ═══════════════════════════════════════════════════════════════
// Content Intelligence Engine — Unified AI Generation Pipeline
//
// Replaces all fragmented AI routes with a single engine.
// Every generation goes through:
//   input → cache check → prompt build → AI call → quality check
//         → retry (if needed) → deliver → cache
//
// Supports all 12 generation modes across the entire product.
// ═══════════════════════════════════════════════════════════════

import { completeChat, streamChat, extractJson, type ChatMessage } from "@/lib/ai/client";
import type { WeakArea } from "@/lib/types";
import {
  buildSystemPrompt,
  buildUserPrompt,
  type GenerationMode,
} from "@/lib/ai/templates";
export type { GenerationMode };
import { validateContent, buildRetryPrompt, generationCache, type QualityCheck, type UserFeedback } from "@/lib/ai/quality";
import type { PlanTier } from "@/lib/plan/types";

// ═══ Types ═══

export interface GenerationRequest {
  mode: GenerationMode;
  input: string;
  subject?: string;
  options?: Record<string, string>;
  context?: {
    weakAreas?: WeakArea[];
    goals?: string[];
    recentTopics?: string[];
    memories?: string;
  };
  /** Skip quality check for non-learning modes (companion, etc.) */
  skipQuality?: boolean;
  /** Skip cache */
  skipCache?: boolean;
}

export interface GenerationResult {
  mode: GenerationMode;
  content: string;
  parsed?: Record<string, unknown>;
  quality?: QualityCheck;
  cached: boolean;
  retries: number;
  tokensUsed?: number;
}

// ═══ Feedback Store ═══

const feedbackStore: Map<string, UserFeedback> = new Map();

export function recordFeedback(messageId: string, rating: "up" | "down", comment?: string): void {
  feedbackStore.set(messageId, { messageId, rating, comment });
}

export function getFeedbackStats(): { total: number; up: number; down: number } {
  let up = 0, down = 0;
  for (const f of feedbackStore.values()) {
    if (f.rating === "up") up++; else down++;
  }
  return { total: up + down, up, down };
}

// ═══ Engine ═══

const MAX_RETRIES = 2;

export async function generate(req: GenerationRequest): Promise<GenerationResult> {
  const { mode, input, subject = "general", options, context, skipQuality = false, skipCache = false } = req;

  // 1. Check cache
  const cacheKey = skipCache ? null : generationCache.key(mode, input);
  if (cacheKey) {
    const cached = generationCache.get(cacheKey);
    if (cached) {
      return { mode, content: cached, cached: true, retries: 0 };
    }
  }

  // 2. Build prompts
  const systemPrompt = buildSystemPrompt({ mode, subject, context });
  const userPrompt = buildUserPrompt(mode, input, options);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  // 3. Call AI with retry loop
  let lastContent = "";
  let lastQuality: QualityCheck | undefined;
  let retries = 0;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      lastContent = await completeChat(messages, { temperature: mode === "companion" ? 0.8 : 0.4 });

      // Parse JSON for structured modes
      const modeConfig = await import("./templates").then((m) => m.MODE_TEMPLATES[mode]);
      if (modeConfig.outputFormat === "json") {
        try {
          const json = extractJson(lastContent);
          JSON.parse(json); // validate parseable
          lastContent = json; // Store clean JSON
        } catch {
          // JSON parse failed — retry
          if (attempt < MAX_RETRIES) {
            messages.push(
              { role: "assistant", content: lastContent },
              { role: "user", content: "输出格式错误，请只输出纯 JSON，不要 markdown 代码块。" },
            );
            retries++;
            continue;
          }
        }
      }

      // Quality check (skip for companion and other non-educational modes)
      if (!skipQuality && modeConfig.outputFormat === "text") {
        lastQuality = validateContent(lastContent);
        if (!lastQuality.passed && attempt < MAX_RETRIES) {
          const retryPrompt = buildRetryPrompt(userPrompt, lastContent, lastQuality);
          messages.push(
            { role: "assistant", content: lastContent },
            { role: "user", content: retryPrompt },
          );
          retries++;
          continue;
        }
      }

      // Success — cache and return
      if (cacheKey) {
        generationCache.set(cacheKey, lastContent);
      }
      return { mode, content: lastContent, quality: lastQuality, cached: false, retries };
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw err;
      }
      retries++;
    }
  }

  // Should not reach here, but TS needs it
  return { mode, content: lastContent, quality: lastQuality, cached: false, retries };
}

// ═══ Streaming generation (for chat/companion modes) ═══

export async function generateStream(
  req: GenerationRequest,
): Promise<ReadableStream<Uint8Array>> {
  const { mode, input, subject = "general", context } = req;

  const systemPrompt = buildSystemPrompt({ mode, subject, context });
  const userPrompt = buildUserPrompt(mode, input);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return streamChat(messages, {
    temperature: mode === "companion" ? 0.8 : 0.7,
    subject: subject as never,
  });
}

// ═══════════════════════════════════════════════════════════════
// Content Quality Prompt Builders — Plan-differentiated
// Used by Agent execute API for REAL generation
// ═══════════════════════════════════════════════════════════════

interface QualityConfig {
  depth: "basic" | "standard" | "deep";
  maxConcepts: number;
  exampleCount: number;
  includeMistakes: boolean;
  includePractice: boolean;
  includeSources: boolean;
  includeConceptMap: boolean;
  tone: string;
}

const QUALITY: Record<PlanTier, QualityConfig> = {
  guest:  { depth:"basic", maxConcepts:3, exampleCount:0, includeMistakes:false, includePractice:false, includeSources:false, includeConceptMap:false, tone:"简单入门" },
  standard: { depth:"standard", maxConcepts:8, exampleCount:2, includeMistakes:true, includePractice:true, includeSources:false, includeConceptMap:false, tone:"学术严谨" },
  pro:    { depth:"deep", maxConcepts:15, exampleCount:4, includeMistakes:true, includePractice:true, includeSources:true, includeConceptMap:true, tone:"深度专家" },
  admin:  { depth:"deep", maxConcepts:20, exampleCount:5, includeMistakes:true, includePractice:true, includeSources:true, includeConceptMap:true, tone:"深度专家" },
};

function qc(plan: PlanTier): QualityConfig { return QUALITY[plan] ?? QUALITY.standard; }

export function buildConceptPrompt(topic: string, plan: PlanTier): string {
  const c = qc(plan);
  return `你是${c.tone}学习导师。用6部分结构解释"${topic}"：1.定义 2.直觉理解 3.推导/逻辑${c.includeConceptMap?" 4.概念关系图":""} 5.${c.exampleCount}个例子 6.${c.includeMistakes?"3-5个常见误区及纠正":"关键注意点"} 7.实际应用${c.includePractice?"\n最后给2道自测题含答案。":""}\n中文，Markdown格式。`;
}

export function buildQuizPrompt(topic: string, plan: PlanTier): string {
  const c = qc(plan);
  const count = plan === "pro" || plan === "admin" ? 8 : 5;
  return `就"${topic}"生成${count}道${c.depth==="deep"?"高质量":""}选择题。JSON：[{"question":"","options":["A","B","C","D"],"answer":0,"explanation":"解析"}]\n${c.depth==="deep"?"梯度难度：概念理解→应用分析→综合推理。":""}只输出JSON。`;
}

export function buildFlashcardPrompt(content: string, plan: PlanTier): string {
  const c = qc(plan);
  const count = c.maxConcepts;
  return `从以下内容提取${count}个知识点，JSON：[{"front":"问题","back":"答案"}]\n${c.depth==="deep"?"答案包含推导或例子。":""}只输出JSON。\n\n${content.slice(0,4000)}`;
}

export function buildStudyPackPrompt(courseName: string, _school?: string, _scope?: string, plan?: PlanTier): string {
  const c = qc(plan ?? "standard");
  const deep = c.depth === "deep";
  const mode = deep ? "Pro深度版：详细分析、更多例题、概念关联。" : "标准版：清晰简洁、重点突出。";
  const parts = [
    `为"${courseName}"生成学习讲义。${mode}`,
    "模块：",
    "1.课程概览",
    "2.考试范围",
    deep ? "3.知识图谱（详细节点网络）" : "3.知识图谱（核心关系）",
    `4.${c.maxConcepts}个核心概念（每个含${c.exampleCount}个例子${c.includeMistakes ? "、常见错误" : ""}）`,
    "5.逻辑框架",
    "6.高频考点",
    "7.公式速查表",
    "8.解题方法",
    `9.${c.exampleCount}道典型例题（含详细解答）`,
  ];
  if (c.includeMistakes) parts.push("10.常见陷阱（5个典型错误及避免方法）");
  if (c.includePractice) parts.push("11.自测题（5道含答案）");
  parts.push("12.考前记忆清单");
  parts.push("13.7天复习计划");
  if (c.includeSources) parts.push("14.参考资料");
  parts.push("用中文回答，Markdown格式，使用表格和列表提高可读性。");
  return parts.join("\n");
}

export function buildNotesPrompt(rawContent: string, plan: PlanTier, _template?: string): string {
  const c = qc(plan);
  return `整理以下笔记为结构化文档：按主题分组、提取${c.maxConcepts}个关键概念、每概念${c.exampleCount}例、标注重点${c.includeMistakes?"、补充误区":""}${c.depth==="deep"?"、添加概念关联":""}\n\n${rawContent.slice(0,4000)}`;
}

export function buildReviewPlanPrompt(subject: string, mistakes: string[], plan: PlanTier): string {
  const c = qc(plan);
  return `为"${subject}"生成${c.depth==="deep"?"详细":""}7天复习计划。${mistakes.length>0?`错题知识点：${mistakes.join("、")}`:""}\n每天：主题、${c.depth==="deep"?"3-4":"2-3"}项任务、预计时间${c.depth==="deep"?"、自测题":""}\n${c.depth==="deep"?"基于间隔重复原理。":""}中文Markdown。`;
}

export function buildSummaryPrompt(content: string, plan: PlanTier): string {
  const c = qc(plan);
  return `生成${c.depth==="deep"?"详细":"300字内"}结构化摘要：核心论点→${c.depth==="deep"?"方法论→关键发现→":""}结论${c.includeSources?"→来源":""}\n\n${content.slice(0,4000)}`;
}

export function buildMistakeAnalysisPrompt(mistakes: string, plan: PlanTier): string {
  const c = qc(plan);
  return `分析以下错题：1.错误类型 2.共性问题 3.建议${c.includePractice?" 4.生成3道类似题":""}\n\n${mistakes.slice(0,3000)}`;
}

export { qc as getQualityConfig };
