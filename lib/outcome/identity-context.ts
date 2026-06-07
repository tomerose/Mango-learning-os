/**
 * MangoOS V14.2 — Global Learning Identity Context
 *
 * Resolves user's learning identity, preferences, goals into
 * generation parameters that influence ALL artifact outputs.
 */
import type { LearningIdentity } from "@/lib/ai/identity-engine";
import { DEFAULT_IDENTITIES } from "@/lib/ai/identity-engine";

export interface IdentityContext {
  identityId: string;
  name: string;
  goal: string;
  personaName: string;
  personaVoice: string;
  teachingStyle: string;
  focusAreas: string[];
  outputPreferences: OutputPreferences;
  levelStage: "beginner" | "intermediate" | "advanced";
}

export interface OutputPreferences {
  depth: "basic" | "standard" | "deep";
  languagePreference: "zh-CN" | "en" | "mixed";
  exampleDensity: "sparse" | "normal" | "rich";
  actionOrientation: "passive" | "balanced" | "intensive";
  formatStyle: "academic" | "practical" | "exam-focused" | "project-based";
}

// ── Identity-specific output tuning ────────────────────────────

const IDENTITY_PRESETS: Record<string, Partial<OutputPreferences>> = {
  "ielts-candidate": {
    languagePreference: "mixed",
    actionOrientation: "intensive",
    formatStyle: "exam-focused",
  },
  "ai-engineer": {
    depth: "deep",
    formatStyle: "project-based",
    languagePreference: "mixed",
  },
  "korean-learner": {
    depth: "standard",
    actionOrientation: "intensive",
    formatStyle: "practical",
  },
  "startup-founder": {
    depth: "deep",
    formatStyle: "practical",
    actionOrientation: "intensive",
  },
  "research-junior": {
    depth: "deep",
    formatStyle: "academic",
    actionOrientation: "balanced",
  },
};

// ── Resolve function ───────────────────────────────────────────

export function resolveIdentityContext(
  identityId?: string | null,
  planTier: string = "guest"
): IdentityContext {
  const identity = DEFAULT_IDENTITIES.find(i => i.id === identityId) ?? DEFAULT_IDENTITIES[0];
  const preset = IDENTITY_PRESETS[identity.id] ?? {};

  const defaultPreferences: OutputPreferences = {
    depth: planTier === "pro" || planTier === "admin" ? "deep" : "standard",
    languagePreference: "zh-CN",
    exampleDensity: planTier === "pro" || planTier === "admin" ? "rich" : "normal",
    actionOrientation: "balanced",
    formatStyle: "practical",
  };

  return {
    identityId: identity.id,
    name: identity.name,
    goal: identity.goal,
    personaName: identity.persona.name,
    personaVoice: identity.persona.voice,
    teachingStyle: identity.persona.teachingStyle,
    focusAreas: identity.topics ?? [],
    levelStage: identity.progress > 80 ? "advanced" : identity.progress > 40 ? "intermediate" : "beginner",
    outputPreferences: { ...defaultPreferences, ...preset },
  };
}

/** Build identity context as a prompt string to inject into generation system prompts */
export function identityContextToPrompt(ctx: IdentityContext): string {
  return [
    `学习者身份：${ctx.name}（${ctx.goal}）`,
    `当前阶段：${ctx.levelStage === "beginner" ? "入门" : ctx.levelStage === "intermediate" ? "进阶" : "高级"}`,
    `教学风格：${ctx.teachingStyle}`,
    `重点关注：${ctx.focusAreas.join("、")}`,
    `输出偏好：${ctx.outputPreferences.depth === "deep" ? "深度" : "标准"} · ${ctx.outputPreferences.formatStyle} · 案例密度${ctx.outputPreferences.exampleDensity}`,
  ].join("\n");
}
