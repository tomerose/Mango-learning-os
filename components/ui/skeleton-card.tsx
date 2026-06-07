"use client";

import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   Calm Academic OS — Skeleton Loading States
   Subtle, warm-toned shimmer for all card-based content.
   ═══════════════════════════════════════════════════════════════ */

export function SkeletonCard({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("card-card p-5 flex flex-col gap-3 animate-pulse", className)}>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-bg-muted" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3.5 rounded-md bg-bg-muted w-1/3" />
          <div className="h-2.5 rounded-md bg-bg-muted w-2/3" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded-md bg-bg-muted" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

export function SkeletonPackCard() {
  return (
    <div className="card-card p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="size-10 rounded-xl bg-bg-muted" />
        <div className="flex gap-0.5">
          <div className="size-7 rounded-lg bg-bg-muted" />
          <div className="size-7 rounded-lg bg-bg-muted" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 rounded-md bg-bg-muted w-3/4" />
        <div className="h-2.5 rounded-md bg-bg-muted w-1/2" />
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <div className="h-5 w-14 rounded-full bg-bg-muted" />
        <div className="h-5 w-10 rounded-full bg-bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonWizard() {
  return (
    <div className="card-card p-5 sm:p-7 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded-md bg-bg-muted" />
        <div className="h-5 rounded-md bg-bg-muted w-32" />
      </div>
      <div className="h-3.5 rounded-md bg-bg-muted w-2/3" />
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-3 rounded-md bg-bg-muted w-20" />
            <div className="h-10 rounded-xl bg-bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-20 rounded-xl bg-bg-muted" />
      <div className="h-11 w-36 rounded-xl bg-bg-muted" />
    </div>
  );
}

export function SkeletonSectionTabs() {
  return (
    <div className="flex gap-0.5 px-4 overflow-hidden bg-bg-muted/20 border-b border-border/30">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 w-20 shrink-0 bg-bg-muted rounded-t-md animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

export function SkeletonReaderContent() {
  return (
    <div className="p-5 sm:p-7 flex flex-col gap-4 animate-pulse">
      <div className="h-6 rounded-md bg-bg-muted w-1/3" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-3 rounded-md bg-bg-muted" style={{ width: `${70 + Math.random() * 30}%`, animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}
