// ═══════════════════════════════════════════════════════════════
// API-Level Feature Gate Enforcement
// Called at the top of every protected API route.
// Checks are server-side — UI gating is cosmetic only.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import type { PlanTier, PlanFeatureFlags } from "./types";
import { PLAN_FEATURES } from "./types";

interface GateContext {
  plan: PlanTier;
  dailyAgentTasks?: number;
  dailyStudyPacks?: number;
}

/** Enforce a boolean feature gate. Returns null if allowed, NextResponse if blocked. */
export function guard(
  ctx: GateContext,
  feature: keyof PlanFeatureFlags,
): NextResponse | null {
  const tier = PLAN_FEATURES[ctx.plan] ?? PLAN_FEATURES.guest;
  const allowed = tier[feature];

  if (typeof allowed === "boolean" && !allowed) {
    const requiredPlan = requiredPlanFor(feature);
    return NextResponse.json(
      {
        error: `此功能需要升级计划`,
        code: "PLAN_REQUIRED",
        currentPlan: ctx.plan,
        requiredFeature: feature,
        requiredPlan,
        upgradeHint: requiredPlan === "standard" ? "注册或登录即可使用" : "使用 Mango Code 兑换 Pro 版",
      },
      { status: 403 },
    );
  }

  return null;
}

/** Enforce a quota check. Returns null if allowed, 429 if exceeded. */
export function guardQuota(
  ctx: GateContext,
  quota: "maxDailyAgentTasks" | "maxDailyStudyPacks",
  current: number,
): NextResponse | null {
  const tier = PLAN_FEATURES[ctx.plan] ?? PLAN_FEATURES.guest;
  const max = tier[quota] as number;

  if (current >= max) {
    const label = quota === "maxDailyAgentTasks" ? "Agent 任务" : "学习包";
    const resetAt = beijingNextMidnight();
    return NextResponse.json(
      {
        error: `今日${label}已达上限 (${current}/${max})`,
        code: "QUOTA_EXCEEDED",
        current,
        max,
        resetAt,
        upgradeHint: "升级到 Pro 版可获得更高配额",
      },
      { status: 429 },
    );
  }

  return null;
}

/** Resolve plan from request context. */
export function resolvePlan(opts: {
  isGuest?: boolean;
  isAuthenticated?: boolean;
  override?: PlanTier;
}): PlanTier {
  if (opts.override) return opts.override;
  if (opts.isGuest || !opts.isAuthenticated) return "guest";
  return "standard";
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function requiredPlanFor(feature: keyof PlanFeatureFlags): PlanTier {
  // Walk tiers from guest up to find the first that allows this feature
  const tiers: PlanTier[] = ["guest", "standard", "pro", "admin"];
  for (const tier of tiers) {
    const val = PLAN_FEATURES[tier][feature];
    if (typeof val === "boolean" && val) return tier;
    if (typeof val === "number" && val > 0) return tier;
  }
  return "pro";
}

function beijingNextMidnight(): string {
  const now = new Date();
  const bj = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const bjDate = bj.toISOString().slice(0, 10);
  const next = new Date(bjDate + "T00:00:00+08:00");
  next.setDate(next.getDate() + 1);
  return next.toISOString();
}
