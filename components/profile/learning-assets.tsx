"use client";

import * as React from "react";
import { Package, Bot, FileText, AlertTriangle, Layers, RefreshCw } from "lucide-react";

interface AssetCounts {
  studyPacks: number;
  agentTasks: number;
  notes: number;
  mistakes: number;
  flashcards: number;
  reviews: number;
}

interface Props {
  counts: AssetCounts;
}

const assets = [
  { key: "studyPacks" as const, label: "学习包", icon: Package, color: "text-amber-500" },
  { key: "agentTasks" as const, label: "Agent 任务", icon: Bot, color: "text-primary" },
  { key: "notes" as const, label: "笔记", icon: FileText, color: "text-blue-500" },
  { key: "mistakes" as const, label: "错题", icon: AlertTriangle, color: "text-red-400" },
  { key: "flashcards" as const, label: "闪卡", icon: Layers, color: "text-green-500" },
  { key: "reviews" as const, label: "复习", icon: RefreshCw, color: "text-purple-500" },
];

export function LearningAssets({ counts }: Props) {
  return (
    <div className="card-card p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold mb-4">学习资产</h2>

      {Object.values(counts).every(v => v === 0) ? (
        <div className="text-center py-3">
          <p className="text-[13px] text-fg-muted/60">还没有学习资产</p>
          <p className="text-[11px] text-fg-muted/40 mt-0.5">
            创建学习包、完成 Agent 任务后将在此显示
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {assets.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-bg-subtle">
              <Icon className={`size-4 ${color} shrink-0`} />
              <div>
                <p className="text-[18px] font-semibold tabular-nums leading-tight">
                  {counts[key]}
                </p>
                <p className="text-[11px] text-fg-muted/60">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
