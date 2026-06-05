"use client";

import * as React from "react";
import {
  Sparkles,
  Loader2,
  Star,
  CheckCircle2,
  Lightbulb,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Project, ProjectReview } from "./project-card";

// ─── Component ─────────────────────────────────────────────────

interface AiReviewPanelProps {
  project: Project;
  onReviewComplete: (review: ProjectReview) => void;
}

export function AiReviewPanel({ project, onReviewComplete }: AiReviewPanelProps) {
  const [loading, setLoading] = React.useState(false);
  const [review, setReview] = React.useState<ProjectReview | null>(
    project.review ?? null
  );
  const [error, setError] = React.useState("");

  async function requestReview() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/project-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.name,
          description: project.description,
          submissionContent: project.submissionContent ?? "",
          learningGoals: project.learningGoals,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      setReview(data);
      onReviewComplete(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate review"
      );
    } finally {
      setLoading(false);
    }
  }

  const canReview =
    project.status === "submitted" || project.status === "completed";

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-4 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <h3 className="text-sm font-semibold">AI Project Review</h3>
        </div>

        {/* No review state */}
        {!review && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="size-14 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Trophy className="size-7 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {canReview
                  ? "Ready for AI Review"
                  : "Submit your project first"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {canReview
                  ? "Get detailed feedback on correctness, completeness, creativity, and best practices."
                  : "Complete and submit your work in the Submit tab, then request an AI review."}
              </p>
            </div>
            <Button
              onClick={requestReview}
              disabled={loading || !canReview}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" /> Request Review
                </>
              )}
            </Button>
            {error && (
              <p className="text-destructive text-xs">{error}</p>
            )}
          </div>
        )}

        {/* Review result */}
        {review && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
            {/* Scores */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2.5">
                Evaluation Scores
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    { key: "correctness", label: "Correctness", icon: CheckCircle2, color: "text-emerald-500" },
                    { key: "completeness", label: "Completeness", icon: CheckCircle2, color: "text-blue-500" },
                    { key: "creativity", label: "Creativity", icon: Lightbulb, color: "text-amber-500" },
                    { key: "bestPractices", label: "Best Practices", icon: Star, color: "text-purple-500" },
                  ] as const
                ).map(({ key, label, icon: Icon, color }) => {
                  const score = review.scores[key as keyof typeof review.scores];
                  return (
                    <div
                      key={key}
                      className="bg-muted/30 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className={cn("size-3.5", color)} />
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-end gap-1.5">
                        <span className="text-xl font-bold tabular-nums">
                          {score}
                        </span>
                        <span className="text-xs text-muted-foreground/50 mb-0.5">
                          /10
                        </span>
                      </div>
                      <Progress
                        value={score * 10}
                        className="h-1 mt-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall score */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Overall Score</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {Math.round(
                    (review.scores.correctness +
                      review.scores.completeness +
                      review.scores.creativity +
                      review.scores.bestPractices) /
                      4
                  )}
                  /10
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Suggestions
              </p>
              <div className="flex flex-col gap-1.5">
                {review.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-muted/20 rounded-lg p-2.5"
                  >
                    <Lightbulb className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
              <p className="text-xs font-medium text-primary mb-1">
                Summary
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {review.summary}
              </p>
            </div>

            {/* Regenerate button */}
            <Button
              variant="outline"
              size="sm"
              onClick={requestReview}
              disabled={loading}
              className="rounded-xl text-xs"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <Sparkles className="size-3.5 mr-1.5" />
              )}
              Regenerate Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
