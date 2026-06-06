"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, BookOpen, Bot, Heart, Flame, Target, Layers,
  ArrowRight, Clock, FileText,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { MagicCard } from "@/components/hub/magic-card";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";
import { cn } from "@/lib/utils";
import { AmbientOrbs, FloatingParticles } from "@/components/ui/ambient-orbs";
import { PageTransition } from "@/components/layout/page-transition";
import { getRecentStudyPacks, type StudyPackSession } from "@/lib/study-pack-store";

/* ═══════════════════════════════════════════════════════════════
   Hub V10.1 — Study Cockpit
   Greeting → Study Pack CTA → Continue → Today → Quick Access
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

export default function HubPage() {
  const [magicOpen, setMagicOpen] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [recentPacks, setRecentPacks] = React.useState<StudyPackSession[]>([]);
  const { stats, tasks, flashcards } = useStore();

  React.useEffect(() => { setShowOnboarding(shouldShowOnboarding()); }, []);
  React.useEffect(() => { setRecentPacks(getRecentStudyPacks(3)); }, []);

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
    <div className="flex flex-col gap-10 pb-24 max-w-2xl mx-auto">
      {/* ═══ 1. HERO + STUDY PACK CTA ═══ */}
      <section className="relative pt-4 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative overflow-hidden card-hero p-7 sm:p-10">
            <AmbientOrbs className="opacity-80" />
            <FloatingParticles count={12} className="opacity-40" />

            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="text-caption">{dateStr}</p>
                <h1 className="text-display">{greeting}，今天想学什么？</h1>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-4 sm:gap-6 text-small">
                <span className="flex items-center gap-1.5"><Flame className="size-4 text-primary" fill="currentColor" />{stats?.streakDays ?? 0} 天</span>
                <span className="w-px h-4 bg-border" />
                <span className="flex items-center gap-1.5"><Target className="size-4 text-fg-muted" />{doneToday}/{totalToday} 任务</span>
                {dueCards > 0 && <><span className="w-px h-4 bg-border" /><span className="flex items-center gap-1.5"><Layers className="size-4 text-fg-muted" />{dueCards} 闪卡</span></>}
              </div>

              {/* Primary CTA: Study Pack */}
              <Link href="/exam"
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-on px-6 py-3.5 text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 self-start pressable">
                <BookOpen className="size-5" />
                生成期末学习包
                <ArrowRight className="size-4" />
              </Link>
              <p className="text-caption -mt-2">
                输入课程名 → AI 搜索资料 → 生成完整复习讲义 → 导出 Word/PDF
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ 2. CONTINUE WHERE YOU LEFT OFF ═══ */}
      {recentPacks.length > 0 && (
        <Section delay={0.05}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title">继续学习</h2>
            <Link href="/exam" className="text-small text-primary hover:underline">查看全部</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentPacks.slice(0, 2).map(pack => (
              <Link key={pack.id} href="/exam"
                className="card-card hover-lift p-4 flex items-center gap-4 group">
                <div className="size-10 rounded-xl bg-primary-subtle flex items-center justify-center shrink-0">
                  <FileText className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                    {pack.courseName}{pack.school ? ` · ${pack.school}` : ""}
                  </p>
                  <p className="text-caption">{new Date(pack.createdAt).toLocaleDateString("zh-CN")} · 质量 {pack.qualityScore}分 · {pack.status === "complete" ? "已完成" : "草稿"}</p>
                </div>
                <ArrowRight className="size-4 text-fg-subtle group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ 3. TODAY ═══ */}
      <Section delay={0.08}>
        <h2 className="text-title mb-4">今日概览</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Target, label: "待办任务", value: `${doneToday}/${totalToday}`, sub: "已完成", href: "/planner" },
            { icon: Layers, label: "闪卡复习", value: `${dueCards} 张`, sub: dueCards > 0 ? "待复习" : "全部完成", href: "/exam" },
            { icon: Clock, label: "今日学习", value: `${stats?.minutesToday ?? 0} 分钟`, sub: `目标 ${stats?.minutesGoal ?? 180} 分钟`, href: "/profile" },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="card-card hover-lift p-4 flex items-start justify-between group">
              <div className="flex flex-col gap-1">
                <span className="text-label">{s.label}</span>
                <span className="text-heading font-medium">{s.value}</span>
                <span className="text-caption">{s.sub}</span>
              </div>
              <div className="size-9 rounded-xl bg-bg-muted flex items-center justify-center group-hover:bg-primary-subtle transition-colors">
                <s.icon className="size-4 text-fg-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ═══ 4. QUICK ACTIONS ═══ */}
      <Section delay={0.1}>
        <h2 className="text-title mb-4">快速入口</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: "学习包", sub: "生成复习讲义", href: "/exam" },
            { icon: Bot, label: "导师", sub: "AI 对话学习", href: "/agent" },
            { icon: Heart, label: "花园", sub: "情绪支持", href: "/grow" },
            { icon: Sparkles, label: "Ask Mango", sub: "快速提问", onClick: () => setMagicOpen(true) },
          ].map((f) => {
            const content = (
              <div className="card-card hover-lift p-4 flex flex-col gap-2.5 group cursor-pointer text-left w-full">
                <span className="size-9 rounded-xl flex items-center justify-center bg-primary-subtle">
                  <f.icon className="size-4 text-primary" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-small font-medium group-hover:text-primary transition-colors">{f.label}</p>
                  <p className="text-caption">{f.sub}</p>
                </div>
              </div>
            );
            if (f.onClick) return <button key={f.label} onClick={f.onClick}>{content}</button>;
            return <Link key={f.label} href={f.href!}>{content}</Link>;
          })}
        </div>
      </Section>

      {/* ═══ Magic Card Modal ═══ */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
    </div>
    </PageTransition>
  );
}
