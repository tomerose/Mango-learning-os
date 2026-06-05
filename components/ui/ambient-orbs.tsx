"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   Ambient Orbs — Premium SVG gradient background system
   Replaces simple CSS blobs with layered, animated gradient orbs.
   Matches the TWEE/Headspace reference aesthetic.
   ═══════════════════════════════════════════════════════════════ */

interface OrbProps { className?: string; variant?: "amber" | "sage" | "rose" | "multi"; }

export function AmbientOrbs({ className, variant = "multi" }: OrbProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Amber glow */}
          <radialGradient id="orb-amber" cx="35%" cy="30%" r="50%" fx="30%" fy="25%">
            <stop offset="0%" stopColor="#DCAE97" stopOpacity="0.20" />
            <stop offset="40%" stopColor="#C58B74" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#DCAE97" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {/* Sage glow */}
          <radialGradient id="orb-sage" cx="65%" cy="60%" r="55%" fx="70%" fy="55%">
            <stop offset="0%" stopColor="#7A9B7E" stopOpacity="0.12" />
            <stop offset="45%" stopColor="#8AAA8E" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {/* Rose glow */}
          <radialGradient id="orb-rose" cx="50%" cy="40%" r="45%" fx="55%" fy="35%">
            <stop offset="0%" stopColor="#C5554A" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#C5554A" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {/* Central ambient */}
          <radialGradient id="orb-center" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#F7F4EF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central warm glow */}
        <motion.rect width="100%" height="100%" fill="url(#orb-center)"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />

        {/* Amber orb */}
        <motion.circle cx="35%" cy="30%" r="45%" fill="url(#orb-amber)"
          animate={{ cx: ["35%", "38%", "33%", "35%"], cy: ["30%", "28%", "33%", "30%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />

        {/* Sage orb */}
        {(variant === "multi" || variant === "sage") && (
          <motion.circle cx="65%" cy="60%" r="50%" fill="url(#orb-sage)"
            animate={{ cx: ["65%", "62%", "67%", "65%"], cy: ["60%", "63%", "57%", "60%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
        )}

        {/* Rose orb */}
        {(variant === "multi" || variant === "rose") && (
          <motion.circle cx="50%" cy="40%" r="40%" fill="url(#orb-rose)"
            animate={{ cx: ["50%", "53%", "48%", "50%"], cy: ["40%", "38%", "42%", "40%"] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }} />
        )}
      </svg>
    </div>
  );
}

/* ── Small floating particle system ──────────────────────────── */
export function FloatingParticles({ count = 12, className }: { count?: number; className?: string }) {
  const particles = React.useMemo(() =>
    Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
    })), [count]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/15"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -20, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
