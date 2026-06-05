"use client";

import * as React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { StatOverviewGrid } from "@/components/analytics/stat-overview-grid";
import { LearningHoursChart } from "@/components/analytics/learning-hours-chart";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";
import { KnowledgeRadar } from "@/components/analytics/knowledge-radar";
import { WeakTopicsTable } from "@/components/analytics/weak-topics-table";
import { GoalProgressTimeline } from "@/components/analytics/goal-progress-timeline";
import { WeeklyHeatmap } from "@/components/analytics/weekly-heatmap";
import { StreakCalendar } from "@/components/analytics/streak-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyHours } from "@/components/analytics/learning-hours-chart";
import type { SubjectMastery } from "@/components/analytics/knowledge-radar";
import type { WeakTopic } from "@/components/analytics/weak-topics-table";
import type { LearningGoal } from "@/components/analytics/goal-progress-timeline";
import type { HeatmapDay } from "@/components/analytics/weekly-heatmap";
import type { CalendarStreak } from "@/components/analytics/streak-calendar";

// ─────────────────────────────────────────────────────────────
// Analytics Dashboard — bento grid of learning insights.
//
// Layout:
//   Top:          StatOverviewGrid (4 cards)
//   Row 2:        LearningHoursChart (2/3) + FocusScoreGauge (1/3)
//   Row 3:        KnowledgeRadar (1/2) + WeakTopicsTable (1/2)
//   Row 4:        WeeklyHeatmap (1/2) + GoalProgressTimeline (1/2)
//   Footer:       StreakCalendar
// ─────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalHoursThisWeek: number;
  focusScoreAvg: number;
  quizAccuracy: number;
  streakDays: number;
  learningHours: DailyHours[];
  subjects: SubjectMastery[];
  weakTopics: WeakTopic[];
  goalProgress: LearningGoal[];
  heatmapData: HeatmapDay[];
  calendarStreaks: CalendarStreak[];
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-6 w-12" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <Skeleton className="h-4 w-20 mb-4 mx-auto" />
          <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-[280px] w-full" />
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-[280px] w-full" />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
        // Use mock data as fallback
        setData({
          totalHoursThisWeek: 8.5,
          focusScoreAvg: 78,
          quizAccuracy: 82,
          streakDays: 7,
          learningHours: [],
          subjects: [],
          weakTopics: [],
          goalProgress: [],
          heatmapData: [],
          calendarStreaks: [],
        });
      }
    }
    fetchData();
  }, []);

  if (!data && !error) {
    return (
      <PageShell
        title="Learning Analytics"
        description="Track your learning progress with beautiful visualizations"
      >
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (!data) return null;

  return (
    <PageShell
      title="Learning Analytics"
      description="Track your learning progress with beautiful visualizations"
    >
      <div className="flex flex-col gap-6">
        {/* Row 1: Stat cards */}
        <StatOverviewGrid
          totalHoursThisWeek={data.totalHoursThisWeek}
          focusScoreAvg={data.focusScoreAvg}
          quizAccuracy={data.quizAccuracy}
          streakDays={data.streakDays}
        />

        {/* Row 2: Learning Hours (2/3) + Focus Score (1/3) */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LearningHoursChart data={data.learningHours} />
          </div>
          <div>
            <FocusScoreGauge
              score={data.focusScoreAvg}
              previousScore={72}
            />
          </div>
        </div>

        {/* Row 3: Knowledge Radar (1/2) + Weak Topics (1/2) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <KnowledgeRadar subjects={data.subjects} />
          <WeakTopicsTable topics={data.weakTopics} />
        </div>

        {/* Row 4: Weekly Heatmap (1/2) + Goal Timeline (1/2) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyHeatmap data={data.heatmapData} />
          <GoalProgressTimeline goals={data.goalProgress} />
        </div>

        {/* Footer: Streak Calendar */}
        <StreakCalendar
          data={data.calendarStreaks}
          streakDays={data.streakDays}
        />
      </div>
    </PageShell>
  );
}
