"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";

// Premium upgrade animation — triggers when user becomes Pro
// Uses CSS + Framer Motion (no external deps needed)

interface Props {
  show: boolean;
  onComplete?: () => void;
  planName?: string;
}

export function ProUpgradeAnimation({ show, onComplete, planName = "Pro" }: Props) {
  const [phase, setPhase] = React.useState<"enter" | "celebrate" | "done">("enter");

  React.useEffect(() => {
    if (!show) return;
    setPhase("enter");
    const t1 = setTimeout(() => setPhase("celebrate"), 800);
    const t2 = setTimeout(() => { setPhase("done"); onComplete?.(); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show, onComplete]);

  if (!show || phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        {/* Floating particles */}
        {phase === "celebrate" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: "50vh", x: `${Math.random() * 100}vw` }}
                animate={{ opacity: [0, 1, 0], y: "-10vh" }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                className="absolute text-amber-400"
                style={{ fontSize: 12 + Math.random() * 20 }}
              >
                {Math.random() > 0.5 ? "✨" : "⭐"}
              </motion.div>
            ))}
          </div>
        )}

        {/* Center card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: phase === "celebrate" ? 1 : 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative bg-surface rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
        >
          <motion.div
            animate={phase === "celebrate" ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.6, repeat: 2 }}
            className="size-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-400/30"
          >
            <Crown className="size-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[24px] font-serif font-semibold mb-2 gradient-mango-text"
          >
            升级成功！
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-fg-muted mb-1"
          >
            你已升级至 <strong className="text-amber-600">{planName} 专业版</strong>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-fg-muted/50"
          >
            OCR · 深度研究 · 高级导出 · 长期记忆已解锁
          </motion.p>

          {phase === "celebrate" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-1 mt-4"
            >
              {["✨", "🎉", "👑", "🚀", "💎"].map((e, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                  className="text-xl"
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
