"use client";

import * as React from "react";
import { CalendarClock, GraduationCap, ArrowRight } from "lucide-react";
import { useSubjects } from "@/lib/subjects";
import { useStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SampleExam {
  id: string;
  name: string;
  subject: string;
  date: string; // ISO date string
}

const SAMPLE_EXAMS: SampleExam[] = [
  { id: "ex1", name: "期末考试 - 微观经济学", subject: "economics", date: "2026-06-25" },
  { id: "ex2", name: "期中测验 - 线性代数", subject: "math", date: "2026-06-12" },
  { id: "ex3", name: "模拟考 - IELTS 听力", subject: "english", date: "2026-07-10" },
];

function getCountdown(targetDate: string): { days: number; label: string } {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return { days: 0, label: "已过" };
  if (days === 0) return { days: 0, label: "今天" };
  if (days === 1) return { days: 1, label: "明天" };
  if (days <= 7) return { days, label: `${days} 天后` };
  if (days <= 30) return { days, label: `${days} 天后` };
  return { days, label: `${days} 天后` };
}

function getUrgencyClass(days: number): string {
  if (days <= 3) return "text-red-500";
  if (days <= 7) return "text-orange-500";
  if (days <= 14) return "text-yellow-500";
  return "text-muted-foreground";
}

export function UpcomingExamsCard() {
  const { getMeta } = useSubjects();
  const { mode } = useStore();
  const exams = mode === "cloud" ? [] : SAMPLE_EXAMS;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarClock className="size-5 text-primary" />
          即将到来的考试
        </CardTitle>
        <CardDescription>按时间排序</CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CalendarClock className="size-8 text-muted-foreground/25" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">暂无考试安排</p>
            <Button size="sm" variant="outline" asChild>
              <a href="/exam">添加考试</a>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {exams.map((exam) => {
              const meta = getMeta(exam.subject);
              const { days, label } = getCountdown(exam.date);
              const urgencyClass = getUrgencyClass(days);
              const formattedDate = exam.date; // already ISO

              return (
                <div
                  key={exam.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                    "hover:border-primary/20 hover:bg-accent/30",
                  )}
                >
                  <div className={cn(
                    "flex flex-col items-center shrink-0 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]",
                    "bg-muted/50",
                  )}>
                    <span className={cn("text-lg font-bold leading-tight", urgencyClass)}>
                      {days > 0 ? days : "!"}
                    </span>
                    <span className={cn("text-[10px] leading-tight", urgencyClass)}>
                      {label.startsWith("已") ? "已过" : days === 0 ? "今天" : days === 1 ? "天" : "天"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{exam.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        <span
                          className="inline-block size-2 rounded-full mr-1"
                          style={{ backgroundColor: meta.color }}
                        />
                        {meta.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" asChild className="shrink-0">
                    <a href="/exam">
                      准备
                      <ArrowRight className="size-3" />
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
