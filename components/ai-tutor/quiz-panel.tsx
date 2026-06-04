"use client";

import * as React from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { SUBJECTS, type SubjectId } from "@/lib/navigation";
import type { QuizQuestion } from "@/lib/types";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "简单" },
  { id: "medium", label: "中等" },
  { id: "hard", label: "困难" },
];

interface QuizPanelProps {
  // Prefill from the Exam Mode "生成针对性练习" deep link.
  initialSubject?: SubjectId;
  initialTopic?: string;
}

export function QuizPanel({ initialSubject, initialTopic }: QuizPanelProps = {}) {
  const { recordQuiz } = useStore();
  const [subject, setSubject] = React.useState<SubjectId>(
    initialSubject ?? "ai"
  );
  const [topic, setTopic] = React.useState(initialTopic ?? "");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitted, setSubmitted] = React.useState(false);

  async function generate() {
    const t = topic.trim();
    if (!t || loading) return;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic: t, count: 5, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
      setQuestions(data.questions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  const score = submitted
    ? questions.reduce(
        (acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0),
        0
      )
    : 0;
  const allAnswered =
    questions.length > 0 && Object.keys(answers).length === questions.length;

  function handleSubmit() {
    if (!allAnswered) return;
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0),
      0
    );
    setSubmitted(true);
    recordQuiz({ subject, topic: topic.trim(), total: questions.length, correct });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="bg-card flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubject(s.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                subject === s.id
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="输入主题，如「梯度下降」「价格弹性」"
            className="flex-1"
            disabled={loading}
          />
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  difficulty === d.id
                    ? "border-transparent bg-secondary text-secondary-foreground"
                    : "hover:bg-accent text-muted-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={generate} disabled={loading || !topic.trim()}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> 生成中…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> 生成测验
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && questions.length === 0 && !error && (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center">
          <span className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
            <Sparkles className="text-primary size-6" />
          </span>
          <p className="text-sm">选择学科、输入主题，AI 即时生成针对性测验</p>
        </div>
      )}

      {/* Score banner */}
      {submitted && (
        <div className="bg-card flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="text-sm font-medium">
              得分 {score}/{questions.length}
            </p>
            <p className="text-muted-foreground text-xs">
              正确率 {Math.round((score / questions.length) * 100)}%
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            <RotateCcw className="size-4" /> 重做
          </Button>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qi) => (
        <div key={qi} className="bg-card flex flex-col gap-3 rounded-xl border p-4">
          <p className="text-sm font-medium">
            {qi + 1}. {q.question}
          </p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const isCorrect = oi === q.answerIndex;
              const showResult = submitted;
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    !showResult && chosen && "border-primary bg-primary/5",
                    !showResult && !chosen && "hover:bg-accent",
                    showResult && isCorrect && "border-success bg-success/10",
                    showResult &&
                      chosen &&
                      !isCorrect &&
                      "border-destructive bg-destructive/10"
                  )}
                >
                  <span className="flex-1">{opt}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="text-success size-4 shrink-0" />
                  )}
                  {showResult && chosen && !isCorrect && (
                    <XCircle className="text-destructive size-4 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <Badge variant="info" className="mb-1.5">
                解析
              </Badge>
              <p className="text-muted-foreground leading-relaxed">
                {q.explanation}
              </p>
            </div>
          )}
        </div>
      ))}

      {questions.length > 0 && !submitted && (
        <Button onClick={handleSubmit} disabled={!allAnswered}>
          {allAnswered ? "提交答案" : `还有 ${questions.length - Object.keys(answers).length} 题未作答`}
        </Button>
      )}
    </div>
  );
}
