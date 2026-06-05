"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Flame, TrendingUp, Zap, Shield, Radio, Crosshair,
  Layers, Network, AlertTriangle, Satellite, Activity,
  ChevronRight, Brain, GraduationCap, Heart, Sparkles,
  Clock, Target, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { BackgroundBeams } from "@/components/ui/background-beams";

/* ═══════════════════════════════════════════════════════════════
   GeekDashboard v2 — 100% Immersive NASA Capsule HUD
   Deep-space amber glow · frosted glass · neon metrics · snap carousel
   ═══════════════════════════════════════════════════════════════ */

// ─── helpers ─────────────────────────────────────────────────
function dueCards(cards: { dueOn: string }[]): number {
  const t = new Date().toISOString().slice(0, 10);
  return cards.filter((c) => c.dueOn <= t).length;
}

function examCountdown(daysFromNow: number): string {
  if (daysFromNow <= 0) return "TODAY";
  if (daysFromNow === 1) return "T-1";
  return `T-${daysFromNow}`;
}

function masteryFor(
  subjectId: string,
  attempts: { subject: string; correct: number; total: number }[],
): number {
  const a = attempts.filter((q) => q.subject === subjectId);
  if (!a.length) return 0;
  const c = a.reduce((s, x) => s + x.correct, 0);
  const t = a.reduce((s, x) => s + x.total, 0);
  return t > 0 ? Math.round((c / t) * 100) : 0;
}

// ─── animated counter ────────────────────────────────────────
function GlowCounter({ n, className }: { n: number; className?: string }) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    let frame = 0; const total = 40;
    const step = n / total;
    const id = setInterval(() => { frame++; if (frame >= total) { setV(n); clearInterval(id); } else setV(Math.round(step * frame)); }, 20);
    return () => clearInterval(id);
  }, [n]);
  return <span className={cn("tabular-nums", className)}>{v}</span>;
}

// ─── glass card wrapper ──────────────────────────────────────
function GlassCard({ children, className, hue = "white" }: { children: React.ReactNode; className?: string; hue?: "white" | "amber" | "rose" | "emerald" | "violet" }) {
  const borders: Record<string, string> = {
    white: "border-white/10 hover:border-white/20",
    amber: "border-amber-500/15 hover:border-amber-500/30",
    rose: "border-rose-500/15 hover:border-rose-500/30",
    emerald: "border-emerald-500/15 hover:border-emerald-500/30",
    violet: "border-violet-500/15 hover:border-violet-500/30",
  };
  return (
    <motion.div
      className={cn(
        "rounded-2xl border bg-[#0D121F]/40 backdrop-blur-md transition-colors duration-500",
        borders[hue],
        className,
      )}
      whileHover={{ y: -1 }}
    >
      {children}
    </motion.div>
  );
}

// ─── section label ───────────────────────────────────────────
function HudLabel({ icon: I, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <I className="size-3 text-amber-500/50" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{text}</span>
    </div>
  );
}

// ─── neon progress bar ───────────────────────────────────────
function NeonBar({ pct, color = "amber" }: { pct: number; color?: string }) {
  const c = { amber: "from-amber-400 to-orange-500 shadow-amber-500/30", emerald: "from-emerald-400 to-teal-500 shadow-emerald-500/30", rose: "from-rose-400 to-pink-500 shadow-rose-500/30", violet: "from-violet-400 to-purple-500 shadow-violet-500/30" }[color] ?? "from-amber-400 to-orange-500 shadow-amber-500/30";
  return (
    <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r shadow-[0_0_8px_var(--tw-shadow-color)]", c)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LEFT WING — Defense + Memory + Velocity + Power
// ═══════════════════════════════════════════════════════════════
function LeftWing() {
  const { stats, flashcards, quizAttempts } = useStore();
  const { subjects } = useSubjects();
  const due = React.useMemo(() => dueCards(flashcards), [flashcards]);

  return (
    <div className="flex flex-col gap-3">
      {/* Streak Shield */}
      <GlassCard hue="amber" className="p-4">
        <HudLabel icon={Shield} text="Defense Streak" />
        <div className="flex items-end justify-between">
          <div>
            <GlowCounter n={stats?.streakDays ?? 0} className="text-[2.5rem] font-bold leading-none text-amber-300 drop-shadow-[0_0_18px_rgba(252,211,77,0.5)]" />
            <p className="text-[11px] text-slate-500 mt-1 font-mono uppercase tracking-wider">days连续学习</p>
          </div>
          <Flame className="size-10 text-amber-500/30" fill="currentColor" />
        </div>
        <div className="mt-3"><NeonBar pct={Math.min(100, ((stats?.streakDays ?? 0) / 30) * 100)} color="amber" /></div>
        <p className="text-[10px] font-mono text-slate-600 mt-1.5 uppercase tracking-widest">objective · 30-day orbital lock</p>
      </GlassCard>

      {/* Memory Distance */}
      <GlassCard hue="violet" className="p-4">
        <HudLabel icon={Layers} text="Memory Distance" />
        <div className="flex items-end justify-between">
          <div>
            <GlowCounter n={due} className="text-[2.5rem] font-bold leading-none text-violet-300 drop-shadow-[0_0_14px_rgba(167,139,250,0.45)]" />
            <p className="text-[11px] text-slate-500 mt-1 font-mono uppercase tracking-wider">SM-2待复习</p>
          </div>
          <div className="flex gap-0.5 items-end">
            {[3.5, 2, 4, 1.8, 3].map((h, i) => (
              <motion.div key={i} className="w-[5px] rounded-sm bg-violet-500/50"
                initial={{ height: 0 }} animate={{ height: h * 7 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }} />
            ))}
          </div>
        </div>
        {due > 0 && (
          <Link href="/exam" className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono text-violet-400/60 hover:text-violet-400 transition-colors uppercase tracking-wider">
            进入复习 <ChevronRight className="size-3" />
          </Link>
        )}
      </GlassCard>

      {/* Energy Velocity — subject gauges */}
      <GlassCard hue="emerald" className="p-4">
        <HudLabel icon={Activity} text="Energy Velocity" />
        <div className="space-y-2.5">
          {subjects.slice(0, 4).map((s) => {
            const m = masteryFor(s.id, quizAttempts);
            return (
              <div key={s.id} className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] text-slate-300 flex-1 truncate font-mono uppercase tracking-wide">{s.short}</span>
                <span className="text-[11px] font-mono tabular-nums text-emerald-400/80 w-8 text-right">{m}%</span>
                <div className="w-14 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                    initial={{ width: 0 }} animate={{ width: `${m}%` }} transition={{ duration: 0.7, delay: 0.4 }} />
                </div>
              </div>
            );
          })}
          {subjects.length === 0 && <p className="text-[11px] text-slate-600 font-mono">awaiting subject acquisition</p>}
        </div>
      </GlassCard>

      {/* Power Level */}
      <GlassCard hue="rose" className="p-4">
        <HudLabel icon={Zap} text="Power Level" />
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[2rem] font-bold leading-none text-rose-300 drop-shadow-[0_0_14px_rgba(251,113,133,0.4)]">Lv.{stats?.level ?? 1}</span>
            <p className="text-[11px] text-slate-500 mt-1 font-mono uppercase tracking-wider">{(stats?.totalXp ?? 0).toLocaleString()} XP</p>
          </div>
          <Brain className="size-10 text-rose-500/20" />
        </div>
        <div className="mt-2">
          <NeonBar pct={stats ? Math.round(((stats.totalXp - stats.xpForCurrentLevel) / (stats.xpToNextLevel - stats.xpForCurrentLevel)) * 100) : 0} color="rose" />
        </div>
        <p className="text-[10px] font-mono text-slate-600 mt-1.5 uppercase tracking-widest">{stats ? `${stats.xpToNextLevel - stats.totalXp} XP to Lv.${(stats.level ?? 1) + 1}` : "calibrating"}</p>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CENTER CORE — Energy Source (Mango Ball + Orbital Rings)
// ═══════════════════════════════════════════════════════════════
function CenterCore({ onMagicClick }: { onMagicClick: () => void }) {
  const { stats, tasks } = useStore();
  const [rot, setRot] = React.useState(0);
  const done = tasks.filter((t) => t.done).length;
  const all = tasks.length;

  React.useEffect(() => {
    const id = setInterval(() => setRot((r) => r + 0.3), 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-6">
      {/* ── Orbital Core ── */}
      <div className="relative flex items-center justify-center">
        {/* Outer ambient glow */}
        <motion.div
          className="absolute size-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer ring */}
        <div className="absolute size-64 rounded-full border border-amber-500/[0.06]"
          style={{ transform: `rotate(${rot}deg)` }} />
        <div className="absolute size-56 rounded-full border border-dashed border-amber-500/[0.08]"
          style={{ transform: `rotate(${-rot * 0.65}deg)` }} />
        <div className="absolute size-48 rounded-full border border-amber-500/[0.04]"
          style={{ transform: `rotate(${rot * 0.4}deg)` }} />

        {/* Orbital nodes */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute size-2 rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            style={{
              transform: `rotate(${angle + rot * 0.5}deg) translateX(88px)`,
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.44 }}
          />
        ))}

        {/* ── Core Energy Source (Mango Ball) ── */}
        <motion.button
          onClick={onMagicClick}
          className="relative z-10 flex flex-col items-center"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {/* Multi-layer radial backlight */}
          <motion.div
            className="absolute size-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(251,146,60,0.25) 0%, rgba(251,146,60,0.06) 50%, transparent 80%)" }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute size-32 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(253,224,71,0.18) 0%, transparent 70%)" }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* SVG Mango */}
          <motion.svg
            width="88" height="88" viewBox="0 0 100 100" fill="none"
            className="drop-shadow-[0_0_28px_rgba(251,146,60,0.55)] relative z-10"
            animate={{ rotate: [0, 5, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <defs>
              <radialGradient id="v2-mango-g" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="35%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#c2410c" />
              </radialGradient>
            </defs>
            <ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80" transform="rotate(-30 62 14)" />
            <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#v2-mango-g)" />
          </motion.svg>
        </motion.button>
      </div>

      {/* ── Status Readout ── */}
      <div className="flex items-center gap-5">
        {[
          { label: "Missions", val: `${done}/${all}`, sub: "complete" },
          { label: "Focus", val: `${stats?.minutesToday ?? 0}m`, sub: "today" },
          { label: "Power", val: `${(stats?.level ?? 1) * 100}`, sub: "rating" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold font-mono tabular-nums text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.3)]">{s.val}</span>
            <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-slate-500">{s.label}</span>
            <span className="text-[8px] font-mono text-slate-700">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Quick Jump ── */}
      <div className="flex gap-1.5">
        {[
          { icon: Layers, label: "Cards", href: "/exam" },
          { icon: GraduationCap, label: "Exam", href: "/exam" },
          { icon: Network, label: "Graph", href: "/exam" },
          { icon: Heart, label: "Garden", href: "/grow" },
        ].map((x) => (
          <Link key={x.label} href={x.href}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 hover:border-amber-500/20 hover:bg-amber-500/[0.04] transition-all group min-h-[56px] min-w-[56px] justify-center">
            <x.icon className="size-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-400 uppercase tracking-widest">{x.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RIGHT WING — Threats + Missions + Agent Nexus
// ═══════════════════════════════════════════════════════════════
function RightWing() {
  const { weakAreas, tasks } = useStore();
  const active = tasks.filter((t) => !t.done).slice(0, 5);

  return (
    <div className="flex flex-col gap-3">
      {/* Threat Monitor */}
      <GlassCard hue="rose" className="p-4">
        <HudLabel icon={AlertTriangle} text="Threat Monitor" />
        {weakAreas.length === 0 ? (
          <div className="py-2">
            <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-400" /><span className="text-[11px] font-mono text-emerald-400/70 uppercase tracking-wider">system nominal</span></div>
            <p className="text-[10px] text-slate-700 mt-1 font-mono">no anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-2">
            {weakAreas.slice(0, 4).map((w, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg bg-rose-500/[0.04] border border-rose-500/10 p-2.5">
                <span className="size-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_6px_rgba(251,113,133,0.5)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-300 truncate font-mono">{w.topic}</p>
                  <p className="text-[10px] font-mono text-rose-500/50 uppercase tracking-wider">accuracy {w.accuracy}%</p>
                </div>
                <span className="text-[9px] font-mono text-rose-400/40 shrink-0">ID.{i + 1}</span>
              </div>
            ))}
          </div>
        )}
        {weakAreas.length > 0 && (
          <Link href="/agent" className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-mono text-rose-400/50 hover:text-rose-400 transition-colors uppercase tracking-widest">
            <Crosshair className="size-3" /> intercept
          </Link>
        )}
      </GlassCard>

      {/* Active Missions */}
      <GlassCard hue="amber" className="p-4">
        <HudLabel icon={Satellite} text="Active Missions" />
        {active.length === 0 ? (
          <div className="py-2">
            <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-400" /><span className="text-[11px] font-mono text-amber-400/60 uppercase tracking-wider">all objectives complete</span></div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {active.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2.5 group">
                <span className="text-[9px] font-mono text-slate-600 w-6 shrink-0 tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="text-[11px] text-slate-300 truncate flex-1 font-mono">{t.title}</span>
                <span className={cn(
                  "text-[9px] font-mono shrink-0 uppercase tracking-wider",
                  t.priority === "high" ? "text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.4)]" :
                  t.priority === "medium" ? "text-amber-400" : "text-slate-600",
                )}>{t.priority === "high" ? "P1" : t.priority === "medium" ? "P2" : "P3"}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/planner" className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-mono text-amber-400/40 hover:text-amber-400 transition-colors uppercase tracking-widest">
          <Radio className="size-3" /> mission control
        </Link>
      </GlassCard>

      {/* Agent Nexus */}
      <GlassCard hue="violet" className="p-4">
        <HudLabel icon={Brain} text="Agent Nexus" />
        <div className="flex items-center gap-3 py-1">
          <div className="flex gap-[3px]">
            {[1, 0, 1, 1, 0, 1, 0, 1].map((s, i) => (
              <motion.div key={i} className={cn("w-[3px] rounded-sm", s ? "bg-violet-500/70 shadow-[0_0_4px_rgba(167,139,250,0.4)]" : "bg-slate-700")}
                initial={{ height: 8 }} animate={{ height: s ? [8, 20, 12, 18, 8][i % 5] : 8 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
          <div>
            <p className="text-[11px] font-mono text-violet-300 uppercase tracking-wider">Memory Core Active</p>
            <p className="text-[9px] font-mono text-slate-600 mt-0.5 uppercase tracking-widest">adaptive learning · online</p>
          </div>
        </div>
        <Link href="/agent" className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-mono text-violet-400/40 hover:text-violet-400 transition-colors uppercase tracking-widest">
          nexus access <ChevronRight className="size-3" />
        </Link>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOBILE HUD — Snap Carousel + Tactical List
// ═══════════════════════════════════════════════════════════════
function MobileHUD({ onMagicClick }: { onMagicClick: () => void }) {
  const { stats, flashcards, tasks, weakAreas, quizAttempts } = useStore();
  const { subjects } = useSubjects();
  const due = React.useMemo(() => dueCards(flashcards), [flashcards]);
  const active = tasks.filter((t) => !t.done);

  const sampleExams = [
    { name: "微观经济学期末", date: "2026-06-25", subject: "economics" },
    { name: "线性代数期中", date: "2026-06-12", subject: "math" },
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* ── Mini Core Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-[#0D121F]/50 backdrop-blur-xl p-4">
        <BackgroundBeams className="opacity-25" />
        <div className="relative z-10 flex items-center gap-4">
          <motion.button onClick={onMagicClick} whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="relative size-14 shrink-0 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]">
            <motion.div className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(251,146,60,0.35) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }} />
            <motion.div className="absolute size-12 rounded-full border border-amber-500/20"
              animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
            <motion.svg width="44" height="44" viewBox="0 0 100 100" fill="none" className="drop-shadow-[0_0_14px_rgba(251,146,60,0.5)] relative z-10"
              animate={{ rotate: [0, 3, -2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <defs><radialGradient id="mob-mango" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="#fef3c7" /><stop offset="40%" stopColor="#fb923c" /><stop offset="100%" stopColor="#c2410c" /></radialGradient></defs>
              <ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80" transform="rotate(-30 62 14)" />
              <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#mob-mango)" />
            </motion.svg>
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.3)] font-mono uppercase tracking-wide">Command Center</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400">Lv.{stats?.level ?? 1}</span>
              <span className="text-[10px] font-mono text-slate-400">{(stats?.streakDays ?? 0)}d streak</span>
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
              <span className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Snap Carousel: Defense + Memory + Power ── */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-1 px-1">
        {[
          {
            hue: "amber" as const,
            icon: Shield,
            label: "Defense Streak",
            big: `${stats?.streakDays ?? 0}`,
            sub: "days",
            extra: "objective 30-day lock",
          },
          {
            hue: "violet" as const,
            icon: Layers,
            label: "Memory Distance",
            big: `${due}`,
            sub: "cards due",
            extra: due > 0 ? "review now" : "all clear",
          },
          {
            hue: "rose" as const,
            icon: Zap,
            label: "Power Level",
            big: `Lv.${stats?.level ?? 1}`,
            sub: `${(stats?.totalXp ?? 0).toLocaleString()} XP`,
            extra: `${(stats?.xpToNextLevel ?? 500) - (stats?.totalXp ?? 0)} to next`,
          },
        ].map((g) => (
          <div key={g.label}
            className={cn(
              "min-w-[75vw] snap-center rounded-2xl border bg-[#0D121F]/40 backdrop-blur-md p-5 flex flex-col justify-between",
              g.hue === "amber" && "border-amber-500/15",
              g.hue === "violet" && "border-violet-500/15",
              g.hue === "rose" && "border-rose-500/15",
            )}>
            <HudLabel icon={g.icon} text={g.label} />
            <div className="mt-2">
              <span className={cn(
                "text-[3rem] font-bold leading-none drop-shadow-[0_0_18px_var(--glow)]",
                g.hue === "amber" && "text-amber-300 [--glow:rgba(252,211,77,0.5)]",
                g.hue === "violet" && "text-violet-300 [--glow:rgba(167,139,250,0.5)]",
                g.hue === "rose" && "text-rose-300 [--glow:rgba(251,113,133,0.5)]",
              )}>{g.big}</span>
              <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">{g.sub}</p>
              <p className="text-[10px] font-mono text-slate-700 mt-2 uppercase tracking-widest">{g.extra}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tactical Subject Gauges ── */}
      <GlassCard hue="emerald" className="p-4">
        <HudLabel icon={Activity} text="Energy Velocity" />
        <div className="space-y-2.5">
          {subjects.slice(0, 4).map((s) => {
            const m = masteryFor(s.id, quizAttempts);
            return (
              <div key={s.id} className="flex items-center gap-2.5 min-h-[44px]">
                <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[12px] text-slate-300 flex-1 truncate font-mono uppercase tracking-wide">{s.short}</span>
                <span className="text-[11px] font-mono tabular-nums text-emerald-400/70">{m}%</span>
                <div className="w-16 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                    initial={{ width: 0 }} animate={{ width: `${m}%` }} transition={{ duration: 0.7 }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ── Exam Countdown ── */}
      <GlassCard hue="rose" className="p-4">
        <HudLabel icon={Clock} text="Exam Countdown" />
        <div className="space-y-2">
          {sampleExams.map((ex, i) => {
            const days = Math.ceil((new Date(ex.date).getTime() - Date.now()) / 86400000);
            const urgent = days <= 3;
            return (
              <Link key={i} href="/exam"
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-2.5 min-h-[44px] transition-all active:scale-[0.97]",
                  urgent ? "border-rose-500/20 bg-rose-500/[0.06]" : "border-white/[0.04] bg-white/[0.01]",
                )}>
                <span className={cn(
                  "text-sm font-bold font-mono tabular-nums w-10 shrink-0",
                  urgent ? "text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.4)]" : "text-amber-400/70",
                )}>{examCountdown(days)}</span>
                <span className="text-[12px] text-slate-300 flex-1 truncate font-mono">{ex.name}</span>
                <ChevronRight className="size-3.5 text-slate-600" />
              </Link>
            );
          })}
        </div>
      </GlassCard>

      {/* ── Active Missions ── */}
      <GlassCard hue="amber" className="p-4">
        <HudLabel icon={Satellite} text="Active Missions" />
        {active.length === 0 ? (
          <p className="text-[11px] font-mono text-slate-600 py-1 uppercase tracking-wider">all clear</p>
        ) : (
          <div className="space-y-1.5">
            {active.slice(0, 5).map((t, i) => (
              <Link key={t.id} href="/planner"
                className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5 min-h-[44px] active:scale-[0.97] transition-transform">
                <span className="text-[10px] font-mono text-slate-600 w-6 shrink-0 tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="text-[12px] text-slate-300 flex-1 truncate font-mono">{t.title}</span>
                <span className={cn("text-[9px] font-mono shrink-0 uppercase tracking-wider",
                  t.priority === "high" ? "text-rose-400" : t.priority === "medium" ? "text-amber-400" : "text-slate-600")}>
                  {t.priority === "high" ? "P1" : t.priority === "medium" ? "P2" : "P3"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ── Quick Access Grid ── */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Layers, label: "Flash Cards", href: "/exam", hue: "violet" as const },
          { icon: Network, label: "Knowledge Graph", href: "/exam", hue: "emerald" as const },
          { icon: Heart, label: "Mind Garden", href: "/grow", hue: "rose" as const },
          { icon: Brain, label: "Agent Nexus", href: "/agent", hue: "amber" as const },
        ].map((x) => (
          <Link key={x.label} href={x.href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border bg-[#0D121F]/40 backdrop-blur-md p-4 min-h-[76px] justify-center transition-all active:scale-95",
              x.hue === "violet" && "border-violet-500/10 hover:border-violet-500/25",
              x.hue === "emerald" && "border-emerald-500/10 hover:border-emerald-500/25",
              x.hue === "rose" && "border-rose-500/10 hover:border-rose-500/25",
              x.hue === "amber" && "border-amber-500/10 hover:border-amber-500/25",
            )}>
            <x.icon className={cn("size-5",
              x.hue === "violet" && "text-violet-400/60",
              x.hue === "emerald" && "text-emerald-400/60",
              x.hue === "rose" && "text-rose-400/60",
              x.hue === "amber" && "text-amber-400/60",
            )} />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{x.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════
interface Props { onMagicClick: () => void; className?: string; }

export function GeekDashboard({ onMagicClick, className }: Props) {
  return (
    <>
      {/* DESKTOP — 3-column command center */}
      <div className={cn("hidden md:grid grid-cols-[230px_1fr_250px] gap-4 items-start", className)}>
        <LeftWing />
        <CenterCore onMagicClick={onMagicClick} />
        <RightWing />
      </div>

      {/* MOBILE — Handheld HUD Terminal */}
      <div className={cn("flex md:hidden flex-col", className)}>
        <MobileHUD onMagicClick={onMagicClick} />
      </div>
    </>
  );
}
