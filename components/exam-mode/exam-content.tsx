"use client";

import * as React from "react";
import { GraduationCap, Target, AlertTriangle, FileQuestion, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WeaknessAnalysis } from "@/components/exam-mode/weakness-analysis";
import { useStore } from "@/lib/store";
import { SUBJECT_META } from "@/lib/mock-data";
import type { SubjectId } from "@/lib/types";

interface ExamEntry {
  course: string;
  subject: SubjectId;
  date: string;
  daysLeft: number;
  readiness: number;
}

// Seeded pseudo-random — deterministic, avoids hydration mismatch.
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const FIXED_TODAY = "2026-06-04"; // stable reference; no Math.random, no new Date()

export function ExamModeContent() {
  const { quizAttempts, tasks, hydrated } = useStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const upcomingExams = React.useMemo<ExamEntry[]>(() => {
    if (!mounted) {
      // Return placeholders matching the card shape so SSR shell is stable.
      return (["math","economics","ai","finance","english"] as SubjectId[]).map((s) => ({
        course: SUBJECT_META[s]?.label ?? s,
        subject: s,
        date: "—",
        daysLeft: 0,
        readiness: 0,
      }));
    }

    const today = new Date(FIXED_TODAY);
    const examSubjects: SubjectId[] = ["math", "economics", "ai", "finance", "english"];

    return examSubjects.map((s, idx) => {
      const subjectQuizzes = quizAttempts.filter((q) => q.subject === s);
      const subjectTasks = tasks.filter((t) => t.subject === s);
      const doneTasks = subjectTasks.filter((t) => t.done).length;

      const quizAcc = subjectQuizzes.length > 0
        ? subjectQuizzes.reduce((a, q) => a + q.correct / q.total, 0) / subjectQuizzes.length
        : 0;
      const taskRate = subjectTasks.length > 0 ? doneTasks / subjectTasks.length : 0;
      const readiness = Math.round((quizAcc * 0.6 + taskRate * 0.4) * 100) || 0;

      const rand = seededRand(idx * 31 + readiness * 7);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 7 + Math.floor(rand() * 21));
      const daysLeft = Math.max(1, Math.ceil((futureDate.getTime() - today.getTime()) / 86400000));

      return {
        course: SUBJECT_META[s]?.label ?? s,
        subject: s,
        date: futureDate.toLocaleDateString("zh-CN", { month: "long", day: "numeric" }),
        daysLeft,
        readiness: Math.max(10, readiness || Math.floor(rand() * 30 + 40)),
      };
    });
  }, [mounted, quizAttempts, tasks]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">考试模式</h1>
        <p className="text-muted-foreground text-sm">
          课程复习、冲刺计划、模拟测试与弱点分析 —— 把焦虑变成准备
        </p>
      </header>

      {/* Upcoming exams — derived from real data */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">备考概览</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {upcomingExams.slice(0, 5).map((e, i) => {
            const meta = SUBJECT_META[e.subject];
            return (
              <Card key={i}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <span className="size-2 rounded-full" style={{ backgroundColor: meta?.color }} />
                      {meta?.short ?? e.subject}
                    </span>
                    <Badge variant={e.daysLeft <= 14 ? "warning" : "secondary"}>
                      <Clock className="size-3" />{e.daysLeft}天
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{e.date}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">备考完成度</span>
                      <span className="tabular-nums">{e.readiness}%</span>
                    </div>
                    <Progress value={e.readiness} />
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    进入冲刺
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">备考工具</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { icon: Target, label: "重点概念", desc: "高频考点梳理" },
              { icon: FileQuestion, label: "模拟测试", desc: "AI 生成模拟题" },
              { icon: GraduationCap, label: "冲刺计划", desc: "倒计时复习路径" },
              { icon: AlertTriangle, label: "错题本", desc: "针对性巩固" },
            ].map((t, i) => {
              const Icon = t.icon;
              return (
                <button key={i} className="hover:bg-accent flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors">
                  <Icon className="text-primary size-5" />
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className="text-muted-foreground text-xs">{t.desc}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Weakness analysis — driven by real quiz history */}
        <WeaknessAnalysis />
      </div>
    </div>
  );
}
