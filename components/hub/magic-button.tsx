"use client";

import * as React from "react";

interface Props {
  onClick: () => void;
}

export function MagicButton({ onClick }: Props) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* 外层光晕环 */}
      <div className="relative flex items-center justify-center">
        {/* 呼吸光晕 */}
        <div
          className="absolute rounded-full transition-all duration-700"
          style={{
            width: hovered ? "200px" : "160px",
            height: hovered ? "200px" : "160px",
            background: "radial-gradient(circle, oklch(0.75 0.1 62 / 0.25) 0%, oklch(0.75 0.1 62 / 0.06) 50%, oklch(0.6 0.05 10 / 0.03) 80%, transparent 100%)",
            animation: "magic-pulse 3s ease-in-out infinite",
          }}
        />
        {/* 旋转粒子环 */}
        <div
          className="absolute rounded-full border border-dashed border-orange-200/60"
          style={{
            width: "130px",
            height: "130px",
            animation: "magic-spin-slow 8s linear infinite",
          }}
        />

        {/* 芒果球按钮 */}
        <button
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative z-10 transition-transform duration-300 hover:scale-110 active:scale-95"
          style={{ filter: hovered ? "drop-shadow(0 8px 24px rgba(251,146,60,0.5))" : "drop-shadow(0 4px 12px rgba(251,146,60,0.3))" }}
        >
          {/* 芒果 SVG */}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            {/* 叶子 */}
            <ellipse cx="62" cy="14" rx="12" ry="6" fill="#4ade80" transform="rotate(-30 62 14)" />
            <line x1="58" y1="18" x2="50" y2="30" stroke="#16a34a" strokeWidth="1.5" />
            {/* 芒果主体 */}
            <defs>
              <radialGradient id="mango-grad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="40%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
              <radialGradient id="mango-shine" cx="30%" cy="25%" r="40%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="62" rx="28" ry="34" fill="url(#mango-grad)" />
            {/* 高光 */}
            <ellipse cx="40" cy="46" rx="9" ry="12" fill="url(#mango-shine)" />
          </svg>
        </button>
      </div>

      {/* 文案 */}
      <div className="text-center">
        <p className="text-2xl font-bold tracking-tight">Mango Magic</p>
        <p className="text-sm text-muted-foreground mt-1">
          不知道下一步学什么？点一下芒果 🥭
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-2 flex items-center justify-center gap-1">
          <span>🥭</span> 点击芒果，开启你的学习之旅
        </p>
      </div>

      <style>{`
        @keyframes magic-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes magic-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
