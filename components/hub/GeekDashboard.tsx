"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Flame, TrendingUp, Zap, Shield, Radio, Crosshair,
  Layers, Network, AlertTriangle, Satellite, Activity,
  ChevronRight, Brain, GraduationCap, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { BlurText } from "@/components/ui/blur-text";
import { BackgroundBeams } from "@/components/ui/background-beams";

/* ═══════════════════════════════════════════════════════════════
   GeekDashboard v1 — NASA Space / Cyber-Geek Command Center
   Responsive dual-experience: Desktop Bento + Mobile Handheld HUD
   ═══════════════════════════════════════════════════════════════ */

// ── Utility ──────────────────────────────────────────────────
function dueFlashcardCount(flashcards: { dueOn: string }[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return flashcards.filter((f) => f.dueOn <= today).length;
}

function masteryAvg(subjects: { id: string }[], quizAttempts: { subject: string; correct: number; total: number }[]): number {
  if (subjects.length === 0) return 0;
  let sum = 0, count = 0;
  for (const s of subjects) {
    const attempts = quizAttempts.filter((q) => q.subject === s.id);
    if (attempts.length === 0) { sum += 50; count++; continue; }
    const correct = attempts.reduce((a, b) => a + b.correct, 0);
    const total = attempts.reduce((a, b) => a + b.total, 0);
    sum += total > 0 ? Math.round((correct / total) * 100) : 50;
    count++;
  }
  return count > 0 ? Math.round(sum / count) : 0;
}

// ── Animated Counter ────────────────────────────────────────
function AnimatedValue({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplay(value); clearInterval(timer); return; }
      setDisplay(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className={className}>{display}{suffix}</span>;
}

// ── GlowBorder wrapper ──────────────────────────────────────
function GlowBorder({ children, className, color = "amber" }: { children: React.ReactNode; className?: string; color?: "amber" | "rose" | "emerald" | "violet" }) {
  const colors = {
    amber: "border-amber-500/10 hover:border-amber-500/25 shadow-amber-500/5",
    rose: "border-rose-500/10 hover:border-rose-500/25 shadow-rose-500/5",
    emerald: "border-emerald-500/10 hover:border-emerald-500/25 shadow-emerald-500/5",
    violet: "border-violet-500/10 hover:border-violet-500/25 shadow-violet-500/5",
  };
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[#0B0F17]/60 backdrop-blur-xl transition-colors duration-500",
        colors[color],
        "hover:shadow-lg",
        className,
      )}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-current opacity-[0.02]" />
      {children}
    </motion.div>
  );
}

// ── Section Label ────────────────────────────────────────────
function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <Icon className="size-3 text-amber-500/50" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-500/50">{text}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESKTOP: LEFT WING — Defense & Memory Metrics
// ═══════════════════════════════════════════════════════════════
function DesktopLeftWing() {
  const { stats, flashcards, quizAttempts } = useStore();
  const { subjects } = useSubjects();
  const dueCards = React.useMemo(() => dueFlashcardCount(flashcards), [flashcards]);
  const mastery = React.useMemo(() => masteryAvg(subjects, quizAttempts), [subjects, quizAttempts]);

  return (
    <div className="flex flex-col gap-3">
      {/* Streak / Defense Core */}
      <GlowBorder color="amber" className="p-4">
        <SectionLabel icon={Shield} text="Defense Streak" />
        <div className="flex items-end justify-between">
          <div>
            <AnimatedValue value={stats?.streakDays ?? 0} className="text-3xl font-bold tabular-nums text-amber-400" />
            <p className="text-xs text-amber-500/40 mt-0.5">连续学习天数</p>
          </div>
          <Flame className="size-8 text-amber-500/30" fill="currentColor" />
        </div>
        <div className="mt-3 h-1 rounded-full bg-amber-500/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((stats?.streakDays ?? 0) / 30) * 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }} />
        </div>
        <p className="text-[10px] text-amber-500/30 mt-1.5">objective: 30-day orbital lock</p>
      </GlowBorder>

      {/* Flashcard Memory Distance */}
      <GlowBorder color="violet" className="p-4">
        <SectionLabel icon={Layers} text="Memory Distance" />
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold tabular-nums text-violet-400">{dueCards}</span>
            <p className="text-xs text-violet-500/40 mt-0.5">SM-2 待复习卡片</p>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            {[4, 3, 1.5, 2.5].map((h, i) => (
              <motion.div key={i} className="w-8 rounded-sm bg-violet-500/40"
                initial={{ height: 0 }} animate={{ height: h * 4 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }} />
            ))}
          </div>
        </div>
        {dueCards > 0 && (
          <Link href="/exam" className="inline-flex items-center gap-1 mt-2 text-[10px] text-violet-400/60 hover:text-violet-400 transition-colors">
            进入复习轨道 <ChevronRight className="size-3" />
          </Link>
        )}
      </GlowBorder>

      {/* Subject Mastery Gauges */}
      <GlowBorder color="emerald" className="p-4">
        <SectionLabel icon={Activity} text="Energy Velocity" />
        <div className="space-y-2.5">
          {subjects.slice(0, 4).map((s) => {
            const attempts = quizAttempts.filter((q) => q.subject === s.id);
            const pct = attempts.length > 0
              ? Math.round(attempts.reduce((a, b) => a + b.correct, 0) / attempts.reduce((a, b) => a + b.total, 0) * 100)
              : Math.floor(Math.random() * 30 + 50);
            return (
              <div key={s.id} className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] text-slate-400 flex-1 truncate">{s.label}</span>
                <span className="text-[11px] font-mono tabular-nums text-emerald-400/80">{pct}%</span>
                <div className="w-16 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlowBorder>

      {/* Total XP / Level */}
      <GlowBorder color="rose" className="p-4">
        <SectionLabel icon={Zap} text="Power Level" />
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold tabular-nums text-rose-400">Lv.{stats?.level ?? 1}</span>
            <p className="text-xs text-rose-500/40 mt-0.5">{stats?.totalXp?.toLocaleString() ?? 0} XP accumulated</p>
          </div>
          <Brain className="size-8 text-rose-500/20" />
        </div>
        <div className="mt-2 h-1 rounded-full bg-rose-500/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${stats ? Math.round(((stats.totalXp - stats.xpForCurrentLevel) / (stats.xpToNextLevel - stats.xpForCurrentLevel)) * 100) : 0}%` }}
            transition={{ duration: 1, delay: 0.7 }} />
        </div>
      </GlowBorder>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESKTOP: CENTER CORE — Rotating Learning Orbit + Magic Ball
// ═══════════════════════════════════════════════════════════════
function DesktopCenterCore({ onMagicClick }: { onMagicClick: () => void }) {
  const { stats, tasks } = useStore();
  const [rotation, setRotation] = React.useState(0);
  const orbitRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const interval = setInterval(() => setRotation((r) => r + 0.2), 50);
    return () => clearInterval(interval);
  }, []);

  const doneToday = tasks.filter((t) => t.done).length;
  const totalToday = tasks.length;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-4">
      {/* Tactical Grid Background */}
      <div className="relative flex items-center justify-center" ref={orbitRef}>
        {/* Outer rotating ring */}
        <div className="absolute size-64 rounded-full border border-amber-500/5"
          style={{ transform: `rotate(${rotation}deg)` }} />
        <div className="absolute size-56 rounded-full border border-dashed border-amber-500/10"
          style={{ transform: `rotate(${-rotation * 0.7}deg)` }} />

        {/* Orbital nodes */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.div key={i} className="absolute size-2 rounded-full bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
            style={{
              transform: `rotate(${angle + rotation * 0.5}deg) translateX(100px)`,
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }} />
        ))}

        {/* Mango Magic Ball (center) */}
        <motion.button
          onClick={onMagicClick}
          className="relative z-10 flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
        >
          {/* Glow */}
          <div className="absolute size-32 rounded-full bg-amber-500/10 blur-2xl animate-pulse" />
          {/* Mango SVG */}
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]">
            <defs>
              <radialGradient id="geek-mango" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="40%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
            </defs>
            <ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80" transform="rotate(-30 62 14)" />
            <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#geek-mango)" />
          </svg>
          <p className="text-xs font-semibold text-amber-400/80 mt-2 tracking-widest uppercase">Initiate</p>
        </motion.button>
      </div>

      {/* Status beneath orbit */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">{doneToday}/{totalToday}</span>
          <span className="text-[9px] text-amber-500/30 uppercase tracking-widest">Missions</span>
        </div>
        <div className="w-px h-8 bg-amber-500/10" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">{(stats?.minutesToday ?? 0)}m</span>
          <span className="text-[9px] text-amber-500/30 uppercase tracking-widest">Focus</span>
        </div>
        <div className="w-px h-8 bg-amber-500/10" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">{(stats?.level ?? 1) * 100}</span>
          <span className="text-[9px] text-amber-500/30 uppercase tracking-widest">Power</span>
        </div>
      </div>

      {/* Quick nav to high-value features */}
      <div className="flex gap-2">
        {[
          { icon: Layers, label: "Cards", href: "/exam" },
          { icon: GraduationCap, label: "Exam", href: "/exam" },
          { icon: Network, label: "Graph", href: "/exam" },
          { icon: Heart, label: "Grow", href: "/grow" },
        ].map((item) => (
          <Link key={item.label} href={item.href}
            className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/10 bg-amber-500/[0.02] px-3 py-2 hover:border-amber-500/25 hover:bg-amber-500/[0.05] transition-all group">
            <item.icon className="size-4 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
            <span className="text-[9px] text-amber-500/40 group-hover:text-amber-500/60 uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESKTOP: RIGHT WING — Threat Monitor & Exam Intercept
// ═══════════════════════════════════════════════════════════════
function DesktopRightWing() {
  const { weakAreas, tasks } = useStore();
  const activeTasks = tasks.filter((t) => !t.done).slice(0, 4);
  const topThreats = weakAreas.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      {/* Threat Monitor */}
      <GlowBorder color="rose" className="p-4">
        <SectionLabel icon={AlertTriangle} text="Threat Monitor" />
        {topThreats.length === 0 ? (
          <div className="py-2">
            <p className="text-xs text-slate-500">no anomalies detected</p>
            <p className="text-[10px] text-slate-600 mt-0.5">system nominal</p>
          </div>
        ) : (
          <div className="space-y-2 mt-1">
            {topThreats.map((w, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-rose-500/[0.04] border border-rose-500/10 p-2">
                <span className="size-1.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-300 truncate">{w.topic}</p>
                  <p className="text-[10px] text-rose-500/40">accuracy: {w.accuracy}%</p>
                </div>
                <span className="text-[10px] font-mono text-rose-400/60 shrink-0">THR-{i + 1}</span>
              </div>
            ))}
          </div>
        )}
        {topThreats.length > 0 && (
          <Link href="/agent" className="inline-flex items-center gap-1 mt-2 text-[10px] text-rose-400/40 hover:text-rose-400 transition-colors">
            <Crosshair className="size-3" /> intercept threat
          </Link>
        )}
      </GlowBorder>

      {/* Active Missions */}
      <GlowBorder color="amber" className="p-4">
        <SectionLabel icon={Satellite} text="Active Missions" />
        {activeTasks.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">all objectives completed</p>
        ) : (
          <div className="space-y-2 mt-1">
            {activeTasks.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-500/40 w-5 shrink-0">0{i + 1}</span>
                <span className="text-[11px] text-slate-300 truncate flex-1">{t.title}</span>
                <span className={cn("text-[10px] font-mono shrink-0",
                  t.priority === "high" ? "text-rose-400" : t.priority === "medium" ? "text-amber-400" : "text-slate-500",
                )}>
                  {t.priority === "high" ? "P1" : t.priority === "medium" ? "P2" : "P3"}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link href="/planner" className="inline-flex items-center gap-1 mt-2 text-[10px] text-amber-400/40 hover:text-amber-400 transition-colors">
          <Radio className="size-3" /> mission control
        </Link>
      </GlowBorder>

      {/* Agent Memory Status */}
      <GlowBorder color="violet" className="p-4">
        <SectionLabel icon={Brain} text="Agent Nexus" />
        <div className="flex items-center gap-2 py-1">
          <div className="flex gap-0.5">
            {[1, 0, 1, 1, 0].map((s, i) => (
              <div key={i} className={cn("w-1.5 h-4 rounded-sm", s ? "bg-violet-500/60" : "bg-slate-700")} />
            ))}
          </div>
          <div>
            <p className="text-xs text-violet-400">Memory Core Active</p>
            <p className="text-[10px] text-violet-500/30">adaptive learning online</p>
          </div>
        </div>
        <Link href="/agent" className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-violet-400/40 hover:text-violet-400 transition-colors">
          open nexus <ChevronRight className="size-3" />
        </Link>
      </GlowBorder>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOBILE: Handheld HUD Terminal
// ═══════════════════════════════════════════════════════════════
function MobileHUD({ onMagicClick }: { onMagicClick: () => void }) {
  const { stats, flashcards, tasks, weakAreas } = useStore();
  const { subjects } = useSubjects();
  const dueCards = React.useMemo(() => dueFlashcardCount(flashcards), [flashcards]);
  const activeTasks = tasks.filter((t) => !t.done);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* ── Mini-Orbit Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-[#0B0F17]/70 backdrop-blur-xl p-4">
        <BackgroundBeams className="opacity-30" />
        <div className="relative z-10 flex items-center gap-4">
          {/* Rotating ring */}
          <div className="relative size-16 shrink-0 flex items-center justify-center">
            <motion.div className="absolute size-14 rounded-full border border-amber-500/20"
              animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute size-10 rounded-full border border-dashed border-amber-500/15"
              animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
            <motion.button onClick={onMagicClick} whileTap={{ scale: 0.9 }}
              className="size-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_16px_rgba(251,146,60,0.3)]">
              <Zap className="size-5 text-white" fill="currentColor" />
            </motion.button>
          </div>
          <div className="flex-1 min-w-0">
            <BlurText text="Command Center" staggerDelay={0.04} initialDelay={0.1} blurAmount={4}
              className="text-base font-bold text-amber-400 block" />
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-mono text-amber-500/50">Lv.{stats?.level ?? 1}</span>
              <span className="text-[10px] font-mono text-amber-500/50">{stats?.streakDays ?? 0}d streak</span>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-500/50">online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Swipable Gauges Carousel ── */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-1 px-1">
        {/* Memory Distance */}
        <div className="min-w-[70vw] snap-center rounded-2xl border border-violet-500/10 bg-[#0B0F17]/60 backdrop-blur-xl p-4">
          <SectionLabel icon={Layers} text="Memory Distance" />
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold text-violet-400">{dueCards}</span>
            <div className="flex gap-0.5 items-end">
              {[3, 2.5, 4, 1.5].map((h, i) => (
                <div key={i} className="w-2 rounded-sm bg-violet-500/50" style={{ height: h * 6 }} />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-violet-500/40 mt-1">SM-2 cards awaiting review</p>
          {dueCards > 0 && (
            <Link href="/exam" className="inline-flex items-center gap-1 mt-2 text-[10px] text-violet-400/60">
              review now <ChevronRight className="size-3" />
            </Link>
          )}
        </div>

        {/* Energy Velocity */}
        <div className="min-w-[70vw] snap-center rounded-2xl border border-emerald-500/10 bg-[#0B0F17]/60 backdrop-blur-xl p-4">
          <SectionLabel icon={Activity} text="Energy Velocity" />
          <div className="space-y-2 mt-2">
            {subjects.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="size-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] text-slate-400 flex-1 truncate">{s.label}</span>
                <div className="w-20 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: s.color, width: `${Math.floor(Math.random()*30+50)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Power Level */}
        <div className="min-w-[70vw] snap-center rounded-2xl border border-rose-500/10 bg-[#0B0F17]/60 backdrop-blur-xl p-4">
          <SectionLabel icon={Zap} text="Power Level" />
          <div className="mt-2">
            <span className="text-3xl font-bold text-rose-400">Lv.{stats?.level ?? 1}</span>
            <p className="text-[10px] text-rose-500/40 mt-1">{(stats?.totalXp ?? 0).toLocaleString()} XP</p>
            <div className="mt-2 h-1 rounded-full bg-rose-500/10 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-rose-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats ? Math.round(((stats.totalXp - stats.xpForCurrentLevel) / (stats.xpToNextLevel - stats.xpForCurrentLevel)) * 100) : 0}%` }}
                transition={{ duration: 1 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Threat List ── */}
      <div className="rounded-2xl border border-rose-500/10 bg-[#0B0F17]/60 backdrop-blur-xl p-4">
        <SectionLabel icon={AlertTriangle} text="Threat Board" />
        {weakAreas.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">no threats detected · nominal</p>
        ) : (
          <div className="space-y-2 mt-2">
            {weakAreas.slice(0, 3).map((w, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-rose-500/[0.04] border border-rose-500/10 p-2.5 min-h-[44px]">
                <span className="size-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-300 truncate">{w.topic}</p>
                  <p className="text-[10px] text-rose-500/40">accuracy {w.accuracy}%</p>
                </div>
                <Link href="/agent" className="text-[10px] text-rose-400/60 shrink-0">intercept →</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Active Missions ── */}
      <div className="rounded-2xl border border-amber-500/10 bg-[#0B0F17]/60 backdrop-blur-xl p-4">
        <SectionLabel icon={Satellite} text="Active Missions" />
        {activeTasks.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">all objective complete · return to base</p>
        ) : (
          <div className="space-y-2 mt-2">
            {activeTasks.slice(0, 5).map((t, i) => (
              <Link key={t.id} href="/planner"
                className="flex items-center gap-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.02] p-2.5 min-h-[44px] active:scale-[0.98] transition-transform">
                <span className="text-[11px] font-mono text-amber-500/50 w-6 shrink-0">0{i + 1}</span>
                <span className="text-[12px] text-slate-300 flex-1 truncate">{t.title}</span>
                <span className={cn("text-[10px] font-mono shrink-0",
                  t.priority === "high" ? "text-rose-400" : "text-amber-400")}>
                  {t.priority === "high" ? "P1" : "P2"}
                </span>
              </Link>
            ))}
          </div>
        )}
        <Link href="/planner" className="inline-flex items-center gap-1 mt-3 text-[10px] text-amber-400/50">
          <Radio className="size-3" /> full mission log
        </Link>
      </div>

      {/* ── Quick Access Grid ── */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Layers, label: "Flash Cards", href: "/exam", color: "violet" },
          { icon: Network, label: "Knowledge Graph", href: "/exam", color: "emerald" },
          { icon: Heart, label: "Mind Garden", href: "/grow", color: "rose" },
          { icon: Brain, label: "Agent Nexus", href: "/agent", color: "amber" },
        ].map((item) => (
          <Link key={item.label} href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 min-h-[70px] justify-center transition-all active:scale-95",
              item.color === "violet" && "border-violet-500/10 bg-violet-500/[0.02]",
              item.color === "emerald" && "border-emerald-500/10 bg-emerald-500/[0.02]",
              item.color === "rose" && "border-rose-500/10 bg-rose-500/[0.02]",
              item.color === "amber" && "border-amber-500/10 bg-amber-500/[0.02]",
            )}>
            <item.icon className={cn("size-5",
              item.color === "violet" && "text-violet-400/60",
              item.color === "emerald" && "text-emerald-400/60",
              item.color === "rose" && "text-rose-400/60",
              item.color === "amber" && "text-amber-400/60",
            )} />
            <span className="text-[10px] text-slate-400 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: GeekDashboard — Dual Experience Shell
// ═══════════════════════════════════════════════════════════════
interface GeekDashboardProps {
  onMagicClick: () => void;
  className?: string;
}

export function GeekDashboard({ onMagicClick, className }: GeekDashboardProps) {
  return (
    <>
      {/* ── DESKTOP: Command Center (3-Column Bento) ── */}
      <div className={cn("hidden md:grid grid-cols-[240px_1fr_260px] gap-4 items-start", className)}>
        {/* Left Wing */}
        <DesktopLeftWing />

        {/* Center Core */}
        <DesktopCenterCore onMagicClick={onMagicClick} />

        {/* Right Wing */}
        <DesktopRightWing />
      </div>

      {/* ── MOBILE: Handheld HUD Terminal ── */}
      <div className={cn("flex md:hidden flex-col", className)}>
        <MobileHUD onMagicClick={onMagicClick} />
      </div>
    </>
  );
}
