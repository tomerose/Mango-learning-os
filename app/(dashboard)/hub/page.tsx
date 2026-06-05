"use client";

import * as React from "react";
import { HubWelcome } from "@/components/hub/hub-welcome";
import { LearningGoalsCard } from "@/components/hub/learning-goals-card";
import { ActiveCoursesList } from "@/components/hub/active-courses-list";
import { UpcomingExamsCard } from "@/components/hub/upcoming-exams-card";
import { WeeklyOverviewChart } from "@/components/hub/weekly-overview-chart";
import { AiRecommendations } from "@/components/hub/ai-recommendations";
import { QuickActions } from "@/components/hub/quick-actions";
import { MagicButton } from "@/components/hub/magic-button";
import { MagicCard } from "@/components/hub/magic-card";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";

export default function HubPage() {
  const [magicOpen, setMagicOpen] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    setShowOnboarding(shouldShowOnboarding());
  }, []);

  if (showOnboarding) {
    return <MangoOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Row 1: Welcome — full width */}
      <HubWelcome />

      {/* 🥭 Mango Magic — 旋转芒果球 */}
      <MagicButton onClick={() => setMagicOpen(true)} />
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />

      {/* Row 2: Learning Goals (2/3) + Upcoming Exams (1/3) */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LearningGoalsCard />
        </div>
        <div className="lg:col-span-1">
          <UpcomingExamsCard />
        </div>
      </div>

      {/* Row 3: Weekly Chart (1/2) + Quick Actions (1/2) */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <WeeklyOverviewChart />
        <QuickActions />
      </div>

      {/* Row 4: Active Courses + AI Recommendations */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ActiveCoursesList />
        <AiRecommendations />
      </div>

      {/* Row 5: Planner CTA */}
      <a href="/planner" className="group block rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-6 hover:border-primary/50 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">📋 学习计划</h3>
            <p className="text-sm text-muted-foreground mt-1">日计划 · 周计划 · 学期计划 · AI 智能生成</p>
          </div>
          <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">打开 →</span>
        </div>
      </a>
    </div>
  );
}
