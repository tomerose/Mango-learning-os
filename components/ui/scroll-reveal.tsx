"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   ScrollReveal — GSAP-inspired scroll-triggered reveal wrapper
   Uses Framer Motion's whileInView as primary engine.
   Falls back to CSS transition when JS is unavailable.
   ───────────────────────────────────────────────────────────── */

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right";
  /** Delay in seconds */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Only animate once (default: true) */
  once?: boolean;
  /** Viewport margin for triggering (e.g. "-100px") */
  margin?: string;
  /** Amount of element that needs to be visible (0-1) */
  amount?: number;
}

const directionVariants = {
  up: { y: 40, opacity: 0 },
  down: { y: -40, opacity: 0 },
  left: { x: 40, opacity: 0 },
  right: { x: -40, opacity: 0 },
};

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  margin = "-80px",
  amount = 0.2,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={directionVariants[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once, margin, amount }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ScrollStagger — staggered children reveal on scroll
   Each direct child is revealed one after another
   ───────────────────────────────────────────────────────────── */

interface ScrollStaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export function ScrollStagger({
  children,
  className,
  staggerDelay = 0.08,
  once = true,
}: ScrollStaggerProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px", amount: 0.1 }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
