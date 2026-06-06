"use client";

import * as React from "react";
import { Flame, Trophy, Sparkles, Shield } from "lucide-react";
import type { PlanTier } from "@/lib/plan/types";
import { AnimeAvatar } from "@/components/avatar/anime-avatar";

interface Props {
  plan: PlanTier;
  planName: string;
  planBadge: string;
  mode: string;
  totalXp: number;
  level: number;
  streakDays: number;
}

export function ProfileHeader({ plan, planName, planBadge, mode, totalXp, level, streakDays }: Props) {
  return (
    <div className="relative overflow-hidden card-hero p-5 sm:p-6">
      {/* Ambient orb */}
      <div className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full watercolor-amber opacity-50 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <AnimeAvatar userId={mode === "cloud" ? "user" : undefined} size={64} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[18px] font-serif font-medium">学习者</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              plan === "pro" || plan === "admin"
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                : plan === "standard"
                ? "bg-primary-subtle text-primary"
                : "bg-bg-muted text-fg-muted"
            }`}>
              {planBadge}
            </span>
          </div>

          <p className="text-[12px] text-fg-muted/60 mt-0.5">
            {mode === "cloud"
              ? `${planName} · 云端同步已启用`
              : "游客模式 · 数据存于本地"}
          </p>

          {/* Mini stats bar */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="size-3.5 text-amber-500" />
              <span className="text-[12px] font-medium tabular-nums">{totalXp}</span>
              <span className="text-[10px] text-fg-muted/50">XP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              <span className="text-[12px] font-medium tabular-nums">Lv.{level}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-orange-500" />
              <span className="text-[12px] font-medium tabular-nums">{streakDays}</span>
              <span className="text-[10px] text-fg-muted/50">天</span>
            </div>
          </div>
        </div>

        {/* Plan badge on desktop */}
        <div className="hidden sm:flex flex-col items-center gap-1 bg-bg-subtle rounded-2xl px-4 py-3 shrink-0">
          <span className="text-[10px] text-fg-muted/50 font-medium uppercase">Current Plan</span>
          <span className={`text-[13px] font-semibold ${
            plan === "pro" || plan === "admin" ? "gradient-mango-text" : ""
          }`}>
            {planName}
          </span>
        </div>
      </div>
    </div>
  );
}
