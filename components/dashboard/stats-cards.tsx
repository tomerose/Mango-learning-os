"use client";

import {
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {label}
          </span>
          <span
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `color-mix(in oklch, ${accent} 15%, transparent)` }}
          >
            <Icon className="size-4" style={{ color: accent }} />
          </span>
        </div>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {sub}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { stats: s } = useStore();
  const levelSpan = s.xpToNextLevel - s.xpForCurrentLevel;
  const levelProgress = Math.round(
    ((s.totalXp - s.xpForCurrentLevel) / levelSpan) * 100
  );
  const minutePct = Math.round((s.minutesToday / s.minutesGoal) * 100);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={Flame}
        label="学习连续"
        value={`${s.streakDays} 天`}
        accent="var(--chart-3)"
        sub={
          <span className="text-muted-foreground text-xs">
            保持势头，别断签 🔥
          </span>
        }
      />
      <StatCard
        icon={Trophy}
        label="等级 / XP"
        value={`Lv.${s.level}`}
        accent="var(--chart-1)"
        sub={
          <div className="flex flex-col gap-1">
            <Progress value={levelProgress} />
            <span className="text-muted-foreground text-xs">
              {s.totalXp} / {s.xpToNextLevel} XP
            </span>
          </div>
        }
      />
      <StatCard
        icon={Clock}
        label="今日专注"
        value={`${s.minutesToday} 分`}
        accent="var(--chart-2)"
        sub={
          <div className="flex flex-col gap-1">
            <Progress value={minutePct} />
            <span className="text-muted-foreground text-xs">
              目标 {s.minutesGoal} 分钟
            </span>
          </div>
        }
      />
      <StatCard
        icon={CheckCircle2}
        label="今日任务"
        value={`${s.tasksDoneToday}/${s.tasksTotalToday}`}
        accent="var(--chart-4)"
        sub={
          <span className="text-muted-foreground text-xs">
            还剩 {s.tasksTotalToday - s.tasksDoneToday} 项待完成
          </span>
        }
      />
    </div>
  );
}
