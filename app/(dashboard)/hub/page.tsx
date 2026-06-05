"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Brain, BookOpen, CalendarCheck, Heart,
  Layers, Zap, Target, ArrowRight, Flame, Network,
  Clock, TrendingUp, Mic,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { MagicCard } from "@/components/hub/magic-card";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";
import { cn } from "@/lib/utils";
import { AmbientOrbs, FloatingParticles } from "@/components/ui/ambient-orbs";
import { PageTransition } from "@/components/layout/page-transition";
import { StaggerReveal, FadeIn, ScaleIn } from "@/components/ui/motion-system";

/* ═══════════════════════════════════════════════════════════════
   Hub v7 — Warm Paper · Editorial Wellness · Mobile-First
   A Personal Learning Sanctuary — not a dashboard.
   ═══════════════════════════════════════════════════════════════ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 12) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({ label, title, href, cta }: {
  label?: string; title: string; href?: string; cta?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {label && <p className="text-label">{label}</p>}
        <h2 className="text-title">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-small text-fg-muted hover:text-primary transition-colors shrink-0">
          {cta ?? "查看全部"}
        </Link>
      )}
    </div>
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

  const greeting = getGreeting();
  const doneToday = tasks.filter((t) => t.done).length;
  const totalToday = tasks.length;
  const dueCards = flashcards.filter((f) => f.dueOn <= new Date().toISOString().slice(0, 10)).length;
  const dateStr = new Date().toLocaleDateString("zh-CN", { weekday: "long", month: "long", day: "numeric" });

  return (
    <PageTransition>
    <div className="flex flex-col gap-14 pb-24">
      {/* ═══ 1. HERO — Warm editorial greeting with watercolor blob ═══ */}
      <section className="relative pt-4 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Hero Card */}
          <div className="relative overflow-hidden card-hero p-7 sm:p-10 md:p-12">
            {/* Premium SVG gradient orbs + floating particles */}
            <AmbientOrbs className="opacity-80" />
            <FloatingParticles count={15} className="opacity-50" />

            <div className="relative z-10 flex flex-col gap-5">
              {/* Date & Greeting */}
              <div className="flex flex-col gap-1">
                <p className="text-caption">{dateStr}</p>
                <h1 className="text-display">
                  {greeting}，<br />
                  <span className="text-fg-muted">今天想学什么？</span>
                </h1>
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5">
                  <Flame className="size-4 text-primary" fill="currentColor" />
                  <span className="text-small font-medium">{stats?.streakDays ?? 0} 天连续</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5">
                  <Target className="size-4 text-fg-muted" />
                  <span className="text-small">{doneToday}/{totalToday} 任务</span>
                </div>
                {dueCards > 0 && (
                  <>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-center gap-1.5">
                      <Layers className="size-4 text-fg-muted" />
                      <span className="text-small">{dueCards} 张待复习</span>
                    </div>
                  </>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 pt-1">
                <motion.button
                  onClick={() => setMagicOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-on px-5 py-2.5 text-small font-medium hover:bg-primary-hover transition-colors duration-200 pressable focus-ring"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles className="size-4" strokeWidth={1.5} />
                  Ask Mango
                </motion.button>
                <Link href="/agent"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-small font-medium hover:bg-bg-muted transition-colors duration-200 pressable focus-ring">
                  进入导师
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ 2. TODAY ═══ */}
      <Section delay={0.05}>
        <SectionHeader title="今日学习" />
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Target, label: "待办任务", value: `${doneToday}/${totalToday}`, sub: "已完成", href: "/planner" },
            { icon: Layers, label: "闪卡复习", value: `${dueCards} 张`, sub: dueCards > 0 ? "待复习" : "全部完成", href: "/exam" },
            { icon: Clock, label: "今日学习", value: `${stats?.minutesToday ?? 0} 分钟`, sub: `目标 ${stats?.minutesGoal ?? 180} 分钟`, href: "/profile" },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="card-card hover-lift p-4 sm:p-5 flex items-start justify-between group">
              <div className="flex flex-col gap-1">
                <span className="text-label">{s.label}</span>
                <span className="text-heading font-medium">{s.value}</span>
                <span className="text-caption">{s.sub}</span>
              </div>
              <div className="size-10 rounded-xl bg-bg-muted flex items-center justify-center group-hover:bg-primary-subtle transition-colors duration-300">
                <s.icon className="size-5 text-fg-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </StaggerReveal>
      </Section>

      {/* ═══ 3. CORE CAPABILITIES ═══ */}
      <Section delay={0.08}>
        <SectionHeader title="核心能力" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { icon: Mic, label: "Mango Voice", sub: "5 个人格 · 实时语音对话", href: "/voice" },
            { icon: Network, label: "知识森林", sub: "3D 网络 · 一键生成", href: "/exam" },
            { icon: Layers, label: "间隔重复", sub: dueCards > 0 ? `${dueCards} 张待复习` : "SM-2 科学闪卡", href: "/planner" },
            { icon: Brain, label: "AI 学习伴侣", sub: "智能导师 + 身份系统", href: "/agent" },
          ].map((f) => (
            <Link key={f.label} href={f.href}
              className="card-card hover-lift p-4 flex flex-col gap-2.5 group relative overflow-hidden">
              {f.label === "间隔重复" && dueCards > 0 && (
                <span className="absolute top-3 right-3 size-2 rounded-full bg-primary animate-pulse" />
              )}
              <span className="size-9 rounded-xl flex items-center justify-center bg-primary-subtle">
                <f.icon className="size-4 text-primary" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-small font-medium group-hover:text-primary transition-colors">{f.label}</p>
                <p className="text-caption">{f.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ═══ 4. LEARNING MODULES ═══ */}
      <Section delay={0.1}>
        <SectionHeader title="学习空间" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Brain, label: "智能导师", desc: "结构化讲解 + 针对性练习", href: "/agent" },
            { icon: Mic, label: "Mango Voice", desc: "5 个人格 · 实时语音对话", href: "/voice" },
            { icon: BookOpen, label: "考试备战", desc: "上传资料 → 自动生成复习包", href: "/planner" },
            { icon: Network, label: "知识森林", desc: "3D 球面知识网络 · AI 自动生成", href: "/exam" },
            { icon: Layers, label: "间隔重复", desc: "SM-2 科学记忆 · 3D 翻转闪卡", href: "/planner" },
            { icon: Heart, label: "心灵花园", desc: "情绪追踪 · CBT 重构 · AI 陪伴", href: "/grow" },
          ].map((m) => (
            <Link key={m.label} href={m.href}
              className="card-card hover-lift p-4 sm:p-5 group flex flex-col gap-3 cursor-pointer">
              <div className="size-10 rounded-xl bg-primary-subtle flex items-center justify-center">
                <m.icon className="size-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-small font-medium group-hover:text-primary transition-colors">{m.label}</p>
                <p className="text-caption mt-0.5 leading-relaxed">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ═══ 5. SUBJECTS ═══ */}
      {subjects.length > 0 && (
        <Section delay={0.12}>
          <SectionHeader title="学习科目" href="/agent" cta="管理" />
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <Link key={s.id} href={`/agent?subject=${s.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-small hover:bg-bg-muted transition-colors duration-200">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ 6. PLANNER CTA ═══ */}
      <Section delay={0.14}>
        <Link href="/planner"
          className="card-card hover-lift p-5 sm:p-6 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <span className="size-11 rounded-2xl bg-primary-subtle flex items-center justify-center">
              <CalendarCheck className="size-5 text-primary" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-small font-medium">学习计划</p>
              <p className="text-caption mt-0.5">日计划 · 周计划 · 学期计划 · 智能生成</p>
            </div>
          </div>
          <ArrowRight className="size-5 text-fg-subtle group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </Link>
      </Section>

      {/* ═══ Magic Card Modal ═══ */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
    </div>
    </PageTransition>
  );
}
