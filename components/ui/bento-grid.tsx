"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Bento Grid — aceternity-inspired asymmetric grid layout
   Usage:
     <BentoGrid>
       <BentoCell colSpan={2} rowSpan={2}>Hero card</BentoCell>
       <BentoCell>Small card</BentoCell>
       <BentoCell colSpan={2}>Wide card</BentoCell>
     </BentoGrid>
   ───────────────────────────────────────────────────────────── */

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
}

export function BentoGrid({
  className,
  columns = 4,
  children,
  ...props
}: BentoGridProps) {
  return (
    <div
      data-slot="bento-grid"
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        "grid-auto-rows-min",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */

interface BentoCellProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  variant?: "flat" | "card" | "elevated" | "glass" | "floating" | "hero";
  hover?: "lift" | "glow" | "none";
}

const variantClasses: Record<NonNullable<BentoCellProps["variant"]>, string> = {
  flat: "surface-flat",
  card: "surface-card",
  elevated: "surface-elevated",
  glass: "surface-glass",
  floating: "surface-floating",
  hero: "surface-hero",
};

const hoverClasses: Record<NonNullable<BentoCellProps["hover"]>, string> = {
  lift: "hover-lift",
  glow: "transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(251,146,60,0.15)] dark:hover:shadow-[0_0_32px_rgba(251,146,60,0.2)]",
  none: "",
};

export function BentoCell({
  className,
  colSpan = 1,
  rowSpan = 1,
  variant = "card",
  hover = "none",
  children,
  ...props
}: BentoCellProps) {
  return (
    <div
      data-slot="bento-cell"
      className={cn(
        "overflow-hidden",
        variantClasses[variant],
        hoverClasses[hover],
        colSpan === 2 && "sm:col-span-2",
        colSpan === 3 && "sm:col-span-2 lg:col-span-3",
        colSpan === 4 && "sm:col-span-2 lg:col-span-4",
        rowSpan === 2 && "sm:row-span-2",
        rowSpan === 3 && "sm:row-span-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
