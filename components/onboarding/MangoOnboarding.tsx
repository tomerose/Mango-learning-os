"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const STORAGE_KEY = "mango-onboarding-v2";

const GREETINGS = ["欢迎回来", "今天想学什么？", "把焦虑变成准备"];

interface Props { onComplete: () => void; }
type Stage = "greeting" | "focus" | "start";

export function MangoOnboarding({ onComplete }: Props) {
  const [stage, setStage] = React.useState<Stage>("greeting");
  const [exiting, setExiting] = React.useState(false);
  const [greetingIdx, setGreetingIdx] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStage("focus"), 1800);
    const t2 = setTimeout(() => setStage("start"), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  React.useEffect(() => {
    if (stage === "greeting") {
      const id = setInterval(() => setGreetingIdx((i) => (i + 1) % GREETINGS.length), 600);
      return () => clearInterval(id);
    }
  }, [stage]);

  function handleEnter() {
    setExiting(true);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, date: Date.now() })); } catch {}
    setTimeout(onComplete, 600);
  }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#F7F4EF" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Ambient watercolor blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute -top-32 -left-20 w-72 h-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(198,123,45,0.12) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-24 -right-20 w-64 h-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(122,155,126,0.08) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm mx-auto text-center">
            {/* ═══ STAGE 1: Greeting ═══ */}
            <AnimatePresence mode="wait">
              {stage === "greeting" && (
                <motion.div
                  key="greeting"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-5"
                >
                  <motion.div
                    className="size-20 rounded-3xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(198,123,45,0.15), rgba(122,155,126,0.1))" }}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="size-9 text-[#C67B2D]" strokeWidth={1.2} />
                  </motion.div>
                  <motion.h1
                    className="text-display"
                    key={greetingIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {GREETINGS[greetingIdx]}
                  </motion.h1>
                </motion.div>
              )}

              {/* ═══ STAGE 2: Focus ═══ */}
              {stage === "focus" && (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-5"
                >
                  <motion.div
                    className="size-20 rounded-3xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(198,123,45,0.15), rgba(122,155,126,0.1))" }}
                  >
                    <Sparkles className="size-9 text-[#C67B2D]" strokeWidth={1.2} />
                  </motion.div>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-display">
                      你的<span className="text-primary">学习</span>，<br />
                      被优雅地组织起来
                    </h1>
                    <p className="text-body text-fg-muted max-w-xs leading-relaxed">
                      智能辅导 · 间隔重复 · 知识图谱 · 项目实践<br />
                      帮助你深度学习，而不仅仅是收集信息
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ═══ STAGE 3: Start ═══ */}
              {stage === "start" && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-6"
                >
                  <h1 className="text-title">准备好了吗？</h1>
                  <motion.button
                    onClick={handleEnter}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-on px-10 py-3.5 text-subhead font-medium hover:bg-primary-hover transition-colors duration-200"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    进入 Mango
                    <ArrowRight className="size-5" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-12 flex gap-2.5">
            {["greeting", "focus", "start"].map((s) => (
              <motion.div
                key={s}
                className="size-1.5 rounded-full"
                animate={{
                  backgroundColor: stage === s ? "var(--color-primary)" : "var(--color-border-strong)",
                  scale: stage === s ? 1.4 : 1,
                }}
                transition={{ duration: 0.4 }}
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
    return (Date.now() - data.date) / 86400000 > 7;
  } catch { return true; }
}
