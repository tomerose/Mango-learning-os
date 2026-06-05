"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap, Layers, Target, BookOpen, ArrowRight, CalendarCheck,
  Brain, TrendingUp, Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { MagicCard } from "@/components/hub/magic-card";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";

/* ─────────────────────────────────────────────────────────────
   Hub v6 — Calm, premium, narrative-driven home
   Mango Design System v5
   ───────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getDateStr(): string {
  const now = new Date();
  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${weekdays[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

export default function HubPage() {
  const [magicOpen, setMagicOpen] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const { stats, tasks, flashcards } = useStore();
  const { subjects } = useSubjects();

  React.useEffect(() => { setShowOnboarding(shouldShowOnboarding()); }, []);

  if (showOnboarding) {
    return <MangoOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  const doneToday = tasks.filter((t) => t.done).length;
  const totalToday = tasks.length;
  const dueCards = flashcards.filter((f) => f.dueOn <= new Date().toISOString().slice(0, 10)).length;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* ── Hero — calm, minimal, value-first ── */}
      <section className="pt-4 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4"
        >
          <p className="text-label">{getDateStr()}</p>
          <h1 className="text-display max-w-2xl">
            {getGreeting()}.<br />
            <span className="text-fg-muted">What would you like to learn today?</span>
          </h1>
          <p className="text-body text-fg-muted max-w-lg">
            Your personal learning operating system. AI tutor, spaced repetition, knowledge mapping, and project-based mastery — all in one calm space.
          </p>
        </motion.div>
      </section>

      {/* ── Today's Focus — 3 stat cards ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { icon: Target, label: "Tasks Today", value: `${doneToday}/${totalToday}`, sub: "completed", href: "/planner" },
          { icon: Layers, label: "Flashcards Due", value: `${dueCards}`, sub: "ready for review", href: "/exam" },
          { icon: Zap, label: "Current Streak", value: `${stats?.streakDays ?? 0}`, sub: "days", href: "/profile" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="card-raised hover-lift p-5 flex items-start justify-between group">
            <div className="flex flex-col gap-1">
              <span className="text-label">{s.label}</span>
              <span className="text-title font-mono tabular-nums">{s.value}</span>
              <span className="text-caption">{s.sub}</span>
            </div>
            <div className="size-10 rounded-lg bg-bg-muted flex items-center justify-center group-hover:bg-primary-subtle transition-colors duration-200">
              <s.icon className="size-5 text-fg-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </motion.section>

      {/* ── Quick Start — Mango Magic trigger ── */}
      <motion.button
        onClick={() => setMagicOpen(true)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="card-raised hover-lift p-6 flex items-center gap-5 group text-left w-full"
      >
        <div className="size-14 rounded-2xl bg-primary-subtle flex items-center justify-center shrink-0">
          <Sparkles className="size-7 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-heading">Ask Mango anything</p>
          <p className="text-body text-fg-muted mt-1">Generate study plans, create practice tests, summarize notes, or explore any topic with your AI tutor.</p>
        </div>
        <ArrowRight className="size-5 text-fg-subtle group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
      </motion.button>

      {/* ── Module Grid — 6 core capabilities ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {[
          { icon: Brain, label: "AI Tutor", desc: "Learn any concept with structured explanations, practice problems, and instant feedback.", href: "/agent", accent: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" },
          { icon: BookOpen, label: "Exam Center", desc: "Upload materials, generate study guides, take practice tests, and track your preparation.", href: "/exam", accent: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" },
          { icon: CalendarCheck, label: "Study Planner", desc: "AI-generated daily, weekly, and semester plans based on your goals and available time.", href: "/planner", accent: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" },
          { icon: TrendingUp, label: "Skill Graph", desc: "Visualize your knowledge as an interconnected graph. See what you know and what's next.", href: "/exam", accent: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400" },
          { icon: Brain, label: "Mind Garden", desc: "Track your mood, reflect on your learning journey, and grow through cognitive reframing.", href: "/grow", accent: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" },
          { icon: Layers, label: "Digital Soul", desc: "Distill your communication style into a digital persona. Memory, voice, and identity.", href: "/dna", accent: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" },
        ].map((m) => (
          <Link key={m.label} href={m.href} className="card-raised hover-lift p-5 group flex flex-col gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${m.accent}`}>
              <m.icon className="size-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-subhead font-semibold group-hover:text-primary transition-colors duration-200">{m.label}</p>
              <p className="text-small text-fg-muted mt-1 leading-relaxed">{m.desc}</p>
            </div>
          </Link>
        ))}
      </motion.section>

      {/* ── Bottom: Subjects overview ── */}
      {subjects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="card-flat p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-subhead font-semibold">Your Subjects</p>
            <Link href="/agent" className="text-small text-primary hover:underline">Manage</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <Link key={s.id} href={`/agent?subject=${s.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-small hover:bg-bg-muted transition-colors duration-150">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Magic Card Modal ── */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
    </div>
  );
}
