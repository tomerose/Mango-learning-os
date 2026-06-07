"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText, Copy, Download, Edit3, RotateCcw, CheckCircle2,
  AlertTriangle, Sparkles, Globe, Layers, BookOpen,
  ChevronRight, X, ExternalLink, Save, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AgentArtifact } from "@/lib/agent/artifact-types";

interface Props {
  artifact: AgentArtifact;
  onClose?: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  onExport?: (format: "md" | "html" | "docx") => void;
  className?: string;
}

const TASK_LABELS: Record<string, { label: string; icon: string }> = {
  exam_review: { label: "期末复习", icon: "📚" },
  study_pack: { label: "学习包", icon: "📦" },
  document_reading: { label: "文档精读", icon: "📄" },
  notes_organize: { label: "笔记整理", icon: "📝" },
  mistake_training: { label: "错题集训", icon: "🎯" },
  english_speaking: { label: "英语口语", icon: "🗣️" },
  presentation: { label: "展示方案", icon: "🎤" },
  concept_explanation: { label: "概念讲解", icon: "💡" },
  knowledge_forest: { label: "知识森林", icon: "🌳" },
  general: { label: "综合任务", icon: "✨" },
};

export function ArtifactRenderer({ artifact, onClose, onRegenerate, onSave, onExport, className }: Props) {
  const [copied, setCopied] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(artifact.artifactMarkdown);
  const [showSources, setShowSources] = React.useState(false);

  const taskInfo = TASK_LABELS[artifact.taskType] ?? TASK_LABELS.general;

  function handleCopy() {
    navigator.clipboard.writeText(artifact.artifactMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    setEditing(false);
    artifact.artifactMarkdown = editContent;
    onSave?.();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("card-card flex flex-col gap-4", className)}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{taskInfo.icon}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[17px] font-serif font-semibold">
                {artifact.artifactTitle || "生成结果"}
              </h2>
              <Badge className={cn("text-[9px]",
                artifact.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                artifact.status === "partial" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              )}>
                {artifact.status === "completed" ? "完成" : artifact.status === "partial" ? "部分" : "失败"}
              </Badge>
            </div>
            <p className="text-xs text-fg-muted/90 mt-0.5">
              {taskInfo.label} · {new Date(artifact.createdAt).toLocaleTimeString("zh-CN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {artifact.qualityScore > 0 && (
            <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full",
              artifact.qualityScore >= 80 ? "bg-emerald-100 text-emerald-700" :
              artifact.qualityScore >= 60 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-600"
            )}>{artifact.qualityScore}分</span>
          )}
          {onClose && (
            <button onClick={onClose} className="size-7 rounded-lg hover:bg-bg-muted flex items-center justify-center">
              <X className="size-3.5 text-fg-muted" />
            </button>
          )}
        </div>
      </div>

      {/* ── Summary ── */}
      {artifact.artifactSummary && (
        <p className="text-sm text-fg-muted/70 leading-relaxed bg-bg-subtle rounded-xl px-4 py-3">
          {artifact.artifactSummary}
        </p>
      )}

      {/* ── Quality summary ── */}
      {artifact.qualityCheck && !artifact.qualityCheck.passed && (
        <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2.5 text-xs text-amber-700">
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">内容待完善</p>
            {artifact.qualityCheck.checks.sectionsMissing.length > 0 && (
              <p className="mt-0.5 opacity-70">缺少: {artifact.qualityCheck.checks.sectionsMissing.join("、")}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Plan + Tools used ── */}
      <div className="flex flex-wrap items-center gap-1.5">
        {artifact.toolTraces.map((t, i) => (
          <Badge key={i} variant="outline" className={cn("text-[9px] gap-1",
            t.status === "done" ? "" : t.status === "error" ? "text-red-500" : "opacity-50"
          )}>
            {t.status === "done" ? <CheckCircle2 className="size-2.5 text-emerald-500" /> :
             t.status === "error" ? <AlertTriangle className="size-2.5 text-red-400" /> : null}
            {t.message}
          </Badge>
        ))}
      </div>

      {/* ── Artifact Content ── */}
      <div className="border-t border-border/30 pt-4">
        {editing ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full min-h-[300px] rounded-xl border border-border p-4 text-sm font-mono leading-relaxed bg-bg-subtle resize-y"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="rounded-xl">保存</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="rounded-xl">取消</Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap text-fg-muted/80">
            {artifact.artifactMarkdown || (
              <p className="text-fg-subtle/90 italic">内容生成中或生成失败。请点击「重新生成」尝试。</p>
            )}
          </div>
        )}
      </div>

      {/* ── Sources ── */}
      {artifact.sources.length > 0 && (
        <div className="border-t border-border/30 pt-3">
          <button onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors">
            <Globe className="size-3" />
            {showSources ? "收起来源" : `${artifact.sources.length} 个参考来源`}
            <ChevronRight className={cn("size-3 transition-transform", showSources && "rotate-90")} />
          </button>
          {showSources && (
            <div className="flex flex-col gap-1 mt-2">
              {artifact.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener"
                  className="text-xs text-primary hover:underline flex items-center gap-1.5 py-1">
                  <ExternalLink className="size-3" /> {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/30 flex-wrap">
        <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-xl gap-1.5 text-xs">
          {copied ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          {copied ? "已复制" : "复制"}
        </Button>
        {!editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-xl gap-1.5 text-xs">
            <Edit3 className="size-3.5" /> 编辑
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onExport?.("md")} className="rounded-xl gap-1.5 text-xs">
          <Download className="size-3.5" /> 导出
        </Button>
        {onRegenerate && (
          <Button size="sm" variant="outline" onClick={onRegenerate}
            className="rounded-xl gap-1.5 text-xs text-amber-600 hover:text-amber-700">
            <RotateCcw className="size-3.5" /> 重新生成
          </Button>
        )}
        {onSave && (
          <Button size="sm" onClick={onSave} className="rounded-xl gap-1.5 text-xs ml-auto">
            <Save className="size-3.5" /> 保存
          </Button>
        )}
      </div>
    </motion.div>
  );
}
