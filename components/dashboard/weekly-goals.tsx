"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { SUBJECT_META } from "@/lib/mock-data";

// Derive weekly goals from real task completion this week.
// Goals: complete N tasks per subject this week.
export function WeeklyGoals() {
  const { tasks, hydrated } = useStore();
  const { subjects } = useSubjects();

  if (!hydrated) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>本周目标</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground text-sm">加载中…</CardContent>
      </Card>
    );
  }

  // Build dynamic goals from registered subjects
  const subjectGoals: Record<string, { current: number; target: number }> = {};
  for (const s of subjects) {
    subjectGoals[s.id] = { current: 0, target: Math.max(2, Math.floor(6 / subjects.length) + s.id.length % 3) };
  }

  for (const t of tasks) {
    if (!t.done) continue;
    if (subjectGoals[t.subject] !== undefined) {
      subjectGoals[t.subject].current += 1;
    }
  }

  const goals = subjects.map((s) => {
    const { current, target } = subjectGoals[s.id];
    const meta = SUBJECT_META[s.id];
    return {
      id: s.id,
      subject: s.id,
      title: `完成 ${meta.label} 任务`,
      current,
      target,
      unit: "项",
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>本周目标</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {goals.map((goal) => {
          const meta = SUBJECT_META[goal.subject];
          const pct = Math.min(
            100,
            Math.round((goal.current / goal.target) * 100)
          );
          return (
            <div key={goal.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {goal.title}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {goal.current}/{goal.target} {goal.unit}
                </span>
              </div>
              <Progress value={pct} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
