"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Mic, Brain, Network, BookOpen, Heart, Layers, X } from "lucide-react";
import { ONBOARDING_KEY } from "@/lib/version";

const FEATURES = [
  { icon: Brain, label: "AI 学习伴侣", desc: "智能导师 + 5 种学习身份", color: "#C58B74" },
  { icon: Mic, label: "Mango Voice", desc: "实时语音对话 · 全平台可用", color: "#7B8FCA" },
  { icon: Network, label: "知识森林", desc: "AI 自动生成知识网络", color: "#8A9E8B" },
  { icon: BookOpen, label: "学习包生成", desc: "上传资料 → 复习讲义 + 导出", color: "#D4A090" },
  { icon: Layers, label: "间隔重复", desc: "SM-2 科学闪卡记忆", color: "#C58B74" },
  { icon: Heart, label: "心灵花园", desc: "情绪追踪 · CBT 重构 · 陪伴", color: "#E8A0BF" },
];

interface Props { onComplete: () => void; }

export function MangoOnboarding({ onComplete }: Props) {
  const [exiting, setExiting] = React.useState(false);
  const [visibleFeatures, setVisibleFeatures] = React.useState(0);
  const [showEnter, setShowEnter] = React.useState(false);

  // Stagger features in
  React.useEffect(() => {
    if (visibleFeatures >= FEATURES.length) {
      // Show enter button after all features are visible
      const t = setTimeout(() => setShowEnter(true), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleFeatures(v => v + 1), 100);
    return () => clearTimeout(t);
  }, [visibleFeatures]);

  function handleEnter() {
    setExiting(true);
    try { localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ completed: true, date: Date.now() })); } catch {}
    setTimeout(onComplete, 400);
  }

  const exitAnim = exiting ? { opacity: 0, y: -20, filter: "blur(4px)" } : {};

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #0b0906 0%, #11100d 40%, #070604 100%)",
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Cinematic glow orbs */}
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(197,139,116,0.1) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          />

          {/* Skip button */}
          <button
            onClick={handleEnter}
            className="absolute top-6 right-6 z-20 flex items-center gap-1.5 rounded-full bg-white/8 px-4 py-2 text-xs font-medium text-white/50 hover:bg-white/12 hover:text-white/70 transition-colors"
          >
            跳过 <X className="size-3" />
          </button>

          <motion.div
            style={exitAnim}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm mx-auto text-center"
          >
            {/* Logo + Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              {/* Mango emblem */}
              <motion.div
                className="size-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(245,158,11,0.08))",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 20px 60px rgba(245,158,11,0.15)",
                }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="size-10 text-amber-200" strokeWidth={1} />
              </motion.div>
              <div>
                <h1 className="text-[2rem] font-semibold tracking-normal text-white">Mango OS</h1>
                <p className="text-sm text-white/40 mt-1">你的 AI 学习操作系统</p>
              </div>
            </motion.div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={i < visibleFeatures ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-2.5 rounded-2xl p-3 text-left"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="size-8 shrink-0 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: `${f.color}22` }}
                  >
                    <f.icon className="size-4" style={{ color: f.color }} strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">{f.label}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enter button */}
            <motion.button
              onClick={handleEnter}
              initial={{ opacity: 0, y: 8 }}
              animate={showEnter ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-2xl px-10 py-3.5 text-sm font-semibold text-black"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 12px 40px rgba(245,158,11,0.3)",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              进入 Mango <ArrowRight className="size-4" />
            </motion.button>
          </motion.div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#070604] to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function shouldShowOnboarding(): boolean {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return true;
    const data = JSON.parse(raw);
    if (!data.completed) return true;
    // Show again if last shown more than 30 days ago
    return (Date.now() - data.date) / 86400000 > 30;
  } catch { return true; }
}
