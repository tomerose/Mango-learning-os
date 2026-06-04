"use client";

import * as React from "react";
import { X, Sparkles, Dna, Heart, BookMarked, Palette, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const VERSION = "v1.3.0";
const STORAGE_KEY = "mango-update-seen";

interface UpdateItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}

const UPDATES: UpdateItem[] = [
  { icon: Palette, title: "全新设计系统", desc: "Apple 级简洁 · 浮动毛玻璃导航 · 统一卡片阴影 · 暗色自动适配", color: "var(--chart-1)" },
  { icon: Heart, title: "Mind Garden 上线", desc: "心灵树洞 AI 陪伴 · CBT 认知重构 · 情绪趋势分析 · 每日反思日记", color: "#ec4899" },
  { icon: BookMarked, title: "Final Exam Master", desc: "上传资料 AI 生成全套复习包 · 知识图谱 · 章节讲义 · 速查表", color: "var(--chart-2)" },
  { icon: Dna, title: "Mango DNA 预览", desc: "AI 人格画像 · Agent 画廊 · 思维风格提取 · 长期记忆", color: "var(--chart-4)" },
  { icon: Zap, title: "AI 题库 + 一键导入", desc: "DeepSeek 批量出题 · URL/文件/粘贴三种数据源 · 自动评分反馈", color: "var(--chart-3)" },
];

export function UpdateModal() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== VERSION) setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, VERSION);
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative surface-elevated w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-[24px] p-6 shadow-2xl">
        {/* Close button */}
        <button onClick={dismiss}
          className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted transition-fast z-10">
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-6 pt-2">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="text-primary size-6" strokeWidth={1.5} />
          </span>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="heading-xl">Mango 更新</h2>
              <Badge variant="info" className="text-[10px]">{VERSION}</Badge>
            </div>
            <p className="body-text text-muted-foreground/60 mt-1">把焦虑变成准备</p>
          </div>
        </div>

        {/* Update list */}
        <div className="flex flex-col gap-3 mb-6">
          {UPDATES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title}
                className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3 transition-fast hover:bg-muted/60">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl mt-0.5"
                  style={{ backgroundColor: `color-mix(in oklch, ${item.color} 12%, transparent)` }}>
                  <Icon className="size-4" style={{ color: item.color }} strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-muted-foreground/70 text-[12px] leading-snug mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action */}
        <Button onClick={dismiss} className="w-full rounded-xl" size="lg">
          开始学习
        </Button>
        <p className="caption text-center mt-3 text-muted-foreground/40">
          第三自习室出品
        </p>
      </div>
    </div>
  );
}
