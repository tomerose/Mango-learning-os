"use client";

/**
 * MangoOS V14.8.1 — Quick Start Guide
 * Inspired by luongnv89/claude-howto (36K ★): visual, example-driven learning path.
 *
 * A lightweight dismissible onboarding overlay for first-time users.
 * Shows 4 steps: Pick a task → AI researches → Review quality → Export PDF.
 *
 * Persisted: 7-day hide after completion (same as existing onboarding).
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, FileCheck, FileOutput, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: <Search className="size-5" />,
    title: "输入学习任务",
    desc: "告诉 MangoAgent 你要完成什么 — 期末复习、论文整理、知识梳理。支持粘贴文字、上传文件、输入网址。",
  },
  {
    icon: <Sparkles className="size-5" />,
    title: "AI 自动检索 + 生成",
    desc: "Agent 自动联网搜索 11 个数据源(学术/视频/公众号/小红书), 生成结构化内容。Pro 用户强制检索 + 90 分质量门禁。",
  },
  {
    icon: <FileCheck className="size-5" />,
    title: "审核与优化",
    desc: "质量评分实时显示。低于 90 分自动加深生成(最多 2 轮)。你可以随时要求修改、补充、调整。",
  },
  {
    icon: <FileOutput className="size-5" />,
    title: "导出成品",
    desc: "一键导出 PDF / Word / Markdown / HTML。所有成果自动保存到 Library, 随时复用。",
  },
];

function hasSeenGuide(): boolean {
  if (typeof window === "undefined") return true;
  const ts = localStorage.getItem("mango-quickstart-dismissed");
  if (!ts) return false;
  return Date.now() - Number(ts) < 7 * 24 * 60 * 60 * 1000; // 7 days
}

function markSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem("mango-quickstart-dismissed", String(Date.now()));
  }
}

export function QuickStartGuide() {
  const [visible, setVisible] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!hasSeenGuide()) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    markSeen();
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-24 z-50 mx-auto w-[calc(100%-2rem)] max-w-md md:bottom-8"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-xl">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 h-0.5 bg-primary/30 w-full">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  快速入门 · {step + 1}/{STEPS.length}
                </span>
                <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="size-4" />
                </button>
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex gap-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {STEPS[step].icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold">{STEPS[step].title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{STEPS[step].desc}</p>
                </div>
              </motion.div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-1.5 rounded-full transition-colors duration-200",
                        i === step ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-on hover:bg-primary-hover transition-colors"
                >
                  {step < STEPS.length - 1 ? "下一步" : "开始使用"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
