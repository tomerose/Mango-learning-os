"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────────
   useScrollReveal — GSAP ScrollTrigger-powered reveal hook
   Falls back to IntersectionObserver when GSAP is unavailable.
   ───────────────────────────────────────────────────────────── */

interface ScrollRevealOptions {
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right";
  /** Delay in seconds */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Trigger when element is this far into viewport (0-1) */
  threshold?: number;
  /** Only animate once (default: true) */
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
) {
  const {
    direction = "up",
    delay = 0,
    duration = 0.6,
    threshold = 0.15,
    once = true,
  } = options;

  const ref = React.useRef<T>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* ── Try GSAP ScrollTrigger first ── */
    let gsapTrigger: { kill: () => void } | null = null;

    try {
      /* Dynamic import check — if GSAP is loaded */
      const win = window as Window &
        typeof window & {
          ScrollTrigger?: { create: (opts: object) => { kill: () => void } };
          gsap?: {
            to: (el: HTMLElement, opts: object) => unknown;
          };
        };

      if (win.gsap && win.ScrollTrigger) {
        const dirMap: Record<string, { x?: number; y?: number }> = {
          up: { y: 32 },
          down: { y: -32 },
          left: { x: 32 },
          right: { x: -32 },
        };

        const fromVars = dirMap[direction] ?? dirMap.up;

        win.gsap.to(el, {
          ...fromVars,
          opacity: 0,
          duration: 0,
        });

        gsapTrigger = win.ScrollTrigger.create({
          trigger: el,
          start: `top bottom-=${Math.round(threshold * 100)}%`,
          once,
          onEnter: () => {
            win.gsap!.to(el, {
              x: 0,
              y: 0,
              opacity: 1,
              duration,
              delay,
              ease: "power2.out",
            });
            setIsVisible(true);
          },
        });

        return () => {
          gsapTrigger?.kill();
        };
      }
    } catch {
      /* GSAP not available — fall through to IntersectionObserver */
    }

    /* ── Fallback: IntersectionObserver ── */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, duration, threshold, once]);

  return { ref, isVisible };
}
