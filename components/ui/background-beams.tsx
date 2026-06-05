"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   BackgroundBeams — Aceternity-inspired animated light beams
   Customized with Mango warm palette: amber/gold/rose
   ───────────────────────────────────────────────────────────── */

export function BackgroundBeams({ className }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const paths = React.useMemo(
    () => [
      "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
      "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
      "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
      "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
      "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
      "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
      "M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827",
      "M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819",
      "M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811",
      "M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803",
      "M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795",
      "M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787",
      "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
      "M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771",
      "M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763",
      "M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755",
      "M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747",
      "M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739",
      "M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731",
    ],
    [],
  );

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]",
        className,
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path}
            stroke={`url(#mango-beam-${index})`}
            strokeOpacity="0.5"
            strokeWidth="0.8"
          />
        ))}
        <defs>
          {paths.map((_, index) => (
            <motion.linearGradient
              id={`mango-beam-${index}`}
              key={`grad-${index}`}
              x1="100%"
              x2="100%"
              y1="100%"
              y2="100%"
              animate={{
                x1: ["0%", "100%"],
                x2: ["0%", "95%"],
                y1: ["0%", "100%"],
                y2: ["0%", `${93 + Math.random() * 8}%`],
              }}
              transition={{
                duration: Math.random() * 8 + 10,
                ease: "easeInOut",
                repeat: Infinity,
                delay: Math.random() * 8,
              }}
            >
              <stop stopColor="#fb923c" stopOpacity="0" />
              <stop stopColor="#fb923c" />
              <stop offset="32.5%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </motion.linearGradient>
          ))}
          <radialGradient
            id="paint0_radial_242_278"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
          >
            <stop offset="0.0666667" stopColor="var(--primary)" />
            <stop offset="0.243243" stopColor="var(--primary)" />
            <stop offset="0.43594" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
