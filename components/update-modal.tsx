"use client";

import * as React from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const VERSION = "V0.1";
const STORAGE_KEY = "mango-update-seen-v6";

const UPDATES = [
  { emoji: "🔐", title: "全新计划系统", desc: "Guest · Standard · Pro · Admin 四级计划 · 后端强制门控 · 北京时区配额重置" },
  { emoji: "🎟️", title: "Mango Code 兑换", desc: "一次性升级码 · 防双重兑换保护 · 兑换历史审计 · 管理后台" },
  { emoji: "👤", title: "Profile 控制中心", desc: "OS 风格个人中心 · 计划卡片 · 配额展示 · 学习资产 · 隐私控制 · 每周更新" },
  { emoji: "💎", title: "登录/注册焕新", desc: "Calm Academic OS 美学 · 两步验证 · 邀请码 · 游客入口 · 水彩氛围" },
  { emoji: "🛡️", title: "功能门控系统", desc: "后端 API 强制检查 · 前端优雅锁定态 · 升级引导 · 配额用尽提示" },
];

const IMPROVEMENTS = [
  { emoji: "🔧", title: "Agent API 强化", desc: "所有 Agent 请求经过 plan + quota 双重验证，guest 不可执行" },
  { emoji: "📦", title: "学习包 API 强化", desc: "生成请求经过 plan 检查，guest 可预览样例但不可生成" },
];

const FIXES = [
  { emoji: "🐛", title: "Agent 模板修复", desc: "修复 Agent 模板点击后 view state 错误导致白屏的问题" },
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
      <div className="relative bg-bg w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{
          transform: exiting ? "translateY(100%)" : "translateY(0)",
          transition: "transform 350ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}>

        {/* Gradient header */}
        <div className="relative overflow-hidden bg-bg-subtle pt-8 pb-2 px-5">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

          {/* Close */}
          <button onClick={dismiss}
            className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-bg/60 hover:bg-bg transition-all z-10">
            <X className="size-4 text-fg-muted" />
          </button>

          {/* Icon */}
          <div className="relative flex flex-col items-center text-center gap-2 mb-4">
            <div className="size-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md mb-1">
              <Sparkles className="size-8 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-[20px] font-bold tracking-tight">Mango 更新</p>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{VERSION}</span>
              </div>
              <p className="text-fg-muted/50 text-[12px] mt-0.5 font-medium">计划 · 配额 · 兑换 · 控制中心</p>
            </div>
          </div>
        </div>

        {/* New */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2">New · 新增</p>
          <div className="flex flex-col gap-1">
            {UPDATES.map((item, i) => (
              <div key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted/40 transition-colors cursor-default">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{item.title}</p>
                  <p className="text-fg-muted/60 text-[11px] leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improved */}
        <div className="px-5 pt-2 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Improved · 改进</p>
          <div className="flex flex-col gap-1">
            {IMPROVEMENTS.map((item, i) => (
              <div key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted/40 transition-colors cursor-default">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{item.title}</p>
                  <p className="text-fg-muted/60 text-[11px] leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed */}
        <div className="px-5 pt-2 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-muted/50 mb-2">Fixed · 修复</p>
          <div className="flex flex-col gap-1">
            {FIXES.map((item, i) => (
              <div key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted/40 transition-colors cursor-default">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{item.title}</p>
                  <p className="text-fg-muted/60 text-[11px] leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="px-5 pt-2 pb-6">
          <Button onClick={dismiss} className="w-full rounded-2xl h-12 text-[15px] font-semibold shadow-md shadow-primary/20 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            开始学习 <ChevronRight className="size-4 ml-1" />
          </Button>
          <p className="text-center text-[10px] text-fg-muted/30 mt-3 font-medium tracking-wide">
            第三自习室出品 · Mango V12
          </p>
        </div>

        {/* Home indicator */}
        <div className="sm:hidden flex justify-center pb-2">
          <div className="w-9 h-1 rounded-full bg-fg-muted/20" />
        </div>
      </div>
    </div>
  );
}
