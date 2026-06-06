"use client";

import * as React from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   MangoCharacter — Pure CSS/SVG animated mango mascot
   Zero dependencies. Works on all devices. <2KB effective.
   ═══════════════════════════════════════════════════════════════ */

export function MangoCharacter({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <motion.svg
        width="100%" height="100%" viewBox="0 0 100 100" fill="none"
        animate={{ y: [0, -3, 0], rotate: [0, 2, -1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Leaf */}
        <motion.ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80"
          animate={{ rotate: [-30, -25, -30] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "62px 14px" }}
          transform="rotate(-30 62 14)" />
        {/* Mango body — gradient */}
        <defs>
          <radialGradient id="mgo-body" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="35%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#mgo-body)" />
        {/* Eyes */}
        <motion.circle cx="42" cy="48" r="3" fill="#1a1a1a"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2, ease: "easeInOut" }} />
        <circle cx="58" cy="48" r="3" fill="#1a1a1a" />
        {/* Smile */}
        <motion.path d="M44 58 Q50 63 56 58" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"
          animate={{ d: ["M44 58 Q50 63 56 58", "M44 60 Q50 65 56 60", "M44 58 Q50 63 56 58"] }}
          transition={{ duration: 3, repeat: Infinity }} />
        {/* Blush */}
        <ellipse cx="37" cy="55" rx="4" ry="2.5" fill="#fca5a5" opacity="0.4" />
        <ellipse cx="63" cy="55" rx="4" ry="2.5" fill="#fca5a5" opacity="0.4" />
      </motion.svg>
    </div>
  );
}
