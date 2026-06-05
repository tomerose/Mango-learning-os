"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   HubWelcome v4 — Premium Hero with mouse-follow blobs
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

  /* ── Mouse-follow blob position ── */
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [blobPos, setBlobPos] = React.useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBlobPos({ x, y });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setBlobPos({ x: 50, y: 50 });
      }}
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "surface-hero",
        "p-6 sm:p-8 lg:p-10",
        "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6",
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Animated watercolor blobs (mouse-follow) ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ opacity: isHovered ? 0.7 : 0.35 }}
      >
        {/* Mango blob */}
        <div
          className="absolute w-[280px] h-[280px] rounded-full watercolor-mango transition-all duration-1000 ease-out"
          style={{
            left: `calc(${blobPos.x}% - 140px)`,
            top: `calc(${blobPos.y}% - 140px)`,
            transform: `translate(${isHovered ? (blobPos.x - 50) * 0.3 : 0}px, ${isHovered ? (blobPos.y - 50) * 0.3 : 0}px)`,
          }}
        />
        {/* Rose accent blob — opposite direction */}
        <div
          className="absolute w-[200px] h-[200px] rounded-full watercolor-rose transition-all duration-1200 ease-out"
          style={{
            right: `calc(${100 - blobPos.x}% - 100px)`,
            bottom: `calc(${100 - blobPos.y}% - 100px)`,
            transform: `translate(${isHovered ? -(blobPos.x - 50) * 0.2 : 0}px, ${isHovered ? -(blobPos.y - 50) * 0.2 : 0}px)`,
          }}
        />
      </div>

      {/* ── Left: Greeting + Date + Streak ── */}
      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <h1 className="display-md">
            {greeting}，
            <span className="gradient-text-primary">Learner</span>
          </h1>
          <Sparkles className="size-5 text-primary/50" strokeWidth={1.5} />
        </div>
        <p className="body-text text-muted-foreground">{dateStr}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <Flame className="size-4 text-orange-500" fill="currentColor" />
            <span className="text-sm font-semibold">
              {stats?.streakDays ?? 0}
              <span className="text-muted-foreground font-normal"> 天连续</span>
            </span>
          </div>
          {/* Mini XP progress pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/6 px-3 py-1">
            <TrendingUp className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Lv.{level}</span>
            <span className="text-xs text-muted-foreground">{totalXp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-2 max-w-xs">
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
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* ── Right: Mini Magic Ball ── */}
      <motion.button
        onClick={onMagicClick}
        className="relative z-10 flex shrink-0 flex-col items-center gap-3 self-center lg:self-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow ring */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full animate-magic-glow"
            style={{
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle, oklch(0.72 0.1 58 / 0.2) 0%, oklch(0.72 0.1 58 / 0.04) 60%, transparent 100%)",
            }}
          />
          {/* Spinning ring */}
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
              <radialGradient id="hero-mango-grad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="40%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
              <radialGradient id="hero-mango-shine" cx="30%" cy="25%" r="40%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80" transform="rotate(-30 62 14)" />
            <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#hero-mango-grad)" />
            <ellipse cx="40" cy="46" rx="9" ry="12" fill="url(#hero-mango-shine)" />
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
