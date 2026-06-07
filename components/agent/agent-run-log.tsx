"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, Filter, Map, FileText, CheckCircle2, Loader2, AlertTriangle, XCircle, RotateCcw } from "lucide-react";
import type { PipelineStageStatus } from "@/lib/agent/research-pipeline";

const STAGE_ICONS: Record<string, React.ElementType> = {
  query_gen: Brain,
  search: Search,
  filter: Filter,
  evidence: Map,
  structure: FileText,
  generate: FileText,
  quality: CheckCircle2,
};

const STAGE_LABELS: Record<string, string> = {
  query_gen: "分析任务意图",
  search: "联网搜索资料",
  filter: "筛选高质量来源",
  evidence: "构建知识证据",
  structure: "生成内容结构",
  generate: "生成最终成品",
  quality: "质量检查",
};

interface Props {
  stages: PipelineStageStatus[];
  onRetry?: () => void;
  className?: string;
}

export function AgentRunLog({ stages, onRetry, className }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to latest
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [stages.length]);

  const hasFailed = stages.some(s => s.status === "failed");

  return (
    <div className={className}>
      <div ref={containerRef} className="space-y-2 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {stages.map((stage, i) => {
            const Icon = STAGE_ICONS[stage.name] ?? FileText;
            const label = STAGE_LABELS[stage.name] ?? stage.label;
            const isLast = i === stages.length - 1;
            const isActive = stage.status === "running";

            return (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
                className={`flex items-start gap-3 rounded-xl p-3 ${
                  isActive ? "bg-amber-400/8 border border-amber-400/20" :
                  stage.status === "failed" ? "bg-red-400/8 border border-red-400/20" :
                  "bg-white/[0.03]"
                }`}
              >
                {/* Status icon */}
                <span className="grid size-8 shrink-0 place-items-center rounded-lg"
                  style={{
                    backgroundColor:
                      stage.status === "done" ? "rgba(52,211,153,0.12)" :
                      stage.status === "failed" ? "rgba(248,113,113,0.12)" :
                      stage.status === "running" ? "rgba(251,191,36,0.15)" :
                      "rgba(255,255,255,0.04)",
                  }}
                >
                  {stage.status === "done" && <CheckCircle2 className="size-4 text-emerald-300" />}
                  {stage.status === "running" && <Loader2 className="size-4 text-amber-300 animate-spin" />}
                  {stage.status === "failed" && <XCircle className="size-4 text-red-300" />}
                  {stage.status === "skipped" && <AlertTriangle className="size-4 text-white/20" />}
                  {stage.status === "pending" && <Icon className="size-4 text-white/15" />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-semibold ${
                      stage.status === "done" ? "text-white/80" :
                      stage.status === "running" ? "text-amber-200" :
                      "text-white/40"
                    }`}>
                      {label}
                    </p>
                    {isActive && (
                      <span className="text-[9px] text-amber-300/60 animate-pulse">执行中</span>
                    )}
                  </div>
                  {stage.detail && (
                    <p className={`mt-0.5 text-[10px] leading-4 ${
                      stage.status === "failed" ? "text-red-300/60" : "text-white/30"
                    }`}>
                      {stage.detail}
                    </p>
                  )}
                </div>

                {/* Retry button on last failed stage */}
                {stage.status === "failed" && isLast && onRetry && (
                  <button
                    onClick={onRetry}
                    className="shrink-0 flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1.5 text-[10px] font-medium text-white/50 hover:text-white/70 transition-colors"
                  >
                    <RotateCcw className="size-3" />重试
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {hasFailed && onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 w-full rounded-xl bg-white/8 border border-white/10 py-2.5 text-xs font-medium text-white/50 hover:bg-white/12 transition-colors"
        >
          <RotateCcw className="size-3 inline mr-1" />重新执行全部步骤
        </button>
      )}
    </div>
  );
}
