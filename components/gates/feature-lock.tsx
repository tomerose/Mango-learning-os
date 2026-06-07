"use client";

import * as React from "react";
import { Lock, ArrowRight, Gift, LogIn, Crown } from "lucide-react";
import type { PlanTier } from "@/lib/plan/types";

interface FeatureLockProps {
  feature: string;
  featureLabel: string;
  currentPlan: PlanTier;
  requiredPlan: PlanTier;
  reason?: string;
  className?: string;
  /** Show as compact inline banner instead of full card */
  compact?: boolean;
}

const upgradeActions: Record<string, { label: string; href: string; icon: typeof ArrowRight }> = {
  guest: { label: "注册/登录", href: "/login", icon: LogIn },
  standard: { label: "使用 Mango Code 升级", href: "/profile?tab=billing", icon: Gift },
};

export function FeatureLock({
  feature,
  featureLabel,
  currentPlan,
  requiredPlan,
  reason,
  className = "",
  compact = false,
}: FeatureLockProps) {
  const action = currentPlan === "guest"
    ? upgradeActions.guest
    : upgradeActions.standard;
  const ActionIcon = action.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-subtle border border-border ${className}`}>
        <Lock className="size-4 text-fg-subtle/90 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-fg-muted truncate">
            {featureLabel}
          </p>
          {reason && (
            <p className="text-[10px] text-fg-muted/80 truncate">{reason}</p>
          )}
        </div>
        <Crown className="size-3.5 text-amber-400 shrink-0" />
      </div>
    );
  }

  return (
    <div className={`card-card p-5 sm:p-6 text-center ${className}`}>
      <div className="size-14 rounded-2xl bg-bg-muted flex items-center justify-center mx-auto mb-3">
        <Lock className="size-6 text-fg-subtle/90" />
      </div>

      <h3 className="text-[16px] font-serif font-medium mb-1">
        {featureLabel}
      </h3>
      <p className="text-[13px] text-fg-muted/90 mb-1">
        {reason ?? `需要 ${requiredPlan === "standard" ? "标准版" : "Pro 专业版"} 才能使用此功能`}
      </p>

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-[11px] text-fg-muted/80 bg-bg-muted px-2 py-0.5 rounded-full">
          当前: {currentPlan === "guest" ? "游客" : currentPlan === "standard" ? "标准版" : currentPlan}
        </span>
        <ArrowRight className="size-3 text-fg-subtle/80" />
        <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
          需要: {requiredPlan === "standard" ? "标准版" : requiredPlan === "pro" ? "Pro" : requiredPlan}
        </span>
      </div>

      <a
        href={action.href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors shadow-sm"
      >
        <ActionIcon className="size-4" />
        {action.label}
      </a>
    </div>
  );
}
