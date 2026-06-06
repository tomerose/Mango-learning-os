"use client";

import * as React from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   Mangobo Emotion Engine — AI companion expression system
   Maps AI response tone → Live2D-style expressions
   ═══════════════════════════════════════════════════════════════ */

export type Emotion = "neutral" | "happy" | "thinking" | "surprised" | "encouraging" | "concerned" | "celebrating";

interface EmotionConfig {
  eyeScale: number;
  mouthCurve: number;
  bounceIntensity: number;
  colorShift: string;
  particleCount: number;
}

const EMOTION_MAP: Record<Emotion, EmotionConfig> = {
  neutral:    { eyeScale: 1, mouthCurve: 0, bounceIntensity: 0, colorShift: "#C58B74", particleCount: 0 },
  happy:      { eyeScale: 0.7, mouthCurve: 8, bounceIntensity: 6, colorShift: "#F0A060", particleCount: 6 },
  thinking:   { eyeScale: 0.3, mouthCurve: -2, bounceIntensity: 2, colorShift: "#C58B74", particleCount: 3 },
  surprised:  { eyeScale: 1.4, mouthCurve: 4, bounceIntensity: 10, colorShift: "#F5B880", particleCount: 10 },
  encouraging:{ eyeScale: 0.8, mouthCurve: 6, bounceIntensity: 4, colorShift: "#E89860", particleCount: 5 },
  concerned:  { eyeScale: 1.1, mouthCurve: -4, bounceIntensity: 1, colorShift: "#D08070", particleCount: 2 },
  celebrating:{ eyeScale: 0.5, mouthCurve: 10, bounceIntensity: 12, colorShift: "#FFB060", particleCount: 15 },
};

// ═══ Detect emotion from AI response text ═══

export function detectEmotion(text: string): Emotion {
  const t = text.toLowerCase();
  if (/恭喜|太棒了|满分|通过|完成|优秀|great|excellent|congratulations/i.test(t)) return "celebrating";
  if (/加油|你可以|坚持|相信|很棒|继续|good job|keep going/i.test(t)) return "encouraging";
  if (/让我想想|思考|分析|计算|推导|let me think|hmm/i.test(t)) return "thinking";
  if (/惊讶|没想到|有趣|竟然|wow|interesting|surprising/i.test(t)) return "surprised";
  if (/担心|注意|小心|风险|困难|warning|careful|risk/i.test(t)) return "concerned";
  if (/谢谢|好|对|是的|开心|喜欢|yes|good|nice|love/i.test(t)) return "happy";
  return "neutral";
}

// ═══ Emotional Mango Character ═══

export function EmotionalMango({ emotion = "neutral", size = 56, className }: {
  emotion?: Emotion; size?: number; className?: string;
}) {
  const config = EMOTION_MAP[emotion];

  return (
    <div className={className} style={{ width: size, height: size }}>
      <motion.svg width="100%" height="100%" viewBox="0 0 100 100" fill="none"
        animate={{
          y: [0, -config.bounceIntensity * 0.5, 0],
          rotate: [0, emotion === "celebrating" ? 5 : 1, -1, 0],
        }}
        transition={{ duration: emotion === "celebrating" ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}>
        {/* Leaf */}
        <motion.ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80"
          animate={{ rotate: [-30, -25, -30] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "62px 14px" }}
          transform="rotate(-30 62 14)" />
        {/* Body */}
        <defs>
          <radialGradient id="emo-body" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="35%" stopColor={config.colorShift} />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#emo-body)" />
        {/* Eyes */}
        <motion.ellipse cx="42" cy="48" rx="3" ry={3 * config.eyeScale} fill="#1a1a1a"
          animate={{ scaleY: [1, config.eyeScale * 0.3, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
        <ellipse cx="58" cy="48" rx="3" ry={3 * config.eyeScale} fill="#1a1a1a" />
        {/* Mouth */}
        <motion.path
          d={`M${44} ${58 + config.mouthCurve * 0.5} Q50 ${58 + config.mouthCurve} ${56} ${58 + config.mouthCurve * 0.5}`}
          stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Blush */}
        <ellipse cx="37" cy="55" rx="4" ry="2.5" fill="#fca5a5" opacity={emotion === "happy" ? 0.6 : 0.3} />
        <ellipse cx="63" cy="55" rx="4" ry="2.5" fill="#fca5a5" opacity={emotion === "happy" ? 0.6 : 0.3} />

        {/* Particles for celebrations */}
        {emotion === "celebrating" && [0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.circle key={i} r="1.5" fill="#fbbf24"
            initial={{ cx: 50, cy: 62, opacity: 0 }}
            animate={{
              cx: 50 + Math.cos(angle * Math.PI / 180) * 40,
              cy: 62 + Math.sin(angle * Math.PI / 180) * 40,
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </motion.svg>
    </div>
  );
}
