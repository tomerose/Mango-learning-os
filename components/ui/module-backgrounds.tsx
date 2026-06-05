"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   Module Background System — 5–15% visual intensity
   Each module gets a unique, subtle ambient background.
   Never competes with content. Always purposeful.
   ═══════════════════════════════════════════════════════════════ */

/* ── AI Tutor: Neural grid, subtle knowledge streams ──────────── */
export function TutorBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Neural grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="neural-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
          <pattern id="neural-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.8" fill="currentColor" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-dots)" />
      </svg>
      {/* Subtle gradient stream */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/[0.03] to-transparent rounded-full blur-3xl" />
    </div>
  );
}

/* ── Mind Garden: Organic networks, root systems ──────────────── */
export function GardenBackground({ className }: { className?: string }) {
  const [seed] = React.useState(() => Math.random() * 100);
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`garden-grad-${seed}`} cx="30%" cy="70%">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {/* Growth rings */}
        {[200, 300, 400].map((r, i) => (
          <circle key={i} cx="30%" cy="70%" r={r} fill="none" stroke={`url(#garden-grad-${seed})`} strokeWidth="0.5" opacity={0.5 - i * 0.15} />
        ))}
        {/* Organic dot pattern */}
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i}
            cx={`${20 + Math.sin(i * 1.7) * 40}%`}
            cy={`${30 + Math.cos(i * 1.3) * 50}%`}
            r={1 + Math.random() * 1.5}
            fill="rgb(16,185,129)"
            opacity={0.08 + Math.random() * 0.08}
          />
        ))}
      </svg>
    </div>
  );
}

/* ── Exam Center: Structured systems, progress grids ──────────── */
export function ExamBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Structured grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Heatmap blot */}
      <div className="absolute bottom-0 left-1/4 w-80 h-40 bg-gradient-to-t from-amber-500/[0.04] to-transparent rounded-full blur-2xl" />
      <div className="absolute top-0 right-1/3 w-64 h-32 bg-gradient-to-b from-emerald-500/[0.03] to-transparent rounded-full blur-2xl" />
    </div>
  );
}

/* ── Skill Graph: Nodes, connections, pathways ────────────────── */
export function GraphBackground({ className }: { className?: string }) {
  const nodes = React.useMemo(() =>
    Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 0.5 + Math.random() * 1.5,
    })), []);
  const edges = React.useMemo(() =>
    Array.from({ length: 15 }).map(() => ({
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
    })), []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        {edges.map((e, i) => (
          <line key={`e-${i}`} x1={`${e.x1}%`} y1={`${e.y1}%`} x2={`${e.x2}%`} y2={`${e.y2}%`}
            stroke="currentColor" strokeWidth="0.3" className="text-violet-500" opacity={0.3 + (i % 3) * 0.2} />
        ))}
        {nodes.map((n, i) => (
          <motion.circle key={`n-${i}`} cx={`${n.x}%`} cy={`${n.y}%`} r={n.r} fill="currentColor"
            className="text-violet-500"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }} />
        ))}
      </svg>
    </div>
  );
}

/* ── Digital Soul: Memory constellations, particles ───────────── */
export function SoulBackground({ className }: { className?: string }) {
  const particles = React.useMemo(() =>
    Array.from({ length: 40 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: 0.5 + Math.random() * 1.5,
    })), []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        {particles.slice(0, 8).map((p, i) => {
          const next = particles[(i + 1) % 8];
          return (
            <line key={i}
              x1={`${p.x}%`} y1={`${p.y}%`} x2={`${next.x}%`} y2={`${next.y}%`}
              stroke="currentColor" strokeWidth="0.3" className="text-indigo-400" />
          );
        })}
      </svg>
      {/* Twinkling particles */}
      {particles.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full bg-indigo-400"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: p.delay }} />
      ))}
    </div>
  );
}

/* ── Mango Sum: Layered compression, crystallized insight ──────── */
export function SumBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Concentric compression rings */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        {[40, 60, 80, 100, 120].map((r, i) => (
          <rect key={i} x="50%" y="50%" width={r * 2} height={r * 2}
            transform={`translate(-${r}, -${r})`}
            rx={r * 0.3} fill="none" stroke="currentColor" strokeWidth="0.4"
            className="text-amber-500" opacity={0.5 - i * 0.08} />
        ))}
      </svg>
      {/* Crystallized facet */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-radial from-amber-500/[0.03] to-transparent rounded-full blur-2xl" />
    </div>
  );
}

/* ── Home / General: Subtle gradient mesh + noise ──────────────── */
export function HomeBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Gradient mesh blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary/[0.04] to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-gradient-to-bl from-accent/[0.03] to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-gradient-to-tr from-emerald-500/[0.03] to-transparent rounded-full blur-3xl" />
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />
    </div>
  );
}
