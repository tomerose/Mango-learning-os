import type { SubjectId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Pluggable, OpenAI-compatible AI client.
// Default provider: DeepSeek (https://api.deepseek.com).
// Swapping providers = changing env vars only; the rest of the
// app talks to this module, never to a vendor SDK directly.
// When AI_API_KEY is unset, every call degrades to a deterministic
// mock stream so the whole product runs end-to-end with zero config.
// ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getAIConfig(): AIConfig {
  return {
    apiKey: process.env.AI_API_KEY ?? "",
    baseUrl: process.env.AI_BASE_URL ?? "https://api.deepseek.com",
    model: process.env.AI_MODEL ?? "deepseek-chat",
  };
}

/** Normalize env values: strip whitespace and surrounding quotes.
 *  Vercel CLI `env pull` writes empty values as `""` (literal double-quotes),
 *  which would otherwise pass a naive truthiness check. */
function cleanEnv(s: string | undefined): string {
  if (!s) return "";
  let v = s.trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).trim();
  return v;
}

export function isAIConfigured(): boolean {
  const key = cleanEnv(process.env.AI_API_KEY);
  // Must be a real-looking API key (starts with sk- or similar), not a
  // Vercel-CLI placeholder like "".
  return Boolean(key && key.length > 10);
}

const encoder = new TextEncoder();

/**
 * Stream a chat completion as a ReadableStream of UTF-8 text chunks.
 * Falls back to a mock stream when no API key is configured.
 */
export async function streamChat(
  messages: ChatMessage[],
  opts: { temperature?: number; subject?: SubjectId } = {}
): Promise<ReadableStream<Uint8Array>> {
  const config = getAIConfig();

  if (!config.apiKey) {
    return mockStream(messages, opts.subject);
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`AI provider error (${res.status}): ${detail.slice(0, 200)}`);
  }

  // Transform the provider's SSE stream into raw text deltas.
  return res.body.pipeThrough(sseToTextTransform());
}

/**
 * Non-streaming completion — returns the full assistant text at once.
 * Used for structured outputs (quiz JSON, error analysis) where streaming
 * a partial JSON blob would be useless. Falls back to a mock string when
 * no API key is configured.
 */
export async function completeChat(
  messages: ChatMessage[],
  opts: { temperature?: number; signal?: AbortSignal } = {}
): Promise<string> {
  const config = getAIConfig();

  if (!config.apiKey) {
    return mockCompletion(messages);
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: opts.temperature ?? 0.4,
      stream: false,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`AI provider error (${res.status}): ${detail.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("AI provider returned no content");
  }
  return content;
}

/**
 * Extract the first balanced JSON object/array from a model response.
 * Models often wrap JSON in prose or ```json fences despite instructions;
 * this recovers the payload so callers get clean structured data.
 */
export function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) return candidate.trim();

  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === open) depth++;
    else if (candidate[i] === close) {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }
  return candidate.slice(start).trim();
}

function sseToTextTransform(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // partial JSON across chunk boundary — ignore, next pass handles it
        }
      }
    },
  });
}

/**
 * Deterministic mock stream — lets the app demo the full UX offline.
 * Emits a clearly-labelled placeholder so users know AI isn't live yet.
 */
function mockStream(
  messages: ChatMessage[],
  subject?: SubjectId
): ReadableStream<Uint8Array> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const q = lastUser?.content ?? "你的问题";
  const subjectNote = subject ? `【学科：${subject}】` : "";

  const reply = [
    `${subjectNote}（演示模式 · 未配置 AI_API_KEY）\n\n`,
    `我收到了你的问题：「${q.slice(0, 60)}」。\n\n`,
    `配置 DeepSeek API Key 后，我会在这里给出结构化的讲解：\n`,
    `1. **核心概念** — 用一句话点明本质\n`,
    `2. **直觉理解** — 类比 + 为什么这样设计\n`,
    `3. **推导/步骤** — 关键步骤拆解\n`,
    `4. **例子** — 一个具体可算的例子\n`,
    `5. **易错点** — 最常见的 1-2 个陷阱\n`,
    `6. **下一步** — 推荐的练习任务\n\n`,
    `在 \`.env.local\` 中设置 \`AI_API_KEY\` 即可启用真实回答。`,
  ];

  return new ReadableStream({
    async start(controller) {
      for (const part of reply) {
        // chunk word-by-word to simulate token streaming
        for (const token of part.match(/.{1,4}/g) ?? [part]) {
          controller.enqueue(encoder.encode(token));
          await new Promise((r) => setTimeout(r, 12));
        }
      }
      controller.close();
    },
  });
}

/**
 * Deterministic mock for non-streaming completions (offline / no API key).
 * For quiz prompts the quiz route handles its own mock, so this only needs
 * to return a clearly-labelled placeholder for any other completion caller.
 */
function mockCompletion(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const q = lastUser?.content?.slice(0, 80) ?? "";
  return `（演示模式 · 未配置 AI_API_KEY）针对「${q}」的回答需要配置 DeepSeek API Key。请在 .env.local 设置 AI_API_KEY 后重试。`;
}
