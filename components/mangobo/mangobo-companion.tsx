"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain, Heart, GraduationCap, Network, X, Sparkles,
  Flame, TrendingUp, Target, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { MangoCharacter } from "./mango-character";
import { EmotionalMango, detectEmotion } from "./emotion-engine";

/* ═══════════════════════════════════════════════════════════════
   Mangobo — Global Floating AI Companion
   Persistent across all pages. Draggable. Speech bubbles.
   ═══════════════════════════════════════════════════════════════ */

const GREETINGS = [
  "今天准备学习什么？",
  "需要我帮你整理知识吗？",
  "试试期末冲刺模式吧。",
  "去 Mind Garden 记录一个新想法。",
  "每一次学习都会让我成长。",
];

const QUICK_ACTIONS = [
  { icon: Brain, label: "AI Tutor", href: "/agent", color: "text-blue-500" },
  { icon: Heart, label: "心灵花园", href: "/grow", color: "text-rose-500" },
  { icon: GraduationCap, label: "考试备战", href: "/planner", color: "text-amber-500" },
  { icon: Network, label: "知识网络", href: "/exam", color: "text-emerald-500" },
];

const LEVELS: Record<number, string> = {
  1: "幼年芒宝", 10: "探索芒宝", 30: "学者芒宝", 50: "智慧芒宝", 100: "芒果贤者",
};

function getLevelName(level: number): string {
  const keys = Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (level >= keys[i]) return LEVELS[keys[i]];
  }
  return "幼年芒宝";
}

export function MangoboCompanion() {
  const { stats } = useStore();
  const [open, setOpen] = React.useState(false);
  const [greeting, setGreeting] = React.useState(GREETINGS[0]);
  const [showBubble, setShowBubble] = React.useState(true);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const dragRef = React.useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  // Rotate greeting every 8 seconds
  React.useEffect(() => {
    const id = setInterval(() => {
      const next = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      setGreeting(next);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 5000);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // Auto-hide bubble after 5 seconds
  React.useEffect(() => {
    if (showBubble) {
      const id = setTimeout(() => setShowBubble(false), 5000);
      return () => clearTimeout(id);
    }
  }, [showBubble]);

  // Drag handlers
  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const maxX = typeof window !== "undefined" ? window.innerWidth - 80 : 300;
    const maxY = typeof window !== "undefined" ? window.innerHeight - 80 : 500;
    setPosition({
      x: Math.max(0, Math.min(maxX, dragRef.current.posX + dx)),
      y: Math.max(0, Math.min(maxY, dragRef.current.posY + dy)),
    });
  }

  function handlePointerUp() {
    setDragging(false);
  }

  if (!mounted) return null;

  const level = stats?.level ?? 1;
  const levelName = getLevelName(level);
  const xpProgress = stats ? Math.round(((stats.totalXp - stats.xpForCurrentLevel) / (stats.xpToNextLevel - stats.xpForCurrentLevel)) * 100) : 0;

  return (
    <>
      {/* Floating Mangobo — positioned above mobile nav */}
      <motion.div
        className="fixed z-[150] select-none"
        style={{
          right: position.x ? "auto" : "max(16px, env(safe-area-inset-right, 16px))",
          bottom: position.y ? "auto" : "max(120px, calc(6rem + env(safe-area-inset-bottom, 0px)))",
          left: position.x || "auto",
          top: position.y || "auto",
          transform: position.x ? `translate(${position.x}px, ${position.y}px)` : undefined,
        }}
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Speech bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute -top-20 right-0 w-56 bg-surface/90 backdrop-blur-xl border border-border rounded-2xl px-4 py-3 shadow-lg text-sm leading-relaxed"
            >
              <p className="text-small">{greeting}</p>
              <div className="absolute -bottom-2 right-6 w-3 h-3 bg-surface border-r border-b border-border rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mangobo button */}
        <motion.button
          onClick={() => { setOpen(!open); setShowBubble(false); }}
          className="relative size-[56px] sm:size-[72px] rounded-full overflow-hidden shadow-xl border-2 border-primary/20 cursor-pointer"
          style={{ background: "radial-gradient(circle at 40% 35%, #fde68a 0%, #fb923c 40%, #ea580c 100%)" }}
          whileHover={{ scale: 1.08, boxShadow: "0 0 30px rgba(197,139,116,0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          {/* CSS Animated Mango — zero deps, all platforms */}
          <MangoCharacter />
          {/* Hidden video — plays audio-free animation if supported */}
          <video ref={videoRef} src="/mangobo.mp4" autoPlay loop muted playsInline preload="none"
            className="hidden" />
          {/* Glass overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-black/10" />
        </motion.button>
      </motion.div>

      {/* Interaction Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[155] bg-black/20"
              onClick={() => setOpen(false)}
            />
            {/* Panel — bottom sheet on mobile, popover on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-24 sm:bottom-32 right-2 sm:right-4 left-2 sm:left-auto z-[160] sm:w-72 bg-surface/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20">
                    <video src="/mangobo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-small font-medium">芒宝</p>
                    <p className="text-caption">{levelName} · Lv.{level}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted">
                  <X className="size-4" />
                </button>
              </div>

              {/* Stats */}
              <div className="p-4 flex flex-col gap-3 border-b border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Flame className="size-3.5 text-orange-500" fill="currentColor" />
                    <span>{stats?.streakDays ?? 0} 天连续</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-primary" />
                    <span>{(stats?.totalXp ?? 0).toLocaleString()} XP</span>
                  </div>
                </div>
                {/* XP Bar */}
                <div className="h-1.5 rounded-full bg-bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8 }} />
                </div>
                <p className="text-caption">{xpProgress}% 到 Lv.{level + 1}</p>
              </div>

              {/* Quick Actions */}
              <div className="p-4 flex flex-col gap-1">
                <p className="text-label mb-1">快捷操作</p>
                {QUICK_ACTIONS.map(a => (
                  <Link key={a.label} href={a.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg-muted transition-colors">
                    <a.icon className={cn("size-4", a.color)} />
                    <span className="text-small">{a.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
