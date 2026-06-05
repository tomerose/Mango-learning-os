"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   LoadingSpinner — branded loading indicator
   Variants: spinner (default), dots, pulse, mango
   ───────────────────────────────────────────────────────────── */

interface LoadingSpinnerProps {
  variant?: "spinner" | "dots" | "pulse" | "mango";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: { container: "size-5", dot: "size-1", gap: "gap-1" },
  md: { container: "size-8", dot: "size-1.5", gap: "gap-1.5" },
  lg: { container: "size-12", dot: "size-2", gap: "gap-2" },
};

export function LoadingSpinner({
  variant = "spinner",
  size = "md",
  label,
  className,
}: LoadingSpinnerProps) {
  const s = sizeMap[size];

  const content = (() => {
    switch (variant) {
      case "spinner":
        return (
          <div
            className={cn("relative", s.container)}
            role="status"
            aria-label={label ?? "Loading"}
          >
            <div className="absolute inset-0 rounded-full border-2 border-muted" />
            <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
          </div>
        );

      case "dots":
        return (
          <div className={cn("flex items-center", s.gap)} role="status" aria-label={label ?? "Loading"}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={cn("rounded-full bg-primary", s.dot)}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <motion.div
            className={cn("rounded-full bg-primary/30", s.container)}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            role="status"
            aria-label={label ?? "Loading"}
          />
        );

      case "mango":
        return (
          <motion.div
            className={cn("relative flex items-center justify-center", s.container)}
            role="status"
            aria-label={label ?? "Loading"}
          >
            <motion.svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <defs>
                <radialGradient id="spin-mango-grad" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="40%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="62" rx="18" ry="22" fill="url(#spin-mango-grad)" />
            </motion.svg>
          </motion.div>
        );
    }
  })();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      {content}
      {label && (
        <p className="text-xs text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
