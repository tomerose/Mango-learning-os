import * as React from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Standard page wrapper for all V2.0 routes.
// Provides consistent header + content area with optional
// right sidebar slot (used by /agent, /knowledge-tree).
// ─────────────────────────────────────────────────────────────

interface Props {
  /** Page title shown in header */
  title: string;
  /** Optional subtitle / description */
  description?: string;
  /** Actions slot — buttons, filters, etc. shown in header right */
  actions?: React.ReactNode;
  /** Optional right panel (e.g., agent context, knowledge node detail) */
  rightPanel?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Constrain main content max-width */
  maxWidth?: "md" | "lg" | "xl" | "full";
  className?: string;
}

const maxWidthClasses: Record<NonNullable<Props["maxWidth"]>, string> = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "",
};

export function PageShell({
  title,
  description,
  actions,
  rightPanel,
  children,
  maxWidth = "xl",
  className,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>

      {/* Body */}
      <div className="flex gap-6">
        <main className={cn("flex-1 min-w-0", maxWidthClasses[maxWidth], className)}>
          {children}
        </main>
        {rightPanel && (
          <aside className="hidden xl:block w-80 shrink-0">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
