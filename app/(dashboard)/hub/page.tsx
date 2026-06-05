"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Brain, BookOpen, CalendarCheck, TrendingUp,
  Heart, Layers, Zap, Target, ArrowRight, ChevronRight,
  Flame, Network, Clock, BarChart3,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { MagicCard } from "@/components/hub/magic-card";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";
import { HomeBackground } from "@/components/ui/module-backgrounds";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   Hub v6 — Calm. Intelligent. Narrative-driven.
   Apple HI × Linear × Arc × Notion × M3
   ═══════════════════════════════════════════════════════════════ */

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

function Section({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}

/* ── Section Header ──────────────────────────────────────────── */
function SectionHeader({ label, title, description, href, cta }: {
  label?: string; title: string; description?: string; href?: string; cta?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div className="flex flex-col gap-1.5">
        {label && <p className="text-label">{label}</p>}
        <h2 className="text-title">{title}</h2>
        {description && <p className="text-body text-fg-muted max-w-md">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="hidden sm:flex items-center gap-1 text-small text-fg-muted hover:text-fg transition-colors shrink-0">
          {cta ?? "View all"} <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, href }: {
  icon: React.ElementType; label: string; value: string; sub: string; href: string;
}) {
  return (
    <Link href={href} className="card-raised hover-lift p-5 flex items-start justify-between group">
      <div className="flex flex-col gap-1">
        <span className="text-label">{label}</span>
        <span className="text-title font-mono tabular-nums">{value}</span>
        <span className="text-caption">{sub}</span>
      </div>
      <div className="size-10 rounded-lg bg-bg-muted flex items-center justify-center group-hover:bg-primary-subtle transition-colors duration-200">
        <Icon className="size-5 text-fg-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
      </div>
    </Link>
  );
}

/* ── Module Card ──────────────────────────────────────────────── */
function ModuleCard({ icon: Icon, label, desc, href, accent }: {
  icon: React.ElementType; label: string; desc: string; href: string; accent: string;
}) {
  return (
    <Link href={href} className="card-raised hover-lift p-5 group flex flex-col gap-3">
      <div className={`size-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-subhead font-semibold group-hover:text-primary transition-colors duration-200">{label}</p>
        <p className="text-small text-fg-muted mt-1 leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
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
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="relative flex flex-col gap-16 pb-24">
      <HomeBackground />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-6 md:pt-14">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }} className="flex flex-col gap-5 max-w-2xl">
          <p className="text-label">{dateStr}</p>
          <h1 className="text-display">
            Your learning,<br />
            <span className="text-fg-muted">beautifully structured.</span>
          </h1>
          <p className="text-body text-fg-muted max-w-lg leading-relaxed">
            Mango is your personal learning operating system. AI-powered tutoring,
            spaced repetition, knowledge mapping, and project-based mastery — designed
            to help you learn deeply, not just collect information.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <motion.button
              onClick={() => setMagicOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-on px-5 py-2.5 text-small font-medium hover:bg-primary-hover transition-colors duration-200 pressable focus-ring"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="size-4" strokeWidth={1.5} />
              Ask Mango
            </motion.button>
            <Link href="/agent"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-small font-medium hover:bg-bg-muted transition-colors duration-200 pressable focus-ring">
              Explore tutor
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ 2. TODAY'S LEARNING CENTER ═══ */}
      <Section>
        <SectionHeader title="Today" description="Your learning at a glance." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Target} label="Tasks" value={`${doneToday}/${totalToday}`} sub="completed today" href="/planner" />
          <StatCard icon={Layers} label="Flashcards" value={`${dueCards}`} sub="ready for review" href="/exam" />
          <StatCard icon={Flame} label="Streak" value={`${stats?.streakDays ?? 0} days`} sub="keep going" href="/profile" />
        </div>
      </Section>

      {/* ═══ 3. AI WORKSPACE ═══ */}
      <Section delay={0.05}>
        <SectionHeader label="AI Workspace" title="Your intelligent tutor" description="Structured explanations, practice problems, and instant feedback — powered by DeepSeek." href="/agent" cta="Open tutor" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ModuleCard icon={Brain} label="Concept Explainer" desc="Break down any topic into clear, structured explanations with examples and practice." href="/agent" accent="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" />
          <ModuleCard icon={BookOpen} label="Practice Problems" desc="Generate targeted exercises based on your weak areas. Get instant scoring and feedback." href="/agent" accent="bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400" />
          <ModuleCard icon={Sparkles} label="Mango Magic" desc="One-click generation: study guides, flashcards, exam prep, and learning plans." href="/agent" accent="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" />
        </div>
      </Section>

      {/* ═══ 4. SKILL GRAPH ═══ */}
      <Section delay={0.1}>
        <SectionHeader label="Skill Graph" title="See what you know" description="Your knowledge visualized as an interconnected network. Discover gaps and connections." href="/exam" cta="Explore graph" />
        <div className="card-raised p-8 flex flex-col items-center gap-6 text-center">
          <div className="size-20 rounded-full bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
            <Network className="size-10 text-violet-600 dark:text-violet-400" strokeWidth={1} />
          </div>
          <div className="max-w-sm">
            <p className="text-subhead font-semibold">Knowledge Graph</p>
            <p className="text-small text-fg-muted mt-1">
              Your notes, flashcards, and quiz results automatically connect into a visual knowledge graph.
              See how concepts relate and find your next learning target.
            </p>
          </div>
          <Link href="/exam" className="text-small text-primary hover:underline font-medium">
            Open knowledge graph →
          </Link>
        </div>
      </Section>

      {/* ═══ 5. MIND GARDEN ═══ */}
      <Section delay={0.15}>
        <SectionHeader label="Mind Garden" title="Grow through reflection" description="Your learning isn't just about knowledge. It's about growth, mindset, and well-being." href="/grow" cta="Visit garden" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ModuleCard icon={Heart} label="Mood Tracking" desc="Track your emotional patterns alongside your learning progress. See what affects your focus." href="/grow" accent="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" />
          <ModuleCard icon={Brain} label="CBT Reframer" desc="Reframe negative thoughts about your learning. Build resilience and a growth mindset." href="/grow" accent="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400" />
          <ModuleCard icon={Sparkles} label="AI Companion" desc="A warm, non-judgmental listener. Talk through learning anxiety or just reflect on your day." href="/grow" accent="bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400" />
        </div>
      </Section>

      {/* ═══ 6. EXAM CENTER ═══ */}
      <Section delay={0.2}>
        <SectionHeader label="Exam Center" title="Prepare with confidence" description="Upload your materials. We'll generate study guides, practice tests, and track your readiness." href="/exam" cta="Start preparing" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ModuleCard icon={BookOpen} label="Study Guides" desc="Upload PDF, Word, or paste notes. AI generates structured review booklets with key concepts." href="/exam" accent="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" />
          <ModuleCard icon={BarChart3} label="Practice Tests" desc="Timed mock exams with scoring, explanations, and weak area analysis. Track your progress." href="/exam" accent="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" />
          <ModuleCard icon={Clock} label="Countdown" desc="See upcoming exams, track preparation progress, and get AI-recommended study schedules." href="/exam" accent="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" />
        </div>
      </Section>

      {/* ═══ 7. KNOWLEDGE TIMELINE ═══ */}
      <Section delay={0.25}>
        <SectionHeader label="Progress" title="Your learning journey" description="Every study session, every quiz, every reflection — building toward mastery." href="/profile" cta="View stats" />
        {subjects.length > 0 && (
          <div className="card-flat p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-subhead font-semibold">Active Subjects</p>
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
          </div>
        )}
      </Section>

      {/* ═══ 8. COMMUNITY (future) ═══ */}
      <Section delay={0.3}>
        <div className="card-raised p-8 text-center flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-bg-muted flex items-center justify-center">
            <TrendingUp className="size-8 text-fg-subtle" strokeWidth={1} />
          </div>
          <div className="max-w-sm">
            <p className="text-subhead font-semibold">More coming soon</p>
            <p className="text-small text-fg-muted mt-1">
              Study groups, shared knowledge graphs, and collaborative learning spaces are on the way.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Magic Card Modal ── */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
    </div>
  );
}
