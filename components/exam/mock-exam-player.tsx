"use client";

import * as React from "react";
import {
  Timer,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

// ─────────────────────────────────────────────────────────────
// MockExamPlayer — timed full-exam simulation.
// All questions shown at once (scrollable), countdown timer,
// auto-submit on time expiration, instant scoring after submit.
// ─────────────────────────────────────────────────────────────

interface MockQuestion {
  id: string;
  type: "mcq" | "fill_blank" | "problem";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

interface MockExamPlayerProps {
  questions: MockQuestion[];
  subject: string;
  durationMinutes: number;
  onFinish: (score: ExamScore) => void;
}

interface ExamScore {
  total: number;
  correct: number;
  percentage: number;
  answers: ExamAnswer[];
}

interface ExamAnswer {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export function MockExamPlayer({
  questions,
  subject,
  durationMinutes,
  onFinish,
}: MockExamPlayerProps) {
  const { recordQuiz } = useStore();
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = React.useState(totalSeconds);
  const [answers, setAnswers] = React.useState<Map<string, string>>(new Map());
  const [submitted, setSubmitted] = React.useState(false);
  const [score, setScore] = React.useState<ExamScore | null>(null);
  const [expandedExplanations, setExpandedExplanations] = React.useState<
    Set<string>
  >(new Set());
  const [timeWarning, setTimeWarning] = React.useState(false);

  // Timer
  React.useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 61 && !timeWarning) {
          setTimeWarning(true);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, submitted, timeWarning]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pctLeft = (timeLeft / totalSeconds) * 100;

  const setAnswer = (questionId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, value);
      return next;
    });
  };

  const getAnswer = (questionId: string): string => {
    return answers.get(questionId) ?? "";
  };

  const answeredCount = React.useMemo(
    () =>
      questions.filter((q) => {
        const a = answers.get(q.id);
        return a && a.trim().length > 0;
      }).length,
    [answers, questions]
  );

  const handleSubmit = () => {
    if (submitted) return;

    const examAnswers: ExamAnswer[] = questions.map((q) => {
      const userAnswer = answers.get(q.id) ?? "";
      const isCorrect =
        q.type === "mcq"
          ? userAnswer.trim().toLowerCase() ===
            q.answer.trim().toLowerCase()
          : q.type === "fill_blank"
            ? userAnswer.trim().toLowerCase() ===
              q.answer.trim().toLowerCase()
            : userAnswer.trim().length > 10;

      return {
        questionId: q.id,
        question: q.question,
        userAnswer: userAnswer.trim(),
        correctAnswer: q.answer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const correct = examAnswers.filter((a) => a.isCorrect).length;
    const percentage =
      questions.length > 0
        ? Math.round((correct / questions.length) * 100)
        : 0;

    const result: ExamScore = {
      total: questions.length,
      correct,
      percentage,
      answers: examAnswers,
    };

    setScore(result);
    setSubmitted(true);

    // Record in store for analytics
    recordQuiz({
      subject,
      topic: `Mock Exam — ${subject}`,
      total: questions.length,
      correct,
    });

    onFinish(result);
  };

  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Score screen after submission
  if (submitted && score) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {/* Score summary */}
        <Card>
          <CardHeader className="text-center">
            <Trophy className="size-14 text-yellow-500 mx-auto" />
            <CardTitle className="text-2xl mt-2">Mock Exam Complete</CardTitle>
            <CardDescription>
              {subject} · {durationMinutes} minutes · {questions.length}{" "}
              questions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex gap-8">
              <div className="text-center">
                <p
                  className={cn(
                    "text-4xl font-bold",
                    score.percentage >= 80
                      ? "text-success"
                      : score.percentage >= 50
                        ? "text-yellow-500"
                        : "text-destructive"
                  )}
                >
                  {score.percentage}%
                </p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-success">
                  {score.correct}
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-destructive">
                  {score.total - score.correct}
                </p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>

            <Progress
              value={score.percentage}
              className="h-2 w-full max-w-sm"
              indicatorClassName={
                score.percentage >= 80
                  ? "bg-success"
                  : score.percentage >= 50
                    ? "bg-yellow-500"
                    : "bg-destructive"
              }
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const incorrectIds = score.answers
                    .filter((a) => !a.isCorrect)
                    .map((a) => a.questionId);
                  setExpandedExplanations(new Set(incorrectIds));
                }}
              >
                <AlertTriangle className="size-4" />
                Show All Explanations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer review */}
        <p className="text-sm font-medium">Answer Review</p>
        <div className="flex flex-col gap-3">
          {score.answers.map((ans, i) => {
            const q = questions.find((q) => q.id === ans.questionId);
            if (!q) return null;
            const expanded = expandedExplanations.has(ans.questionId);

            return (
              <Card
                key={ans.questionId}
                className={cn(
                  "border-l-4",
                  ans.isCorrect
                    ? "border-l-success"
                    : "border-l-destructive"
                )}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {ans.isCorrect ? (
                        <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Q{i + 1}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {q.topic}
                          </Badge>
                          <Badge
                            variant={
                              q.difficulty === "easy"
                                ? "success"
                                : q.difficulty === "medium"
                                  ? "warning"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {q.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{q.question}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 px-4 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="font-semibold text-muted-foreground mb-0.5">
                        Your Answer
                      </p>
                      <p
                        className={
                          ans.isCorrect ? "text-success" : "text-destructive"
                        }
                      >
                        {ans.userAnswer || "(No answer)"}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="font-semibold text-muted-foreground mb-0.5">
                        Correct Answer
                      </p>
                      <p className="text-success">{ans.correctAnswer}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExplanation(ans.questionId)}
                    className="flex items-center gap-1.5 text-xs text-info hover:underline"
                  >
                    <Lightbulb className="size-3.5" />
                    {expanded ? "Hide" : "Show"} Explanation
                  </button>

                  {expanded && (
                    <div className="rounded-lg bg-info/10 border border-info/20 p-2.5">
                      <p className="text-xs">{ans.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Exam screen
  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {/* Timer + progress */}
      <Card className="sticky top-0 z-10">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Timer
                className={cn(
                  "size-5",
                  timeWarning ? "text-destructive animate-pulse" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-lg font-mono font-bold tabular-nums",
                  timeWarning ? "text-destructive" : ""
                )}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <Progress
              value={pctLeft}
              className={cn(
                "h-2 flex-1",
                timeWarning && "[&>span]:bg-destructive"
              )}
            />
            <span className="text-xs text-muted-foreground shrink-0">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <Card key={q.id} id={`q-${q.id}`}>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-muted-foreground">
                  Q{i + 1}
                </span>
                <Badge variant="outline" className="text-xs">
                  {q.topic}
                </Badge>
                <Badge
                  variant={
                    q.difficulty === "easy"
                      ? "success"
                      : q.difficulty === "medium"
                        ? "warning"
                        : "destructive"
                  }
                  className="text-xs"
                >
                  {q.difficulty}
                </Badge>
                <Badge variant="info" className="text-xs">
                  {q.type === "mcq"
                    ? "MCQ"
                    : q.type === "fill_blank"
                      ? "Fill Blank"
                      : "Problem"}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium">
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              {q.type === "mcq" && (
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const selected = getAnswer(q.id) === opt;
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswer(q.id, opt)}
                        className={cn(
                          "w-full text-left rounded-md border p-2.5 text-sm transition-all",
                          !submitted &&
                            "hover:border-primary hover:bg-primary/5 cursor-pointer",
                          selected &&
                            "border-primary bg-primary/10 ring-1 ring-primary"
                        )}
                      >
                        <span className="font-medium mr-1.5">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
              {(q.type === "fill_blank" || q.type === "problem") && (
                <Input
                  placeholder={
                    q.type === "fill_blank"
                      ? "Type your answer..."
                      : "Write your solution..."
                  }
                  value={getAnswer(q.id)}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  disabled={submitted}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit button */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur border-t py-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {answeredCount < questions.length && (
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-yellow-500" />
              {questions.length - answeredCount} unanswered question
              {questions.length - answeredCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {timeWarning && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <Timer className="size-3" />
              Time almost up!
            </span>
          )}
          <Button onClick={handleSubmit} size="lg">
            Submit Exam
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { MockQuestion as MockExamQuestion, ExamScore };
