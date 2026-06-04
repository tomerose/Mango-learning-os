"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { SUBJECT_META } from "@/lib/mock-data";

// Derive subject mastery from real data: notes + flashcard reviews + quiz accuracy.
export function SubjectProgress() {
  const { notes, flashcards, quizAttempts, hydrated } = useStore();
  const { subjects } = useSubjects();

  if (!hydrated) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>学科掌握度</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground text-sm">加载中…</CardContent>
      </Card>
    );
  }
  const progress = subjects.map((subj) => {
    const subjectNotes = notes.filter((n) => n.subject === subj.id);
    const subjectCards = flashcards.filter((c) => c.subject === subj.id);
    const subjectQuizzes = quizAttempts.filter((a) => a.subject === subj.id);

    // Notes: count × 5, capped at 50
    const notesScore = Math.min(50, subjectNotes.length * 5);

    // Flashcards: reviews (repetitions sum) × 2, capped at 30
    const reviewsCount = subjectCards.reduce((sum, c) => sum + c.repetitions, 0);
    const cardsScore = Math.min(30, reviewsCount * 2);

    // Quizzes: average accuracy, weighted ×0.2 (max 20)
    let quizScore = 0;
    if (subjectQuizzes.length > 0) {
      const totalCorrect = subjectQuizzes.reduce((s, a) => s + a.correct, 0);
      const totalQuestions = subjectQuizzes.reduce((s, a) => s + a.total, 0);
      const avgAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
      quizScore = Math.round(avgAccuracy * 20); // 0-20
    }

    const masteryPct = Math.min(100, notesScore + cardsScore + quizScore);

    // Weekly minutes: rough estimate from task count × 25min
    const weeklyMinutes = subjectNotes.length * 25;

    return { subject: subj.id, masteryPct, weeklyMinutes };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>学科掌握度</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {progress.map((p) => {
          const meta = SUBJECT_META[p.subject];
          const hours = (p.weeklyMinutes / 60).toFixed(1);
          return (
            <div key={p.subject} className="flex items-center gap-3">
              <div className="relative flex size-12 shrink-0 items-center justify-center">
                <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke={meta.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(p.masteryPct / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className="absolute text-xs font-semibold tabular-nums">
                  {p.masteryPct}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{meta.label}</p>
                <p className="text-muted-foreground text-xs">
                  本周 {hours} 小时
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
