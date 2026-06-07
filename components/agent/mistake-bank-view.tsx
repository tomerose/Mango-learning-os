"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Search, Filter, X, CheckCircle2, AlertTriangle,
  Plus, Trash2, ExternalLink, Brain, BookOpen, Clock,
  ChevronRight, Flame, TrendingUp, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { loadMistakes, deleteMistake, reviewMistake, getMistakeStats } from "@/lib/agent/mistake-bank";
import type { MistakeEntry } from "@/lib/agent/types";

const REASON_LABELS: Record<string, string> = {
  concept: "概念不清",
  calculation: "计算错误",
  memory: "记忆遗漏",
  careless: "粗心大意",
  unknown: "未分类",
};

export function MistakeBankView() {
  const [mistakes, setMistakes] = React.useState<MistakeEntry[]>([]);
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({ total: 0, mastered: 0, due: 0, bySubject: {} as Record<string, number> });

  React.useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    const all = loadMistakes();
    setMistakes(all);
    setStats(getMistakeStats());
  }

  const filtered = mistakes.filter(m => {
    if (filter === "due") return !m.mastered && m.nextReview <= new Date().toISOString().slice(0, 10);
    if (filter === "mastered") return m.mastered;
    if (filter !== "all") return m.subject === filter;
    return true;
  }).filter(m => {
    if (!search) return true;
    return m.question.includes(search) || m.knowledgePoint.includes(search) || m.subject.includes(search);
  });

  const subjects = [...new Set(mistakes.map(m => m.subject))].filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "全部", value: stats.total, color: "bg-bg-muted" },
          { label: "待复习", value: stats.due, color: "bg-amber-100 text-amber-700" },
          { label: "已掌握", value: stats.mastered, color: "bg-emerald-100 text-emerald-700" },
          { label: "掌握率", value: stats.total > 0 ? `${Math.round((stats.mastered / stats.total) * 100)}%` : "--", color: "bg-primary-subtle text-primary" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl p-3 flex flex-col gap-1", s.color)}>
            <span className="text-xl font-bold font-serif">{s.value}</span>
            <span className="text-[10px]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索错题…" className="pl-9 text-xs rounded-xl" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="text-xs border border-border rounded-xl px-3 py-2 bg-bg-surface">
          <option value="all">全部</option>
          <option value="due">待复习</option>
          <option value="mastered">已掌握</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Mistake cards */}
      {filtered.length === 0 ? (
        <div className="card-card p-8 flex flex-col items-center gap-4 text-center">
          <Target className="size-10 text-fg-subtle/80" />
          <div>
            <p className="text-base font-medium font-serif">暂无错题</p>
            <p className="text-sm text-fg-muted mt-1">通过 Agent 任务、测验或手动添加错题来开始积累。</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(mistake => {
            const isExpanded = expanded === mistake.id;
            return (
              <div key={mistake.id} className="card-card overflow-hidden">
                <button onClick={() => setExpanded(isExpanded ? null : mistake.id)}
                  className="w-full p-4 flex items-start gap-3 text-left">
                  <div className={cn("size-2 rounded-full mt-1.5 shrink-0",
                    mistake.mastered ? "bg-emerald-400" : mistake.nextReview <= new Date().toISOString().slice(0, 10) ? "bg-amber-400" : "bg-fg-muted/30")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{mistake.question}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[9px]">{mistake.subject || "未分类"}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{REASON_LABELS[mistake.reason] ?? mistake.reason}</Badge>
                      <span className="text-[9px] text-fg-muted">复习 {mistake.reviewCount} 次</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("size-4 text-fg-muted/80 mt-1 transition-transform", isExpanded && "rotate-90")} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/30 pt-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-fg-muted">你的答案</span>
                            <span className="text-red-600 font-medium">{mistake.userAnswer || "(空)"}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-fg-muted">正确答案</span>
                            <span className="text-emerald-600 font-medium">{mistake.correctAnswer}</span>
                          </div>
                        </div>
                        {mistake.explanation && (
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="text-fg-muted">解析</span>
                            <p className="text-fg">{mistake.explanation}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => { reviewMistake(mistake.id, true); refresh(); }}
                            className="gap-1.5 rounded-xl text-xs h-8">✅ 掌握了</Button>
                          <Button size="sm" variant="outline" onClick={() => { reviewMistake(mistake.id, false); refresh(); }}
                            className="gap-1.5 rounded-xl text-xs h-8">🔄 再练</Button>
                          <Button size="sm" variant="ghost" onClick={() => { deleteMistake(mistake.id); refresh(); setExpanded(null); }}
                            className="gap-1.5 rounded-xl text-xs h-8 text-red-400 ml-auto">
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
