"use client";

import * as React from "react";
import {
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Beaker,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// ReviewBooklet — displays the generated exam review booklet
// with chapter summaries, key points, formulas, common
// mistakes, and example problems in a print-friendly layout.
// ─────────────────────────────────────────────────────────────

interface Chapter {
  title: string;
  summary: string;
  keyPoints: string[];
  importance: "high" | "medium" | "low";
}

interface KeyPoint {
  topic: string;
  point: string;
  formula?: string;
}

interface CommonMistake {
  topic: string;
  mistake: string;
  correction: string;
}

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

interface ReviewBookletProps {
  subject: string;
  chapters: Chapter[];
  keyPoints: KeyPoint[];
  commonMistakes: CommonMistake[];
  mockQuestions: MockQuestion[];
}

const importanceConfig = {
  high: { color: "text-red-500", bg: "bg-red-500/10", label: "High Priority" },
  medium: {
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: "Medium Priority",
  },
  low: { color: "text-green-500", bg: "bg-green-500/10", label: "Low Priority" },
};

const difficultyConfig = {
  easy: { color: "text-green-500", label: "Easy" },
  medium: { color: "text-yellow-500", label: "Medium" },
  hard: { color: "text-red-500", label: "Hard" },
};

export function ReviewBooklet({
  subject,
  chapters,
  keyPoints,
  commonMistakes,
  mockQuestions,
}: ReviewBookletProps) {
  const [expandedChapters, setExpandedChapters] = React.useState<Set<number>>(
    new Set([0])
  );
  const [expandedMistakes, setExpandedMistakes] = React.useState<Set<number>>(
    new Set()
  );
  const [expandedQuestions, setExpandedQuestions] = React.useState<Set<string>>(
    new Set()
  );

  const toggleChapter = (i: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleMistake = (i: number) => {
    setExpandedMistakes((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const highCount = chapters.filter((c) => c.importance === "high").length;
  const medCount = chapters.filter((c) => c.importance === "medium").length;

  return (
    <div className="flex flex-col gap-6 print:gap-3" id="review-booklet">
      {/* Title card */}
      <Card className="print:border-none print:shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <CardTitle className="text-xl">
              {subject} — Final Exam Review Booklet
            </CardTitle>
          </div>
          <CardDescription>
            {chapters.length} chapters · {highCount} high priority · {medCount}{" "}
            medium · {keyPoints.length} key points · {mockQuestions.length}{" "}
            practice questions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chapter summaries */}
      <section className="print:break-inside-avoid">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="size-5" />
          Chapter Summaries
        </h2>
        <div className="flex flex-col gap-3">
          {chapters.map((chapter, i) => {
            const expanded = expandedChapters.has(i);
            const imp = importanceConfig[chapter.importance];
            return (
              <Card
                key={i}
                className={cn(
                  "print:border print:shadow-none",
                  chapter.importance === "high" && "border-l-4 border-l-red-400"
                )}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleChapter(i)}
                      className="flex items-center gap-2 text-left hover:underline-offset-2"
                    >
                      {expanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                      <CardTitle className="text-base">
                        {chapter.title}
                      </CardTitle>
                    </button>
                    <Badge
                      variant={chapter.importance === "high" ? "destructive" : chapter.importance === "medium" ? "warning" : "success"}
                      className="text-xs"
                    >
                      {imp.label}
                    </Badge>
                  </div>
                </CardHeader>
                {expanded && (
                  <CardContent className="pb-4 px-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {chapter.summary}
                    </p>
                    {chapter.keyPoints.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Key Points
                        </p>
                        <ul className="space-y-1">
                          {chapter.keyPoints.map((kp, j) => (
                            <li
                              key={j}
                              className="text-sm flex items-start gap-2"
                            >
                              <Star className="size-3.5 text-yellow-500 shrink-0 mt-0.5" />
                              {kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Key Points & Formula Sheet */}
      <section className="print:break-inside-avoid">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="size-5" />
          Key Points & Formula Sheet
        </h2>
        <Card className="print:border print:shadow-none">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {keyPoints.map((kp, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-muted/30 p-3"
                >
                  <Badge variant="outline" className="mb-2 text-xs">
                    {kp.topic}
                  </Badge>
                  <p className="text-sm">{kp.point}</p>
                  {kp.formula && (
                    <div className="mt-2 rounded-md bg-background px-3 py-1.5 font-mono text-sm text-primary">
                      {kp.formula}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Common Mistakes */}
      <section className="print:break-inside-avoid">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="size-5" />
          Common Mistakes to Avoid
        </h2>
        <div className="flex flex-col gap-3">
          {commonMistakes.map((cm, i) => {
            const expanded = expandedMistakes.has(i);
            return (
              <Card key={i} className="print:border print:shadow-none">
                <CardHeader className="py-3 px-4">
                  <button
                    onClick={() => toggleMistake(i)}
                    className="flex items-center gap-2 text-left w-full"
                  >
                    {expanded ? (
                      <ChevronDown className="size-4 shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <Badge variant="outline" className="mb-1 text-xs">
                        {cm.topic}
                      </Badge>
                      <p className="text-sm font-medium text-destructive truncate">
                        {cm.mistake}
                      </p>
                    </div>
                  </button>
                </CardHeader>
                {expanded && (
                  <CardContent className="pb-4 px-4">
                    <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                      <p className="text-xs font-semibold text-success mb-1">
                        Correction
                      </p>
                      <p className="text-sm">{cm.correction}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Example Problems */}
      <section className="print:break-inside-avoid">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Beaker className="size-5" />
          Practice Questions ({mockQuestions.length})
        </h2>
        <div className="flex flex-col gap-3">
          {mockQuestions.map((q) => {
            const expanded = expandedQuestions.has(q.id);
            const diff = difficultyConfig[q.difficulty];
            return (
              <Card key={q.id} className="print:border print:shadow-none">
                <CardHeader className="py-3 px-4">
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="flex items-start gap-2 text-left w-full"
                  >
                    {expanded ? (
                      <ChevronDown className="size-4 shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {q.topic}
                        </Badge>
                        <Badge
                          variant={
                            q.type === "mcq"
                              ? "info"
                              : q.type === "fill_blank"
                                ? "warning"
                                : "default"
                          }
                          className="text-xs"
                        >
                          {q.type === "mcq"
                            ? "MCQ"
                            : q.type === "fill_blank"
                              ? "Fill Blank"
                              : "Problem"}
                        </Badge>
                        <span className={cn("text-xs", diff.color)}>
                          {diff.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{q.question}</p>
                    </div>
                  </button>
                </CardHeader>
                {expanded && (
                  <CardContent className="pb-4 px-4 space-y-3">
                    {q.type === "mcq" && q.options.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Options
                        </p>
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={cn(
                              "rounded-md border p-2.5 text-sm",
                              opt === q.answer
                                ? "border-success bg-success/10 font-medium text-success"
                                : "border-muted-foreground/20"
                            )}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === "fill_blank" && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Answer
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {q.answer}
                        </p>
                      </div>
                    )}
                    {q.type === "problem" && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Solution Outline
                        </p>
                        <p className="text-sm whitespace-pre-wrap text-primary">
                          {q.answer}
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg bg-info/10 border border-info/20 p-3">
                      <p className="text-xs font-semibold text-info mb-1">
                        Explanation
                      </p>
                      <p className="text-sm">{q.explanation}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Print button hint */}
      <div className="flex items-center justify-center print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
        >
          <BookOpen className="size-4" />
          Print Review Booklet
        </Button>
      </div>
    </div>
  );
}
