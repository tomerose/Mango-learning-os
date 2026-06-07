"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, FileText, Lightbulb, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import type { IntentType } from "@/lib/today/intent-router";

interface OutcomeSection {
  title: string;
  content: string;
}

interface Props {
  title: string;
  summary: string;
  sections: OutcomeSection[];
  qualityScore?: number;
  qualityGrade?: string;
  intentType?: IntentType;
  generatedAt?: string;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  daily_plan: Target,
  study_outcome: BookOpen,
  material_organize: FileText,
  project_thinking: Lightbulb,
  daily_review: RotateCcw,
};

const TYPE_LABELS: Record<string, string> = {
  daily_plan: "每日计划",
  study_outcome: "学习成果",
  material_organize: "资料整理",
  project_thinking: "项目分析",
  daily_review: "每日复盘",
};

export function OutcomeDocument({ title, summary, sections, qualityScore, qualityGrade, intentType, generatedAt, className }: Props) {
  const Icon = intentType ? (TYPE_ICONS[intentType] ?? BookOpen) : BookOpen;
  const typeLabel = intentType ? (TYPE_LABELS[intentType] ?? "成果") : "成果";

  return (
    <div className={className}>
      {/* Header */}
      <div className="mango-glass-card overflow-hidden">
        <div className="p-4 space-y-3">
          {/* Type badge + date */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-white/45">
              <Icon className="size-3" />
              {typeLabel}
            </span>
            {generatedAt && (
              <span className="text-[10px] text-white/25">
                {new Date(generatedAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-white leading-snug">{title}</h2>

          {/* Summary */}
          <p className="text-sm leading-6 text-white/55">{summary}</p>

          {/* Quality badge */}
          {qualityScore !== undefined && (
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                qualityGrade === "excellent" ? "bg-emerald-400/15 text-emerald-300" :
                qualityGrade === "passed" ? "bg-amber-400/15 text-amber-300" :
                qualityGrade === "partial" ? "bg-orange-400/15 text-orange-300" :
                "bg-red-400/15 text-red-300"
              }`}>
                {qualityGrade === "excellent" ? "优秀" :
                 qualityGrade === "passed" ? "通过" :
                 qualityGrade === "partial" ? "部分" : "未达标"} · {qualityScore}分
              </span>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="border-t border-white/8">
          {sections.map((section, i) => (
            <SectionBlock key={i} section={section} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ section, defaultOpen }: { section: OutcomeSection; defaultOpen: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-medium text-white/80">{section.title}</span>
        {open ? <ChevronUp className="size-4 text-white/25" /> : <ChevronDown className="size-4 text-white/25" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="text-sm leading-7 text-white/55 whitespace-pre-wrap">{section.content}</div>
        </div>
      )}
    </div>
  );
}
