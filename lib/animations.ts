/**
 * MangoOS V14.8.1 — Impeccable Animation System
 * Reusable micro-interaction utilities based on impeccable.dev design principles.
 *
 * Rules (from impeccable):
 * - No bounce/elastic easing → use spring-without-bounce or snappy deceleration
 * - 150ms micro, 250ms normal, 400ms page transitions
 * - Always respect prefers-reduced-motion
 * - Purposeful motion only — no decorative animations
 */

import type { Variants } from "framer-motion";

// ── Easing (aligned with globals.css tokens) ────────────────────

export const EASING = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const, // spring without bounce
  snappy: [0.2, 0, 0, 1] as const,
};

// ── Duration ────────────────────────────────────────────────────

export const DURATION = {
  instant: 0.08,
  micro: 0.15,
  fast: 0.2,
  normal: 0.35,
  slow: 0.6,
  glacial: 0.9,
};

// ── Reusable Framer Motion Variants ─────────────────────────────

/** Card hover: subtle lift + shadow deepen. impeccable: no scale bounce. */
export const cardHover: Variants = {
  rest: { y: 0, transition: { duration: DURATION.micro, ease: EASING.out } },
  hover: { y: -2, transition: { duration: DURATION.micro, ease: EASING.out } },
};

/** List item stagger: children appear with increasing delay */
export const staggerList: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASING.out },
  },
};

/** Page enter/exit (use with AnimatePresence) */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASING.out } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASING.inOut } },
};

/** Fade in only — for content that shouldn't move */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.fast, ease: EASING.out } },
};

/** Scale reveal — for modals, dialogs */
export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASING.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: DURATION.micro, ease: EASING.out },
  },
};

// ── CSS Class Helpers (for non-Framer-Motion use) ───────────────

/** CSS transition string for Tailwind arbitrary values */
export const transitionCard = "transition-[transform,box-shadow] duration-150 ease-out";

/** Hover lift utility class description (for documentation) */
export const HOVER_LIFT = "hover:-translate-y-0.5 transition-transform duration-150 ease-out";
