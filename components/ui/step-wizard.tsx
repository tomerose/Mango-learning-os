"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   StepWizard — Premium horizontal step flow
   Mobile: snap-scroll cards. Desktop: numbered timeline.
   Used for Exam Workspace 6-step flow.
   ═══════════════════════════════════════════════════════════════ */

interface Step { id: string; label: string; desc: string; }

interface StepWizardProps {
  steps: Step[];
  current: number;
  onStep: (idx: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function StepWizard({ steps, current, onStep, children, className }: StepWizardProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ── Step indicators ── */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <button
              key={s.id}
              onClick={() => onStep(i)}
              className={cn(
                "flex items-center gap-2 shrink-0 snap-start rounded-xl px-3 py-2 text-left transition-all duration-200 min-h-[44px]",
                active && "bg-primary-subtle border border-primary/20",
                done && "opacity-60",
                !active && !done && "hover:bg-bg-muted",
              )}
            >
              <span className={cn(
                "size-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors duration-200",
                done ? "bg-primary text-primary-on" : active ? "bg-primary text-primary-on" : "bg-bg-muted text-fg-muted",
              )}>
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <div className="hidden sm:block">
                <p className={cn("text-xs font-medium leading-tight", active && "text-primary")}>{s.label}</p>
                <p className="text-caption leading-tight">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Step content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => onStep(current - 1)}
          disabled={current === 0}
          className="inline-flex items-center gap-1 text-small text-fg-muted hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="size-4" />
          {steps[current - 1]?.label ?? "上一步"}
        </button>
        <span className="text-caption">{current + 1} / {steps.length}</span>
        <button
          onClick={() => onStep(current + 1)}
          disabled={current === steps.length - 1}
          className="inline-flex items-center gap-1 text-small text-primary hover:text-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {steps[current + 1]?.label ?? "下一步"}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
