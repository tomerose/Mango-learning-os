import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ─────────────────────────────────────────────────────────────
   PageShell v4 — consistent wrapper for all routes
   Supports: loading skeleton, right panel, constrained width
   ───────────────────────────────────────────────────────────── */

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "full";
  loading?: boolean;
  loadingRows?: number;
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
  loading = false,
  loadingRows = 4,
  className,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          {loading ? (
            <>
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground text-sm">{description}</p>
              )}
            </>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </header>

      {/* Body */}
      <div className="flex gap-6">
        <main
          className={cn(
            "flex-1 min-w-0",
            maxWidthClasses[maxWidth],
            className,
          )}
        >
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: loadingRows }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-4"
                >
                  <Skeleton variant="circular" className="size-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            children
          )}
        </main>
        {rightPanel && (
          <aside className="hidden xl:block w-80 shrink-0">{rightPanel}</aside>
        )}
      </div>
    </div>
  );
}
