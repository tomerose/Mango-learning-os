"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, BookOpen, CalendarCheck, TrendingUp,
  Heart, Layers, Zap, ArrowRight, ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "mango-onboarding-v2";

const FEATURES = [
  { icon: Brain, title: "AI 导师", desc: "结构化讲解任何概念，即时反馈和练习" },
  { icon: BookOpen, title: "考试备战", desc: "上传资料，AI 生成复习手册和模拟题" },
  { icon: CalendarCheck, title: "学习计划", desc: "AI 分析目标，自动生成每日学习计划" },
  { icon: Layers, title: "知识图谱", desc: "笔记、闪卡、测验自动连接成知识网络" },
  { icon: TrendingUp, title: "学习分析", desc: "追踪时长、专注度、掌握度变化" },
  { icon: Heart, title: "心灵花园", desc: "情绪追踪、CBT 重构、AI 陪伴" },
];

const HUB_PREVIEW = {
  stats: [
    { label: "今日任务", value: "2/6" },
    { label: "连续天数", value: "7 天" },
    { label: "待复习", value: "5 张" },
  ],
};

interface Props { onComplete: () => void; }
type Stage = "logo" | "welcome" | "features" | "hub" | "enter";

export function MangoOnboarding({ onComplete }: Props) {
  const [stage, setStage] = React.useState<Stage>("logo");
  const [visibleFeatures, setVisibleFeatures] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage("welcome"), 1800));
    timers.push(setTimeout(() => setStage("features"), 3400));
    timers.push(setTimeout(() => setStage("hub"), 6200));
    timers.push(setTimeout(() => setStage("enter"), 8200));
    return () => timers.forEach(clearTimeout);
  }, []);

  React.useEffect(() => {
    if (stage !== "features") return;
    if (visibleFeatures >= FEATURES.length) return;
    const t = setTimeout(() => setVisibleFeatures((v) => v + 1), 100);
    return () => clearTimeout(t);
  }, [stage, visibleFeatures]);

  function handleEnter() {
    setExiting(true);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, date: Date.now() })); } catch {}
    setTimeout(onComplete, 500);
  }

  const exitAnim = exiting ? { opacity: 0, filter: "blur(4px)" } : {};

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0C0C0D" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ambient gradient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-32 w-80 h-80 bg-accent/[0.02] rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-lg mx-auto text-center">
            {/* ═══ STAGE 1: Logo ═══ */}
            {(stage === "logo") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-4"
              >
                <div className="size-20 rounded-2xl bg-primary-subtle flex items-center justify-center">
                  <Sparkles className="size-10 text-primary" strokeWidth={1} />
                </div>
                <p className="text-label text-fg-muted">第三自习室出品</p>
              </motion.div>
            )}

            {/* ═══ STAGE 2: Welcome ═══ */}
            {(stage === "welcome" || stage === "logo") && (
              <motion.div
                initial={stage === "welcome" ? { opacity: 0, y: 12 } : { opacity: 0 }}
                animate={{ opacity: stage === "welcome" ? 1 : 0, y: stage === "welcome" ? 0 : 12 }}
                transition={{ duration: 0.6, delay: stage === "welcome" ? 0 : 0 }}
                className="flex flex-col items-center gap-3"
              >
                <h1 className="text-display text-fg">Mango Learning OS</h1>
                <p className="text-body text-fg-muted max-w-xs leading-relaxed">
                  你的个人学习操作系统。<br />
                  把焦虑变成准备。
                </p>
              </motion.div>
            )}

            {/* ═══ STAGE 3: Features ═══ */}
            {stage === "features" && (
              <div className="flex flex-col items-center gap-5 w-full">
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                  className="flex flex-col gap-1"
                >
                  <h2 className="text-title">你的学习，<span className="text-fg-muted">被优雅地组织起来</span></h2>
                  <p className="text-small text-fg-muted">AI 辅导 · 间隔重复 · 知识图谱 · 项目实践</p>
                </motion.div>
                <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={i < visibleFeatures ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="flex items-start gap-2.5 rounded-xl border border-border/40 p-3 text-left bg-bg-subtle/50"
                    >
                      <f.icon className="size-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <p className="text-small font-medium">{f.title}</p>
                        <p className="text-caption mt-0.5 leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ STAGE 4: Hub Preview ═══ */}
            {stage === "hub" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-5 w-full"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-title">一切从这里开始</h2>
                  <p className="text-small text-fg-muted">打开即看到你今天需要做什么</p>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                  {HUB_PREVIEW.stats.map((s) => (
                    <div key={s.label} className="card-flat p-3 text-center flex flex-col gap-0.5">
                      <span className="text-title font-mono">{s.value}</span>
                      <span className="text-caption">{s.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ STAGE 5: Enter ═══ */}
            {stage === "enter" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <p className="text-title">准备好了吗？</p>
                <motion.button
                  onClick={handleEnter}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-on px-8 py-3 text-subhead font-medium hover:bg-primary-hover transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  进入 Mango
                  <ArrowRight className="size-5" />
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-10 flex gap-2">
            {["logo", "welcome", "features", "hub", "enter"].map((s, i) => (
              <motion.div
                key={s}
                className="size-1.5 rounded-full"
                animate={{
                  backgroundColor: stage === s ? "var(--color-primary)" : "var(--color-border-strong)",
                  scale: stage === s ? 1.3 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function shouldShowOnboarding(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const data = JSON.parse(raw);
    if (!data.completed) return true;
    const daysSince = (Date.now() - data.date) / 86400000;
    return daysSince > 7;
  } catch { return true; }
}
