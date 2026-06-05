"use client";

import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Ambient gradient lights — slow-moving orange/purple/blue glows
// Apple WWDC / Linear / Arc Browser hero section feeling
// ─────────────────────────────────────────────────────────────

export function GradientLights() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Orange glow — top right */}
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)",
          top: "-10%",
          right: "-10%",
        }}
        animate={{
          x: ["0%", "5%", "-3%", "0%"],
          y: ["0%", "-8%", "3%", "0%"],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Purple glow — bottom left */}
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: "35vw",
          height: "35vw",
          background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          bottom: "-10%",
          left: "-5%",
        }}
        animate={{
          x: ["0%", "-5%", "3%", "0%"],
          y: ["0%", "5%", "-3%", "0%"],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Blue glow — top left */}
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: "25vw",
          height: "25vw",
          background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)",
          top: "20%",
          left: "-5%",
        }}
        animate={{
          x: ["0%", "8%", "-3%", "0%"],
          y: ["0%", "-5%", "5%", "0%"],
        }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </div>
  );
}
