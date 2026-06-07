"use client";

import * as React from "react";
import { Lock, Sparkles, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanTier } from "@/lib/plan/use-plan";
import { PLAN_FEATURES, type PlanTier, type PlanFeatureFlags } from "@/lib/plan/types";
import { TIER_META } from "@/lib/plan/plan-config";
import Link from "next/link";

// ── PlanGate — wrap Pro features ───────────────────────────────

interface PlanGateProps {
  feature: keyof PlanFeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Custom upgrade message */
  upgradeTitle?: string;
  upgradeDescription?: string;
}

export function PlanGate({ feature, children, fallback, upgradeTitle, upgradeDescription }: PlanGateProps) {
  const tier = usePlanTier();
  const features = PLAN_FEATURES[tier];
  const allowed = features[feature];

  const isAllowed = typeof allowed === "boolean" ? allowed : (typeof allowed === "number" ? allowed > 0 : false);

  if (isAllowed) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <ProFeatureLock
      title={upgradeTitle ?? "Pro 功能"}
      description={upgradeDescription ?? "升级到 Pro 专业版以解锁此功能"}
      feature={feature}
    />
  );
}

// ── ProFeatureLock — shown when standard user clicks Pro feature ─

function ProFeatureLock({ title, description, feature }: {
  title: string;
  description: string;
  feature: string;
}) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mango-glass-card p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-400/15">
            <Lock className="size-4 text-amber-200" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-xs text-white/45">{description}</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-white/20 hover:text-white/40">
          <X className="size-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <Link
          href="/profile?tab=billing"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400/15 border border-amber-400/25 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-400/20 transition-colors"
        >
          <Sparkles className="size-3.5" />查看 Pro 能力
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 rounded-xl bg-white/5 py-2.5 text-xs font-medium text-white/40 hover:text-white/60 transition-colors"
        >
          稍后再说
        </button>
      </div>
    </motion.div>
  );
}

// ── TierBadge — small badge showing current plan ────────────────

export function TierBadge({ tier, size = "sm" }: { tier: PlanTier; size?: "sm" | "md" }) {
  const meta = TIER_META[tier];
  return (
    <span
      className={size === "md" ? "rounded-full px-3 py-1 text-xs font-semibold" : "rounded-full px-2 py-0.5 text-[10px] font-semibold"}
      style={{ backgroundColor: meta.color + "20", color: meta.color, border: `1px solid ${meta.color}30` }}
    >
      {meta.shortName}
    </span>
  );
}

// ── TierModeLabel — "Standard Mode" / "Pro Studio" indicator ────

export function TierModeLabel({ tier }: { tier: PlanTier }) {
  const meta = TIER_META[tier];
  const label = tier === "pro" ? "Pro Studio Mode" : tier === "standard" ? "Standard Mode" : "Guest Mode";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{ backgroundColor: meta.color + "15", color: meta.color, border: `1px solid ${meta.color}25` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {label}
    </span>
  );
}
