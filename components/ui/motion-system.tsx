"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   Motion System — Reusable Framer Motion primitives
   Stagger, fade, slide, scale — calm and purposeful.
   ═══════════════════════════════════════════════════════════════ */

/* ── StaggerReveal: children fade in one by one ──────────────── */
export function StaggerReveal({ children, className, delay = 0.06 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <div className={cn(className)}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

/* ── FadeIn: simple fade+slide on scroll ────────────────────── */
export function FadeIn({ children, className, direction = "up", delay = 0 }: {
  children: React.ReactNode; className?: string; direction?: "up" | "down"; delay?: number;
}) {
  const y = direction === "up" ? 24 : -24;
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── ScaleIn: gentle zoom in ────────────────────────────────── */
export function ScaleIn({ children, className, delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── BreathingElement: subtle ongoing float ─────────────────── */
export function BreathingElement({ children, className, duration = 4 }: {
  children: React.ReactNode; className?: string; duration?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
