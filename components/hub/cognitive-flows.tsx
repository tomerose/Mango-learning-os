"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Globe, BookOpen, Calendar, Sparkles, ExternalLink, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchFlowContent, structureContent, type RawContent, type CognitiveCard } from "@/lib/data/ingestion-engine";

/* ═══════════════════════════════════════════════════════════════
   Cognitive Flows — V10 Daily Data-Driven Learning System
   English Flow / World Intelligence / Learning Plan
   All content from real RSS sources. No hallucination.
   ═══════════════════════════════════════════════════════════════ */

const FLOWS = [
  { id: "english" as const, icon: BookOpen, label: "English Flow", desc: "Economist / BBC 精选", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
  { id: "world" as const, icon: Globe, label: "World Intelligence", desc: "HN / Reddit 全球视野", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  { id: "planning" as const, icon: Calendar, label: "Learning Plan", desc: "系统生成今日学习任务", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
];

export function CognitiveFlows() {
  const [activeFlow, setActiveFlow] = React.useState<"english" | "world" | "planning" | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cards, setCards] = React.useState<CognitiveCard[]>([]);
  const [error, setError] = React.useState("");

  async function loadFlow(flow: "english" | "world" | "planning") {
    setActiveFlow(flow);
    setLoading(true);
    setError("");
    setCards([]);

    try {
      const category = flow === "english" ? "english" : flow === "world" ? "world" : "tech";
      const rawItems = await fetchFlowContent(category);

      if (rawItems.length === 0) {
        setError("暂无数据源可用。RSS 源可能需要网络连接。");
        setLoading(false);
        return;
      }

      const structured = await Promise.all(rawItems.slice(0, 5).map(structureContent));
      const valid = structured.filter(Boolean) as CognitiveCard[];
      setCards(valid);

      if (valid.length === 0) setError("内容结构化为空，请稍后重试。");
    } catch {
      setError("数据获取失败。请检查网络连接。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Flow selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FLOWS.map(flow => (
          <motion.button key={flow.id}
            onClick={() => loadFlow(flow.id)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={cn(
              "card-card p-5 text-left flex flex-col gap-3 transition-all",
              activeFlow === flow.id && "border-primary/40 bg-primary-subtle",
            )}>
            <span className={cn("size-10 rounded-xl flex items-center justify-center", flow.bg)}>
              <flow.icon className={cn("size-5", flow.color)} />
            </span>
            <div>
              <p className="text-small font-medium">{flow.label}</p>
              <p className="text-caption mt-0.5">{flow.desc}</p>
            </div>
            <span className="text-xs text-primary flex items-center gap-1">
              开始 <ChevronRight className="size-3" />
            </span>
          </motion.button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card-card p-8 flex items-center justify-center gap-3">
          <Loader2 className="size-5 text-primary animate-spin" />
          <span className="text-small text-fg-muted">从真实数据源获取内容中...</span>
        </div>
      )}

      {/* Error / Empty */}
      {error && (
        <div className="card-card p-8 text-center">
          <p className="text-small text-fg-muted">{error}</p>
          <p className="text-caption mt-1">所有内容来自真实 RSS 源，无 AI 虚构。</p>
        </div>
      )}

      {/* Cognitive Cards */}
      {cards.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-small text-fg-muted">
            {activeFlow === "english" ? "English Flow" : activeFlow === "world" ? "World Intelligence" : "Learning Plan"}
            {" · "}{cards.length} 个结构化认知单元
          </p>

          {cards.map((card, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-card p-5 flex flex-col gap-3">
              {/* Key Concept */}
              <div>
                <p className="text-label">核心概念</p>
                <p className="text-small font-medium mt-1">{card.keyConcept}</p>
              </div>

              {/* Explanation */}
              {card.explanation && (
                <div>
                  <p className="text-label">解释</p>
                  <p className="text-small text-fg-muted mt-1 leading-relaxed">{card.explanation}</p>
                </div>
              )}

              {/* Example + Misconception side by side */}
              {(card.example || card.misconception) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {card.example && (
                    <div className="rounded-xl bg-bg-muted p-3">
                      <p className="text-label">示例</p>
                      <p className="text-caption mt-0.5">{card.example}</p>
                    </div>
                  )}
                  {card.misconception && (
                    <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/10 p-3">
                      <p className="text-label">常见误区</p>
                      <p className="text-caption mt-0.5">{card.misconception}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action */}
              {card.actionableInsight && (
                <div className="rounded-xl bg-primary-subtle p-3 flex items-start gap-2">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label">行动建议</p>
                    <p className="text-caption mt-0.5">{card.actionableInsight}</p>
                  </div>
                </div>
              )}

              {/* Source */}
              <div className="flex items-center justify-between text-caption">
                <span>来源: {card.source}</span>
                <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline">
                  原文 <ExternalLink className="size-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
