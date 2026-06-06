// ═══════════════════════════════════════════════════════════════
// API-Level Feature Gate Enforcement
// Called at the top of every protected API route.
// Checks are server-side — UI gating is cosmetic only.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export type PlanTier = "guest" | "standard" | "pro" | "admin";

interface PlanFeatures {
  canUseAgent: boolean;
  canGenerateStudyPack: boolean;
  canUseDeepResearch: boolean;
  canUploadFiles: boolean;
  maxFileSizeMB: number;
  maxDailyAgentTasks: number;
  maxDailyStudyPacks: number;
}

const FEATURES: Record<PlanTier, PlanFeatures> = {
  guest: { canUseAgent: false, canGenerateStudyPack: false, canUseDeepResearch: false, canUploadFiles: false, maxFileSizeMB: 0, maxDailyAgentTasks: 0, maxDailyStudyPacks: 0 },
  standard: { canUseAgent: true, canGenerateStudyPack: true, canUseDeepResearch: false, canUploadFiles: true, maxFileSizeMB: 10, maxDailyAgentTasks: 20, maxDailyStudyPacks: 3 },
  pro: { canUseAgent: true, canGenerateStudyPack: true, canUseDeepResearch: true, canUploadFiles: true, maxFileSizeMB: 50, maxDailyAgentTasks: 100, maxDailyStudyPacks: 20 },
  admin: { canUseAgent: true, canGenerateStudyPack: true, canUseDeepResearch: true, canUploadFiles: true, maxFileSizeMB: 200, maxDailyAgentTasks: 9999, maxDailyStudyPacks: 9999 },
};

interface GateContext {
  plan: PlanTier;
  dailyAgentTasks?: number;
  dailyStudyPacks?: number;
}

/** Enforce a feature gate. Returns null if allowed, or a NextResponse if blocked. */
export function guard(
  ctx: GateContext,
  feature: keyof PlanFeatures,
): NextResponse | null {
  const tier = FEATURES[ctx.plan] ?? FEATURES.guest;
  const allowed = tier[feature];

  if (typeof allowed === "boolean" && !allowed) {
    return NextResponse.json(
      { error: `此功能需要升级计划 (当前: ${ctx.plan})`, code: "PLAN_REQUIRED", requiredPlan: feature },
      { status: 403 },
    );
  }

  return null;
}

/** Enforce a quota check. Returns null if allowed, or a 429 response. */
export function guardQuota(
  ctx: GateContext,
  quota: "maxDailyAgentTasks" | "maxDailyStudyPacks",
  current: number,
): NextResponse | null {
  const tier = FEATURES[ctx.plan] ?? FEATURES.guest;
  const max = tier[quota] as number;

  if (current >= max) {
    return NextResponse.json(
      { error: `今日${quota === "maxDailyAgentTasks" ? "Agent 任务" : "学习包"}已达上限 (${current}/${max})`, code: "QUOTA_EXCEEDED", current, max },
      { status: 429 },
    );
  }

  return null;
}

/** Resolve plan from request context */
export function resolvePlan(opts: { isGuest?: boolean; isAuthenticated?: boolean; override?: PlanTier }): PlanTier {
  if (opts.override) return opts.override;
  if (opts.isGuest || !opts.isAuthenticated) return "guest";
  return "standard";
}
