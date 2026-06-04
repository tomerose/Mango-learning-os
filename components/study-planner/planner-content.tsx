"use client";

import { CalendarCheck, Plus, Target, Flag } from "lucide-react";
import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { SUBJECT_META } from "@/lib/mock-data";
import type { SubjectId, Task } from "@/lib/types";

const WEEK_DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const semesterGoals = [
  { title: "完成深度学习课程 + 1 个项目", subject: "ai" as SubjectId, pct: 65 },
  { title: "金融建模能力达到实习水平", subject: "finance" as SubjectId, pct: 48 },
  { title: "数学分析期末 90+", subject: "math" as SubjectId, pct: 72 },
  { title: "雅思模考稳定 7.0", subject: "english" as SubjectId, pct: 55 },
];

function PlanRow({ task }: { task: Task }) {
  const meta = SUBJECT_META[task.subject];
  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <span className="text-muted-foreground w-12 shrink-0 text-sm tabular-nums">
        {task.dueLabel || "—"}
      </span>
      <span
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <div className="min-w-0 flex-1">
        <p className={task.done ? "text-muted-foreground text-sm line-through" : "text-sm font-medium"}>
          {task.title}
        </p>
        <p className="text-muted-foreground text-xs">
          {meta.short} · {task.estimatedMin}min · {task.priority}
        </p>
      </div>
      {task.done && <Badge variant="success">已完成</Badge>}
    </div>
  );
}

export function StudyPlannerContent() {
  const { tasks, toggleTask } = useStore();

  // Compute derived data from live tasks
  const pendingTasks = tasks.filter((t) => !t.done);

  // Pseudo week plan: group by subject load
  const subjectLoad: Record<SubjectId, number> = { ai: 0, economics: 0, finance: 0, math: 0, english: 0 };
  for (const t of pendingTasks) subjectLoad[t.subject] += t.estimatedMin;

  const weekPlan = WEEK_DAYS.map((day, i) => {
    const subjects = Object.entries(subjectLoad)
      .filter(([, m]) => m > 0)
      .slice(0, 1 + (i % 3));
    const load = Math.min(6, Math.max(1, Math.round(
      Object.values(subjectLoad).reduce((a, b) => a + b, 0) / 60
    )));
    return {
      day,
      load: i >= 5 ? Math.max(2, load - 1) : load,
      focus: subjects.length ? SUBJECT_META[subjects[0]?.[0] as SubjectId]?.short ?? "综合" : "自由",
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">学习计划</h1>
          <p className="text-muted-foreground text-sm">
            日 / 周 / 月 / 学期四级规划 · {pendingTasks.length} 项待完成
          </p>
        </div>
        <Button size="sm" onClick={() => {}}>
          <Plus className="size-4" /> 新建计划
        </Button>
      </header>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">每日</TabsTrigger>
          <TabsTrigger value="weekly">每周</TabsTrigger>
          <TabsTrigger value="monthly">每月</TabsTrigger>
          <TabsTrigger value="semester">学期</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="size-4" /> 今日任务列表
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {tasks.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  暂无任务。前往 Dashboard 添加你的学习任务。
                </div>
              ) : (
                tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="text-left w-full"
                  >
                    <PlanRow task={task} />
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>本周负荷分布</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {weekPlan.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-sm font-medium">{d.day}</span>
                  <div className="flex-1">
                    <Progress value={(d.load / 6) * 100} />
                  </div>
                  <span className="text-muted-foreground w-28 shrink-0 text-right text-xs">
                    {d.focus} · {d.load}h
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <Target className="size-8 opacity-40" />
              <p className="text-sm">月视图日历即将上线 —— 将聚合周计划与里程碑</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semester" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="size-4" /> 本学期目标
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {semesterGoals.map((g, i) => {
                const meta = SUBJECT_META[g.subject];
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                        {g.title}
                      </span>
                      <span className="text-muted-foreground tabular-nums">{g.pct}%</span>
                    </div>
                    <Progress value={g.pct} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
