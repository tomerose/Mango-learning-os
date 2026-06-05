"use client";

import * as React from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import { useSubjects } from "@/lib/subjects";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { seedSubjectProgress } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export function ActiveCoursesList() {
  const { subjects, getMeta } = useSubjects();
  const { mode } = useStore();

  if (subjects.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="size-5 text-primary" />
            已选课程
          </CardTitle>
          <CardDescription>你还没有添加科目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <BookOpen className="size-8 text-muted-foreground/25" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">前往知识树添加学习科目</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="size-5 text-primary" />
          已选课程
        </CardTitle>
        <CardDescription>按掌握度排序</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {subjects.map((subject) => {
            const seed = mode === "guest" ? seedSubjectProgress.find((s) => s.subject === subject.id) : null;
            const mastery = seed?.masteryPct ?? (mode === "cloud" ? 0 : Math.floor(Math.random() * 40 + 40));
            const meta = getMeta(subject.id);

            return (
              <div
                key={subject.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                  "hover:border-primary/20 hover:bg-accent/30",
                )}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.short}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{subject.label}</p>
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">
                      {mastery}%
                    </span>
                  </div>
                  <Progress value={mastery} className="h-1.5 mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
