import { Suspense } from "react";

import { DashboardGreeting } from "@/components/dashboard/greeting";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { WeeklyGoals } from "@/components/dashboard/weekly-goals";
import { SubjectProgress } from "@/components/dashboard/subject-progress";
import { ActivityFeedLive } from "@/components/dashboard/activity-feed-live";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Dashboard · Mango Learning OS" };

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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={
        <header className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </header>
      }>
        <DashboardGreeting />
      </Suspense>

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<BlockSkeleton rows={6} />}>
            <TodayTasks />
          </Suspense>
        </div>
        <div className="flex flex-col gap-6">
          <Suspense fallback={<BlockSkeleton />}>
            <WeeklyGoals />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<BlockSkeleton rows={5} />}>
          <SubjectProgress />
        </Suspense>
        <Suspense fallback={<BlockSkeleton rows={5} />}>
          <ActivityFeedLive />
        </Suspense>
      </div>
    </div>
  );
}
