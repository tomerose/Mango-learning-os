"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Mic, Brain, Network, BookOpen, Heart, Layers } from "lucide-react";

const STORAGE_KEY = "mango-onboarding-v3";

const FEATURES = [
  { icon: Brain, label: "AI 学习伴侣", desc: "智能导师 + 5种学习身份" },
  { icon: Mic, label: "Mango Voice", desc: "实时语音对话 · 全平台可用" },
  { icon: Network, label: "知识森林", desc: "AI自动生成知识网络" },
  { icon: BookOpen, label: "考试备战", desc: "上传资料 → 自动生成复习包" },
  { icon: Layers, label: "间隔重复", desc: "SM-2 科学闪卡记忆" },
  { icon: Heart, label: "心灵花园", desc: "情绪追踪 · CBT 重构" },
];

interface Props { onComplete: () => void; }
type Stage = "logo" | "greeting" | "enter";

export function MangoOnboarding({ onComplete }: Props) {
  const [stage, setStage] = React.useState<Stage>("logo");
  const [exiting, setExiting] = React.useState(false);
  const [visibleFeatures, setVisibleFeatures] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStage("greeting"), 1500);
    const t2 = setTimeout(() => setStage("enter"), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  React.useEffect(() => {
    if (stage !== "greeting") return;
    if (visibleFeatures >= FEATURES.length) return;
    const t = setTimeout(() => setVisibleFeatures(v => v + 1), 120);
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
          style={{ background: "#F7F4EF" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ambient blobs */}
          <motion.div className="absolute -top-24 -left-24 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(197,139,116,0.15) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity }} />
          <motion.div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(138,158,139,0.1) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 }} />

          <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-sm mx-auto text-center">
            {/* Stage 1: Logo */}
            {stage === "logo" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-4">
                {/* Mangobo preview */}
                <motion.div className="size-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <video src="/mangobo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </motion.div>
                <h1 className="text-display">Mango Learning OS</h1>
                <p className="text-small text-fg-muted">你的个人学习操作系统</p>
              </motion.div>
            )}

            {/* Stage 2: Greeting + Features */}
            {(stage === "greeting" || stage === "logo") && (
              <motion.div
                initial={stage === "greeting" ? { opacity: 0, y: 16 } : { opacity: 0 }}
                animate={{ opacity: stage === "greeting" ? 1 : 0, y: stage === "greeting" ? 0 : 16 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-5 w-full">
                <div className="flex flex-col gap-1">
                  <h2 className="text-title">你的学习，被优雅地组织起来</h2>
                  <p className="text-small text-fg-muted">把焦虑变成准备</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {FEATURES.map((f, i) => (
                    <motion.div key={f.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={i < visibleFeatures ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="flex items-start gap-2.5 rounded-xl border border-border/40 p-3 text-left bg-surface-low/50">
                      <f.icon className="size-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <p className="text-xs font-medium">{f.label}</p>
                        <p className="text-[10px] text-fg-muted mt-0.5">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stage 3: Enter */}
            {stage === "enter" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6">
                <p className="text-title">准备好了吗？</p>
                <motion.button onClick={handleEnter}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-on px-10 py-3.5 text-subhead font-medium hover:bg-primary-hover transition-colors duration-200"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                  进入 Mango <ArrowRight className="size-5" />
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-12 flex gap-2.5">
            {["logo", "greeting", "enter"].map((s) => (
              <motion.div key={s} className="size-1.5 rounded-full"
                animate={{
                  backgroundColor: stage === s ? "var(--color-primary)" : "var(--color-border-strong)",
                  scale: stage === s ? 1.4 : 1,
                }}
                transition={{ duration: 0.4 }} />
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
    return (Date.now() - data.date) / 86400000 > 7;
  } catch { return true; }
}
