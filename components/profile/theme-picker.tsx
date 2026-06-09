"use client";

/**
 * MangoOS V14.8.1 — Taste-Skill Theme Picker
 * Applies taste-skill design language variants without breaking the existing layout.
 *
 * Themes (from taste-skill):
 * - "warm-paper" (default) — Warm Paper Wellness, editorial + calm
 * - "minimalist" — Notion/Linear vibes, restrained palette
 * - "high-end" — Polished, premium, lower contrast, spring motion
 *
 * Persisted to localStorage. Applies CSS data attribute on <html>.
 */

import * as React from "react";
import { PaintBucket, Leaf, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeVariant = "warm-paper" | "minimalist" | "high-end";

const THEMES: { key: ThemeVariant; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "warm-paper", label: "暖纸", desc: "温暖学术风 — 默认主题", icon: <Leaf className="size-4" /> },
  { key: "minimalist", label: "极简", desc: "Notion/Linear 克制风格", icon: <PaintBucket className="size-4" /> },
  { key: "high-end", label: "臻品", desc: "高端沉稳 · 低对比 · 弹性动效", icon: <Gem className="size-4" /> },
];

function getStoredTheme(): ThemeVariant {
  if (typeof window === "undefined") return "warm-paper";
  return (localStorage.getItem("mango-theme-variant") as ThemeVariant) || "warm-paper";
}

function applyTheme(variant: ThemeVariant) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-mango-theme", variant);
  localStorage.setItem("mango-theme-variant", variant);
}

export function ThemePicker({ className }: { className?: string }) {
  const [active, setActive] = React.useState<ThemeVariant>("warm-paper");

  React.useEffect(() => {
    const stored = getStoredTheme();
    setActive(stored);
    applyTheme(stored);
  }, []);

  const handleChange = (v: ThemeVariant) => {
    setActive(v);
    applyTheme(v);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold tracking-tight">界面风格</h3>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.key}
            onClick={() => handleChange(t.key)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-all duration-150",
              active === t.key
                ? "border-primary/40 bg-primary/5 text-primary shadow-sm"
                : "border-border bg-surface text-muted-foreground hover:border-primary/20 hover:bg-primary/3"
            )}
          >
            {t.icon}
            <span className="text-xs font-semibold">{t.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {THEMES.find((t) => t.key === active)?.desc}
      </p>
    </div>
  );
}
