"use client";

import * as React from "react";
import { Play, CheckCircle2, XCircle, RotateCcw, ArrowRight, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { ExamQuestion, ExamResultDetail } from "@/lib/types";

interface Props {
  questions: ExamQuestion[];
  onSubmit: (answers: { id: string; question: string; type: string; userAnswer: string; correctAnswer: string }[]) => Promise<{
    score: number; total: number; percentage: number; details: ExamResultDetail[];
  } | null>;
  onBack: () => void;
}

export function ExercisePlayer({ questions, onSubmit, onBack }: Props) {
  const TOTAL = questions.length;

  // ── State machine: "idle" → "playing" → "submitted"
  const [phase, setPhase] = React.useState<"idle" | "playing" | "submitted">("playing");
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ score: number; total: number; percentage: number; details: ExamResultDetail[] } | null>(null);

  const q = questions[currentIdx];
  const answered = Object.keys(answers).length;
  const allAnswered = answered === TOTAL;

  function setAnswer(idx: number, val: string) {
    setAnswers(a => ({ ...a, [idx]: val }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = questions.map((qi, i) => ({
      id: qi.id, question: qi.question, type: qi.type,
      userAnswer: answers[i] ?? "",
      correctAnswer: qi.answer,
    }));
    const res = await onSubmit(payload);
    if (res) {
      setResult(res);
    }
    setPhase("submitted");
    setSubmitting(false);
  }

  function retryIncorrect() {
    if (!result) return;
    const wrongIds = new Set(result.details.filter(d => !d.isCorrect).map(d => d.questionId));
    const newAnswers: Record<number, string> = {};
    questions.forEach((qi, i) => { if (wrongIds.has(qi.id)) newAnswers[i] = ""; });
    setAnswers(newAnswers);
    setResult(null);
    setCurrentIdx(0);
    setPhase("playing");
  }

  // ── Submitted state: results overview ────────────────────
  if (phase === "submitted" && result) {
    return (
      <div className="flex flex-col gap-4">
        {/* Score banner */}
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Trophy className={`size-10 ${result.percentage >= 80 ? "text-warning" : result.percentage >= 50 ? "text-info" : "text-destructive"}`} />
            <div>
              <p className="text-2xl font-bold tabular-nums">{result.score} / {result.total}</p>
              <p className="text-muted-foreground text-sm">正确率 {result.percentage}%</p>
            </div>
            <Progress value={result.percentage} className="w-48" />
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={onBack}><RotateCcw className="size-4" />返回题库</Button>
              <Button onClick={retryIncorrect} disabled={result.percentage === 100}>
                <Play className="size-4" /> 重做错题
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Per-question review */}
        {result.details.map((d, i) => (
          <Card key={i} className={d.isCorrect ? "border-success/30" : "border-destructive/30"}>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium flex-1">{i + 1}. {d.question}</p>
                <Badge variant={d.isCorrect ? "success" : "destructive"} className="shrink-0">
                  {d.isCorrect ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                  {d.points}/{d.maxPoints}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">你的答案：</span><span className={d.isCorrect ? "text-success" : "text-destructive"}>{d.userAnswer || "(未作答)"}</span></div>
                <div><span className="text-muted-foreground">正确答案：</span><span className="text-success">{d.correctAnswer}</span></div>
              </div>
              {d.feedback && <p className="text-muted-foreground text-xs bg-muted/50 rounded-md px-2 py-1.5">{d.feedback}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ── Playing state: single question ────────────────────────
  if (!q) return <p className="text-muted-foreground text-sm">没有题目。</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>第 {currentIdx + 1} / {TOTAL} 题</span>
        <span>{answered} 已答</span>
      </div>
      <Progress value={((currentIdx + 1) / TOTAL) * 100} />

      {/* Question card */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{{ mcq: "选择题", fill_blank: "填空题", problem: "解答题" }[q.type]}</Badge>
            <Badge variant="secondary" className="text-[10px]">{{ easy: "简单", medium: "中等", hard: "困难" }[q.difficulty]}</Badge>
            <span className="text-muted-foreground text-[11px]">{q.topic || q.subject}</span>
          </div>

          <p className="text-sm font-medium leading-relaxed">{currentIdx + 1}. {q.question}</p>

          {/* MCQ options */}
          {q.type === "mcq" && q.options.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              {q.options.map((opt, oi) => {
                const chosen = answers[currentIdx] === opt;
                return (
                  <button key={oi}
                    onClick={() => setAnswer(currentIdx, opt)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      chosen ? "border-primary bg-primary/5 font-medium" : "hover:bg-accent"
                    }`}>
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                      chosen ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}>{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill-blank / Problem textarea */}
          {(q.type === "fill_blank" || q.type === "problem") && (
            <Textarea
              value={answers[currentIdx] ?? ""}
              onChange={e => setAnswer(currentIdx, e.target.value)}
              placeholder={q.type === "fill_blank" ? "输入你的答案…" : "写出你的解答过程或最终答案…"}
              className="min-h-24 text-sm"
              autoFocus
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack} disabled={submitting}>← 返回题库</Button>
        <div className="flex gap-2">
          {currentIdx > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCurrentIdx(i => i - 1)} disabled={submitting}>
              上一题
            </Button>
          )}
          {currentIdx < TOTAL - 1 ? (
            <Button size="sm" onClick={() => setCurrentIdx(i => i + 1)} disabled={submitting}>
              下一题 <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={submitting || !allAnswered}>
              {submitting ? "提交中…" : `提交答案 (${answered}/${TOTAL})`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
