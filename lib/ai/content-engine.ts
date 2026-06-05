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
