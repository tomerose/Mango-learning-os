"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  CalendarClock,
  BarChart2,
  GraduationCap,
  ArrowRight,
  Flame,
  TrendingUp,
} from "lucide-react";

import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { BentoGrid, BentoCell } from "@/components/ui/bento-grid";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { HubWelcome } from "@/components/hub/hub-welcome";
import { MagicButton } from "@/components/hub/magic-button";
import { MagicCard } from "@/components/hub/magic-card";
import { LearningGoalsCard } from "@/components/hub/learning-goals-card";
import { UpcomingExamsCard } from "@/components/hub/upcoming-exams-card";
import { WeeklyOverviewChart } from "@/components/hub/weekly-overview-chart";
import { QuickActions } from "@/components/hub/quick-actions";
import { ActiveCoursesList } from "@/components/hub/active-courses-list";
import { AiRecommendations } from "@/components/hub/ai-recommendations";
import { MangoOnboarding, shouldShowOnboarding } from "@/components/onboarding/MangoOnboarding";

/* ─────────────────────────────────────────────────────────────
   Hub v4 — Bento Grid + Hero + Scroll Storytelling
   ───────────────────────────────────────────────────────────── */

export default function HubPage() {
  const [magicOpen, setMagicOpen] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    setShowOnboarding(shouldShowOnboarding());
  }, []);

  if (showOnboarding) {
    return <MangoOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ═══ Hero Section ═══ */}
      <HubWelcome onMagicClick={() => setMagicOpen(true)} />

      {/* ═══ Mango Magic Card (full-screen dialog) ═══ */}
      <MagicCard open={magicOpen} onClose={() => setMagicOpen(false)} />

      {/* ═══ Bento Dashboard ═══ */}
      <BentoGrid columns={4}>
        {/* ── Cell 1: Learning Goals ── */}
        <ScrollReveal direction="up" delay={0} className="contents">
          <BentoCell colSpan={2} rowSpan={2} variant="card" hover="lift" className="p-4 sm:p-6">
          <SectionHeader
            icon={Target}
            title="学习目标"
            subtitle="追踪进度，保持专注"
          />
          <div className="mt-3 flex-1">
            <LearningGoalsContent />
          </div>
        </BentoCell>
        </ScrollReveal>

        {/* ── Cell 2: Upcoming Exams ── */}
        <ScrollReveal direction="up" delay={0.08} className="contents">
        <BentoCell
          colSpan={1}
          rowSpan={2}
          variant="glass"
          hover="lift"
          className="p-4 sm:p-5"
        >
          <SectionHeader
            icon={CalendarClock}
            title="即将考试"
            subtitle="倒计时提醒"
          />
          <div className="mt-3 flex-1">
            <UpcomingExamsContent />
          </div>
        </BentoCell>
        </ScrollReveal>

        {/* ── Cell 3: Quick Actions ── */}
        <ScrollReveal direction="up" delay={0.16} className="contents">
        <BentoCell
          colSpan={1}
          rowSpan={2}
          variant="flat"
          hover="glow"
          className="p-4 sm:p-5"
        >
          <SectionHeader
            icon={Sparkles}
            title="快捷操作"
            subtitle="一步直达"
          />
          <div className="mt-3 flex-1">
            <QuickActions />
          </div>
        </BentoCell>
        </ScrollReveal>

        {/* ── Cell 4: Weekly Chart ── */}
        <ScrollReveal direction="up" delay={0.12} className="contents">
        <BentoCell
          colSpan={2}
          variant="card"
          hover="lift"
          className="p-4 sm:p-6"
        >
          <WeeklyOverviewChart embedded />
        </BentoCell>
        </ScrollReveal>

        {/* ── Cell 5: Active Courses ── */}
        <ScrollReveal direction="up" delay={0.16} className="contents">
        <BentoCell
          colSpan={1}
          variant="card"
          hover="lift"
          className="p-4 sm:p-5"
        >
          <ActiveCoursesList embedded />
        </BentoCell>
        </ScrollReveal>

        {/* ── Cell 6: AI Recommendations ── */}
        <ScrollReveal direction="up" delay={0.2} className="contents">
        <BentoCell
          colSpan={1}
          variant="card"
          hover="lift"
          className="p-4 sm:p-5"
        >
          <AiRecommendations embedded />
        </BentoCell>
        </ScrollReveal>
      </BentoGrid>

      {/* ═══ Planner CTA — gradient banner ═══ */}
      <motion.a
        href="/planner"
        className="group relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-muted) 0%, var(--card) 50%, var(--accent) 100%)",
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/20" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarClock className="size-6" />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                学习计划
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                日计划 · 周计划 · 学期计划 · 智能生成
              </p>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            打开
            <ArrowRight className="size-4" />
          </span>
        </div>
      </motion.a>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Section Header — consistent heading for bento cells
   ───────────────────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold leading-tight">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LearningGoalsContent — embedded directly for bento layout
   ───────────────────────────────────────────────────────────── */

const SAMPLE_GOALS = [
  {
    id: "sg1",
    title: "AI 深度学习专题达到 80% 掌握度",
    subject: "ai",
    category: "mastery" as const,
    current: 72,
    target: 80,
    unit: "%",
    deadline: "2026-06-30",
    status: "active" as const,
  },
  {
    id: "sg2",
    title: "完成 30 道数学证明题",
    subject: "math",
    category: "habit" as const,
    current: 18,
    target: 30,
    unit: "道",
    deadline: "2026-06-25",
    status: "active" as const,
  },
  {
    id: "sg3",
    title: "雅思词汇量达到 350 词",
    subject: "english",
    category: "mastery" as const,
    current: 220,
    target: 350,
    unit: "词",
    deadline: "2026-07-05",
    status: "active" as const,
  },
];

function LearningGoalsContent() {
  const { getMeta } = useSubjects();
  const { mode } = useStore();
  const goals = mode === "cloud" ? [] : SAMPLE_GOALS;

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Target className="size-10 text-muted-foreground/20" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">还没有学习目标</p>
        <Button size="sm" variant="outline" asChild>
          <a href="/planner">创建第一个目标</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => {
        const meta = getMeta(goal.subject);
        const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
        return (
          <div
            key={goal.id}
            className={cn(
              "flex flex-col gap-2.5 rounded-xl border border-border/60 p-3.5",
              "transition-all duration-200 hover:border-primary/20 hover:bg-accent/20",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.short}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{goal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {meta.label} · {goal.deadline}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {pct}%
              </Badge>
            </div>
            <Progress value={pct} className="h-1" />
          </div>
        );
      })}
      <Button variant="ghost" size="sm" asChild className="self-start text-xs">
        <a href="/planner">查看全部目标 →</a>
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   UpcomingExamsContent — embedded for bento
   ───────────────────────────────────────────────────────────── */

const SAMPLE_EXAMS = [
  { id: "ex1", name: "期末考试 · 微观经济学", subject: "economics", date: "2026-06-25" },
  { id: "ex2", name: "期中测验 · 线性代数", subject: "math", date: "2026-06-12" },
  { id: "ex3", name: "模拟考 · IELTS 听力", subject: "english", date: "2026-07-10" },
];

function getCountdown(targetDate: string): { days: number; label: string; urgent: boolean } {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return { days: 0, label: "已结束", urgent: false };
  if (days === 0) return { days: 0, label: "今天", urgent: true };
  if (days === 1) return { days: 1, label: "明天", urgent: true };
  return { days, label: `${days} 天后`, urgent: days <= 3 };
}

function UpcomingExamsContent() {
  const { getMeta } = useSubjects();
  const { mode } = useStore();
  const exams = mode === "cloud" ? [] : SAMPLE_EXAMS;

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CalendarClock className="size-10 text-muted-foreground/20" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">暂无考试安排</p>
        <Button size="sm" variant="outline" asChild>
          <a href="/exam">添加考试</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {exams.map((exam) => {
        const meta = getMeta(exam.subject);
        const { days, label, urgent } = getCountdown(exam.date);
        return (
          <a
            key={exam.id}
            href="/exam"
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border/50 p-3",
              "transition-all duration-200 hover:border-primary/20 hover:bg-accent/20",
              urgent && "border-orange-200 dark:border-orange-800/30 bg-orange-50/50 dark:bg-orange-900/10",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 flex-col items-center justify-center rounded-lg text-center",
                urgent
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span className="text-base font-bold leading-none">{days > 0 ? days : "!"}</span>
              <span className="text-[9px] leading-tight">{label}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{exam.name}</p>
              <p className="text-xs text-muted-foreground">{meta.label} · {exam.date}</p>
            </div>
          </a>
        );
      })}
      <Button variant="ghost" size="sm" asChild className="self-start text-xs">
        <a href="/exam">查看全部 →</a>
      </Button>
    </div>
  );
}
