"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Target, AlertTriangle, FileQuestion, Clock, Sparkles } from "lucide-react";

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
  daysLeft: number;
  readiness: number;
}

// Fixed exam schedule — stable, no random, no Date() in render
const EXAM_SCHEDULE: { subject: SubjectId; course: string; daysLeft: number }[] = [
  { subject: "math",      course: "数学分析",     daysLeft: 14 },
  { subject: "economics", course: "微观经济学",    daysLeft: 18 },
  { subject: "ai",        course: "机器学习导论",  daysLeft: 21 },
  { subject: "finance",   course: "金融学原理",    daysLeft: 25 },
  { subject: "english",   course: "雅思强化",      daysLeft: 30 },
];

export function ExamModeContent() {
  const { quizAttempts, tasks, weakAreas } = useStore();

  // Derive readiness from real data
  const upcomingExams: ExamEntry[] = EXAM_SCHEDULE.map((e) => {
    const sq = quizAttempts.filter((q) => q.subject === e.subject);
    const st = tasks.filter((t) => t.subject === e.subject);
    const quizAcc = sq.length > 0
      ? sq.reduce((a, q) => a + q.correct / q.total, 0) / sq.length : 0;
    const taskRate = st.length > 0
      ? st.filter((t) => t.done).length / st.length : 0;
    const readiness = Math.min(100, Math.round((quizAcc * 0.6 + taskRate * 0.4) * 100) || 0);
    return { ...e, readiness: Math.max(8, readiness) };
  });

  // Weakest subject for deep-link
  const weakest = weakAreas[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">考试模式</h1>
        <p className="text-muted-foreground text-sm">
          课程复习、冲刺计划、模拟测试与弱点分析 —— 把焦虑变成准备
        </p>
      </header>

      {/* Upcoming exams */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">备考概览</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {upcomingExams.map((e) => {
            const meta = SUBJECT_META[e.subject];
            return (
              <Card key={e.subject}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <span className="size-2 rounded-full" style={{ backgroundColor: meta?.color }} />
                      {e.course}
                    </span>
                    <Badge variant={e.daysLeft <= 14 ? "warning" : "secondary"}>
                      <Clock className="size-3" />{e.daysLeft}天
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">备考完成度</span>
                      <span className="tabular-nums">{e.readiness}%</span>
                    </div>
                    <Progress value={e.readiness} />
                  </div>
                  {/* 「进入冲刺」→ AI Tutor quiz tab, pre-filled with subject */}
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href={`/ai-tutor?tab=quiz&subject=${e.subject}`}>
                      进入冲刺
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick action tools — all wired to real routes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">备考工具</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              {
                icon: Target,
                label: "AI 讲解",
                desc: "概念讲解 + 举例",
                href: "/ai-tutor?tab=chat",
              },
              {
                icon: FileQuestion,
                label: "模拟测试",
                desc: "AI 生成选择题",
                href: weakest
                  ? `/ai-tutor?tab=quiz&subject=${weakest.subject}&topic=${encodeURIComponent(weakest.topic)}`
                  : "/ai-tutor?tab=quiz",
              },
              {
                icon: GraduationCap,
                label: "学习计划",
                desc: "查看冲刺路径",
                href: "/study-planner",
              },
              {
                icon: AlertTriangle,
                label: "弱点练习",
                desc: "针对薄弱点",
                href: weakest
                  ? `/ai-tutor?tab=quiz&subject=${weakest.subject}&topic=${encodeURIComponent(weakest.topic)}`
                  : "/ai-tutor?tab=quiz",
              },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.label}
                  href={t.href}
                  className="hover:bg-accent flex flex-col items-start gap-1 rounded-lg border p-3 transition-colors"
                >
                  <Icon className="text-primary size-5" />
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className="text-muted-foreground text-xs">{t.desc}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Weakness analysis — real quiz history */}
        <WeaknessAnalysis />
      </div>

      {/* Quick start quiz CTA */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
          <span className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-2xl">
            <Sparkles className="text-primary size-6" />
          </span>
          <div className="flex-1">
            <p className="font-medium">立即开始 AI 测验</p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              选择学科和主题，AI 即时生成 5-10 题选择题 + 解析
            </p>
          </div>
          <Button asChild>
            <Link href="/ai-tutor?tab=quiz">
              <Sparkles className="size-4" /> 开始测验
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
