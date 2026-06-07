"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search, Filter, Download, Edit3, Trash2, Copy,
  FileText, BookOpen, Brain, Target, Sparkles,
  Archive, RotateCcw, Layers, Calendar,
  Library, ChevronRight, CalendarCheck, Layers3, HelpCircle, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileShell, MissionHero, EmptyState, SkeletonState, ErrorState } from "@/components/mobile/premium-mobile";
import { listArtifacts, deleteArtifact, getArtifact } from "@/lib/artifact/artifact-store";
import { ARTIFACT_TYPE_LABELS, type ArtifactType } from "@/lib/artifact/types";
import type { ArtifactMeta } from "@/lib/artifact/artifact-store";
import { SAMPLE_ARTIFACTS } from "@/lib/artifact/samples";
import { artifactToPlan, planToStoreTasks } from "@/lib/outcome/planner-bridge";
import { artifactToFlashcards } from "@/lib/outcome/flashcard-bridge";
import { artifactToQuiz } from "@/lib/outcome/flashcard-bridge";
import { useStore } from "@/lib/store";

// ── Helper ──────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, React.ElementType> = {
  exam_review: BookOpen,
  study_pack: Layers,
  document_reading: FileText,
  notes_organize: FileText,
  mistake_training: Target,
  english_speaking: Brain,
  presentation: Sparkles,
  concept_explain: Brain,
  knowledge_forest: Layers,
  general: FileText,
};

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}

// ── Page ────────────────────────────────────────────────────────

export default function LibraryPage() {
  const store = useStore();
  const [artifacts, setArtifacts] = React.useState<ArtifactMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<ArtifactType | "all">("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedArtifact, setSelectedArtifact] = React.useState<any>(null);
  const [showSamples, setShowSamples] = React.useState(false);
  const [planGenerated, setPlanGenerated] = React.useState(false);

  React.useEffect(() => {
    loadArtifacts();
  }, [typeFilter]);

  async function loadArtifacts() {
    setLoading(true);
    setError(false);
    try {
      const result = await listArtifacts({
        types: typeFilter !== "all" ? [typeFilter] : undefined,
        search: search || undefined,
        sortBy: "updatedAt",
        sortDir: "desc",
      });
      setArtifacts(result);
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  async function handleSelect(id: string) {
    setSelectedId(id);
    // Try real first, fall back to sample
    const real = await getArtifact(id);
    if (real) {
      setSelectedArtifact(real);
    } else {
      const sample = SAMPLE_ARTIFACTS.find(s => s.id === id);
      setSelectedArtifact(sample ?? null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此 artifact？")) return;
    await deleteArtifact(id);
    setSelectedId(null);
    setSelectedArtifact(null);
    loadArtifacts();
  }

  function handleConvertToPlan() {
    if (!selectedArtifact || planGenerated) return;
    const plan = artifactToPlan(selectedArtifact, 5);
    const tasks = planToStoreTasks(plan, selectedArtifact.subject ?? "ai");
    tasks.forEach(t => store.addTask(t));
    setPlanGenerated(true);
    setTimeout(() => setPlanGenerated(false), 3000);
  }

  function handleCopy() {
    if (!selectedArtifact) return;
    const text = selectedArtifact.content || selectedArtifact.sections?.map((s: any) => `## ${s.title}\n\n${s.content}`).join("\n\n") || "";
    navigator.clipboard.writeText(text).then(() => {
      setPlanGenerated(true);
      setTimeout(() => setPlanGenerated(false), 1500);
    }).catch(() => {});
  }

  function handleExport(format: string) {
    if (!selectedArtifact) return;
    const title = selectedArtifact.title || "artifact";
    const content = selectedArtifact.content || selectedArtifact.sections?.map((s: any) => `## ${s.title}\n\n${s.content}`).join("\n\n") || "";
    const ext = format === "html" ? "html" : format === "docx" ? "docx" : "md";
    const mime = format === "html" ? "text/html" : format === "docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "text/markdown;charset=utf-8";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFlashcards() {
    if (!selectedArtifact) return;
    const cards = artifactToFlashcards(selectedArtifact, 15);
    const text = cards.map(c => `Q: ${c.front}\nA: ${c.back}\n---`).join("\n\n");
    const blob = new Blob([`# ${selectedArtifact.title} — 闪卡\n\n${text}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedArtifact.title}_闪卡.md`;
    a.click();
    URL.revokeObjectURL(url);
    setPlanGenerated(true);
    setTimeout(() => setPlanGenerated(false), 1500);
  }

  function handleQuiz() {
    if (!selectedArtifact) return;
    const quiz = artifactToQuiz(selectedArtifact, 8);
    const text = quiz.map((q, i) => `${i + 1}. ${q.question}\n   答案：${q.correctAnswer}\n   解析：${q.explanation}\n`).join("\n");
    const blob = new Blob([`# ${selectedArtifact.title} — 练习\n\n${text}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedArtifact.title}_练习.md`;
    a.click();
    URL.revokeObjectURL(url);
    setPlanGenerated(true);
    setTimeout(() => setPlanGenerated(false), 1500);
  }

  const displayItems = showSamples
    ? SAMPLE_ARTIFACTS.map(a => ({
        id: a.id, type: a.type, title: a.title, summary: a.summary,
        tags: a.tags, qualityScore: a.qualityScore, status: a.status,
        subject: a.subject, createdAt: a.createdAt, updatedAt: a.updatedAt,
        storageMode: "local",
      } as ArtifactMeta))
    : artifacts;

  return (
    <>
    {/* ── MOBILE ── */}
    <div className="md:hidden">
      <MobileShell stage="dark">
        <MissionHero
          eyebrow="Artifact Library"
          title="你的学习成品库"
          description="Agent、学习包、笔记、错题报告 — 所有生成结果在这里统一管理。"
          icon={Library}
        />

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
            <Search className="size-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadArtifacts()}
              placeholder="搜索 artifact..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
            />
          </div>
          <button
            onClick={() => setShowSamples(!showSamples)}
            className={cn(
              "shrink-0 rounded-2xl px-4 py-3 text-xs font-semibold transition-colors",
              showSamples ? "bg-primary/20 text-amber-200 border border-primary/30" : "bg-white/[0.06] text-white/50 border border-white/10"
            )}
          >
            {showSamples ? "我的" : "示例"}
          </button>
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "exam_review", "study_pack", "document_reading", "mistake_training", "english_speaking"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                typeFilter === t ? "bg-primary text-primary-on" : "bg-white/[0.06] text-white/50 border border-white/10"
              )}
            >
              {t === "all" ? "全部" : ARTIFACT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <SkeletonState rows={4} />
        ) : error ? (
          <ErrorState
            title="加载失败"
            description="无法读取学习成品数据，请刷新页面重试。"
            action={<button onClick={() => { setError(false); loadArtifacts(); }} className="rounded-full bg-red-400/15 text-red-300 px-4 py-2 text-xs font-semibold">重新加载</button>}
          />
        ) : displayItems.length === 0 ? (
          <EmptyState
            title="还没有学习成品"
            description="去 Agent 或 Generate 生成你的第一个 artifact，它会自动出现在这里。"
            action={
              <Link href="/agent" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-on">
                开始生成
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {displayItems.map((item, i) => {
              const Icon = TYPE_ICONS[item.type] ?? FileText;
              const isSelected = selectedId === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    "w-full text-left mango-glass-card p-3 transition-all",
                    isSelected && "border-primary/40 bg-primary/8"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/8 text-amber-200">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      <p className="mt-0.5 text-xs text-white/40 line-clamp-2">{item.summary}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/45">
                          {ARTIFACT_TYPE_LABELS[item.type as ArtifactType] ?? item.type}
                        </span>
                        {item.qualityScore > 0 && (
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            item.qualityScore >= 75 ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
                          )}>
                            {item.qualityScore}分
                          </span>
                        )}
                        <span className="text-[10px] text-white/25">{formatDate(item.updatedAt)}</span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-white/20 shrink-0 mt-2" />
                  </div>

                  {/* Expanded detail */}
                  {isSelected && selectedArtifact && (
                    <div className="mt-4 pt-4 border-t border-white/8 space-y-3">
                      {/* Sources */}
                      {selectedArtifact.sources?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">来源</p>
                          {selectedArtifact.sources.map((src: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-1.5">
                              <span className={src.reliability === "high" ? "text-emerald-300" : src.reliability === "medium" ? "text-amber-300" : "text-white/30"}>●</span>
                              <span className="text-[11px] text-white/55 truncate">{src.title}</span>
                              <span className="text-[9px] text-white/20 ml-auto">{src.platform}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sections preview */}
                      {selectedArtifact.sections?.length > 0 && (
                        <div className="space-y-2">
                          {selectedArtifact.sections.slice(0, 3).map((s: any) => (
                            <details key={s.id} className="group">
                              <summary className="text-xs font-medium text-amber-200/80 cursor-pointer">{s.title}</summary>
                              <p className="mt-1 text-xs text-white/55 whitespace-pre-wrap line-clamp-6">{s.content.slice(0, 500)}</p>
                            </details>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/agent?artifact=${selectedArtifact.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1.5 text-[11px] font-semibold text-amber-200"
                        >
                          <RotateCcw className="size-3" />继续生成
                        </Link>
                        <button
                          onClick={handleConvertToPlan}
                          disabled={planGenerated}
                          className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/55 disabled:opacity-40"
                        >
                          <CalendarCheck className="size-3" />{planGenerated ? "已添加" : "拆成计划"}
                        </button>
                        <button
                          onClick={() => handleExport("md")}
                          className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors"
                        >
                          <Download className="size-3" />MD
                        </button>
                        <button
                          onClick={() => handleExport("docx")}
                          className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors"
                        >
                          <FileText className="size-3" />DOCX
                        </button>
                        <button
                          onClick={handleFlashcards}
                          className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors"
                        >
                          <Layers3 className="size-3" />闪卡
                        </button>
                        <button
                          onClick={handleQuiz}
                          className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors"
                        >
                          <HelpCircle className="size-3" />练习
                        </button>
                        <button
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/55 hover:text-white/80 transition-colors"
                        >
                          <Copy className="size-3" />复制
                        </button>
                        <button
                          onClick={() => handleDelete(selectedArtifact.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-red-400/10 px-3 py-1.5 text-[11px] font-medium text-red-300/70"
                        >
                          <Trash2 className="size-3" />删除
                        </button>
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </MobileShell>
    </div>

    {/* ── DESKTOP ── */}
    <div className="hidden md:flex flex-col gap-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display">Artifact Library</h1>
          <p className="text-caption mt-1">所有学习成品统一管理 · 搜索 · 筛选 · 导出</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSamples(!showSamples)}
            className="rounded-2xl border border-border px-4 py-2 text-sm font-medium hover:bg-bg-muted transition-colors"
          >
            {showSamples ? "我的成品" : "查看示例"}
          </button>
          <Link href="/agent" className="rounded-2xl bg-primary text-primary-on px-4 py-2 text-sm font-semibold">
            新建生成
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
        <Search className="size-4 text-fg-muted" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && loadArtifacts()}
          placeholder="搜索 artifact..." className="flex-1 bg-transparent text-sm outline-none" />
      </div>

      {loading ? (
        <div className="text-sm text-fg-muted">加载中…</div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertTriangle className="size-8 text-amber-400 mx-auto mb-3" />
          <p className="text-lg font-semibold">加载失败</p>
          <p className="text-sm text-fg-muted mt-2">无法读取学习成品数据。</p>
          <button onClick={() => { setError(false); loadArtifacts(); }} className="mt-4 rounded-xl bg-primary text-primary-on px-4 py-2 text-sm font-semibold">重新加载</button>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-semibold">还没有学习成品</p>
          <p className="text-sm text-fg-muted mt-2">去 Agent 或 Generate 生成你的第一个 artifact。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayItems.map(item => {
            const Icon = TYPE_ICONS[item.type] ?? FileText;
            return (
              <button key={item.id} onClick={() => handleSelect(item.id)}
                className="card-card hover-lift p-4 text-left">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-primary-subtle text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{item.title}</p>
                    <p className="mt-1 text-xs text-fg-muted line-clamp-2">{item.summary}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-fg-muted bg-bg-muted rounded-full px-2 py-0.5">
                        {ARTIFACT_TYPE_LABELS[item.type as ArtifactType]}
                      </span>
                      {item.qualityScore > 0 && (
                        <span className="text-[10px] font-semibold text-primary">{item.qualityScore}分</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
