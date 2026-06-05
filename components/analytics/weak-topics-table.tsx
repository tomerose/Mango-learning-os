"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSubjects } from "@/lib/subjects";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// WeakTopicsTable — sortable table of weak areas with subject,
// accuracy, attempts, trend, and navigation to knowledge tree.
// ─────────────────────────────────────────────────────────────

interface WeakTopic {
  subject: string;
  topic: string;
  accuracy: number; // 0-100
  attempts: number;
  trend?: "up" | "down" | "flat";
}

interface WeakTopicsTableProps {
  topics: WeakTopic[];
}

type SortKey = "accuracy" | "attempts" | "topic";
type SortDir = "asc" | "desc";

export function WeakTopicsTable({ topics }: WeakTopicsTableProps) {
  const router = useRouter();
  const { getMeta } = useSubjects();
  const [sortKey, setSortKey] = React.useState<SortKey>("accuracy");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "accuracy" ? "asc" : "desc");
    }
  };

  const sorted = React.useMemo(() => {
    return [...topics].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "accuracy") cmp = a.accuracy - b.accuracy;
      else if (sortKey === "attempts") cmp = a.attempts - b.attempts;
      else cmp = a.topic.localeCompare(b.topic);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [topics, sortKey, sortDir]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="size-3 opacity-30" />;
    return (
      <ArrowUpDown
        className={cn("size-3", sortKey === column && "opacity-100")}
      />
    );
  };

  const avgAccuracy =
    topics.length > 0
      ? Math.round(
          topics.reduce((s, t) => s + t.accuracy, 0) / topics.length
        )
      : 0;

  const needsWork = topics.filter((t) => t.accuracy < 50).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-yellow-500" />
          <CardTitle className="text-lg">Weak Topics</CardTitle>
        </div>
        <CardDescription>
          {needsWork} topic{needsWork !== 1 ? "s" : ""} need attention · Avg
          accuracy: {avgAccuracy}%
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No quiz data yet. Complete some quizzes to identify weak areas.
          </p>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_60px_60px_40px] gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
              <button
                className="flex items-center gap-1 hover:text-foreground text-left"
                onClick={() => handleSort("topic")}
              >
                Topic
                <SortIcon column="topic" />
              </button>
              <button
                className="flex items-center gap-1 hover:text-foreground text-center"
                onClick={() => handleSort("accuracy")}
              >
                Accuracy
                <SortIcon column="accuracy" />
              </button>
              <button
                className="flex items-center gap-1 hover:text-foreground text-center"
                onClick={() => handleSort("attempts")}
              >
                Attempts
                <SortIcon column="attempts" />
              </button>
              <span className="text-center">Trend</span>
              <span className="sr-only">Action</span>
            </div>

            {/* Table rows */}
            <div className="max-h-[320px] overflow-y-auto space-y-1">
              {sorted.map((topic) => {
                const meta = getMeta(topic.subject);
                const TrendIcon =
                  topic.trend === "up"
                    ? TrendingUp
                    : topic.trend === "down"
                      ? TrendingDown
                      : Minus;
                const trendColor =
                  topic.trend === "up"
                    ? "text-success"
                    : topic.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground";

                const barColor =
                  topic.accuracy >= 80
                    ? "bg-success"
                    : topic.accuracy >= 50
                      ? "bg-yellow-500"
                      : "bg-destructive";

                return (
                  <div
                    key={`${topic.subject}-${topic.topic}`}
                    className="grid grid-cols-[1fr_80px_60px_60px_40px] gap-2 items-center rounded-md px-2 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                          style={{
                            borderColor: meta.color,
                            color: meta.color,
                          }}
                        >
                          {meta.short}
                        </Badge>
                      </div>
                      <p className="text-sm truncate">{topic.topic}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Progress
                        value={topic.accuracy}
                        className="h-1.5 flex-1"
                        indicatorClassName={barColor}
                      />
                      <span className="text-xs font-mono font-medium w-8 text-right">
                        {topic.accuracy}%
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground text-center font-mono">
                      {topic.attempts}
                    </span>

                    <div className={cn("flex justify-center", trendColor)}>
                      <TrendIcon className="size-3.5" />
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                          router.push(`/knowledge-tree?topic=${encodeURIComponent(topic.topic)}`);
                        }}
                        title="Study this topic"
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export type { WeakTopic };
