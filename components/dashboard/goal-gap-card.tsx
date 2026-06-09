"use client";

/**
 * MangoOS V14.8.1 — Goal Gap Card (inspired by PAI's ISA primitive)
 *
 * PAI Concept: "Current State → Ideal State" mapping.
 * Applied here as a lightweight learning goal tracker:
 *   Where am I now? → Where do I want to be? → What's the gap?
 *
 * Data: localStorage (guest) or Supabase (cloud), same dual-mode as store.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface GoalGap {
  id: string;
  subject: string;
  currentState: string;
  idealState: string;
  progress: number; // 0-100
}

function getStoredGaps(): GoalGap[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("mango-goal-gaps") || "[]");
  } catch { return []; }
}

export function GoalGapCard({ className }: { className?: string }) {
  const { stats } = useStore();
  const [gaps, setGaps] = React.useState<GoalGap[]>([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [current, setCurrent] = React.useState("");
  const [ideal, setIdeal] = React.useState("");

  React.useEffect(() => { setGaps(getStoredGaps()); }, []);

  const addGap = () => {
    if (!subject || !current || !ideal) return;
    const newGap: GoalGap = {
      id: Date.now().toString(36),
      subject, currentState: current, idealState: ideal, progress: 0,
    };
    const updated = [...gaps, newGap];
    setGaps(updated);
    localStorage.setItem("mango-goal-gaps", JSON.stringify(updated));
    setSubject(""); setCurrent(""); setIdeal(""); setShowAdd(false);
  };

  const updateProgress = (id: string, progress: number) => {
    const updated = gaps.map(g => g.id === id ? { ...g, progress } : g);
    setGaps(updated);
    localStorage.setItem("mango-goal-gaps", JSON.stringify(updated));
  };

  return (
    <motion.div
      className={cn("surface-card rounded-2xl p-5 space-y-4", className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">目标差距</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {showAdd ? "取消" : "+ 新增"}
        </button>
      </div>

      {showAdd && (
        <div className="space-y-2 rounded-xl border border-border bg-bg-subtle p-3">
          <input
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary/40"
            placeholder="科目 (如: 微观经济学)"
            value={subject} onChange={e => setSubject(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary/40"
            placeholder="当前状态 (如: 第三章还没看)"
            value={current} onChange={e => setCurrent(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary/40"
            placeholder="目标状态 (如: 完成全部习题, 能写推导)"
            value={ideal} onChange={e => setIdeal(e.target.value)}
          />
          <button
            onClick={addGap}
            className="w-full rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-on hover:bg-primary-hover transition-colors"
          >
            设定目标
          </button>
        </div>
      )}

      {gaps.length === 0 && !showAdd && (
        <p className="text-xs text-muted-foreground py-2">
          设定学习目标差距 — PAI 风格：你现在在哪？想到哪去？
        </p>
      )}

      {gaps.map((gap) => (
        <div key={gap.id} className="space-y-2 rounded-xl border border-border/60 bg-surface-low p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{gap.subject}</span>
            <span className="text-[11px] text-muted-foreground">{gap.progress}%</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="line-clamp-1 flex-1">{gap.currentState}</span>
            <ArrowRight className="size-3 shrink-0" />
            <span className="line-clamp-1 flex-1 text-foreground/70">{gap.idealState}</span>
          </div>
          <input
            type="range"
            min={0} max={100}
            value={gap.progress}
            onChange={e => updateProgress(gap.id, Number(e.target.value))}
            className="w-full h-1 accent-primary"
          />
        </div>
      ))}
    </motion.div>
  );
}
