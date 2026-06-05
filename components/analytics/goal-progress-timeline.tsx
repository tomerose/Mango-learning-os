"use client";

import * as React from "react";
import { Target, Flag, CheckCircle2, Clock, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubjects } from "@/lib/subjects";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// GoalProgressTimeline — horizontal timeline of learning goals
// with milestones, progress bars, and target dates.
// Uses pure CSS for the timeline connector.
// ─────────────────────────────────────────────────────────────

interface GoalMilestone {
  label: string;
  date: string;
  completed: boolean;
}

interface LearningGoal {
  id: string;
  title: string;
  subject: string;
  current: number;
  target: number;
  unit: string;
  startDate: string;
  targetDate: string;
  milestones: GoalMilestone[];
}

interface GoalProgressTimelineProps {
  goals: LearningGoal[];
}

export function GoalProgressTimeline({ goals }: GoalProgressTimelineProps) {
  const { getMeta } = useSubjects();
  const [expandedGoal, setExpandedGoal] = React.useState<string | null>(null);

  const toggleGoal = (id: string) => {
    setExpandedGoal((prev) => (prev === id ? null : id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <CardTitle className="text-lg">Goal Progress</CardTitle>
        </div>
        <CardDescription>
          {goals.filter((g) => g.current >= g.target).length} of {goals.length}{" "}
          goals completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No goals set yet. Create a study plan to track your progress.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {goals.map((goal) => {
              const pct = Math.min(
                100,
                Math.round((goal.current / Math.max(1, goal.target)) * 100)
              );
              const meta = getMeta(goal.subject);
              const isExpanded = expandedGoal === goal.id;
              const completedMilestones = goal.milestones.filter(
                (m) => m.completed
              ).length;

              return (
                <div
                  key={goal.id}
                  className="rounded-lg border bg-muted/20 overflow-hidden"
                >
                  {/* Goal header */}
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: meta.color,
                              color: meta.color,
                            }}
                          >
                            {meta.short}
                          </Badge>
                          {pct >= 100 && (
                            <Badge variant="success" className="text-xs">
                              Complete
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{goal.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {goal.startDate} → {goal.targetDate}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <Progress
                        value={pct}
                        className="h-2 flex-1"
                        indicatorClassName={
                          pct >= 100 ? "bg-success" : ""
                        }
                      />
                      <span className="text-xs font-mono font-medium shrink-0">
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                  </button>

                  {/* Expanded timeline */}
                  {isExpanded && (
                    <div className="border-t px-4 py-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-3">
                        Milestones ({completedMilestones}/{goal.milestones.length}
                        )
                      </p>

                      <div className="relative">
                        {goal.milestones.map((ms, i) => {
                          const isFirst = i === 0;
                          const isLast = i === goal.milestones.length - 1;

                          return (
                            <div key={i} className="flex gap-3 relative">
                              {/* Timeline connector */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={cn(
                                    "size-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                    ms.completed
                                      ? "border-success bg-success text-white"
                                      : "border-muted-foreground/30 bg-background"
                                  )}
                                >
                                  {ms.completed ? (
                                    <CheckCircle2 className="size-3.5" />
                                  ) : (
                                    <Circle className="size-3" />
                                  )}
                                </div>
                                {!isLast && (
                                  <div
                                    className={cn(
                                      "w-0.5 h-8",
                                      ms.completed
                                        ? "bg-success"
                                        : "bg-muted-foreground/20"
                                    )}
                                  />
                                )}
                              </div>

                              {/* Milestone content */}
                              <div className="pb-4 flex-1">
                                <p
                                  className={cn(
                                    "text-sm",
                                    ms.completed
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {ms.label}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="size-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {ms.date}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary footer */}
                      <div className="rounded-lg bg-muted/40 p-2.5 mt-1 text-xs text-muted-foreground">
                        {pct >= 100
                          ? "Goal achieved! Consider setting a new stretch goal."
                          : pct >= 50
                            ? "More than halfway there. Keep pushing!"
                            : "Still early. Consistent effort will get you there."}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { LearningGoal, GoalMilestone };
