"use client";

import {
  Trophy,
  FileText,
  BookOpen,
  Brain,
  PencilLine,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { SUBJECT_META } from "@/lib/mock-data";
import type { ActivityEvent, SubjectId } from "@/lib/types";

const kindMeta: Record<
  ActivityEvent["kind"],
  { icon: LucideIcon; color: string }
> = {
  achievement: { icon: Trophy, color: "var(--chart-1)" },
  quiz: { icon: Brain, color: "var(--chart-4)" },
  note: { icon: FileText, color: "var(--chart-2)" },
  study: { icon: BookOpen, color: "var(--chart-5)" },
  reflection: { icon: PencilLine, color: "var(--chart-3)" },
};

export function ActivityFeedLive() {
  const { notes, reflections, quizAttempts, tasks, hydrated } = useStore();

  if (!hydrated) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>近期动态</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          加载中…
        </CardContent>
      </Card>
    );
  }

  // Derive activity feed from live data
  const events: (ActivityEvent & { subject?: SubjectId })[] = [];

  // Recent quizzes
  for (const q of quizAttempts.slice(-3).reverse()) {
    events.push({
      id: q.id,
      kind: "quiz",
      label: `完成「${q.subject}」测验，正确率 ${Math.round((q.correct / q.total) * 100)}%`,
      subject: q.subject,
      timeLabel: q.createdAt ? new Date(q.createdAt).toLocaleDateString("zh-CN") : "最近",
    });
  }

  // Latest notes
  for (const n of notes.slice(0, 3)) {
    events.push({
      id: n.id,
      kind: "note",
      label: `新建笔记《${n.title}》`,
      subject: n.subject,
      timeLabel: n.updatedLabel || "最近",
    });
  }

  // Latest reflections
  for (const r of reflections.slice(0, 2)) {
    events.push({
      id: r.id,
      kind: "reflection",
      label: `提交反思：${r.body.slice(0, 30)}…`,
      timeLabel: r.dateLabel || "最近",
    });
  }

  // Recent completed tasks
  const doneTasks = tasks.filter((t) => t.done).slice(-2);
  for (const t of doneTasks) {
    events.push({
      id: t.id,
      kind: "study",
      label: `完成学习任务「${t.title}」`,
      subject: t.subject,
      timeLabel: "今天",
    });
  }

  // Sort by recency (quizzes newest first, then notes, etc.)
  // and limit to 8 events
  const displayEvents = events.slice(0, 8);

  if (displayEvents.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>近期动态</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm">
          <BookOpen className="size-6 opacity-40" />
          <p>还没有活动记录</p>
          <p className="text-xs">开始学习后，这里会显示你的动态</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>近期动态</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative flex flex-col gap-4">
          {displayEvents.map((e, i) => {
            const meta = kindMeta[e.kind];
            const Icon = meta.icon;
            return (
              <li key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${meta.color} 15%, transparent)`,
                    }}
                  >
                    <Icon className="size-4" style={{ color: meta.color }} />
                  </span>
                  {i < displayEvents.length - 1 && (
                    <span className="bg-border mt-1 w-px flex-1" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="text-sm leading-snug">{e.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {e.subject ? `${SUBJECT_META[e.subject].short} · ` : ""}
                    {e.timeLabel}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
