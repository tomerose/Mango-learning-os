"use client";

// ═══════════════════════════════════════════════════════════════
// Client-side plan hook — cosmetic gating only
// Real enforcement is server-side in API routes.
// ═══════════════════════════════════════════════════════════════

import * as React from "react";
import type { PlanTier, PlanFeatureFlags } from "./types";
import { PLAN_FEATURES, getPlanInfo } from "./types";
import type { PlanInfo } from "./types";

interface PlanState {
  plan: PlanTier;
  planInfo: PlanInfo;
  features: PlanFeatureFlags;
  expiresAt: string | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  loading: boolean;
}

export function usePlan(): PlanState & {
  canUse: (feature: keyof PlanFeatureFlags) => boolean;
  refreshPlan: () => Promise<void>;
} {
  const [state, setState] = React.useState<PlanState>({
    plan: "guest",
    planInfo: getPlanInfo("guest"),
    features: PLAN_FEATURES.guest,
    expiresAt: null,
    isGuest: true,
    isAuthenticated: false,
    loading: true,
  });

  const refreshPlan = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/plan");
      const data = await res.json();
      const tier: PlanTier = data.plan?.tier ?? "guest";
      const expiresAt = data.plan?.expiresAt ?? null;

      setState({
        plan: tier,
        planInfo: getPlanInfo(tier, expiresAt ?? undefined),
        features: PLAN_FEATURES[tier],
        expiresAt,
        isGuest: tier === "guest",
        isAuthenticated: data.isAuthenticated ?? false,
        loading: false,
      });
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  React.useEffect(() => {
    refreshPlan();
  }, [refreshPlan]);

  const canUse = React.useCallback(
    (feature: keyof PlanFeatureFlags): boolean => {
      const val = state.features[feature];
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val > 0;
      return false;
    },
    [state.features],
  );

  return { ...state, canUse, refreshPlan };
}

/** Minimal hook — just returns plan tier, no fetch */
export function usePlanTier(): PlanTier {
  const [plan, setPlan] = React.useState<PlanTier>("guest");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("mango-user-plan");
      if (stored) { setPlan(stored as PlanTier); return; }
    } catch {}

    fetch("/api/auth/plan")
      .then(r => r.json())
      .then(data => {
        const tier = data.plan?.tier ?? "guest";
        setPlan(tier);
        try { localStorage.setItem("mango-user-plan", tier); } catch {}
      })
      .catch(() => {});
  }, []);

  return plan;
}
