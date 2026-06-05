"use client";

import * as React from "react";
import {
  TrendingUp,
  Target,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSubjects } from "@/lib/subjects";

// ─────────────────────────────────────────────────────────────
// PredictedTopics — ordered list of predicted high-frequency
// exam topics with confidence levels, subject badges, and
// "Study this" navigation buttons.
// ─────────────────────────────────────────────────────────────

interface PredictedTopic {
  topic: string;
  subject: string;
  confidence: number; // 0-100
  reason: string;
}

interface PredictedTopicsProps {
  topics: PredictedTopic[];
  onStudyTopic?: (topic: PredictedTopic) => void;
}

function confidenceColor(pct: number): string {
  if (pct >= 80) return "text-success";
  if (pct >= 50) return "text-yellow-500";
  return "text-destructive";
}

function confidenceBg(pct: number): string {
  if (pct >= 80) return "bg-success/10 border-success/20";
  if (pct >= 50) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-destructive/10 border-destructive/20";
}

export function PredictedTopics({
  topics,
  onStudyTopic,
}: PredictedTopicsProps) {
  const { getMeta } = useSubjects();
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());

  const toggleExpanded = (i: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const sorted = React.useMemo(
    () => [...topics].sort((a, b) => b.confidence - a.confidence),
    [topics]
  );

  const avgConfidence =
    topics.length > 0
      ? Math.round(
          topics.reduce((s, t) => s + t.confidence, 0) / topics.length
        )
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          <CardTitle className="text-lg">Predicted Topics</CardTitle>
        </div>
        <CardDescription>
          AI predicts these topics are most likely to appear on your exam.
          Average confidence: {avgConfidence}%
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No predictions yet. Generate an exam package to see topic
            predictions.
          </p>
        )}

        {sorted.map((topic, i) => {
          const expanded = expandedIds.has(i);
          const meta = getMeta(topic.subject);

          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border p-4 transition-all",
                topic.confidence >= 80 && "border-l-4 border-l-success",
                topic.confidence >= 50 &&
                  topic.confidence < 80 &&
                  "border-l-4 border-l-yellow-500",
                topic.confidence < 50 && "border-l-4 border-l-destructive"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground">
                      #{i + 1}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: meta.color, color: meta.color }}
                    >
                      {meta.short}
                    </Badge>
                    <span
                      className={cn(
                        "text-xs font-bold font-mono tabular-nums",
                        confidenceColor(topic.confidence)
                      )}
                    >
                      {topic.confidence}%
                    </span>
                  </div>
                  <p className="text-sm font-medium">{topic.topic}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={topic.confidence}
                      className="h-1.5 flex-1 max-w-[120px]"
                      indicatorClassName={
                        topic.confidence >= 80
                          ? "bg-success"
                          : topic.confidence >= 50
                            ? "bg-yellow-500"
                            : "bg-destructive"
                      }
                    />
                    <span className="text-[10px] text-muted-foreground">
                      confidence
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleExpanded(i)}
                  >
                    {expanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStudyTopic?.(topic)}
                  >
                    <Target className="size-3.5" />
                    Study
                  </Button>
                </div>
              </div>

              {expanded && (
                <div
                  className={cn(
                    "mt-3 rounded-lg p-3 text-sm",
                    confidenceBg(topic.confidence)
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="size-3.5" />
                    <span className="text-xs font-semibold">Why this topic?</span>
                  </div>
                  <p className="text-muted-foreground">{topic.reason}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary stats */}
        {sorted.length > 0 && (
          <div className="rounded-lg bg-muted/30 p-3 mt-1">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-success">
                  {sorted.filter((t) => t.confidence >= 80).length}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  High (&ge;80%)
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-500">
                  {sorted.filter((t) => t.confidence >= 50 && t.confidence < 80)
                    .length}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Medium (50-79%)
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-destructive">
                  {sorted.filter((t) => t.confidence < 50).length}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Low (&lt;50%)
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { PredictedTopic };
