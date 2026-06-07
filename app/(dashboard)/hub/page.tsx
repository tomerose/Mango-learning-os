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
import { cn } from "@/lib/utils";
import { AmbientOrbs, FloatingParticles } from "@/components/ui/ambient-orbs";
import { PageTransition } from "@/components/layout/page-transition";
import { getRecentStudyPacks, type StudyPackSession } from "@/lib/study-pack-store";
import { useSubjects } from "@/lib/subjects";
import { buildLearningIdentity } from "@/lib/agent/learning-memory";
import { getMistakesDue } from "@/lib/agent/mistake-bank";
import { MobileShell, MissionHero, FloatingCommandBar, ActionCard, LearningStatCard, PrimaryMobileButton } from "@/components/mobile/premium-mobile";
import { MangoTodayEntry } from "@/components/hub/mango-today-entry";
import { ExperienceCards } from "@/components/hub/experience-cards";
import { VersionBadge } from "@/components/hub/version-badge";
import { VisionCard } from "@/components/hub/vision-card";
import { ExperimentLog } from "@/components/hub/experiment-log";

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

function ReviewSection() {
  const [recommendations, setRecommendations] = React.useState<string[]>([]);
  const [mistakesDue, setMistakesDue] = React.useState(0);

  React.useEffect(() => {
    try {
      const identity = buildLearningIdentity();
      setRecommendations(identity.recentRecommendations ?? []);
      const due = getMistakesDue();
      setMistakesDue(due.length);
    } catch { /* guest mode, no data */ }
  }, []);

  if (recommendations.length === 0 && mistakesDue === 0) return null;

  return (
    <Section delay={0.12}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-title">今日复习建议</h2>
        {mistakesDue > 0 && (
          <Link href="/agent?view=tasks" className="text-small text-primary hover:underline flex items-center gap-1">
            复习错题 <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {mistakesDue > 0 && (
          <Link href="/agent?view=tasks"
            className="card-card p-4 flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Target className="size-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                你有 <span className="text-amber-600 font-bold">{mistakesDue}</span> 道错题待复习
              </p>
              <p className="text-caption">基于间隔重复，现在是最佳复习时间</p>
            </div>
            <ArrowRight className="size-4 text-fg-subtle/80 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        )}
        {recommendations.slice(0, 2).map((rec, i) => (
          <div key={i} className="card-card p-3 flex items-start gap-3">
            <span className="text-sm mt-0.5">💡</span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm">{rec}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
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
    <>
      {/* ══════════════════════════════════════════════════════
          Mobile Layout (< md)
          ══════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <MobileShell>
          <MissionHero
            eyebrow={`${dateStr} · 连续 ${stats?.streakDays ?? 0} 天`}
            title="今天你要交付什么？"
            description="不是聊天，不是看数据 — MangoOS 帮你生成可保存、可导出、可复习的学习成果。"
            icon={Sparkles}
          />

          <FloatingCommandBar placeholder="告诉 Mango 你想学什么..." href="/agent" />

          {/* ═══ MANGO TODAY ENTRY ═══ */}
          <MangoTodayEntry />

          {/* ═══ EXPERIENCE CARDS (V14.7.3) ═══ */}
          <section className="px-1">
            <ExperienceCards />
          </section>

          {/* 3-column stat grid */}
          <div className="grid grid-cols-3 gap-2 px-1">
            <LearningStatCard
              icon={Target}
              label="待办任务"
              value={`${doneToday}/${totalToday}`}
              sub="已完成"
            />
            <LearningStatCard
              icon={Layers}
              label="闪卡复习"
              value={`${dueCards} 张`}
              sub={dueCards > 0 ? "待复习" : "全部完成"}
            />
            <LearningStatCard
              icon={Clock}
              label="今日学习"
              value={`${stats?.minutesToday ?? 0} 分钟`}
              sub={`目标 ${stats?.minutesGoal ?? 180} 分钟`}
            />
          </div>

          {/* Recent packs */}
          {recentPacks.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-white/70 px-1">继续学习</h2>
              {recentPacks.slice(0, 2).map(pack => (
                <Link key={pack.id} href="/pack" className="mango-glass-card p-4 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-amber-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {pack.courseName}{pack.school ? ` · ${pack.school}` : ""}
                    </p>
                    <p className="text-xs text-white/45">
                      {new Date(pack.createdAt).toLocaleDateString("zh-CN")} · 质量 {pack.qualityScore}分
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-white/28" />
                </Link>
              ))}
            </div>
          )}

          {/* Action grid */}
          <div className="grid grid-cols-2 gap-2 px-1">
            <ActionCard icon={BookOpen} title="学习包" description="生成复习讲义" href="/pack" />
            <ActionCard icon={Bot} title="导师" description="AI 对话学习" href="/agent" />
            <ActionCard icon={Heart} title="花园" description="情绪支持" href="/grow" />
            <ActionCard icon={Sparkles} title="Ask Mango" description="快速提问" onClick={() => setMagicOpen(true)} />
          </div>

          {/* Secondary modules */}
          <ReviewSection />
          <CognitiveFlows />

          {/* ═══ V14.7.3: Version + Vision + Experiment Log ═══ */}
          <section className="px-1 space-y-3">
            <VersionBadge />
            <VisionCard />
            <ExperimentLog />
          </section>

          <SubjectsSection />
        </MobileShell>

        {/* Magic Card Modal */}
        <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
      </div>

      {/* ══════════════════════════════════════════════════════
          Desktop Layout (≥ md) — EXACT original
          ══════════════════════════════════════════════════════ */}
      <PageTransition>
      <div className="hidden md:flex flex-col gap-10 pb-24 max-w-2xl mx-auto">
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
                <Link href="/pack"
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-on px-6 py-3.5 text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 self-start pressable">
                  <BookOpen className="size-5" />
                  生成学习包
                  <ArrowRight className="size-4" />
                </Link>
                <p className="text-caption -mt-2">
                  输入课程名 → AI 搜索资料 → 生成完整复习讲义 → 导出 Word/PDF
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══ V14.7.3: EXPERIENCE CARDS ═══ */}
        <Section delay={0.03}>
          <ExperienceCards />
        </Section>

        {/* ═══ 2. CONTINUE WHERE YOU LEFT OFF ═══ */}
        {recentPacks.length > 0 && (
          <Section delay={0.05}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title">继续学习</h2>
              <Link href="/pack" className="text-small text-primary hover:underline">查看全部</Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentPacks.slice(0, 2).map(pack => (
                <Link key={pack.id} href="/pack"
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
              { icon: Layers, label: "闪卡复习", value: `${dueCards} 张`, sub: dueCards > 0 ? "待复习" : "全部完成", href: "/pack" },
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
              { icon: BookOpen, label: "学习包", sub: "生成复习讲义", href: "/pack" },
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

        {/* ═══ 5. TODAY'S REVIEW PLAN ═══ */}
        <ReviewSection />

        {/* ═══ 6. COGNITIVE FLOWS (Daily real content) ═══ */}
        <Section delay={0.14}>
          <CognitiveFlows />
        </Section>

        {/* ═══ 7. SUBJECTS ═══ */}
        <SubjectsSection />

        {/* ═══ V14.7.3: Version + Vision + Experiment Log ═══ */}
        <Section delay={0.16}>
          <div className="flex flex-col gap-4">
            <VersionBadge />
            <VisionCard />
            <ExperimentLog />
          </div>
        </Section>

        {/* ═══ Magic Card Modal ═══ */}
        <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
      </div>
      </PageTransition>
    </>
  );
}
