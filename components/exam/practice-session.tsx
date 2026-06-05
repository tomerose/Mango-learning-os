"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

// ─────────────────────────────────────────────────────────────
// PracticeSession — one-question-at-a-time practice player
// Supports MCQ, fill-blank, and problem types. Shows immediate
// feedback, explanation, tracks score, and allows retrying
// incorrect questions.
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

interface PracticeSessionProps {
  questions: MockQuestion[];
  subject: string;
  onFinish: (results: PracticeResult[]) => void;
}

interface PracticeResult {
  questionId: string;
  question: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

type SessionState = "answering" | "feedback" | "finished";

const difficultyBadge = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
} as const;

export function PracticeSession({
  questions,
  subject,
  onFinish,
}: PracticeSessionProps) {
  const { recordQuiz } = useStore();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [results, setResults] = React.useState<PracticeResult[]>([]);
  const [state, setState] = React.useState<SessionState>("answering");
  const [lastResult, setLastResult] = React.useState<PracticeResult | null>(
    null
  );
  const [incorrectQueue, setIncorrectQueue] = React.useState<number[]>([]);
  const [inRetryMode, setInRetryMode] = React.useState(false);

  const currentQuestion = questions[currentIdx];
  const progress =
    questions.length > 0
      ? ((currentIdx + 1) / questions.length) * 100
      : 0;

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    if (!userAnswer.trim() && currentQuestion.type !== "mcq") return;

    const isCorrect =
      currentQuestion.type === "mcq"
        ? userAnswer.trim().toLowerCase() ===
          currentQuestion.answer.trim().toLowerCase()
        : currentQuestion.type === "fill_blank"
          ? userAnswer.trim().toLowerCase() ===
            currentQuestion.answer.trim().toLowerCase()
          : userAnswer.trim().length > 10; // Problem: non-trivial answer considered

    const result: PracticeResult = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      type: currentQuestion.type,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentQuestion.answer,
      isCorrect,
      explanation: currentQuestion.explanation,
    };

    setResults((prev) => [...prev, result]);
    setLastResult(result);
    setState("feedback");

    if (!isCorrect && !inRetryMode) {
      setIncorrectQueue((prev) => [...prev, currentIdx]);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setLastResult(null);
    setState("answering");

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      // Quiz complete
      const correct = results.filter((r) => r.isCorrect).length;
      recordQuiz({
        subject,
        topic: currentQuestion?.topic ?? subject,
        total: results.length,
        correct,
      });
      setState("finished");
      onFinish(results);
    }
  };

  const handleRetryIncorrect = () => {
    if (incorrectQueue.length === 0) return;
    setInRetryMode(true);
    const nextIdx = incorrectQueue[0];
    setIncorrectQueue((prev) => prev.slice(1));
    setCurrentIdx(nextIdx);
    setUserAnswer("");
    setLastResult(null);
    setState("answering");
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setUserAnswer("");
    setResults([]);
    setState("answering");
    setLastResult(null);
    setIncorrectQueue([]);
    setInRetryMode(false);
  };

  if (state === "finished") {
    const correct = results.filter((r) => r.isCorrect).length;
    const accuracy = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Trophy className="size-12 text-yellow-500 mx-auto" />
          <CardTitle className="text-xl mt-2">Practice Complete!</CardTitle>
          <CardDescription>
            {subject} — {results.length} questions attempted
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {accuracy}%
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                {correct}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">
                {results.length - correct}
              </p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </div>

          <Progress
            value={accuracy}
            className="h-2 w-full max-w-xs"
            indicatorClassName={
              accuracy >= 80
                ? "bg-success"
                : accuracy >= 50
                  ? "bg-yellow-500"
                  : "bg-destructive"
            }
          />

          <div className="flex gap-2 mt-2">
            {incorrectQueue.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryIncorrect}
              >
                <RotateCcw className="size-4" />
                Retry Incorrect ({incorrectQueue.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleRestart}>
              <RotateCcw className="size-4" />
              Start Over
            </Button>
          </div>

          {/* Results summary */}
          <div className="w-full mt-4 space-y-2">
            <p className="text-sm font-medium">Results Summary</p>
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-md p-2 text-sm",
                    r.isCorrect
                      ? "bg-success/10 border border-success/20"
                      : "bg-destructive/10 border border-destructive/20"
                  )}
                >
                  {r.isCorrect ? (
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                  ) : (
                    <XCircle className="size-4 text-destructive shrink-0" />
                  )}
                  <span className="truncate flex-1">{r.question}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No questions available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground shrink-0">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* Question card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {currentQuestion.topic}
            </Badge>
            <Badge
              variant={difficultyBadge[currentQuestion.difficulty]}
              className="text-xs"
            >
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="info" className="text-xs">
              {currentQuestion.type === "mcq"
                ? "MCQ"
                : currentQuestion.type === "fill_blank"
                  ? "Fill Blank"
                  : "Problem"}
            </Badge>
          </div>
          <CardTitle className="text-base font-medium">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* MCQ options */}
          {currentQuestion.type === "mcq" && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => {
                const isSelected =
                  state === "answering" &&
                  userAnswer === opt;
                const isThisCorrect = opt === currentQuestion.answer;
                const showResult = state === "feedback";
                return (
                  <button
                    key={i}
                    disabled={state !== "answering"}
                    onClick={() => setUserAnswer(opt)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 text-sm transition-all",
                      state === "answering" &&
                        "hover:border-primary hover:bg-primary/5 cursor-pointer",
                      isSelected &&
                        state === "answering" &&
                        "border-primary bg-primary/10 ring-1 ring-primary",
                      showResult &&
                        isThisCorrect &&
                        "border-success bg-success/10 text-success",
                      showResult &&
                        isSelected &&
                        !isThisCorrect &&
                        "border-destructive bg-destructive/10 text-destructive",
                      showResult && !isSelected && !isThisCorrect && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-5 rounded-full border-2 flex items-center justify-center text-xs shrink-0",
                          isSelected && "border-primary",
                          showResult && isThisCorrect && "border-success bg-success text-white",
                          showResult && isSelected && !isThisCorrect && "border-destructive bg-destructive text-white"
                        )}
                      >
                        {showResult && isThisCorrect ? (
                          <CheckCircle2 className="size-3" />
                        ) : showResult && isSelected && !isThisCorrect ? (
                          <XCircle className="size-3" />
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </span>
                      {opt}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill blank or problem */}
          {(currentQuestion.type === "fill_blank" ||
            currentQuestion.type === "problem") && (
            <div className="space-y-3">
              <Input
                placeholder={
                  currentQuestion.type === "fill_blank"
                    ? "Type your answer..."
                    : "Explain your solution..."
                }
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={state === "feedback"}
                className={cn(
                  state === "feedback" &&
                    (lastResult?.isCorrect
                      ? "border-success"
                      : "border-destructive")
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && state === "answering") {
                    handleSubmitAnswer();
                  }
                  if (e.key === "Enter" && state === "feedback") {
                    handleNext();
                  }
                }}
              />
              {state === "feedback" && (
                <div
                  className={cn(
                    "rounded-lg p-3",
                    lastResult?.isCorrect
                      ? "bg-success/10 border border-success/20"
                      : "bg-destructive/10 border border-destructive/20"
                  )}
                >
                  <p className="text-xs font-semibold mb-1">Correct Answer:</p>
                  <p className="text-sm">{currentQuestion.answer}</p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            {state === "answering" ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="w-full"
              >
                Submit Answer
              </Button>
            ) : (
              <div className="flex w-full items-center gap-3">
                {/* Feedback indicator */}
                <div
                  className={cn(
                    "flex items-center gap-2 flex-1",
                    lastResult?.isCorrect ? "text-success" : "text-destructive"
                  )}
                >
                  {lastResult?.isCorrect ? (
                    <>
                      <CheckCircle2 className="size-5" />
                      <span className="text-sm font-medium">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5" />
                      <span className="text-sm font-medium">Incorrect</span>
                    </>
                  )}
                </div>
                <Button onClick={handleNext}>
                  {currentIdx < questions.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="size-4" />
                    </>
                  ) : (
                    <>
                      View Results
                      <Target className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Explanation in feedback state */}
          {state === "feedback" && lastResult && (
            <div className="rounded-lg bg-info/10 border border-info/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="size-4 text-info" />
                <p className="text-xs font-semibold text-info">Explanation</p>
              </div>
              <p className="text-sm">{lastResult.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentIdx === 0}
          onClick={() => {
            setCurrentIdx((i) => Math.max(0, i - 1));
            setUserAnswer("");
            setLastResult(null);
            setState("answering");
          }}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          {inRetryMode ? "Retry Mode" : "Question"} {currentIdx + 1} of{" "}
          {questions.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={currentIdx >= questions.length - 1}
          onClick={() => {
            setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
            setUserAnswer("");
            setLastResult(null);
            setState("answering");
          }}
        >
          Skip
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export type { MockQuestion, PracticeResult };
