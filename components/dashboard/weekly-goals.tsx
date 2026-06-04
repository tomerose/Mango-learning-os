"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { SUBJECT_META } from "@/lib/mock-data";
import type { SubjectId } from "@/lib/types";

// Derive weekly goals from real task completion this week.
// Goals: complete N tasks per subject this week.
export function WeeklyGoals() {
  const { tasks, hydrated } = useStore();

  if (!hydrated) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>本周目标</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          加载中…
        </CardContent>
      </Card>
    );
  }

  // This week's Monday 00:00
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // Sunday=7
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  // Group tasks by subject, count done this week
  const subjectGoals: Record<
    SubjectId,
    { current: number; target: number }
  > = {
    ai: { current: 0, target: 5 },
    economics: { current: 0, target: 4 },
    finance: { current: 0, target: 4 },
    math: { current: 0, target: 5 },
    english: { current: 0, target: 3 },
  };

  for (const t of tasks) {
    if (!t.done) continue;
    // Assume task doneAt is tracked via completion time — for now count all done
    // (we'd need a doneAt timestamp field to filter by week precisely)
    if (subjectGoals[t.subject as SubjectId] !== undefined) {
      subjectGoals[t.subject as SubjectId].current += 1;
    }
  }

  const goals = (Object.keys(subjectGoals) as SubjectId[]).map((subject) => {
    const { current, target } = subjectGoals[subject];
    const meta = SUBJECT_META[subject];
    return {
      id: subject,
      subject,
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
