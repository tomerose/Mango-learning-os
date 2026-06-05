"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Gradient Text — premium gradient text effect
   Usage:
     <GradientText>Mango Learning OS</GradientText>
     <GradientText variant="secondary">Subtitle</GradientText>
   ───────────────────────────────────────────────────────────── */

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "accent" | "mango";
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

const gradientMap: Record<NonNullable<GradientTextProps["variant"]>, string> = {
  primary:
    "from-primary via-primary to-accent",
  secondary:
    "from-secondary-foreground via-secondary-foreground to-muted-foreground",
  accent:
    "from-accent-foreground via-accent-foreground to-primary",
  mango:
    "from-amber-500 via-orange-500 to-rose-400",
};

export function GradientText({
  className,
  variant = "primary",
  as: Tag = "span",
  children,
  ...props
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradientMap[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
