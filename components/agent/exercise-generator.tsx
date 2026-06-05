"use client";

import * as React from "react";
import {
  Dumbbell,
  Loader2,
  Sparkles,
  Check,
  X,
  Lightbulb,
  SlidersHorizontal,
  Hash,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import type { SubjectId, QuizQuestion } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Exercise Generator — inline quiz generation panel.
// Difficulty slider, count selector, generate button,
// generated questions with inline answer and check.
// ─────────────────────────────────────────────────────────────

interface ExerciseGeneratorProps {
  subject: SubjectId;
  className?: string;
}

type Difficulty = "easy" | "medium" | "hard";

interface AnsweredQuestion extends QuizQuestion {
  userAnswer: number | null;
  checked: boolean;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: "简单", color: "bg-emerald-500" },
  medium: { label: "中等", color: "bg-yellow-500" },
  hard: { label: "困难", color: "bg-red-500" },
};

export function ExerciseGenerator({ subject, className }: ExerciseGeneratorProps) {
  const store = useStore();
  const { getMeta } = useSubjects();
  const subjectMeta = getMeta(subject);

  const [topic, setTopic] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");
  const [count, setCount] = React.useState(3);
  const [loading, setLoading] = React.useState(false);
  const [questions, setQuestions] = React.useState<AnsweredQuestion[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function generate() {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || loading) return;

    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic: trimmedTopic,
          count,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `请求失败 (${res.status})`);
      }

      const qs: QuizQuestion[] = data.questions ?? [];
      if (qs.length === 0) {
        throw new Error("未能生成有效题目，请换个主题或重试");
      }

      setQuestions(
        qs.map((q) => ({ ...q, userAnswer: null, checked: false }))
      );

      // Record generation as a quiz attempt (0 questions answered yet)
      // store.recordQuiz is called when user finishes checking
    } catch (err) {
      const msg = err instanceof Error ? err.message : "出错了，请重试";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(qIdx: number, optIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx && !q.checked ? { ...q, userAnswer: optIdx } : q
      )
    );
  }

  function checkAnswer(qIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, checked: true } : q))
    );
  }

  function checkAll() {
    setQuestions((prev) => prev.map((q) => ({ ...q, checked: true })));
  }

  const answeredCount = questions.filter((q) => q.checked).length;
  const correctCount = questions.filter(
    (q) => q.checked && q.userAnswer === q.answerIndex
  ).length;
  const allChecked = questions.length > 0 && answeredCount === questions.length;

  // Submit quiz results to store when all checked
  React.useEffect(() => {
    if (allChecked && questions.length > 0) {
      store.recordQuiz({
        subject,
        topic: topic.trim(),
        total: questions.length,
        correct: correctCount,
      });
    }
  }, [allChecked]);

  function handleTopicKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Controls */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          {/* Topic input */}
          <div className="flex gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleTopicKeyDown}
              placeholder={`输入主题，如"梯度下降"、"期权定价"…`}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={generate} disabled={loading || !topic.trim()}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  生成中
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-1.5" />
                  生成
                </>
              )}
            </Button>
          </div>

          {/* Difficulty + count */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Difficulty selector */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-fg-muted" />
              <Label className="text-xs text-fg-muted">难度</Label>
              <div className="flex rounded-lg border p-0.5 gap-0.5">
                {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG["easy"]][]).map(
                  ([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setDifficulty(key)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                        difficulty === key
                          ? "bg-primary text-primary-foreground"
                          : "text-fg-muted hover:bg-muted"
                      )}
                    >
                      {config.label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Count selector */}
            <div className="flex items-center gap-2">
              <Hash className="size-3.5 text-fg-muted" />
              <Label className="text-xs text-fg-muted">题数</Label>
              <div className="flex rounded-lg border p-0.5 gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium transition-colors",
                      count === n
                        ? "bg-primary text-primary-foreground"
                        : "text-fg-muted hover:bg-muted"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-xl card-card p-4 space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="h-8 w-32 rounded-lg bg-muted/50 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Summary bar */}
          {allChecked && (
            <div className="flex items-center gap-2 rounded-xl card-card px-4 py-3">
              <Dumbbell className="size-4 text-primary" />
              <span className="text-sm font-medium">
                结果：{correctCount}/{questions.length} 正确
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  correctCount === questions.length
                    ? "bg-emerald-500/10 text-emerald-600"
                    : correctCount >= questions.length / 2
                      ? "bg-yellow-500/10 text-yellow-600"
                      : "bg-red-500/10 text-red-600"
                )}
              >
                {Math.round((correctCount / questions.length) * 100)}%
              </Badge>
            </div>
          )}

          {questions.map((q, qIdx) => (
            <Card key={qIdx}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-2 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-xs font-semibold text-primary">
                    {qIdx + 1}
                  </span>
                  <span>{q.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Options */}
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.userAnswer === optIdx;
                    const isCorrect = optIdx === q.answerIndex;
                    const showResult = q.checked;

                    let optionClassName = cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      "hover:bg-accent cursor-pointer",
                      isSelected && !showResult && "border-primary bg-primary-subtle text-primary"
                    );

                    if (showResult) {
                      if (isCorrect) {
                        optionClassName = cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                          "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        );
                      } else if (isSelected && !isCorrect) {
                        optionClassName = cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                          "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
                        );
                      } else {
                        optionClassName = cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                          "opacity-50"
                        );
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => selectAnswer(qIdx, optIdx)}
                        disabled={q.checked}
                        className={optionClassName}
                      >
                        {showResult && isCorrect && (
                          <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <X className="size-3 text-red-600 dark:text-red-400" />
                        )}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action row */}
                <div className="flex items-center justify-between pt-1">
                  {!q.checked && q.userAnswer !== null && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => checkAnswer(qIdx)}
                    >
                      <Check className="size-3.5 mr-1" />
                      检查
                    </Button>
                  )}
                  {q.checked && (
                    <div className="flex items-start gap-1.5 text-xs text-fg-muted">
                      <Lightbulb className="size-3.5 shrink-0 mt-0.5 text-yellow-500" />
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Check all button */}
          {questions.some((q) => q.userAnswer !== null && !q.checked) && (
            <Button
              variant="secondary"
              onClick={checkAll}
              className="self-start"
            >
              检查全部
            </Button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && questions.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-subtle">
            <Dumbbell className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-sm font-medium">生成针对性练习</p>
            <p className="mt-1 text-xs text-fg-muted">
              输入主题，选择难度和题数，AI 会为你生成高质量的选择题
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
