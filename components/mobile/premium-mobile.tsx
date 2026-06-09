"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileShell({
  children,
  className,
  stage = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  stage?: "dark" | "paper";
}) {
  return (
    <div
      className={cn(
        "mango-mobile-shell relative mx-auto min-h-[100dvh] w-full overflow-hidden md:overflow-visible",
        stage === "dark" ? "mango-mobile-stage" : "mango-mobile-paper",
        className,
      )}
    >
      <div className="mango-mobile-glow mango-mobile-glow-a" />
      <div className="mango-mobile-glow mango-mobile-glow-b" />
      <div className="relative z-10 flex flex-col gap-5 pb-28">{children}</div>
    </div>
  );
}

export function AnimatedPageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10, scale: 0.995 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function CinematicHero({
  eyebrow,
  title,
  description,
  meta,
  action,
  icon: Icon = Sparkles,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn("mango-hero-card relative overflow-hidden rounded-2xl p-5 text-white", className)}
    >
      {/* V14.8.1 taste-skill: oklch gradients, no rgba */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,oklch(0.58_0.16_75/0.24),transparent_34%),radial-gradient(circle_at_80%_12%,oklch(1_0_0/0.11),transparent_30%)]" />
      <div className="absolute -right-16 -top-16 size-44 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/70">{eyebrow}</p>}
            <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-normal">{title}</h1>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/12 bg-white/10 shadow-2xl backdrop-blur-xl">
            <Icon className="size-6 text-amber-200" />
          </span>
        </div>
        {description && <p className="max-w-[32rem] text-sm leading-6 text-white/68">{description}</p>}
        {meta && <div className="flex flex-wrap gap-2">{meta}</div>}
        {action}
      </div>
    </motion.section>
  );
}

export const MissionHero = CinematicHero;

export function LearningStatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const body = (
    <div className="mango-glass-card flex min-h-[116px] flex-col justify-between p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/52">{label}</span>
        <span className="grid size-9 place-items-center rounded-2xl bg-white/8 text-amber-200">
          <Icon className="size-4" />
        </span>
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-normal text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-white/45">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  onClick,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
}) {
  const content = (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="mango-glass-card group relative flex min-h-[132px] flex-col justify-between p-4 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary/18 text-amber-200">
          <Icon className="size-5" />
        </span>
        {badge && <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] text-white/55">{badge}</span>}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/48">{description}</p>
      </div>
      <ArrowRight className="absolute bottom-4 right-4 size-4 text-white/28 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-200" />
    </motion.div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return (
    <button type="button" onClick={onClick} className="text-left">
      {content}
    </button>
  );
}

export function GenerateTemplateCard({
  title,
  description,
  input,
  process,
  output,
  icon: Icon,
  onSelect,
}: {
  title: string;
  description: string;
  input: string;
  process: string;
  output: string;
  icon: LucideIcon;
  onSelect?: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onSelect}
      className="mango-paper-card w-full p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-subtle text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">{title}</p>
          <p className="mt-1 text-xs leading-5 text-fg-muted">{description}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
        {[["Input", input], ["Process", process], ["Output", output]].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-bg-muted/70 p-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-fg-subtle">{k}</p>
            <p className="mt-1 line-clamp-2 leading-4 text-fg-muted">{v}</p>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

export function AgentTaskCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "rounded-3xl border p-3 text-left transition-colors",
        active
          ? "border-primary/50 bg-primary/12 text-white shadow-[0_18px_50px_rgba(245,158,11,0.15)]"
          : "border-white/10 bg-white/[0.055] text-white/70",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 place-items-center rounded-2xl", active ? "bg-primary text-primary-on" : "bg-white/8 text-amber-200")}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

export function ProfileIdentityCard({
  avatar,
  title,
  subtitle,
  level,
  progress,
}: {
  avatar: React.ReactNode;
  title: string;
  subtitle: string;
  level: string;
  progress: number;
}) {
  return (
    <div className="mango-hero-card relative overflow-hidden rounded-[28px] p-5 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(251,191,36,0.22),transparent_35%)]" />
      <div className="relative z-10 flex items-center gap-4">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold">{title}</h1>
            <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-on">{level}</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-white/55">{subtitle}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-200 to-primary" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloatingCommandBar({
  placeholder = "Ask Mango anything...",
  href = "/agent",
}: {
  placeholder?: string;
  href?: string;
}) {
  return (
    <Link href={href} className="mango-command-bar flex items-center gap-3 px-4 py-3 text-sm text-white/55">
      <Sparkles className="size-4 text-amber-200" />
      <span className="flex-1 truncate">{placeholder}</span>
      <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-on">Go</span>
    </Link>
  );
}

export function GenerationProgressPanel({
  title = "Generation in progress",
  steps,
  activeIndex,
}: {
  title?: string;
  steps: string[];
  activeIndex: number;
}) {
  return (
    <div className="mango-glass-card p-5 text-white">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-amber-200" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="mt-5 space-y-3">
        {steps.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <div key={step} className="flex items-center gap-3 text-sm">
              <span className={cn("grid size-6 place-items-center rounded-full", done ? "bg-emerald-400 text-black" : active ? "bg-primary text-primary-on" : "bg-white/8 text-white/35")}>
                {done ? <CheckCircle2 className="size-3.5" /> : active ? <Loader2 className="size-3.5 animate-spin" /> : index + 1}
              </span>
              <span className={cn(done || active ? "text-white" : "text-white/36")}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ArtifactPreviewShell({
  title,
  meta,
  actions,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mango-paper-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/50 bg-surface/80 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{title}</p>
          {meta && <div className="mt-1 text-xs text-fg-muted">{meta}</div>}
        </div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function SkeletonState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="mango-glass-card h-24 animate-pulse" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mango-glass-card flex flex-col items-center gap-3 p-6 text-center text-white">
      <span className="grid size-12 place-items-center rounded-2xl bg-white/8 text-amber-200">
        <Sparkles className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something needs attention",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-red-300/25 bg-red-500/10 p-4 text-white">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-200" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-white/55">{description}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export function PremiumSheet({
  title,
  trigger,
  children,
}: {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="premium-sheet max-h-[82vh] overflow-y-auto rounded-t-[28px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function PremiumToast({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mango-command-bar flex items-center gap-3 px-4 py-3 text-sm text-white">
      <div className="flex-1">{children}</div>
      {action}
    </div>
  );
}

export function PrimaryMobileButton({
  children,
  href,
  onClick,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const buttonClass = cn(
    "inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-on shadow-[0_18px_42px_rgba(245,158,11,0.24)] transition-transform active:scale-[0.98]",
    className,
  );

  if (href) return <Link href={href} className={buttonClass}>{children}</Link>;
  return (
    <button type="button" onClick={onClick} className={buttonClass}>
      {children}
    </button>
  );
}
