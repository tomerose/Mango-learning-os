"use client";

import * as React from "react";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

function getChineseDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const weekday = weekdays[now.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

export function HubWelcome() {
  const { stats } = useStore();
  const greeting = getGreeting();
  const dateStr = getChineseDate();
  const level = stats?.level ?? 1;
  const totalXp = stats?.totalXp ?? 0;
  const xpForCurrentLevel = stats?.xpForCurrentLevel ?? 0;
  const xpToNextLevel = stats?.xpToNextLevel ?? 500;
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpToNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 0;

  return (
    <div className={cn(
      "relative rounded-[2rem] p-6 sm:p-8 overflow-hidden",
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6",
      "bg-card border card-layered",
    )}>
      {/* Watercolor blob decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 pointer-events-none watercolor-mango" />
      <div className="absolute -bottom-16 left-1/3 w-48 h-48 rounded-full opacity-20 pointer-events-none watercolor-rose" />
      {/* Left: greeting + date + streak */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {greeting}，<span className="text-primary">Learner</span>
          </h2>
          <Sparkles className="size-5 text-primary/60" strokeWidth={2} />
        </div>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Flame className="size-4 text-orange-500" fill="currentColor" />
            <span>{stats?.streakDays ?? 0} 天连续学习</span>
          </div>
        </div>
      </div>

      {/* Right: XP & Level */}
      <div className="flex flex-col items-start sm:items-end gap-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Level {level}</span>
        </div>
        <div className="w-40 sm:w-48 h-2 rounded-full bg-primary/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4 transition-all duration-700"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {totalXp.toLocaleString()} XP · {xpProgress}% to Level {level + 1}
        </span>
      </div>
    </div>
  );
}
