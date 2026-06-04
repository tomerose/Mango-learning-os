"use client";

import * as React from "react";
import { Layers, RotateCcw, CheckCircle2, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { dueCards, intervalPreview } from "@/lib/srs";
import { SUBJECT_META } from "@/lib/mock-data";
import type { Flashcard, ReviewGrade } from "@/lib/types";

const GRADES: { id: ReviewGrade; label: string; variant: string }[] = [
  { id: "again", label: "重来", variant: "destructive" },
  { id: "hard", label: "困难", variant: "warning" },
  { id: "good", label: "良好", variant: "info" },
  { id: "easy", label: "简单", variant: "success" },
];

export function FlashcardsTab() {
  const { flashcards, reviewCard, hydrated } = useStore();

  // Decks overview — grouped by deck name, with due counts.
  const decks = React.useMemo(() => {
    const map = new Map<
      string,
      { deck: string; subject: Flashcard["subject"]; total: number; due: number; mastered: number }
    >();
    const due = new Set(dueCards(flashcards).map((c) => c.id));
    for (const c of flashcards) {
      const d =
        map.get(c.deck) ??
        { deck: c.deck, subject: c.subject, total: 0, due: 0, mastered: 0 };
      d.total++;
      if (due.has(c.id)) d.due++;
      if (c.repetitions >= 3) d.mastered++;
      map.set(c.deck, d);
    }
    return [...map.values()];
  }, [flashcards]);

  const [activeDeck, setActiveDeck] = React.useState<string | null>(null);
  const [queue, setQueue] = React.useState<string[]>([]);
  const [flipped, setFlipped] = React.useState(false);
  const [reviewedCount, setReviewedCount] = React.useState(0);

  function startReview(deck: string) {
    const ids = dueCards(flashcards.filter((c) => c.deck === deck)).map((c) => c.id);
    setActiveDeck(deck);
    setQueue(ids);
    setFlipped(false);
    setReviewedCount(0);
  }

  function grade(g: ReviewGrade) {
    const currentId = queue[0];
    if (!currentId) return;
    reviewCard(currentId, g);
    setReviewedCount((n) => n + 1);
    setFlipped(false);
    // "again" sends the card to the back of this session's queue.
    setQueue((q) => (g === "again" ? [...q.slice(1), currentId] : q.slice(1)));
  }

  function exit() {
    setActiveDeck(null);
    setQueue([]);
    setFlipped(false);
  }

  // ─── Review session view ───────────────────────────────────
  if (activeDeck) {
    const currentId = queue[0];
    const card = flashcards.find((c) => c.id === currentId);

    if (!card) {
      return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="bg-success/15 flex size-14 items-center justify-center rounded-2xl">
            <CheckCircle2 className="text-success size-7" />
          </span>
          <div>
            <p className="font-medium">复习完成 🎉</p>
            <p className="text-muted-foreground mt-1 text-sm">
              本轮复习了 {reviewedCount} 张卡片，+{reviewedCount * 5} XP
            </p>
          </div>
          <Button variant="outline" onClick={exit}>
            返回牌组
          </Button>
        </div>
      );
    }

    const meta = SUBJECT_META[card.subject];
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={exit}>
            ← {activeDeck}
          </Button>
          <span className="text-muted-foreground text-sm tabular-nums">
            剩余 {queue.length} 张
          </span>
        </div>

        {/* Card — click to flip */}
        <button
          onClick={() => setFlipped((f) => !f)}
          className="bg-card hover:border-primary/40 flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-xl border p-8 text-center transition-colors"
        >
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: meta.color }}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
            {meta.short}
          </span>
          <p className="text-lg font-medium text-balance">{card.front}</p>
          {flipped ? (
            <>
              <div className="bg-border h-px w-16" />
              <p className="text-muted-foreground text-sm leading-relaxed text-balance whitespace-pre-wrap">
                {card.back}
              </p>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">点击查看答案</span>
          )}
        </button>

        {/* Grading — only after flip */}
        {flipped ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRADES.map((g) => (
              <Button
                key={g.id}
                variant="outline"
                onClick={() => grade(g.id)}
                className="flex h-auto flex-col gap-1 py-2"
              >
                <span className="font-medium">{g.label}</span>
                <span className="text-muted-foreground text-xs">
                  {intervalPreview(card, g.id)}
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <Button onClick={() => setFlipped(true)}>显示答案</Button>
        )}
      </div>
    );
  }

  // ─── Decks overview ────────────────────────────────────────
  const totalDue = decks.reduce((sum, d) => sum + d.due, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {hydrated
            ? totalDue > 0
              ? `今日 ${totalDue} 张待复习`
              : "今日已无待复习卡片 ✓"
            : "加载中…"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((d) => {
          const meta = SUBJECT_META[d.subject];
          return (
            <Card key={d.deck}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="size-4" style={{ color: meta.color }} />
                  {d.deck}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm">
                  {d.due > 0 ? (
                    <Badge variant="warning">{d.due} 待复习</Badge>
                  ) : (
                    <Badge variant="success">已复习</Badge>
                  )}
                  <span className="text-muted-foreground">
                    {d.mastered}/{d.total} 已掌握
                  </span>
                </div>
                <Button
                  variant={d.due > 0 ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  disabled={d.due === 0}
                  onClick={() => startReview(d.deck)}
                >
                  {d.due > 0 ? (
                    <>
                      <Sparkles className="size-4" /> 开始复习
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4" /> 暂无到期
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
