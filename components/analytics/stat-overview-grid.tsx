"use client";

import * as React from "react";
import { Clock, Brain, Target, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// StatOverviewGrid — 4 KPI cards with icon, value, and
// subtle trend indicator stripes.
// ─────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  color?: string;
}

interface StatOverviewGridProps {
  totalHoursThisWeek: number;
  focusScoreAvg: number;
  quizAccuracy: number;
  streakDays: number;
}

function StatCardItem({ card }: { card: StatCard }) {
  const Icon = card.icon;
  const trendIcon =
    card.trend === "up"
      ? TrendingUp
      : card.trend === "down"
        ? TrendingDown
        : Minus;
  const trendColor =
    card.trend === "up"
      ? "text-success"
      : card.trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card className="relative overflow-hidden">
      {/* Subtle left color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: card.color ?? "var(--chart-1)" }}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {card.label}
            </p>
            <p className="text-2xl font-bold mt-1 tracking-tight">
              {card.value}
            </p>
            {card.sublabel && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.sublabel}
              </p>
            )}
            {card.trendValue && (
              <div className={cn("flex items-center gap-1 mt-1.5 text-xs", trendColor)}>
                {React.createElement(trendIcon, { className: "size-3" })}
                <span>{card.trendValue}</span>
              </div>
            )}
          </div>
          <div
            className="size-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${card.color ?? "var(--chart-1)"}15`,
              color: card.color ?? "var(--chart-1)",
            }}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatOverviewGrid({
  totalHoursThisWeek,
  focusScoreAvg,
  quizAccuracy,
  streakDays,
}: StatOverviewGridProps) {
  const cards: StatCard[] = [
    {
      label: "Total Hours This Week",
      value: `${totalHoursThisWeek}h`,
      sublabel: `≈ ${Math.round(totalHoursThisWeek * 60)} min`,
      icon: Clock,
      trend: totalHoursThisWeek >= 12 ? "up" : totalHoursThisWeek >= 6 ? "flat" : "down",
      trendValue:
        totalHoursThisWeek >= 12
          ? "+2.5h from last week"
          : totalHoursThisWeek >= 6
            ? "Similar to last week"
            : "-1.5h from last week",
      color: "var(--chart-1)",
    },
    {
      label: "Focus Score",
      value: `${focusScoreAvg}`,
      sublabel: "out of 100",
      icon: Brain,
      trend: focusScoreAvg >= 70 ? "up" : focusScoreAvg >= 40 ? "flat" : "down",
      trendValue:
        focusScoreAvg >= 70
          ? "Great focus"
          : focusScoreAvg >= 40
            ? "Moderate"
            : "Needs improvement",
      color:
        focusScoreAvg >= 70
          ? "#10b981"
          : focusScoreAvg >= 40
            ? "#f59e0b"
            : "#ef4444",
    },
    {
      label: "Quiz Accuracy",
      value: `${quizAccuracy}%`,
      sublabel: "across all subjects",
      icon: Target,
      trend: quizAccuracy >= 80 ? "up" : quizAccuracy >= 60 ? "flat" : "down",
      trendValue:
        quizAccuracy >= 80
          ? "+5% improvement"
          : quizAccuracy >= 60
            ? "Steady"
            : "Review needed",
      color:
        quizAccuracy >= 80
          ? "#10b981"
          : quizAccuracy >= 60
            ? "#f59e0b"
            : "#ef4444",
    },
    {
      label: "Streak Days",
      value: streakDays,
      sublabel: "consecutive days",
      icon: Flame,
      trend: streakDays >= 7 ? "up" : streakDays >= 3 ? "flat" : "down",
      trendValue:
        streakDays >= 7
          ? "On fire!"
          : streakDays >= 3
            ? "Keep going"
            : "Start today",
      color:
        streakDays >= 7
          ? "#f59e0b"
          : streakDays >= 3
            ? "#10b981"
            : "var(--chart-1)",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCardItem key={card.label} card={card} />
      ))}
    </div>
  );
}

export type { StatCard };
