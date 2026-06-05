"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Premium particle background — 30 low-opacity floating dots
// Subtle mouse-follow, ambient depth, knowledge/thinking vibe
// ─────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
  driftX: number;
  driftY: number;
}

const COLORS = [
  "rgba(251,146,60,0.6)",   // orange (mango)
  "rgba(168,85,247,0.4)",   // purple
  "rgba(96,165,250,0.4)",   // blue
  "rgba(251,191,36,0.35)",  // amber
  "rgba(244,114,182,0.3)",  // pink
];

function generateParticles(): Particle[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1.5,
    opacity: Math.random() * 0.25 + 0.05,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    driftX: (Math.random() - 0.5) * 15,
    driftY: (Math.random() - 0.5) * 15,
  }));
}

export function ParticleBackground() {
  const particles = React.useMemo(() => generateParticles(), []);
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 40 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 40 });

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 100);
      mouseY.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            filter: "blur(1px)",
          }}
          animate={{
            x: p.driftX,
            y: p.driftY,
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            x: { duration: p.duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            y: { duration: p.duration * 1.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            opacity: { duration: p.duration * 0.7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
