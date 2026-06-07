"use client";

import * as React from "react";
import { Zap, Clock, ArrowRight } from "lucide-react";

interface QuotaExhaustedProps {
  type: "agent" | "studyPack";
  current: number;
  max: number;
  resetAt?: string;
  className?: string;
}

export function QuotaExhausted({ type, current, max, resetAt, className = "" }: QuotaExhaustedProps) {
  const label = type === "agent" ? "Agent 任务" : "学习包";
  const nextReset = resetAt ? new Date(resetAt) : null;
  const hoursLeft = nextReset
    ? Math.max(0, Math.round((nextReset.getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  return (
    <div className={`card-card p-5 text-center ${className}`}>
      <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
        <Zap className="size-6 text-amber-500" />
      </div>

      <h3 className="text-[16px] font-serif font-medium mb-1">
        今日{label}已达上限
      </h3>
      <p className="text-[13px] text-fg-muted/90 mb-1">
        已使用 {current}/{max} 次
      </p>

      <div className="flex items-center justify-center gap-1.5 text-[12px] text-fg-muted/80 mb-4">
        <Clock className="size-3" />
        <span>
          {hoursLeft > 0
            ? `${hoursLeft} 小时后重置（北京时间 00:00）`
            : "即将重置"}
        </span>
      </div>

      <a
        href="/profile?tab=billing"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-[13px] font-medium hover:bg-amber-100 transition-colors"
      >
        升级 Pro 获得更高配额
        <ArrowRight className="size-3.5" />
      </a>
    </div>
  );
}
