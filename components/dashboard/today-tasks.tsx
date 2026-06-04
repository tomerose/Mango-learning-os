"use client";

import { Circle, CheckCircle2, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBJECT_META } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Priority } from "@/lib/types";

const priorityVariant: Record<
  Priority,
  "destructive" | "warning" | "secondary"
> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

const priorityLabel: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export function TodayTasks() {
  const { tasks, toggleTask } = useStore();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>今日任务</CardTitle>
          <Badge variant="outline">
            {tasks.filter((t) => t.done).length}/{tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {tasks.map((task) => {
          const meta = SUBJECT_META[task.subject];
          const Icon: LucideIcon = task.done ? CheckCircle2 : Circle;
          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              aria-pressed={task.done}
              className="hover:bg-accent/50 focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors outline-none focus-visible:ring-[3px]"
            >
              <Icon
                className={
                  task.done
                    ? "text-success size-5 shrink-0"
                    : "text-muted-foreground size-5 shrink-0"
                }
              />
              <div className="min-w-0 flex-1">
                <p
                  className={
                    task.done
                      ? "text-muted-foreground truncate text-sm line-through"
                      : "truncate text-sm font-medium"
                  }
                >
                  {task.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: meta.color }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    {meta.short}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {task.dueLabel} · {task.estimatedMin}分
                  </span>
                </div>
              </div>
              {!task.done && (
                <Badge variant={priorityVariant[task.priority]}>
                  {priorityLabel[task.priority]}
                </Badge>
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
