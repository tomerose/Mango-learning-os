"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, RotateCcw, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { dueCards, intervalPreview } from "@/lib/srs";
import { SUBJECT_META } from "@/lib/mock-data";
import type { Flashcard, ReviewGrade } from "@/lib/types";

const GRADES: { id: ReviewGrade; label: string; color: string }[] = [
  { id: "again", label: "重来", color: "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/30 dark:text-rose-300" },
  { id: "hard", label: "困难", color: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-300" },
  { id: "good", label: "良好", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300" },
  { id: "easy", label: "简单", color: "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-950/30 dark:text-sky-300" },
];

function FlipCard({ front, back, flipped, onClick, meta }: {
  front: string; back: string; flipped: boolean; onClick: () => void; meta: { short: string; color: string };
}) {
  return (
    <div className="perspective-[1000px] w-full min-h-[260px] cursor-pointer" onClick={onClick}>
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div className={cn(
          "absolute inset-0 backface-hidden card-card flex flex-col items-center justify-center gap-4 p-8 text-center",
          flipped ? "pointer-events-none" : "",
        )}>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: meta.color }}>
            <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
            {meta.short}
          </span>
          <p className="text-heading font-medium text-balance">{front}</p>
          <span className="text-caption">点击翻转查看答案</span>
        </div>
        {/* Back */}
        <div className={cn(
          "absolute inset-0 backface-hidden card-floating flex flex-col items-center justify-center gap-4 p-8 text-center",
          !flipped ? "pointer-events-none" : "",
        )}
        style={{ transform: "rotateY(180deg)" }}>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: meta.color }}>
            <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
            {meta.short}
          </span>
          <p className="text-body leading-relaxed text-balance whitespace-pre-wrap">{back}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function FlashcardsTab() {
  const { flashcards, reviewCard, hydrated } = useStore();

  const decks = React.useMemo(() => {
    const map = new Map<string, { deck: string; subject: Flashcard["subject"]; total: number; due: number; mastered: number }>();
    const due = new Set(dueCards(flashcards).map((c) => c.id));
    for (const c of flashcards) {
      const d = map.get(c.deck) ?? { deck: c.deck, subject: c.subject, total: 0, due: 0, mastered: 0 };
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
    setQueue((q) => (g === "again" ? [...q.slice(1), currentId] : q.slice(1)));
  }

  function exit() { setActiveDeck(null); setQueue([]); setFlipped(false); }

  // ─── Review session ────────────────────────────────────────
  if (activeDeck) {
    const currentId = queue[0];
    const card = flashcards.find((c) => c.id === currentId);

    if (!card) {
      return (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <span className="size-16 rounded-2xl bg-primary-subtle flex items-center justify-center">
            <CheckCircle2 className="size-8 text-primary" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-heading font-medium">复习完成</p>
            <p className="text-body text-fg-muted mt-1">本轮复习了 {reviewedCount} 张卡片，+{reviewedCount * 5} XP</p>
          </div>
          <Button variant="outline" onClick={exit}>返回牌组</Button>
        </div>
      );
    }

    const meta = SUBJECT_META[card.subject];
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={exit}>← {activeDeck}</Button>
          <span className="text-small text-fg-muted tabular-nums">剩余 {queue.length} 张</span>
        </div>

        <FlipCard front={card.front} back={card.back} flipped={flipped}
          onClick={() => setFlipped((f) => !f)} meta={meta} />

        {flipped ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <button key={g.id} onClick={() => grade(g.id)}
                className={cn("flex flex-col gap-1 py-3 rounded-xl font-medium text-sm transition-all duration-150 pressable", g.color)}>
                <span>{g.label}</span>
                <span className="text-xs opacity-60">{intervalPreview(card, g.id)}</span>
              </button>
            ))}
          </div>
        ) : (
          <Button onClick={() => setFlipped(true)} className="w-full">显示答案</Button>
        )}
      </div>
    );
  }

  // ─── Decks overview ────────────────────────────────────────
  const totalDue = decks.reduce((sum, d) => sum + d.due, 0);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-body text-fg-muted">
        {hydrated ? (totalDue > 0 ? `今日 ${totalDue} 张待复习` : "今日已无待复习卡片") : "加载中…"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((d) => {
          const meta = SUBJECT_META[d.subject];
          return (
            <div key={d.deck} className="card-card flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2">
                <Layers className="size-4" style={{ color: meta.color }} />
                <span className="text-small font-medium">{d.deck}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {d.due > 0 ? <Badge variant="warning">{d.due} 待复习</Badge> : <Badge variant="success">已复习</Badge>}
                <span className="text-fg-muted">{d.mastered}/{d.total} 已掌握</span>
              </div>
              <Button variant={d.due > 0 ? "default" : "outline"} size="sm" className="w-full"
                disabled={d.due === 0} onClick={() => startReview(d.deck)}>
                {d.due > 0 ? <><Sparkles className="size-4" /> 开始复习</> : <><RotateCcw className="size-4" /> 暂无到期</>}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
