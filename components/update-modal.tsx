"use client";

import * as React from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const VERSION = "内测版";
const STORAGE_KEY = "mango-update-seen-v3";

const UPDATES = [
  { emoji: "🔬", title: "AI 研究引擎上线", desc: "9 源实时搜索 · 来源评分 · 引用提取 · 智能合成" },
  { emoji: "📚", title: "期末备考 Pro", desc: "输入课程 → 自动搜资料 → 生成完整讲义 → 导出 Word/PDF" },
  { emoji: "💚", title: "心灵花园 Pro", desc: "10 种心理模式 · 危机检测 · 隐私优先 · CBT 模板" },
  { emoji: "🌳", title: "知识森林 v4", desc: "Notion 风格 · 富文本编辑 · 社区上传 · 多源导入" },
  { emoji: "🎬", title: "B站 + 抖音搜索", desc: "中文学习视频搜索 · GitHub · 学术论文 · 公开书籍" },
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
      <div className="relative bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{
          transform: exiting ? "translateY(100%)" : "translateY(0)",
          transition: "transform 350ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}>

        {/* Gradient header */}
        <div className="relative overflow-hidden bg-bg-subtle pt-8 pb-2 px-5">
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
            <div className="size-16 rounded-xl bg-primary flex items-center justify-center shadow-md mb-1">
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
