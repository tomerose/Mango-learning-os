"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar, BookOpen, FileText, Lightbulb, RotateCcw,
  ArrowRight, Sparkles,
} from "lucide-react";

// ── Intent types ───────────────────────────────────────────────

export type TodayIntent =
  | "daily_plan"
  | "study_outcome"
  | "material_organize"
  | "project_thinking"
  | "daily_review";

export interface TodayEntry {
  type: TodayIntent;
  userGoal: string;
  recommendedRoute: string;
  suggestedPrompt: string;
  createdAt: string;
}

const STORAGE_KEY = "mango-today-entry";

const INTENTIONS: { id: TodayIntent; label: string; icon: React.ElementType; route: string; prompt: string }[] = [
  {
    id: "daily_plan",
    label: "安排今天",
    icon: Calendar,
    route: "/planner",
    prompt: "帮我安排今天的学习计划：列出优先级任务、时间分配和预期成果。",
  },
  {
    id: "study_outcome",
    label: "复习一门课",
    icon: BookOpen,
    route: "/agent",
    prompt: "帮我生成一门课程的复习讲义，包含知识框架、重点考点、典型例题和复习计划。",
  },
  {
    id: "material_organize",
    label: "整理一份资料",
    icon: FileText,
    route: "/agent?tab=knowledge",
    prompt: "帮我整理以下学习资料，提取关键概念、结构化笔记和复习要点。",
  },
  {
    id: "project_thinking",
    label: "推进一个项目",
    icon: Lightbulb,
    route: "/agent",
    prompt: "帮我分析一个学习项目：拆解目标、规划步骤、评估难点和资源需求。",
  },
  {
    id: "daily_review",
    label: "复盘今天",
    icon: RotateCcw,
    route: "/grow",
    prompt: "帮我复盘今天的学习：回顾完成情况、总结收获、记录待改进点和明天计划。",
  },
];

// ── Component ──────────────────────────────────────────────────

export function MangoTodayEntry() {
  const router = useRouter();
  const [input, setInput] = React.useState("");
  const [selectedIntent, setSelectedIntent] = React.useState<TodayIntent | null>(null);
  const [saved, setSaved] = React.useState(false);

  // Load saved entry
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const entry: TodayEntry = JSON.parse(raw);
        if (Date.now() - new Date(entry.createdAt).getTime() < 86400000) {
          setInput(entry.userGoal);
          setSelectedIntent(entry.type);
          setSaved(true);
        }
      }
    } catch {}
  }, []);

  function handleIntentSelect(intent: (typeof INTENTIONS)[number]) {
    setSelectedIntent(intent.id);
    const entry: TodayEntry = {
      type: intent.id,
      userGoal: intent.prompt,
      recommendedRoute: intent.route,
      suggestedPrompt: intent.prompt,
      createdAt: new Date().toISOString(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entry)); } catch {}
    setSaved(true);
  }

  function handleGo() {
    const intent = INTENTIONS.find(i => i.id === selectedIntent);
    if (intent) {
      const entry: TodayEntry = {
        type: intent.id,
        userGoal: input || intent.prompt,
        recommendedRoute: intent.route,
        suggestedPrompt: input || intent.prompt,
        createdAt: new Date().toISOString(),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entry)); } catch {}
      router.push(intent.route);
    }
  }

  function handleCustomGo() {
    if (!input.trim()) return;
    const entry: TodayEntry = {
      type: "daily_plan",
      userGoal: input.trim(),
      recommendedRoute: "/agent",
      suggestedPrompt: input.trim(),
      createdAt: new Date().toISOString(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entry)); } catch {}
    router.push(`/agent?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div className="mango-glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-200" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">今天你想整理什么？</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCustomGo(); }}
            placeholder="例如：复习微观经济学第3章、整理论文笔记…"
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/30 transition-colors"
          />
          <button
            onClick={handleCustomGo}
            disabled={!input.trim()}
            className="shrink-0 rounded-xl bg-amber-400/15 border border-amber-400/20 px-4 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-400/20 disabled:opacity-30 transition-colors"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Quick intentions */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25 mb-2">快速意图</p>
        <div className="grid grid-cols-2 gap-2">
          {INTENTIONS.map((intent, i) => (
            <motion.button
              key={intent.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => handleIntentSelect(intent)}
              className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                selectedIntent === intent.id
                  ? "bg-amber-400/12 border border-amber-400/25"
                  : "bg-white/[0.04] border border-white/6 hover:bg-white/[0.06]"
              }`}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                selectedIntent === intent.id ? "bg-amber-400/15" : "bg-white/[0.06]"
              }`}>
                <intent.icon className={`size-4 ${selectedIntent === intent.id ? "text-amber-200" : "text-white/40"}`} />
              </span>
              <span className={`text-xs font-medium ${selectedIntent === intent.id ? "text-amber-100" : "text-white/60"}`}>
                {intent.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Go button (when intent selected) */}
      {selectedIntent && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleGo}
          className="w-full rounded-xl bg-amber-400/15 border border-amber-400/25 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-400/20 transition-colors"
        >
          开始执行 <ArrowRight className="size-3.5 inline ml-1" />
        </motion.button>
      )}

      {/* Saved indicator */}
      {saved && selectedIntent && (
        <p className="text-center text-[10px] text-white/25">
          已保存今天的意图 · 可随时返回继续
        </p>
      )}
    </div>
  );
}
