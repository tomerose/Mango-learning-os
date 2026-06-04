// ═══════════════════════════════════════════════════════════════
// LearningOS Design System — Surface Components
// Every container in the app uses one of these 4 surfaces.
// No manual surface styling. All inherit dark mode automatically.
// ═══════════════════════════════════════════════════════════════

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card as ShadcnCard } from "@/components/ui/card";

// ── Card Surface — imports from shadcn Card ──────────────────
// Use <Card> from components/ui/card.tsx — it auto-inherits surface-card.
// Re-export with convenience wrappers for the design system.


// ── Glass Surface — floating nav, modals ─────────────────────
export function GlassSurface({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("surface-glass p-3", className)} {...props} />;
}

// ── Elevated Surface — modals, dropdowns ──────────────────────
export function ElevatedSurface({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("surface-elevated p-4", className)} {...props} />;
}

// ── PageSection — consistent vertical rhythm ─────────────────
interface PageSectionProps { title?: string; description?: string; children: React.ReactNode; className?: string; }
export function PageSection({ title, description, children, className }: PageSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {title && (
        <div className="flex flex-col gap-0.5">
          <h2 className="heading-lg">{title}</h2>
          {description && <p className="body-text text-muted-foreground/70">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

// ── StatCard — dashboard stats ───────────────────────────────
interface StatCardProps { icon: React.ElementType; label: string; value: string; sub?: React.ReactNode; color?: string; }
export function StatCard({ icon: Icon, label, value, sub, color = "var(--chart-1)" }: StatCardProps) {
  return (
    <ShadcnCard>
      <div className="flex items-center justify-between">
        <span className="caption">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}>
          <Icon className="size-4" style={{ color }} />
        </span>
      </div>
      <p className="heading-xl mt-1">{value}</p>
      {sub && <div className="mt-1">{sub}</div>}
    </Card>
  );
}

// ── PageHeader — consistent page title ───────────────────────
interface PageHeaderProps { icon?: React.ElementType; title: string; description?: string; children?: React.ReactNode; }
export function PageHeader({ icon: Icon, title, description, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="heading-xl flex items-center gap-2">
        {Icon && <Icon className="text-primary size-6" strokeWidth={2} />}
        {title}
      </h1>
      {description && <p className="body-text text-muted-foreground/60">{description}</p>}
      {children}
    </header>
  );
}

// ── EmptyState — when there's no data ────────────────────────
interface EmptyStateProps { icon: React.ElementType; title: string; description?: string; action?: React.ReactNode; }
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Icon className="size-10 text-muted-foreground/25" strokeWidth={1.5} />
      <div>
        <p className="heading-md text-muted-foreground">{title}</p>
        {description && <p className="body-text text-muted-foreground/50 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
