"use client";

import * as React from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import { useSubjects } from "@/lib/subjects";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { seedSubjectProgress } from "@/lib/mock-data";

interface Props {
  embedded?: boolean;
  className?: string;
}

export function ActiveCoursesList({ embedded = false, className }: Props) {
  const { subjects, getMeta } = useSubjects();
  const { mode } = useStore();

  const headerBlock = embedded ? null : (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <GraduationCap className="size-5 text-primary" />
        已选课程
      </div>
      <p className="text-sm text-muted-foreground">按掌握度排序</p>
    </div>
  );

  const embeddedHeader = embedded ? (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
        <GraduationCap className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold leading-tight">已选课程</p>
        <p className="text-xs text-muted-foreground leading-tight">按掌握度排序</p>
      </div>
    </div>
  ) : null;

  if (subjects.length === 0) {
    const emptyContent = (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <BookOpen className="size-8 text-muted-foreground/25" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">前往知识树添加学习科目</p>
      </div>
    );
    if (embedded) {
      return (
        <div className={cn("flex flex-col gap-1", className)}>
          {embeddedHeader}
          {emptyContent}
        </div>
      );
    }
    return (
      <div className={cn("rounded-2xl surface-card p-6", className)}>
        {headerBlock}
        {emptyContent}
      </div>
    );
  }

  const listContent = (
    <div className="flex flex-col gap-2.5">
      {subjects.map((subject) => {
        const seed = mode === "guest" ? seedSubjectProgress.find((s) => s.subject === subject.id) : null;
        const mastery = seed?.masteryPct ?? (mode === "cloud" ? 0 : Math.floor(Math.random() * 40 + 40));
        const meta = getMeta(subject.id);

        return (
          <div
            key={subject.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all duration-200",
              "hover:border-primary/20 hover:bg-accent/20",
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
              <Progress value={mastery} className="h-1 mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );

  if (embedded) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {embeddedHeader}
        {listContent}
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl surface-card p-6", className)}>
      {headerBlock}
      {listContent}
    </div>
  );
}
