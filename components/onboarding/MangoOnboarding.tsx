"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ParticleBackground } from "./ParticleBackground";
import { GradientLights } from "./GradientLights";

// ─────────────────────────────────────────────────────────────
// Mango Onboarding — 5-stage premium welcome experience
// Logo Reveal → Welcome → Feature Discovery → Hub Preview → Enter
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "mango-onboarding-v1";

const FEATURES = [
  { icon: "🌳", title: "心灵树洞", desc: "匿名倾诉，温暖陪伴" },
  { icon: "📚", title: "期末冲刺讲义制作", desc: "上传资料，一键生成复习手册" },
  { icon: "🎯", title: "智能学习计划", desc: "分析课表，自动生成日程" },
  { icon: "📝", title: "知识点总结", desc: "笔记 → 闪卡 → 知识图谱" },
  { icon: "📊", title: "学习数据分析", desc: "追踪时长、专注度、掌握度" },
  { icon: "💜", title: "声魂蒸馏", desc: "上传聊天记录，重建数字挚友" },
];

const HUB_PREVIEW = {
  course: { name: "商务英语 3", progress: 68 },
  exam: { name: "高等数学 II", date: "6月20日" },
  weak: { name: "第 8 章 特征值分解", accuracy: 55 },
  action: { label: "25 分钟专注冲刺", module: "Mango Tutor" },
};

interface Props {
  onComplete: () => void;
}

type Stage = "logo" | "welcome" | "features" | "hub" | "enter";

export function MangoOnboarding({ onComplete }: Props) {
  const [stage, setStage] = React.useState<Stage>("logo");
  const [visibleFeatures, setVisibleFeatures] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);

  // Stage sequencing
  React.useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setStage("welcome"), 2000));
    timers.push(setTimeout(() => setStage("features"), 3800));
    timers.push(setTimeout(() => setStage("hub"), 6800));
    timers.push(setTimeout(() => setStage("enter"), 8800));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Sequential feature reveal
  React.useEffect(() => {
    if (stage !== "features") return;
    if (visibleFeatures >= FEATURES.length) return;
    const t = setTimeout(() => setVisibleFeatures((v) => v + 1), 120);
    return () => clearTimeout(t);
  }, [stage, visibleFeatures]);

  // Persist completion
  function handleEnter() {
    setExiting(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, date: Date.now() }));
    } catch {}
    setTimeout(onComplete, 600);
  }

  // Animate out
  const exitAnim = exiting ? { opacity: 0, filter: "blur(8px)" } : {};

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0f0b08 0%, #1a1410 40%, #0f0d14 100%)" }}
          animate={exitAnim}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <ParticleBackground />
          <GradientLights />

          <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8 px-4 md:px-6 text-center max-w-2xl w-full">
            {/* ═══ Stage 1: Logo Reveal ═══ */}
            <AnimatePresence>
              {stage !== "enter" && (
                <motion.div
                  key="logo-group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative"
                >
                  {/* Ambient glow behind logo */}
                  <div className="absolute inset-0 rounded-full blur-[60px] bg-gradient-to-br from-orange-400/30 via-amber-400/20 to-purple-500/20 animate-pulse" style={{ animationDuration: "4s" }} />
                  {/* Logo */}
                  <motion.img
                    src="/favicon-32.png"
                    alt="Mango"
                    className="relative size-20 mx-auto rounded-2xl"
                    animate={{ filter: ["drop-shadow(0 0 20px rgba(251,146,60,0.3))", "drop-shadow(0 0 40px rgba(251,146,60,0.6))", "drop-shadow(0 0 20px rgba(251,146,60,0.3))"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Stage 2: Welcome Message ═══ */}
            <AnimatePresence>
              {(stage === "welcome" || stage === "features" || stage === "hub" || stage === "enter") && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.h1
                    className="text-3xl md:text-5xl font-bold tracking-tight text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Welcome,
                  </motion.h1>
                  <motion.h2
                    className="text-3xl md:text-4xl font-semibold tracking-tight text-white/80"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    My Mango Explorer.
                  </motion.h2>
                  <motion.div
                    className="mt-4 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 1.0 }}
                  >
                    <p className="text-base text-white/40 font-light tracking-wide">让学习更有温度，</p>
                    <p className="text-base text-white/40 font-light tracking-wide">让成长自然发生。</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Stage 3: Feature Discovery ═══ */}
            <AnimatePresence>
              {(stage === "features" || stage === "hub" || stage === "enter") && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-xl"
                >
                  {FEATURES.slice(0, visibleFeatures).map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.175, 0.885, 0.32, 1.275],
                      }}
                      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.18 } }}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-4 cursor-default"
                    >
                      <span className="text-2xl">{f.icon}</span>
                      <p className="text-xs font-medium text-white/70">{f.title}</p>
                      <p className="text-[10px] text-white/30 leading-tight">{f.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Stage 4: Hub Preview ═══ */}
            <AnimatePresence>
              {(stage === "hub" || stage === "enter") && (
                <motion.div
                  key="hub"
                  initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6"
                >
                  <p className="text-sm font-semibold text-white/60 mb-4 tracking-wide">Today&apos;s Learning</p>
                  <div className="space-y-3">
                    {/* Course progress */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{HUB_PREVIEW.course.name}</span>
                      <span className="text-xs font-medium text-orange-400">{HUB_PREVIEW.course.progress}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${HUB_PREVIEW.course.progress}%` }}
                        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    {/* Exam */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-white/50">Next Exam</span>
                      <span className="text-xs text-white/40">{HUB_PREVIEW.exam.name} · {HUB_PREVIEW.exam.date}</span>
                    </div>
                    {/* Weak area */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Weak Area</span>
                      <span className="text-xs text-red-400/60">{HUB_PREVIEW.weak.name} · {HUB_PREVIEW.weak.accuracy}%</span>
                    </div>
                    {/* Recommended */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-white/60 flex items-center gap-1.5">
                        <Sparkles className="size-3 text-orange-400" />
                        {HUB_PREVIEW.action.label}
                      </span>
                      <span className="text-[10px] text-white/30">{HUB_PREVIEW.action.module}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Stage 5: Enter Button ═══ */}
            <AnimatePresence>
              {stage === "enter" && (
                <motion.div
                  key="enter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.button
                    onClick={handleEnter}
                    className="px-8 py-3 rounded-full bg-white text-black font-semibold text-sm tracking-wide hover:bg-white/90 transition-colors"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Enter MangoLearningOS
                  </motion.button>
                  <p className="text-[10px] text-white/20 mt-3">Mango OS · 第三自习室出品</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip button — always visible */}
            <motion.button
              onClick={handleEnter}
              className="absolute top-6 right-6 text-xs text-white/20 hover:text-white/50 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
            >
              跳过
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Helper: check if onboarding should show ─────────────────
export function shouldShowOnboarding(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const data = JSON.parse(raw);
    return !data.completed;
  } catch { return true; }
}

export function resetOnboarding(): void {
  localStorage.removeItem(STORAGE_KEY);
}
