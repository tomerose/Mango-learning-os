"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

type MoodRecord = {
  date: string; // ISO date string
  mood: string; // emoji
  label: string;
};

type Trend = "improving" | "stable" | "declining";

const MOOD_MAP: Record<string, { label: string; score: number }> = {
  "😊": { label: "Happy", score: 5 },
  "🤔": { label: "Pensive", score: 4 },
  "😐": { label: "Neutral", score: 3 },
  "😢": { label: "Sad", score: 2 },
  "😡": { label: "Angry", score: 1 },
};

function getMoodEmoji(body: string): string {
  for (const emoji of Object.keys(MOOD_MAP)) {
    if (body.includes(emoji)) return emoji;
  }
  return "😐";
}

function getTrend(scores: number[]): Trend {
  if (scores.length < 2) return "stable";
  const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
  const secondHalf = scores.slice(Math.ceil(scores.length / 2));
  const firstAvg =
    firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (secondAvg > firstAvg + 0.5) return "improving";
  if (secondAvg < firstAvg - 0.5) return "declining";
  return "stable";
}

const TREND_CONFIG: Record<
  Trend,
  { icon: typeof TrendingUp; label: string; color: string }
> = {
  improving: {
    icon: TrendingUp,
    label: "Improving",
    color: "text-emerald-500",
  },
  stable: { icon: Minus, label: "Stable", color: "text-muted-foreground" },
  declining: {
    icon: TrendingDown,
    label: "Declining",
    color: "text-rose-500",
  },
};

// ─── Component ─────────────────────────────────────────────────

export function MoodTracker() {
  const { reflections } = useStore();

  const last7Days = React.useMemo(() => {
    const days: MoodRecord[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      // Find matching reflection for this day
      const match = reflections.find((r) => {
        const rd = new Date(r.dateLabel);
        // Skip invalid date strings (e.g. Chinese format "6月3日")
        if (isNaN(rd.getTime())) return false;
        return rd.toISOString().slice(0, 10) === dateStr;
      });

      const emoji = match ? getMoodEmoji(match.body) : "";
      const moodInfo = emoji ? MOOD_MAP[emoji] : null;

      days.push({
        date: dayName,
        mood: emoji || "—",
        label: moodInfo?.label ?? "无数据",
      });
    }

    return days;
  }, [reflections]);

  const scores = React.useMemo(
    () =>
      last7Days
        .filter((d) => d.mood !== "—")
        .map((d) => MOOD_MAP[d.mood]?.score ?? 3),
    [last7Days]
  );

  const trend: Trend = React.useMemo(() => getTrend(scores), [scores]);
  const TrendIcon = TREND_CONFIG[trend].icon;

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-4 pt-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Mood Timeline</h3>
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              TREND_CONFIG[trend].color
            )}
          >
            <TrendIcon className="size-3.5" />
            {TREND_CONFIG[trend].label}
          </div>
        </div>

        {/* 7-day timeline */}
        <div className="flex items-end justify-between gap-1 h-28">
          {last7Days.map((day, i) => {
            const score = day.mood !== "—" ? MOOD_MAP[day.mood]?.score ?? 0 : 0;
            const heightPct = score ? (score / 5) * 100 : 8;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1.5 min-w-0"
              >
                {/* Emoji */}
                <span
                  className={cn(
                    "text-xl transition-all",
                    day.mood === "—" && "opacity-20 text-lg"
                  )}
                  title={day.label}
                >
                  {day.mood === "—" ? "·" : day.mood}
                </span>

                {/* Bar */}
                <div className="w-full flex justify-center">
                  <div
                    className={cn(
                      "w-8 max-w-full rounded-full transition-all duration-500",
                      score >= 4
                        ? "bg-emerald-400"
                        : score >= 3
                          ? "bg-amber-400"
                          : score >= 2
                            ? "bg-orange-400"
                            : "bg-muted"
                    )}
                    style={{
                      height: `${Math.max(4, heightPct)}%`,
                      minHeight: 4,
                    }}
                  />
                </div>

                {/* Day label */}
                <span className="text-[10px] text-muted-foreground/70 truncate w-full text-center">
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-400 inline-block" />
            Positive
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-400 inline-block" />
            Neutral
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-orange-400 inline-block" />
            Low
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
