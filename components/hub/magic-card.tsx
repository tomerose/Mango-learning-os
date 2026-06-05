"use client";

import * as React from "react";
import { X, ArrowLeft, Loader2, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";

// ─────────────────────────────────────────────────────────────
// Mango Magic Card — 参考图风格：3+2 网格，圆形图标，全屏弹窗
// ─────────────────────────────────────────────────────────────

const MODES = [
  {
    id: "exam" as const,
    emoji: "📚",
    icon: "📖",
    color: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    label: "明天考试",
    desc: "生成复习资料、题目、冲刺计划",
    placeholder: "请输入考试科目和重点章节，例如：微观经济学期末，重点消费者理论、市场结构…",
  },
  {
    id: "notes" as const,
    emoji: "📝",
    icon: "✏️",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "整理课堂",
    desc: "生成课堂总结、笔记、思维导图、卡片",
    placeholder: "请输入课程主题，例如：Transformer 注意力机制，今天讲了 QKV 计算…",
  },
  {
    id: "plan" as const,
    emoji: "🎯",
    icon: "🎯",
    color: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    label: "制定计划",
    desc: "生成学习计划、目标拆解、时间规划",
    placeholder: "请描述目标和可用时间，例如：两周内学完 Python 数据分析，每天 2 小时…",
  },
  {
    id: "learn" as const,
    emoji: "💡",
    icon: "💡",
    color: "bg-sky-100 dark:bg-sky-900/30",
    iconColor: "text-sky-600 dark:text-sky-400",
    label: "学习新领域",
    desc: "生成学习路线图、知识框架、推荐资源",
    placeholder: "请描述感兴趣的领域，例如：想系统学机器学习，有编程基础但没接触过 AI…",
  },
  {
    id: "recommend" as const,
    emoji: "🤔",
    icon: "🤔",
    color: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "不知道学什么",
    desc: "分析个人情况，推荐最值得学的内容",
    placeholder: "简单说说你最近学了什么，或者哪些方向感兴趣…",
  },
];

type Mode = typeof MODES[number]["id"];
type Step = "select" | "input" | "loading" | "result";

export function MagicCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const [step, setStep] = React.useState<Step>("select");
  const [mode, setMode] = React.useState<Mode | null>(null);
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState<Record<string, unknown> | null>(null);
  const [error, setError] = React.useState("");

  function reset() { setStep("select"); setMode(null); setInput(""); setResult(null); setError(""); }

  async function generate() {
    if (!input.trim()) { setError("请输入内容后再生成"); return; }
    setStep("loading"); setError("");
    try {
      const res = await fetch("/api/ai/magic", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setResult(data.result);
      setStep("result");
      // Auto-save notes
      if (mode === "notes" && typeof data.result?.notes === "string") {
        store.addNote({ subject: "ai", title: `笔记：${input.slice(0, 30)}`, body: data.result.notes, tags: ["Mango Magic"] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
      setStep("input");
    }
  }

  function copyAll() {
    if (!result) return;
    const text = Object.values(result).filter((v) => typeof v === "string").join("\n\n---\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  if (!open) return null;
  const currentMode = MODES.find((m) => m.id === mode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) { reset(); onClose(); } }}
    >
      <div className="relative w-full max-w-lg mx-4 max-h-[88dvh] overflow-y-auto rounded-3xl bg-background shadow-2xl border animate-in fade-in-0 slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-background border-b rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold">你现在最需要什么？</h2>
            <p className="text-xs text-muted-foreground mt-0.5">选择你的学习场景，Mango Magic 为你一键生成</p>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="size-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6">
          {/* ══ Select ══ */}
          {step === "select" && (
            <div className="grid grid-cols-3 gap-3">
              {MODES.slice(0, 3).map((m) => (
                <button key={m.id} onClick={() => { setMode(m.id); setStep("input"); }}
                  className="flex flex-col items-center gap-2.5 rounded-2xl border p-4 hover:border-primary/40 hover:bg-muted/40 transition-all text-center group">
                  <div className={cn("size-14 rounded-2xl flex items-center justify-center text-2xl", m.color)}>
                    {m.icon}
                  </div>
                  <p className="text-sm font-semibold leading-tight">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{m.desc}</p>
                </button>
              ))}
              <div className="col-span-3 grid grid-cols-2 gap-3">
                {MODES.slice(3).map((m) => (
                  <button key={m.id} onClick={() => { setMode(m.id); setStep("input"); }}
                    className="flex flex-col items-center gap-2.5 rounded-2xl border p-4 hover:border-primary/40 hover:bg-muted/40 transition-all text-center group">
                    <div className={cn("size-14 rounded-2xl flex items-center justify-center text-2xl", m.color)}>
                      {m.icon}
                    </div>
                    <p className="text-sm font-semibold leading-tight">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ Input ══ */}
          {step === "input" && currentMode && (
            <div className="space-y-4">
              <button onClick={() => setStep("select")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-3" /> 返回选择
              </button>
              <div className={cn("flex items-center gap-3 rounded-2xl p-3", currentMode.color)}>
                <span className="text-2xl">{currentMode.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{currentMode.label}</p>
                  <p className="text-xs text-muted-foreground">{currentMode.desc}</p>
                </div>
              </div>
              <Textarea value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={currentMode.placeholder} className="min-h-28 text-sm resize-none rounded-2xl" autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }} />
              {error && <p className="text-destructive text-xs">{error}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">⌘ + Enter 快速生成</span>
                <Button onClick={generate} disabled={!input.trim()} className="rounded-xl px-6">
                  🥭 一键生成
                </Button>
              </div>
            </div>
          )}

          {/* ══ Loading ══ */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="relative size-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <span className="text-2xl">🥭</span>
              </div>
              <p className="text-sm font-medium">正在为你生成内容…</p>
              <p className="text-xs text-muted-foreground">{currentMode?.label}</p>
              <Progress value={65} className="h-1 w-40" />
            </div>
          )}

          {/* ══ Result ══ */}
          {step === "result" && result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-green-500" /> 生成完成
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={copyAll}>
                    <Copy className="size-3.5 mr-1" /> 复制全部
                  </Button>
                  <Button size="sm" className="rounded-xl" onClick={() => { reset(); onClose(); }}>完成</Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[50dvh] overflow-y-auto">
                {/* Text sections */}
                {Object.entries(result).filter(([, v]) => typeof v === "string").map(([key, value]) => (
                  <div key={key} className="rounded-2xl border bg-muted/20 p-4">
                    <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{String(value)}</pre>
                  </div>
                ))}
                {/* Exercises */}
                {Array.isArray(result.exercises) && (result.exercises as Array<Record<string, unknown>>).length > 0 && (
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs font-semibold mb-2">📝 练习题</p>
                    {(result.exercises as Array<Record<string, unknown>>).map((q, i) => (
                      <details key={i} className="mb-2">
                        <summary className="text-xs cursor-pointer">{i + 1}. {String(q.question || "")}</summary>
                        <div className="mt-1 ml-3 text-xs text-muted-foreground">
                          <p>✅ {String(q.answer || "")}</p>
                          <p>💡 {String(q.explanation || "")}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
                {/* Flashcards */}
                {Array.isArray(result.flashcards) && (result.flashcards as Array<Record<string, unknown>>).length > 0 && (
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs font-semibold mb-2">🃏 闪卡</p>
                    {(result.flashcards as Array<Record<string, unknown>>).map((f, i) => (
                      <div key={i} className="mb-1.5 p-2 rounded-lg bg-background text-xs">
                        <p className="font-medium">Q: {String(f.front || "")}</p>
                        <p className="text-muted-foreground">A: {String(f.back || "")}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Recommendations */}
                {Array.isArray(result.recommendations) && (result.recommendations as Array<Record<string, unknown>>).length > 0 && (
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs font-semibold mb-2">🎯 推荐任务</p>
                    {(result.recommendations as Array<Record<string, unknown>>).map((r, i) => (
                      <div key={i} className="mb-2 p-2 rounded-xl bg-primary/5">
                        <p className="text-xs font-medium">{String(r.title || "")}</p>
                        <p className="text-[10px] text-muted-foreground">{String(r.description || "")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setStep("input"); setResult(null); }}>
                <ArrowLeft className="size-3.5 mr-1" /> 修改输入
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
