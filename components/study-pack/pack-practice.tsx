"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, RotateCcw, CheckCircle2, Sparkles, Brain,
  ArrowLeft, ArrowRight, Target, Flame, Clock, Zap,
  BookOpen, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { review } from "@/lib/srs";
import type { Flashcard, ReviewGrade } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════
   Pack Practice — Auto-generated flashcards from handout content
   SM-2 spaced repetition with flip animation
   ═══════════════════════════════════════════════════════════════ */

const GRADES: { id: ReviewGrade; label: string; color: string; key: string }[] = [
  { id: "again", label: "重来", color: "bg-rose-100 text-rose-700 hover:bg-rose-200", key: "1" },
  { id: "hard", label: "困难", color: "bg-amber-100 text-amber-700 hover:bg-amber-200", key: "2" },
  { id: "good", label: "良好", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200", key: "3" },
  { id: "easy", label: "简单", color: "bg-sky-100 text-sky-700 hover:bg-sky-200", key: "4" },
];

type Mode = "idle" | "review" | "complete";

interface PracticeFlashcard {
  id: string;
  front: string;
  back: string;
  sourceSection: string;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueOn: string;
}

interface PracticeStats {
  total: number;
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  streak: number;
}

/** Extract flashcards from generated handout sections */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFlashcards(handout: any): PracticeFlashcard[] {
  const cards: PracticeFlashcard[] = [];
  const sections = (handout?.sections ?? {}) as Record<string, unknown>;
  const today = new Date().toISOString().slice(0, 10);

  // From highFreqPoints: extract key points as Q&A pairs
  const highFreq = (sections?.highFreqPoints as string) ?? "";
  if (highFreq) {
    const points = highFreq.split(/\n- |\n• |\n\d+\. /).filter(p => p.trim().length > 10);
    points.forEach((point, i) => {
      const colon = point.indexOf("：") > 0 ? point.indexOf("：") : point.indexOf(":");
      if (colon > 0) {
        cards.push({
          id: `fp-hf-${i}`,
          front: point.slice(0, colon).replace(/^[-•\d.]+\s*/, "").trim(),
          back: point.slice(colon + 1).trim(),
          sourceSection: "高频考点",
          ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: today,
        });
      }
    });
  }

  // From chapterConcepts: each concept as a flashcard
  const chapters = (sections?.chapterConcepts ?? []) as Array<{ title: string; content: string }>;
  if (Array.isArray(chapters)) {
    chapters.forEach((ch, i) => {
      if (ch.title && ch.content) {
        cards.push({
          id: `fp-ch-${i}`,
          front: ch.title,
          back: ch.content.slice(0, 300),
          sourceSection: "章节概念",
          ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: today,
        });
      }
    });
  }

  // From formulaTable: extract formulas
  const formulas = (sections?.formulaTable as string) ?? "";
  if (formulas) {
    const lines = formulas.split("\n").filter(l => l.trim().length > 5);
    lines.forEach((line, i) => {
      const colon = line.indexOf("：") > 0 ? line.indexOf("：") : line.indexOf(":");
      if (colon > 0) {
        cards.push({
          id: `fp-fm-${i}`,
          front: line.slice(0, colon).replace(/^[-•\d.]+\s*/, "").trim(),
          back: line.slice(colon + 1).trim(),
          sourceSection: "公式速查",
          ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: today,
        });
      }
    });
  }

  // From commonTraps
  const traps = (sections?.commonTraps as string) ?? "";
  if (traps) {
    const trapLines = traps.split(/\n- |\n• |\n\d+\. /).filter(t => t.trim().length > 10);
    trapLines.forEach((trap, i) => {
      cards.push({
        id: `fp-tr-${i}`,
        front: "常见陷阱",
        back: trap.replace(/^[-•\d.]+\s*/, "").trim(),
        sourceSection: "常见陷阱",
        ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: today,
      });
    });
  }

  // From memoryChecklist: each item as a recall prompt
  const checklist = (sections?.memoryChecklist as string) ?? "";
  if (checklist) {
    const items = checklist.split(/\n- |\n• |\n\d+\. |\n☐ /).filter(item => item.trim().length > 3);
    items.forEach((item, i) => {
      cards.push({
        id: `fp-mc-${i}`,
        front: "记忆要点",
        back: item.replace(/^[-•\d.]+\s*/, "").trim(),
        sourceSection: "记忆清单",
        ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: today,
      });
    });
  }

  return cards.slice(0, 30); // Cap at 30 cards
}

function FlipCard({ card, flipped, onClick }: { card: PracticeFlashcard; flipped: boolean; onClick: () => void }) {
  return (
    <div className="perspective-[1000px] w-full min-h-[280px] cursor-pointer" onClick={onClick}>
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div className={cn(
          "absolute inset-0 backface-hidden card-card flex flex-col items-center justify-center gap-4 p-6 sm:p-8 text-center",
          flipped ? "pointer-events-none" : "",
        )}>
          <Badge variant="secondary" className="text-[10px]">{card.sourceSection}</Badge>
          <p className="text-heading font-serif font-medium text-balance">{card.front}</p>
          <span className="text-caption">点击翻转查看答案</span>
        </div>
        {/* Back */}
        <div className={cn(
          "absolute inset-0 backface-hidden card-floating flex flex-col items-center justify-center gap-4 p-6 sm:p-8 text-center",
          !flipped ? "pointer-events-none" : "",
        )}
        style={{ transform: "rotateY(180deg)" }}>
          <Badge variant="secondary" className="text-[10px]">答案</Badge>
          <p className="text-body leading-relaxed text-balance whitespace-pre-wrap max-h-[200px] overflow-y-auto">{card.back}</p>
        </div>
      </motion.div>
    </div>
  );
}

interface PackPracticeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatedHandout: any;
  onClose: () => void;
}

export function PackPractice({ generatedHandout, onClose }: PackPracticeProps) {
  const [mode, setMode] = React.useState<Mode>("idle");
  const [cards, setCards] = React.useState<PracticeFlashcard[]>([]);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [stats, setStats] = React.useState<PracticeStats>({
    total: 0, reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, streak: 0,
  });

  // Init
  React.useEffect(() => {
    const extracted = extractFlashcards(generatedHandout);
    setCards(extracted);
    setStats(prev => ({ ...prev, total: extracted.length }));
  }, [generatedHandout]);

  const current = cards[currentIdx];
  const progress = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;

  function handleGrade(grade: ReviewGrade) {
    if (!current) return;
    const today = new Date().toISOString().slice(0, 10);
    const card: Flashcard = {
      id: current.id,
      front: current.front,
      back: current.back,
      deck: current.sourceSection,
      subject: current.sourceSection as Flashcard["subject"],
      ease: current.ease,
      intervalDays: current.intervalDays,
      repetitions: current.repetitions,
      dueOn: current.dueOn,
    };
    const result = review(card, grade, today);

    // Update card
    const updated = cards.map((c, i) =>
      i === currentIdx ? { ...c, ...result } : c
    );
    setCards(updated);

    // Stats
    setStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      [grade]: prev[grade] + 1,
      streak: grade === "good" || grade === "easy" ? prev.streak + 1 : 0,
    }));

    setFlipped(false);

    // Next card or complete
    const nextIdx = currentIdx + 1;
    if (nextIdx < cards.length) {
      setTimeout(() => setCurrentIdx(nextIdx), 300);
    } else {
      setMode("complete");
    }
  }

  if (cards.length === 0) {
    return (
      <div className="card-card p-8 flex flex-col items-center gap-4 text-center">
        <Brain className="size-10 text-fg-subtle/80" />
        <div>
          <p className="text-base font-medium font-serif">无可提取的闪卡</p>
          <p className="text-sm text-fg-muted mt-1">当前讲义的考点/公式/概念不足以生成闪卡。请尝试更详细的课程信息重新生成。</p>
        </div>
        <Button variant="outline" onClick={onClose} className="rounded-xl">返回讲义</Button>
      </div>
    );
  }

  if (mode === "complete") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card-card p-8 flex flex-col items-center gap-5 text-center">
        <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-heading font-serif">练习完成！</h3>
          <p className="text-sm text-fg-muted mt-1">你已完成所有 {stats.total} 张闪卡的复习</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
          {GRADES.map(g => (
            <div key={g.id} className="card-card p-3 text-center">
              <span className="text-2xl font-bold font-serif">{stats[g.id]}</span>
              <p className="text-[10px] text-fg-muted">{g.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Flame className="size-4 text-primary" fill="currentColor" />
          <span className="font-medium">{stats.streak}</span>
          <span className="text-fg-muted">连续正确</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setCurrentIdx(0); setMode("review"); setStats(prev => ({ ...prev, reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, streak: 0 })); }}
            className="gap-2 rounded-xl">
            <RotateCcw className="size-4" /> 再练一轮
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">返回讲义</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }} />
        </div>
        <span className="text-xs font-medium text-fg-muted shrink-0">
          {stats.reviewed}/{stats.total}
        </span>
        <span className="text-[10px] text-fg-muted/80 shrink-0 flex items-center gap-1">
          <Flame className="size-3 text-primary" fill="currentColor" />{stats.streak}
        </span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}>
          <FlipCard card={current} flipped={flipped} onClick={() => setFlipped(!flipped)} />
        </motion.div>
      </AnimatePresence>

      {/* Grade buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex flex-col gap-2">
            <p className="text-xs text-center text-fg-muted">你的掌握程度？</p>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map(g => (
                <button key={g.id} onClick={() => handleGrade(g.id)}
                  className={cn("rounded-xl px-3 py-2.5 text-xs font-medium transition-all pressable", g.color)}>
                  <span className="block text-[11px]">{g.label}</span>
                  <span className="block text-[9px] opacity-60 mt-0.5">{g.key}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card index dots */}
      <div className="flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <div key={i} className={cn(
            "size-1.5 rounded-full transition-colors",
            i === currentIdx ? "bg-primary" : i < currentIdx ? "bg-emerald-400" : "bg-border",
          )} />
        ))}
      </div>
    </div>
  );
}
