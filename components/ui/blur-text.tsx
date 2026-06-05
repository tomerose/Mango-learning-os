"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   BlurText — Reactbits-inspired blur-to-focus text reveal
   Each word animates from blur(8px) + fade to clear + visible
   ───────────────────────────────────────────────────────────── */

interface BlurTextProps {
  text: string;
  className?: string;
  /** Delay between each word in seconds (default: 0.08) */
  staggerDelay?: number;
  /** Initial delay before animation starts (default: 0.3) */
  initialDelay?: number;
  /** Blur amount in px (default: 8) */
  blurAmount?: number;
  /** Animate by "word" or "char" (default: word) */
  animateBy?: "word" | "char";
  /** Direction: "up" | "down" | "none" (default: up) */
  direction?: "up" | "down" | "none";
  /** Font size override */
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const directionMap = {
  up: { y: 12 },
  down: { y: -12 },
  none: {},
};

export function BlurText({
  text,
  className,
  staggerDelay = 0.08,
  initialDelay = 0.3,
  blurAmount = 8,
  animateBy = "word",
  direction = "up",
  as: Tag = "span",
}: BlurTextProps) {
  const segments = React.useMemo(() => {
    if (animateBy === "char") return text.split("");
    return text.split(" ").map((w, i) => (i < text.split(" ").length - 1 ? w + " " : w));
  }, [text, animateBy]);

  return (
    <Tag className={cn("inline", className)}>
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{
            filter: `blur(${blurAmount}px)`,
            opacity: 0,
            ...directionMap[direction],
          }}
          animate={{
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: initialDelay + i * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ willChange: "filter, opacity, transform" }}
        >
          {segment}
        </motion.span>
      ))}
    </Tag>
  );
}
