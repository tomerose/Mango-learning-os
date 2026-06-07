"use client";

import * as React from "react";
import { PUBLIC_VERSION, UPDATE_RHYTHM, INTERNAL_BUILD } from "@/lib/roadmap/public-version";
import { FlaskConical, ChevronDown, ChevronUp } from "lucide-react";

export function ExperimentLog() {
  const [showInternal, setShowInternal] = React.useState(false);

  return (
    <div className="card-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FlaskConical className="size-4 text-fg-muted/90" />
        <h3 className="text-sm font-medium">Mango 实验日志</h3>
      </div>

      {/* Public info */}
      <div className="space-y-2 text-[11px] text-fg-muted/90 leading-relaxed">
        <div className="flex items-center justify-between">
          <span>当前版本</span>
          <span className="font-medium text-fg">{PUBLIC_VERSION}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>更新节奏</span>
          <span>{UPDATE_RHYTHM}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>本周重点</span>
          <span>成果体验优化 · 移动端可读性 · Agent 研究可见</span>
        </div>
        <div className="flex items-center justify-between">
          <span>已修复</span>
          <span>登录稳定性 · 游客入口 · 文字对比度 · 来源卡片</span>
        </div>
        <div className="flex items-center justify-between">
          <span>正在探索</span>
          <span className="text-amber-600 font-medium">Mango Agent Workbench</span>
        </div>
      </div>

      {/* Known limitations */}
      <div className="bg-bg-subtle rounded-xl p-3 space-y-1">
        <p className="text-[10px] font-semibold text-fg-muted/90">已知限制</p>
        <ul className="text-[10px] text-fg-muted/90 space-y-0.5 list-disc list-inside">
          <li>PDF 导出使用浏览器打印（非服务端生成）</li>
          <li>游客模式下 AI 能力有限</li>
          <li>语音输入尚未全流程接通</li>
          <li>离线缓存仅部分页面可用</li>
        </ul>
      </div>

      {/* Internal build — collapsible, for admin/debug only */}
      <div className="border-t border-border pt-2">
        <button
          onClick={() => setShowInternal(!showInternal)}
          className="flex items-center gap-1 text-[10px] text-fg-subtle/90 hover:text-fg-muted/90 transition-colors"
        >
          {showInternal ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          技术细节
        </button>
        {showInternal && (
          <div className="mt-2 text-[10px] text-fg-subtle/90 space-y-1 font-mono">
            <p>Internal build: {INTERNAL_BUILD}</p>
            <p>Stack: Next.js 15.5 · React 19 · TypeScript 5.8 · Tailwind v4</p>
            <p>AI: DeepSeek · Supabase · Vercel</p>
            <p>Agent Pipeline: Pro 7-stage research → Standard lightweight</p>
          </div>
        )}
      </div>
    </div>
  );
}
