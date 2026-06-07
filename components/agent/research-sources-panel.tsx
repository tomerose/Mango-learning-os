"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Search, Filter, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { RankedSource } from "@/lib/agent/research-pipeline";

interface Props {
  sources: RankedSource[];
  networkAvailable: boolean;
  className?: string;
}

export function ResearchSourcesPanel({ sources, networkAvailable, className }: Props) {
  const [expanded, setExpanded] = React.useState(false);

  if (sources.length === 0 && !networkAvailable) {
    return (
      <div className={className}>
        <div className="mango-glass-card p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-300" />
            <p className="text-xs text-white/50">当前网络检索工具不可用，内容基于已有知识生成。建议联网后重新生成以获得更准确的资料支撑。</p>
          </div>
        </div>
      </div>
    );
  }

  if (sources.length === 0) return null;

  const highQuality = sources.filter(s => s.compositeScore >= 60);
  const displaySources = expanded ? sources : sources.slice(0, 5);

  return (
    <div className={className}>
      <div className="mango-glass-card overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="size-3.5 text-amber-200" />
            <span className="text-xs font-semibold text-white">研究来源</span>
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/45">
              {sources.length} 条 · {highQuality.length} 高质量
            </span>
          </div>
          {expanded ? <ChevronUp className="size-4 text-white/30" /> : <ChevronDown className="size-4 text-white/30" />}
        </button>

        {/* Source list */}
        <div className="px-3 pb-3 space-y-1">
          {displaySources.map((source, i) => (
            <motion.a
              key={source.id}
              href={source.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-white/[0.04] transition-colors group"
            >
              {/* Score indicator */}
              <div className="relative size-8 shrink-0 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: source.compositeScore >= 60 ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.10)",
                }}>
                <span className="text-[10px] font-bold"
                  style={{ color: source.compositeScore >= 60 ? "#6EE7B7" : "#FCD34D" }}>
                  {source.compositeScore}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-medium text-white/80 truncate">{source.title}</p>
                  {source.compositeScore >= 60 && <CheckCircle2 className="size-3 text-emerald-300 shrink-0" />}
                </div>
                <p className="mt-0.5 text-[10px] leading-4 text-white/40 line-clamp-2">{source.snippet}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[9px] text-white/25">{source.platform}</span>
                  <span className="text-[9px] text-white/15">相关 {source.relevanceScore}%</span>
                  <span className="text-[9px] text-white/15">可信 {source.credibilityScore}%</span>
                </div>
              </div>

              <ExternalLink className="size-3 text-white/15 group-hover:text-white/40 shrink-0 mt-1 transition-colors" />
            </motion.a>
          ))}

          {sources.length > 5 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-center py-2 text-[10px] text-white/30 hover:text-white/50 transition-colors"
            >
              还有 {sources.length - 5} 条来源 · 点击展开
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
