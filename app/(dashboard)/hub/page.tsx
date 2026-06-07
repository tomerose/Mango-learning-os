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
import { CognitiveFlows } from "@/components/hub/cognitive-flows";
import { AmbientOrbs, FloatingParticles } from "@/components/ui/ambient-orbs";
import { PageTransition } from "@/components/layout/page-transition";
import { getRecentStudyPacks, type StudyPackSession } from "@/lib/study-pack-store";
import { useSubjects } from "@/lib/subjects";
import {
  ActionCard,
  FloatingCommandBar,
  LearningStatCard,
  MissionHero,
  MobileShell,
  PrimaryMobileButton,
} from "@/components/mobile/premium-mobile";

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

function SubjectsSection() {
  const { subjects } = useSubjects();
  if (subjects.length === 0) return null;
  return (
    <Section delay={0.14}>
      <h2 className="text-title mb-4">学习科目</h2>
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <Link key={s.id} href={`/agent?subject=${s.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-small hover:bg-bg-muted transition-colors">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </Link>
        ))}
      </div>
    </Section>
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
    <div className="md:hidden">
      <MobileShell>
        <MissionHero
          eyebrow={dateStr}
          title={`${greeting}，进入学习任务台`}
          description="把今天的课程、复习、提问和情绪恢复，收束成可执行的下一步。"
          icon={Sparkles}
          meta={
            <>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{stats?.streakDays ?? 0} 天 streak</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{doneToday}/{totalToday} tasks</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{dueCards} flashcards</span>
            </>
          }
          action={
            <PrimaryMobileButton href="/exam">
              <BookOpen className="mr-2 size-4" />
              生成学习包
            </PrimaryMobileButton>
          }
        />

        <FloatingCommandBar placeholder="让芒宝解释、规划、复习..." href="/agent" />

        <section className="grid grid-cols-3 gap-3">
          <LearningStatCard icon={Target} label="Missions" value={`${doneToday}/${totalToday}`} sub="今日任务" href="/planner" />
          <LearningStatCard icon={Layers} label="Review" value={`${dueCards}`} sub="到期闪卡" href="/exam" />
          <LearningStatCard icon={Clock} label="Focus" value={`${stats?.minutesToday ?? 0}`} sub="分钟" href="/profile" />
        </section>

        {recentPacks.length > 0 && (
          <section className="mango-glass-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">继续学习</h2>
              <Link href="/exam" className="text-xs font-medium text-amber-200">查看全部</Link>
            </div>
            <div className="space-y-2">
              {recentPacks.slice(0, 2).map((pack) => (
                <Link key={pack.id} href="/exam" className="flex items-center gap-3 rounded-2xl bg-white/[0.055] p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/18 text-amber-200">
                    <FileText className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{pack.courseName}</span>
                    <span className="mt-0.5 block text-xs text-white/42">Quality {pack.qualityScore} · {new Date(pack.createdAt).toLocaleDateString("zh-CN")}</span>
                  </span>
                  <ArrowRight className="size-4 text-white/35" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/45">Next actions</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Mission shortcuts</h2>
            </div>
            <button type="button" onClick={() => setMagicOpen(true)} className="text-xs font-semibold text-amber-200">
              魔法
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard icon={BookOpen} title="Generate" description="课程输入、资料分析、生成复习讲义" href="/exam" badge="DOCX" />
            <ActionCard icon={Bot} title="Agent" description="讲解概念、生成练习、保存知识" href="/agent" />
            <ActionCard icon={Heart} title="Mind Garden" description="本地优先的情绪恢复与复盘" href="/grow" />
            <ActionCard icon={Sparkles} title="Ask Mango" description="快速整理一个学习问题" onClick={() => setMagicOpen(true)} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <ActionCard icon={FileText} title="Notes" description="导入、整理、复习笔记" href="/exam?tab=notes" />
          <ActionCard icon={Layers} title="Forest" description="知识森林和学习路径" href="/exam?tab=forest" />
        </section>

      </MobileShell>
    </div>

    <div className="hidden flex-col gap-10 pb-24 max-w-2xl mx-auto md:flex">
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

      {/* ═══ 5. COGNITIVE FLOWS (Daily real content) ═══ */}
      <Section delay={0.12}>
        <CognitiveFlows />
      </Section>

      {/* ═══ 6. SUBJECTS ═══ */}
      <SubjectsSection />
    </div>

    {/* ═══ Magic Card Modal — single instance ═══ */}
    <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
    </PageTransition>
  );
}
