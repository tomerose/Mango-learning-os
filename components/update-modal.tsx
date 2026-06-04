"use client";

import * as React from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const VERSION = "v1.3.0";
const STORAGE_KEY = "mango-update-seen";

const UPDATES = [
  { emoji: "🎨", title: "全新设计系统", desc: "Apple 级简洁，浮动毛玻璃，统一卡片阴影" },
  { emoji: "💚", title: "Mind Garden 上线", desc: "心灵树洞 · AI 陪伴 · 情绪追踪 · CBT 重构" },
  { emoji: "📚", title: "Final Exam Master", desc: "上传资料 AI 生成复习包，考点+例题+速查表" },
  { emoji: "🧬", title: "Mango DNA 预览", desc: "AI 人格画像 · 思维风格提取 · Agent 画廊" },
  { emoji: "⚡", title: "AI 智能题库", desc: "DeepSeek 批量出题 · 一键导入 · 自动评分" },
];

export function UpdateModal() {
  const [visible, setVisible] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== VERSION) setVisible(true);
  }, []);

  if (!visible && !exiting) return null;

  function dismiss() {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, VERSION);
      setVisible(false);
      setExiting(false);
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={dismiss}
        style={{ opacity: exiting ? 0 : 1, transition: "opacity 300ms ease" }} />

      {/* Sheet */}
      <div className="relative bg-background w-full sm:max-w-sm rounded-t-[24px] sm:rounded-[24px] overflow-hidden shadow-2xl"
        style={{
          transform: exiting ? "translateY(100%)" : "translateY(0)",
          transition: "transform 350ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}>

        {/* Gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-8 pb-2 px-5">
          {/* Dots pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

          {/* Close */}
          <button onClick={dismiss}
            className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-background/60 hover:bg-background transition-all z-10">
            <X className="size-4 text-muted-foreground" />
          </button>

          {/* Icon */}
          <div className="relative flex flex-col items-center text-center gap-2 mb-4">
            <div className="size-16 rounded-[20px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 mb-1">
              <Sparkles className="size-8 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-[20px] font-bold tracking-tight">Mango 更新</p>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{VERSION}</span>
              </div>
              <p className="text-muted-foreground/50 text-[12px] mt-0.5 font-medium">把焦虑变成准备</p>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="px-5 py-3 flex flex-col gap-1">
          {UPDATES.map((item, i) => (
            <div key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted/40 transition-colors cursor-default">
              <span className="text-xl shrink-0">{item.emoji}</span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{item.title}</p>
                <p className="text-muted-foreground/60 text-[11px] leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="px-5 pt-2 pb-6">
          <Button onClick={dismiss} className="w-full rounded-2xl h-12 text-[15px] font-semibold shadow-md shadow-primary/20">
            开始学习 <ChevronRight className="size-4 ml-1" />
          </Button>
          <p className="text-center text-[10px] text-muted-foreground/30 mt-3 font-medium tracking-wide">
            第三自习室出品
          </p>
        </div>

        {/* Home indicator */}
        <div className="sm:hidden flex justify-center pb-2">
          <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  );
}
