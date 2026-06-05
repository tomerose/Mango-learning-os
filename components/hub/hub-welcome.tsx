"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BlurText } from "@/components/ui/blur-text";
import { BackgroundBeams } from "@/components/ui/background-beams";

/* ─────────────────────────────────────────────────────────────
   HubWelcome v5 — BackgroundBeams + BlurText hero
   ───────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

function getChineseDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${year}年${month}月${day}日 ${weekdays[now.getDay()]}`;
}

interface Props {
  onMagicClick: () => void;
}

export function HubWelcome({ onMagicClick }: Props) {
  const { stats } = useStore();
  const greeting = getGreeting();
  const dateStr = getChineseDate();
  const level = stats?.level ?? 1;
  const totalXp = stats?.totalXp ?? 0;
  const xpForCurrentLevel = stats?.xpForCurrentLevel ?? 0;
  const xpToNextLevel = stats?.xpToNextLevel ?? 500;
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpToNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 0;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "surface-hero",
        "p-6 sm:p-8 lg:p-10",
        "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6",
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Animated Background Beams (warm palette) ── */}
      <BackgroundBeams className="opacity-60" />

      {/* ── Left: Greeting + Date + Stats ── */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <BlurText
              text={`${greeting}，`}
              staggerDelay={0.06}
              initialDelay={0.1}
              blurAmount={6}
            />
          </h1>
          <Sparkles className="size-5 text-primary/50" strokeWidth={1.5} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <p className="text-sm sm:text-base text-muted-foreground">{dateStr}</p>
        </motion.div>

        <motion.div
          className="flex items-center gap-4 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <div className="flex items-center gap-1.5">
            <Flame className="size-4 text-orange-500" fill="currentColor" />
            <span className="text-sm font-semibold">
              {stats?.streakDays ?? 0}
              <span className="text-muted-foreground font-normal"> 天连续</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/6 px-3 py-1">
            <TrendingUp className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Lv.{level}</span>
            <span className="text-xs text-muted-foreground">{totalXp.toLocaleString()} XP</span>
          </div>
        </motion.div>

        {/* XP Bar */}
        <motion.div
          className="mt-2 max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-muted-foreground">
              {xpProgress}% to Level {level + 1}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-primary/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Right: Mango Magic Ball ── */}
      <motion.button
        onClick={onMagicClick}
        className="relative z-10 flex shrink-0 flex-col items-center gap-3 self-center lg:self-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
      >
        <div className="relative flex items-center justify-center">
          {/* Outer glow — pulsating */}
          <div
            className="absolute rounded-full animate-magic-glow"
            style={{
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle, oklch(0.72 0.1 58 / 0.2) 0%, oklch(0.72 0.1 58 / 0.04) 60%, transparent 100%)",
            }}
          />
          {/* Spinning dashed ring */}
          <div
            className="absolute rounded-full border border-dashed border-orange-200/40 dark:border-orange-300/20"
            style={{
              width: "90px",
              height: "90px",
              animation: "magic-spin 10s linear infinite",
            }}
          />
          {/* Mango SVG */}
          <svg
            width="70"
            height="70"
            viewBox="0 0 100 100"
            fill="none"
            className="relative z-10 drop-shadow-lg"
          >
            <defs>
              <radialGradient id="v5-mango-grad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="40%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
              <radialGradient id="v5-mango-shine" cx="30%" cy="25%" r="40%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80" transform="rotate(-30 62 14)" />
            <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#v5-mango-grad)" />
            <ellipse cx="40" cy="46" rx="9" ry="12" fill="url(#v5-mango-shine)" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-tight">Mango Magic</p>
          <p className="text-[11px] text-muted-foreground">点一下，灵感自来</p>
        </div>
      </motion.button>
    </motion.div>
  );
}
