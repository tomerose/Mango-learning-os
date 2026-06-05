"use client";

import * as React from "react";

/* ═══════════════════════════════════════════════════════════════
   useGsapScroll — Scroll-triggered reveal via GSAP or fallback
   Uses IntersectionObserver when GSAP is unavailable.
   ═══════════════════════════════════════════════════════════════ */

interface Options {
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export function useGsapScroll<T extends HTMLElement = HTMLDivElement>(opts: Options = {}) {
  const { direction = "up", delay = 0, duration = 0.6, threshold = 0.15, once = true } = opts;
  const ref = React.useRef<T>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Try GSAP first
    const win = window as typeof window & { gsap?: { fromTo: (el: HTMLElement, from: object, to: object) => unknown }; ScrollTrigger?: { create: (o: object) => { kill: () => void } } };
    if (win.gsap && win.ScrollTrigger) {
      const fromMap: Record<string, object> = { up: { y: 40, opacity: 0 }, down: { y: -40, opacity: 0 }, left: { x: 40, opacity: 0 }, right: { x: -40, opacity: 0 } };
      win.gsap.fromTo(el, fromMap[direction] ?? fromMap.up, { x: 0, y: 0, opacity: 1, duration, delay, ease: "power2.out" });
      const trigger = win.ScrollTrigger.create({ trigger: el, start: `top bottom-=${Math.round(threshold * 100)}%`, once, onEnter: () => setVisible(true) });
      return () => { trigger.kill(); };
    }

    // Fallback: IntersectionObserver
    const obs = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); if (once) obs.unobserve(el); }
      else if (!once) setVisible(false);
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [direction, delay, duration, threshold, once]);

  // Apply CSS transition as fallback
  const dirClass = { up: "scroll-reveal-up", down: "scroll-reveal-down", left: "scroll-reveal-left", right: "scroll-reveal-right" }[direction] ?? "scroll-reveal-up";

  return { ref, visible, className: visible ? "is-visible" : dirClass };
}
