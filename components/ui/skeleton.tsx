import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Skeleton — loading placeholder
   Variants: text, circular, rectangular, card
   ───────────────────────────────────────────────────────────── */

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "text" | "circular" | "rectangular" | "card";
}

function Skeleton({
  className,
  variant = "text",
  ...props
}: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-gradient-to-r from-muted via-muted/60 to-muted animate-pulse",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        variant === "card" && "rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   HubPageSkeleton — full-page skeleton for /hub
   ───────────────────────────────────────────────────────────── */

function HubPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Hero skeleton */}
      <Skeleton variant="card" className="h-48 sm:h-56 w-full" />

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Large cell (2col × 2row) */}
        <Skeleton variant="card" className="h-64 sm:col-span-2 sm:row-span-2" />
        {/* Tall narrow */}
        <Skeleton variant="card" className="h-64 sm:row-span-2" />
        {/* Quick actions */}
        <Skeleton variant="card" className="h-64 sm:row-span-2" />
        {/* Wide chart */}
        <Skeleton variant="card" className="h-48 sm:col-span-2" />
        {/* Courses */}
        <Skeleton variant="card" className="h-48" />
        {/* Recs */}
        <Skeleton variant="card" className="h-48" />
      </div>

      {/* CTA banner */}
      <Skeleton variant="card" className="h-24 w-full" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ContentSkeleton — generic card list skeleton
   ───────────────────────────────────────────────────────────── */

function ContentSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 p-4">
          <Skeleton variant="circular" className="size-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton, HubPageSkeleton, ContentSkeleton };
