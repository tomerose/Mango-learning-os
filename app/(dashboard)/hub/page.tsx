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
          {cta ?? "查看全部"} <ChevronRight className="size-4" />
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
  const dateStr = new Date().toLocaleDateString("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="relative flex flex-col gap-16 pb-24">
      <HomeBackground />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-6 md:pt-14">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }} className="flex flex-col gap-5 max-w-2xl">
          <p className="text-label">{dateStr}</p>
          <h1 className="text-display">
            你的学习，<br />
            <span className="text-fg-muted">被优雅地组织起来。</span>
          </h1>
          <p className="text-body text-fg-muted max-w-lg leading-relaxed">
            Mango 是你的个人学习操作系统——智能辅导、间隔重复、知识图谱、项目实践
            帮助你深度学习，而不仅仅是收集信息。
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
              进入导师
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ 2. TODAY'S LEARNING CENTER ═══ */}
      <Section>
        <SectionHeader title="今日" description="学习概览，一目了然。" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Target} label="任务" value={`${doneToday}/${totalToday}`} sub="今日已完成" href="/planner" />
          <StatCard icon={Layers} label="闪卡" value={`${dueCards}`} sub="待复习" href="/exam" />
          <StatCard icon={Flame} label="连续天数" value={`${stats?.streakDays ?? 0} 天`} sub="继续加油" href="/profile" />
        </div>
      </Section>

      {/* ═══ 3. 核心能力 ═══ */}
      <Section delay={0.03}>
        <SectionHeader title="核心能力" description="Mango 的独特价值——帮你学得更深、记得更牢。" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { icon: Layers, label: "间隔重复", sub: dueCards > 0 ? `${dueCards} 张待复习` : "SM-2 算法驱动", href: "/exam" },
            { icon: Network, label: "知识图谱", sub: "概念关联可视化", href: "/exam" },
            { icon: Heart, label: "CBT 认知重构", sub: "心理工具 · 成长心态", href: "/grow" },
            { icon: Brain, label: "Agent 记忆", sub: "个性化学习引擎", href: "/agent" },
          ].map((f) => (
            <Link key={f.label} href={f.href}
              className="card-raised hover-lift p-4 flex flex-col gap-2 group relative overflow-hidden">
              {f.label === "间隔重复" && dueCards > 0 && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-orange-400 animate-pulse" />
              )}
              <span className="size-9 rounded-lg bg-bg-muted flex items-center justify-center">
                <f.icon className="size-4 text-primary" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-small font-semibold group-hover:text-primary transition-colors">{f.label}</p>
                <p className="text-caption">{f.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ═══ 4. 学习工作区 ═══ */}
      <Section delay={0.05}>
        <SectionHeader label="学习工作区" title="你的智能导师" description="结构化讲解、针对性练习、即时反馈。" href="/agent" cta="打开导师" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ModuleCard icon={Brain} label="概念讲解" desc="将任何主题拆解为清晰、结构化的讲解，附带示例和练习。" href="/agent" accent="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" />
          <ModuleCard icon={BookOpen} label="针对性练习" desc="根据你的薄弱环节生成专项练习。即时评分和反馈。" href="/agent" accent="bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400" />
          <ModuleCard icon={Sparkles} label="Mango Magic" desc="一键生成：学习指南、闪卡、考试复习包、学习计划。" href="/agent" accent="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" />
        </div>
      </Section>

      {/* ═══ 4. SKILL GRAPH ═══ */}
      <Section delay={0.1}>
        <SectionHeader label="技能图谱" title="看见你的知识" description="你的知识以网络形式可视化呈现。发现知识盲区和概念关联。" href="/exam" cta="探索图谱" />
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
            打开知识图谱 →
          </Link>
        </div>
      </Section>

      {/* ═══ 5. MIND GARDEN ═══ */}
      <Section delay={0.15}>
        <SectionHeader label="心灵花园" title="在反思中成长" description="学习不只是获取知识，更是心智成长和情绪管理。" href="/grow" cta="进入花园" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ModuleCard icon={Heart} label="情绪追踪" desc="追踪你的情绪模式与学习进度的关联，了解什么影响你的专注力。" href="/grow" accent="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" />
          <ModuleCard icon={Brain} label="CBT 认知重构" desc="重新框定你对学习的负面想法，建立韧性和成长心态。" href="/grow" accent="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400" />
          <ModuleCard icon={Sparkles} label="暖心陪伴" desc="一个温暖、不评判的倾听者。聊聊学习焦虑，或者只是反思今天。" href="/grow" accent="bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400" />
        </div>
      </Section>

      {/* ═══ 6. EXAM CENTER ═══ */}
      <Section delay={0.2}>
        <SectionHeader label="考试中心" title="从容备考" description="上传你的资料，自动生成复习指南、模拟考试，并追踪你的备考进度。" href="/exam" cta="开始备考" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ModuleCard icon={BookOpen} label="学习指南" desc="上传 PDF、Word 或粘贴笔记。自动生成结构化复习手册。" href="/exam" accent="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" />
          <ModuleCard icon={BarChart3} label="模拟考试" desc="计时的模拟考试，附带评分、解析和薄弱项分析。追踪你的进步。" href="/exam" accent="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" />
          <ModuleCard icon={Clock} label="倒计时" desc="查看即将到来的考试，追踪备考进度，获取智能推荐的学习计划。" href="/exam" accent="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" />
        </div>
      </Section>

      {/* ═══ 7. KNOWLEDGE TIMELINE ═══ */}
      <Section delay={0.25}>
        <SectionHeader label="进度" title="你的学习旅程" description="每一次学习、每一场测验、每一篇反思——都在构筑你的知识体系。" href="/profile" cta="查看统计" />
        {subjects.length > 0 && (
          <div className="card-flat p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-subhead font-semibold">已选科目</p>
              <Link href="/agent" className="text-small text-primary hover:underline">管理</Link>
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
            <p className="text-subhead font-semibold">更多功能即将上线</p>
            <p className="text-small text-fg-muted mt-1">
              学习小组、共享知识图谱和协作学习空间正在开发中。
            </p>
          </div>
        </div>
      </Section>

      {/* ── Magic Card Modal ── */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />
    </div>
  );
}
