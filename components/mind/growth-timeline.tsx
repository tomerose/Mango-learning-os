"use client";

import * as React from "react";
import { Sparkles, Star, Target, Leaf, Lightbulb, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: "insight" | "breakthrough" | "goal" | "growth" | "reflection";
}

const ICON_MAP = {
  insight: Lightbulb,
  breakthrough: Star,
  goal: Target,
  growth: Leaf,
  reflection: Sparkles,
} as const;

const ICON_COLORS = {
  insight: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
  breakthrough: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
  goal: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  growth: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  reflection: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
} as const;

// ─── Milestone derivation from reflections ─────────────────────

function deriveMilestones(
  reflections: { dateLabel: string; body: string; mood: string }[]
): Milestone[] {
  const milestones: Milestone[] = [];

  for (const r of reflections) {
    const body = r.body.toLowerCase();

    // Detect "breakthrough" language
    if (
      body.includes("breakthrough") ||
      body.includes("realized") ||
      body.includes("finally") ||
      body.includes("break") ||
      body.includes("突破") ||
      body.includes("终于") ||
      body.includes("顿悟")
    ) {
      milestones.push({
        id: `ms-${r.dateLabel}-breakthrough`,
        date: r.dateLabel,
        title: "Personal Breakthrough",
        description:
          "A moment of clarity and deep realization during reflection.",
        icon: "breakthrough",
      });
      continue;
    }

    // Detect goal-setting
    if (
      body.includes("goal") ||
      body.includes("plan") ||
      body.includes("want to") ||
      body.includes("目标") ||
      body.includes("计划") ||
      body.includes("想要")
    ) {
      milestones.push({
        id: `ms-${r.dateLabel}-goal`,
        date: r.dateLabel,
        title: "Goal Setting",
        description: "Set new intentions and direction for personal growth.",
        icon: "goal",
      });
      continue;
    }

    // Detect growth moments
    if (
      body.includes("grow") ||
      body.includes("learned") ||
      body.includes("better") ||
      body.includes("进步") ||
      body.includes("成长") ||
      body.includes("学会")
    ) {
      milestones.push({
        id: `ms-${r.dateLabel}-growth`,
        date: r.dateLabel,
        title: "Growth Moment",
        description: "Recognized progress and personal development.",
        icon: "growth",
      });
      continue;
    }

    // High motivation journals = insight
    if (
      body.includes("motivation:") &&
      body.includes("motivation: 8") ||
      body.includes("motivation: 9") ||
      body.includes("motivation: 10")
    ) {
      milestones.push({
        id: `ms-${r.dateLabel}-insight`,
        date: r.dateLabel,
        title: "Insightful Reflection",
        description: "A deeply motivated journal entry with clear self-awareness.",
        icon: "insight",
      });
    }
  }

  // Sort by date descending (newest first), limit to 10
  milestones.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return milestones.slice(0, 10);
}

// ─── Component ─────────────────────────────────────────────────

export function GrowthTimeline() {
  const { reflections } = useStore();

  const milestones = React.useMemo(
    () => deriveMilestones(reflections),
    [reflections]
  );

  if (milestones.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="size-14 rounded-full bg-muted/50 flex items-center justify-center">
            <Sparkles className="size-6 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              No milestones yet
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1 max-w-xs">
              Milestones will appear here as you journal and reflect. Keep
              writing — growth takes time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-1 pt-5">
        <h3 className="text-sm font-semibold mb-3">Growth Timeline</h3>

        {/* Vertical timeline */}
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-muted-foreground/15" />

          <div className="flex flex-col gap-0">
            {milestones.map((m, i) => {
              const Icon = ICON_MAP[m.icon];
              const isLast = i === milestones.length - 1;

              return (
                <div
                  key={m.id}
                  className={cn(
                    "relative pb-5",
                    isLast && "pb-0"
                  )}
                >
                  {/* Dot */}
                  <div
                    className={cn(
                      "absolute -left-6 top-1 size-[22px] rounded-full flex items-center justify-center z-10 border-2 border-background",
                      ICON_COLORS[m.icon]
                    )}
                  >
                    <Icon className="size-3" />
                  </div>

                  {/* Content */}
                  <div className="bg-muted/30 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{m.title}</p>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">
                        {m.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
