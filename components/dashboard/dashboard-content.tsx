"use client";

import { Suspense } from "react";

import { DashboardGreeting } from "@/components/dashboard/greeting";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { WeeklyGoals } from "@/components/dashboard/weekly-goals";
import { SubjectProgress } from "@/components/dashboard/subject-progress";
import { ActivityFeedLive } from "@/components/dashboard/activity-feed-live";
import { BrandCard } from "@/components/dashboard/brand-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

function BlockSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl border p-6">
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// Each widget is independently wrapped so one failing widget can't take down
// the whole page — it shows a small inline error instead.
function Widget({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      <Widget>
        <Suspense
          fallback={
            <header className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </header>
          }
        >
          <DashboardGreeting />
        </Suspense>
      </Widget>

      <Widget>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          }
        >
          <StatsCards />
        </Suspense>
      </Widget>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Widget>
            <Suspense fallback={<BlockSkeleton rows={6} />}>
              <TodayTasks />
            </Suspense>
          </Widget>
        </div>
        <div className="flex flex-col gap-6">
          <Widget>
            <Suspense fallback={<BlockSkeleton />}>
              <WeeklyGoals />
            </Suspense>
          </Widget>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Widget>
          <Suspense fallback={<BlockSkeleton rows={5} />}>
            <SubjectProgress />
          </Suspense>
        </Widget>
        <Widget>
          <Suspense fallback={<BlockSkeleton rows={5} />}>
            <ActivityFeedLive />
          </Suspense>
        </Widget>
      </div>

      <Widget>
        <BrandCard />
      </Widget>
    </div>
  );
}
