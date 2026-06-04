import { Suspense } from "react";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { WeeklyGoals } from "@/components/dashboard/weekly-goals";
import { SubjectProgress } from "@/components/dashboard/subject-progress";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
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
  const today = new Date("2026-06-04").toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">{today}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          下午好，林深 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          今天有 4 项任务待完成，先从最高优先级开始。专注，是最快的捷径。
        </p>
      </header>

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
          <ActivityFeed />
        </Suspense>
      </div>
    </div>
  );
}
