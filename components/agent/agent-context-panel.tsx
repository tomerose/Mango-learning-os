"use client";

import * as React from "react";
import {
  Brain,
  Target,
  BookOpen,
  Clock,
  Database,
  TrendingDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import type { SubjectId, WeakArea } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Agent Context Panel — right sidebar showing what the agent
// knows about the user's current learning state.
// ─────────────────────────────────────────────────────────────

interface AgentContextPanelProps {
  subject: SubjectId;
  memoryCount?: number;
  className?: string;
}

function WeakAreaRow({ area }: { area: WeakArea }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="truncate font-medium">{area.topic}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <Progress
          value={area.accuracy}
          className="h-1.5 w-16"
          indicatorClassName={cn(
            area.accuracy < 40
              ? "bg-destructive"
              : area.accuracy < 70
                ? "bg-yellow-500"
                : "bg-emerald-500"
          )}
        />
        <span
          className={cn(
            "w-9 text-right tabular-nums font-mono",
            area.accuracy < 40
              ? "text-destructive"
              : area.accuracy < 70
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {area.accuracy}%
        </span>
      </div>
    </div>
  );
}

export function AgentContextPanel({
  subject,
  memoryCount = 0,
  className,
}: AgentContextPanelProps) {
  const store = useStore();
  const { getMeta } = useSubjects();

  const subjectMeta = getMeta(subject);

  // Weak areas filtered by current subject
  const subjectWeakAreas = React.useMemo(
    () => store.weakAreas.filter((w) => w.subject === subject).slice(0, 5),
    [store.weakAreas, subject]
  );

  // Recent topics studied (from quiz attempts)
  const recentTopics = React.useMemo(() => {
    const seen = new Set<string>();
    const topics: string[] = [];
    for (const qa of store.quizAttempts) {
      if (qa.subject === subject && !seen.has(qa.topic)) {
        seen.add(qa.topic);
        topics.push(qa.topic);
      }
    }
    return topics.slice(0, 5);
  }, [store.quizAttempts, subject]);

  // Active goals (undone high-priority tasks for this subject)
  const activeGoals = React.useMemo(() => {
    return store.tasks
      .filter(
        (t) =>
          !t.done &&
          t.priority === "high" &&
          (t.subject === subject || t.subject === "general")
      )
      .slice(0, 4)
      .map((t) => t.title);
  }, [store.tasks, subject]);

  // Total quiz attempts across all subjects
  const totalAttempts = store.quizAttempts.length;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Current subject */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="size-4 text-primary" />
            当前学科
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Badge
            variant="secondary"
            className="text-xs font-medium"
            style={{ borderColor: subjectMeta.color }}
          >
            <span
              className="mr-1.5 inline-block size-2 rounded-full"
              style={{ backgroundColor: subjectMeta.color }}
            />
            {subjectMeta.label}
          </Badge>
        </CardContent>
      </Card>

      {/* Weak areas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingDown className="size-4 text-destructive" />
            薄弱领域
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {subjectWeakAreas.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              暂无数据 — 完成一些测验后这里会显示薄弱点
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {subjectWeakAreas.map((area) => (
                <WeakAreaRow key={`${area.subject}::${area.topic}`} area={area} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent topics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            最近学习
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recentTopics.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              还未开始学习此学科
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {recentTopics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-[11px]">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active goals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="size-4 text-primary" />
            活跃目标
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {activeGoals.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              暂无高优先级任务
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {activeGoals.map((goal) => (
                <li
                  key={goal}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="mt-0.5 block size-1 rounded-full bg-primary shrink-0" />
                  <span className="truncate">{goal}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Stats summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="size-4 text-muted-foreground" />
            学习统计
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <p className="text-lg font-semibold tabular-nums">
                {totalAttempts}
              </p>
              <p className="text-[10px] text-muted-foreground">测验次数</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <p className="text-lg font-semibold tabular-nums">
                {store.stats.level}
              </p>
              <p className="text-[10px] text-muted-foreground">当前等级</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <p className="text-lg font-semibold tabular-nums">
                {store.stats.streakDays}
              </p>
              <p className="text-[10px] text-muted-foreground">连续天数</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <p className="text-lg font-semibold tabular-nums">
                {memoryCount}
              </p>
              <p className="text-[10px] text-muted-foreground">记忆条目</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
