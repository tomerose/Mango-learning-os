"use client";

import * as React from "react";
import { Zap, Package, Clock } from "lucide-react";
import type { PlanTier } from "@/lib/plan/types";
import { PLAN_FEATURES } from "@/lib/plan/types";

interface Props {
  plan: PlanTier;
  agentTasks: { current: number; max: number };
  studyPacks: { current: number; max: number };
}

export function QuotaDisplay({ plan, agentTasks, studyPacks }: Props) {
  const maxAgent = PLAN_FEATURES[plan].maxDailyAgentTasks;
  const maxPacks = PLAN_FEATURES[plan].maxDailyStudyPacks;

  const agentPct = maxAgent > 0 ? Math.round((agentTasks.current / maxAgent) * 100) : 0;
  const packPct = maxPacks > 0 ? Math.round((studyPacks.current / maxPacks) * 100) : 0;

  return (
    <div className="card-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold flex items-center gap-2">
          <Zap className="size-4 text-amber-500" />
          今日配额
        </h2>
        <span className="text-[11px] text-fg-muted/80 flex items-center gap-1">
          <Clock className="size-3" />
          北京时间 00:00 重置
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Agent Tasks */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium flex items-center gap-1.5">
              <Zap className="size-3.5 text-primary" />
              Agent 任务
            </span>
            <span className="text-[12px] tabular-nums text-fg-muted">
              {agentTasks.current} / {maxAgent >= 9999 ? "∞" : maxAgent}
            </span>
          </div>
          {/* Quota ring */}
          <div className="relative w-full h-2 rounded-full bg-bg-muted overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                agentPct >= 90 ? "bg-red-400" : agentPct >= 70 ? "bg-amber-400" : "bg-primary"
              }`}
              style={{ width: `${Math.min(agentPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Study Packs */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium flex items-center gap-1.5">
              <Package className="size-3.5 text-primary" />
              学习包
            </span>
            <span className="text-[12px] tabular-nums text-fg-muted">
              {studyPacks.current} / {maxPacks >= 9999 ? "∞" : maxPacks}
            </span>
          </div>
          <div className="relative w-full h-2 rounded-full bg-bg-muted overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                packPct >= 90 ? "bg-red-400" : packPct >= 70 ? "bg-amber-400" : "bg-primary"
              }`}
              style={{ width: `${Math.min(packPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Empty state for guest */}
      {plan === "guest" && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[12px] text-fg-muted/90 text-center">
            游客模式无配额限制展示。登录后查看每日使用情况。
          </p>
        </div>
      )}
    </div>
  );
}
