"use client";

import * as React from "react";
import { Target, Plus, BookOpen } from "lucide-react";
import { useSubjects } from "@/lib/subjects";
import { useStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SampleGoal {
  id: string;
  title: string;
  subject: string;
  category: "mastery" | "exam" | "habit";
  current: number;
  target: number;
  unit: string;
  deadline: string;
  status: "active" | "completed" | "paused";
}

// Sample goals when no real data exists
const SAMPLE_GOALS: SampleGoal[] = [
  {
    id: "sg1",
    title: "AI 深度学习专题达到 80% 掌握度",
    subject: "ai",
    category: "mastery",
    current: 72,
    target: 80,
    unit: "%",
    deadline: "2026-06-30",
    status: "active",
  },
  {
    id: "sg2",
    title: "完成 30 道数学证明题",
    subject: "math",
    category: "habit",
    current: 18,
    target: 30,
    unit: "problems",
    deadline: "2026-06-25",
    status: "active",
  },
  {
    id: "sg3",
    title: "雅思词汇量达到 350 词",
    subject: "english",
    category: "mastery",
    current: 220,
    target: 350,
    unit: "cards",
    deadline: "2026-07-05",
    status: "active",
  },
];

function getStatusVariant(status: SampleGoal["status"]) {
  switch (status) {
    case "active":
      return "success" as const;
    case "completed":
      return "default" as const;
    case "paused":
      return "secondary" as const;
  }
}

function getStatusLabel(status: SampleGoal["status"]) {
  switch (status) {
    case "active":
      return "进行中";
    case "completed":
      return "已完成";
    case "paused":
      return "已暂停";
  }
}

export function LearningGoalsCard() {
  const { getMeta } = useSubjects();
  const { mode } = useStore();
  // Cloud users see empty state; guest users see demo data
  const goals: SampleGoal[] = mode === "cloud" ? [] : SAMPLE_GOALS;

  if (goals.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="size-5 text-primary" />
            学习目标
          </CardTitle>
          <CardDescription>设定你的学习目标，追踪进度</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Target className="size-8 text-muted-foreground/25" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">还没有学习目标</p>
            <Button size="sm" variant="outline" asChild>
              <a href="/planner">
                <Plus className="size-3.5" />
                创建第一个目标
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="size-5 text-primary" />
          学习目标
        </CardTitle>
        <CardDescription>当前进行中的学习目标</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {goals.slice(0, 3).map((goal) => {
            const meta = getMeta(goal.subject);
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

            return (
              <div
                key={goal.id}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border p-4 transition-colors",
                  "hover:border-primary/20 hover:bg-accent/30",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.short}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meta.label} · 截止 {goal.deadline}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(goal.status)} className="shrink-0">
                    {getStatusLabel(goal.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={pct} className="flex-1 h-1.5" />
                  <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
              </div>
            );
          })}

          <Button variant="ghost" size="sm" asChild className="self-start">
            <a href="/planner">
              <BookOpen className="size-3.5" />
              查看全部目标
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
