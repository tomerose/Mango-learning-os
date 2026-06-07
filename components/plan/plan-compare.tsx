"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Minus, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { PLAN_COMPARISON, TIER_META, type PlanComparisonItem } from "@/lib/plan/plan-config";
import type { PlanTier } from "@/lib/plan/types";
import { usePlanTier } from "@/lib/plan/use-plan";

// ── PlanCompare — used in onboarding + profile ──────────────────

interface PlanCompareProps {
  /** If true, show as compact cards for onboarding. If false, show full comparison table. */
  compact?: boolean;
  onSelect?: (tier: PlanTier) => void;
  selectedTier?: PlanTier;
}

export function PlanCompare({ compact = false, onSelect, selectedTier }: PlanCompareProps) {
  const currentTier = usePlanTier();

  if (compact) {
    return <CompactPlanCards currentTier={currentTier} onSelect={onSelect} selectedTier={selectedTier} />;
  }

  return <FullComparisonTable currentTier={currentTier} />;
}

// ── Compact cards (onboarding) ──────────────────────────────────

function CompactPlanCards({ currentTier, onSelect, selectedTier }: {
  currentTier: PlanTier;
  onSelect?: (tier: PlanTier) => void;
  selectedTier?: PlanTier;
}) {
  const cards = [
    {
      tier: "standard" as PlanTier,
      title: "Standard",
      subtitle: "轻量学习助手",
      desc: "基础 AI 对话、日常总结、复习纲要、本地历史。适合日常学习辅助。",
      highlights: ["基础 Agent 与 Tutor", "20 次/天 AI 任务", "Markdown 导出", "本地历史记录"],
      cta: "继续使用标准版",
      variant: "outline" as const,
    },
    {
      tier: "pro" as PlanTier,
      title: "Pro Studio",
      subtitle: "高质量成果生产系统",
      desc: "深度生成、高级 Agent 工作流、完整学习包、PDF/DOCX 导出、云端同步、Mango DNA 个性化。适合追求高质量学习成品的深度学习者。",
      highlights: ["高级 Agent 多步骤执行", "100 次/天 + 8 来源检索", "PDF/DOCX 导出 + 自动修复", "云端保存 · Mango DNA"],
      cta: "了解 Pro 能力",
      variant: "primary" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {cards.map((card, i) => (
        <motion.div
          key={card.tier}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
          className={card.variant === "primary"
            ? "rounded-2xl p-5 text-left"
            : "rounded-2xl p-5 text-left"
          }
          style={card.variant === "primary" ? {
            background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(245,158,11,0.08))",
            border: "1px solid rgba(245,158,11,0.25)",
          } : {
            background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{card.tier === "pro" ? "⚡" : "📚"}</span>
            <div>
              <p className="text-sm font-semibold text-white">{card.title}</p>
              <p className="text-[10px] text-white/40">{card.subtitle}</p>
            </div>
            {card.tier === "pro" && (
              <span className="ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-semibold text-amber-300 border border-amber-400/20">
                推荐
              </span>
            )}
          </div>

          <p className="text-xs leading-5 text-white/50 mb-3">{card.desc}</p>

          <div className="space-y-1.5 mb-4">
            {card.highlights.map(h => (
              <div key={h} className="flex items-start gap-2">
                <Check className="size-3 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-[11px] text-white/55">{h}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelect?.(card.tier)}
            className={card.variant === "primary"
              ? "w-full rounded-xl bg-amber-400/15 border border-amber-400/25 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-400/20 transition-colors"
              : "w-full rounded-xl bg-white/5 border border-white/10 py-2.5 text-xs font-medium text-white/50 hover:bg-white/8 transition-colors"
            }
          >
            {card.cta}
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ── Full comparison table (profile) ─────────────────────────────

function FullComparisonTable({ currentTier }: { currentTier: PlanTier }) {
  const categories = [...new Set(PLAN_COMPARISON.map(c => c.category))];
  const catLabels: Record<string, string> = {
    core: "核心功能", generation: "生成能力", export: "导出", ai: "AI 能力", storage: "存储与同步",
  };

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-2">{catLabels[cat] ?? cat}</p>
          <div className="space-y-0.5">
            {PLAN_COMPARISON.filter(c => c.category === cat).map(item => (
              <div key={item.feature} className="flex items-center rounded-xl bg-white/[0.03] px-4 py-2.5">
                <span className="flex-1 text-xs text-white/60">{item.feature}</span>
                <span className="w-32 text-[11px] text-white/40">{String(item.standard)}</span>
                <span className="w-32 text-[11px] font-medium text-amber-200/80">{String(item.pro)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-white/8">
        <Link
          href="/profile?tab=billing"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400/12 border border-amber-400/20 px-5 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-400/18 transition-colors"
        >
          <Zap className="size-4" />
          {currentTier === "pro" ? "管理 Pro 订阅" : "升级到 Pro"}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
