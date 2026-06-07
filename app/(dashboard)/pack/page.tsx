"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package, Plus, History, ArrowLeft, Sparkles,
  FileText, Clock, Target, GraduationCap, BookOpen,
  ChevronRight, Loader2, Trash2, Download, Edit3,
  ExternalLink, Search, CheckCircle2, AlertTriangle, Globe,
  Github, FileUp, Tag, Shield, X, Layers, Brain, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/page-transition";
import { PackBackground } from "@/components/ui/module-backgrounds";
import { qualityBadge } from "@/lib/ai/content-quality-v2";
import type { ResearchSource } from "@/lib/ai/research-orchestrator";
import type { QualityReport } from "@/lib/ai/content-quality-v2";
import {
  saveStudyPackSync, loadStudyPacksSync, getRecentStudyPacks,
  buildPackFromResponse, deleteStudyPackSync, getPackById,
  renameStudyPack, duplicateStudyPack,
  type StudyPackSession,
} from "@/lib/study-pack-store";
import { migrateOldPacks } from "@/lib/study-pack-store";
import { PackPractice } from "@/components/study-pack/pack-practice";

/* ═══════════════════════════════════════════════════════════════
   Study Pack V11 — The core MangoOS experience.
   Upload → Generate → Save → Review → Export → Continue.
   ═══════════════════════════════════════════════════════════════ */

// ── Types ────────────────────────────────────────────────────────

interface ReviewSection {
  title: string;
  content: string;
}

interface ReviewPackage {
  meta: {
    courseName: string;
    school?: string;
    generatedAt: string;
    sourceCount: number;
    qualityScore: number;
  };
  sections: {
    coverPage: string;
    tableOfContents: string;
    courseOverview: string;
    examScopeMap: string;
    knowledgeGraph: string;
    chapterConcepts: ReviewSection[];
    logicFramework: string;
    highFreqPoints: string;
    formulaTable: string;
    problemMethods: string;
    typicalExamples: string;
    commonTraps: string;
    memoryChecklist: string;
    reviewPlan: string;
    mockExam: string;
    answerKey: string;
    finalSprint: string;
    references: string;
  };
  qualityReport: QualityReport;
  sources: ResearchSource[];
}

type Step = "input" | "researching" | "sources" | "generating" | "preview" | "practicing" | "error";
type View = "wizard" | "history";

// ── Constants ────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  web: <Globe className="size-3" />,
  academic: <BookOpen className="size-3" />,
  github: <Github className="size-3" />,
  youtube: <Globe className="size-3" />,
  official: <Shield className="size-3" />,
  local: <FileUp className="size-3" />,
  zhihu: <Target className="size-3" />,
};

const RELIABILITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "高可信度", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "中等可信", color: "bg-amber-50 text-amber-700 border-amber-200" },
  low: { label: "低可信度", color: "bg-red-50 text-red-700 border-red-200" },
};

const PROGRESS_STEPS = [
  { key: "parse", label: "解析资料", icon: FileText },
  { key: "search", label: "搜索来源", icon: Search },
  { key: "rank", label: "可靠性排序", icon: Layers },
  { key: "structure", label: "生成结构", icon: Target },
  { key: "examples", label: "创建例题", icon: Edit3 },
  { key: "quality", label: "质量检查", icon: CheckCircle2 },
  { key: "save", label: "保存导出", icon: Download },
];

function getReliabilityLabel(score: number) {
  if (score >= 0.8) return RELIABILITY_LABELS.high;
  if (score >= 0.5) return RELIABILITY_LABELS.medium;
  return RELIABILITY_LABELS.low;
}

// ── Simple Markdown → HTML renderer ─────────────────────────────

function renderMd(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2 font-serif">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2 font-serif">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3 font-serif">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-bg-muted rounded px-1 py-0.5 text-xs">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ── Sub-components ──────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-16 px-4 gap-6">
      <div className="size-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Package className="size-10 text-primary" strokeWidth={1} />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-heading font-serif">生成你的第一个学习包</h2>
        <p className="text-sm text-fg-muted max-w-sm leading-relaxed">
          输入课程名称，AI 将自动搜索在线资源并生成完整的复习讲义——包含考纲分析、知识图谱、公式速查、模拟试卷等18个模块。
        </p>
      </div>
      <Button onClick={onStart} size="lg" className="gap-2 rounded-xl">
        <Plus className="size-4" /> 新建学习包
      </Button>
    </motion.div>
  );
}

function ProgressTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {PROGRESS_STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const isPending = i > currentStep;
        return (
          <div key={step.key} className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
            isActive && "bg-primary-subtle",
          )}>
            <div className={cn(
              "size-7 rounded-full flex items-center justify-center shrink-0 transition-all",
              isDone && "bg-emerald-100 text-emerald-600",
              isActive && "bg-primary text-primary-foreground",
              isPending && "bg-bg-muted text-fg-muted/40",
            )}>
              {isDone ? <CheckCircle2 className="size-4" /> :
               isActive ? <Loader2 className="size-4 animate-spin" /> :
               <step.icon className="size-3.5" />}
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors",
              isDone && "text-emerald-600",
              isActive && "text-primary",
              isPending && "text-fg-muted/40",
            )}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────

export default function PackPage() {
  const [view, setView] = React.useState<View>("wizard");
  const [step, setStep] = React.useState<Step>("input");
  const [hasPacks, setHasPacks] = React.useState(false);
  const [recentPacks, setRecentPacks] = React.useState<StudyPackSession[]>([]);
  const [progressStep, setProgressStep] = React.useState(0);

  // Input state
  const [courseName, setCourseName] = React.useState("");
  const [school, setSchool] = React.useState("");
  const [professor, setProfessor] = React.useState("");
  const [textbook, setTextbook] = React.useState("");
  const [examScope, setExamScope] = React.useState("");
  const [targetScore, setTargetScore] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState("");
  const [additionalNotes, setAdditionalNotes] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<Array<{ name: string; text: string }>>([]);

  // Results state
  const [reviewPackage, setReviewPackage] = React.useState<ReviewPackage | null>(null);
  const [sources, setSources] = React.useState<ResearchSource[]>([]);
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);

  // Preview state
  const [previewSection, setPreviewSection] = React.useState("courseOverview");
  const [exportFormat, setExportFormat] = React.useState<"docx" | "pdf" | "md">("docx");
  const [exporting, setExporting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Init
  React.useEffect(() => {
    migrateOldPacks();
    const packs = getRecentStudyPacks(10);
    setHasPacks(packs.length > 0);
    setRecentPacks(packs);
  }, []);

  function refreshPacks() {
    const packs = getRecentStudyPacks(10);
    setHasPacks(packs.length > 0);
    setRecentPacks(packs);
  }

  // ── File Upload ────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const results: Array<{ name: string; text: string }> = [];
    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/notes/import/file", { method: "POST", body: form });
        if (res.ok) {
          const data = await res.json();
          results.push({ name: file.name, text: data.text ?? "" });
        }
      } catch { }
    }
    setUploadedFiles(prev => [...prev, ...results]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Generate ───────────────────────────────────────────────
  async function handleGenerate() {
    if (!courseName.trim()) return;
    setStep("researching");
    setError("");
    setWarnings([]);
    setProgressStep(0);

    // Animate progress steps
    const progressInterval = setInterval(() => {
      setProgressStep(p => Math.min(p + 1, PROGRESS_STEPS.length));
    }, 8000);

    try {
      const res = await fetch("/api/exam-review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: courseName.trim(),
          school: school.trim() || undefined,
          professor: professor.trim() || undefined,
          textbook: textbook.trim() || undefined,
          examScope: examScope.trim() || undefined,
          targetScore: targetScore.trim() || undefined,
          timeLeft: timeLeft.trim() || undefined,
          additionalNotes: additionalNotes.trim() || undefined,
          uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        }),
      });

      clearInterval(progressInterval);
      setProgressStep(PROGRESS_STEPS.length);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "生成失败");
      }

      setReviewPackage(data.reviewPackage);
      setSources(data.reviewPackage.sources ?? []);
      setWarnings(data.warnings ?? []);

      // Persist
      try {
        const pack = buildPackFromResponse(
          courseName.trim(), school.trim() || undefined, examScope.trim() || undefined,
          data.reviewPackage.sources ?? [],
          data.reviewPackage,
          data.reviewPackage.qualityReport?.overallScore ?? 0,
        );
        saveStudyPackSync(pack);
      } catch { /* best effort */ }

      refreshPacks();
      setStep("preview");
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "未知错误");
      setStep("error");
    }
  }

  // ── Export ────────────────────────────────────────────────
  async function handleExport() {
    if (!reviewPackage) return;
    setExporting(true);
    try {
      // Use new Study Pack export for docx (true .docx), fallback for pdf
      const exportUrl = exportFormat === "pdf"
        ? "/api/exam-review/export"
        : "/api/study-pack/export";

      const res = await fetch(exportUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: exportFormat,
          courseName: reviewPackage.meta.courseName,
          sections: reviewPackage.sections,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = exportFormat === "docx" ? "docx" : exportFormat === "md" ? "md" : "html";
        a.download = `${reviewPackage.meta.courseName}_复习讲义.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        if (exportFormat === "pdf") {
          const html = await blob.text();
          const w = window.open("", "_blank");
          if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
        }
      }
    } catch (err) {
      setError(`导出失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setExporting(false);
    }
  }

  // ── Load saved pack ───────────────────────────────────────
  async function handleOpenPack(pack: StudyPackSession) {
    try {
      const full = await getPackById(pack.id);
      if (full?.generatedHandout && Object.keys(full.generatedHandout).length > 1) {
        setReviewPackage(full.generatedHandout as unknown as ReviewPackage);
        setSources(full.sources ?? []);
      } else if (pack.generatedHandout && Object.keys(pack.generatedHandout).length > 1) {
        setReviewPackage(pack.generatedHandout as unknown as ReviewPackage);
        setSources(pack.sources ?? []);
      }
      setStep("preview");
      setView("wizard");
    } catch {
      // Pack content not found
    }
  }

  // ── Section keys ──────────────────────────────────────────
  const sectionKeys: Array<{ key: string; label: string; content: string }> = React.useMemo(() => {
    if (!reviewPackage) return [];
    const s = reviewPackage.sections;
    return [
      { key: "courseOverview", label: "课程概述", content: s.courseOverview },
      { key: "examScopeMap", label: "考纲范围", content: s.examScopeMap },
      { key: "knowledgeGraph", label: "知识图谱", content: s.knowledgeGraph },
      ...s.chapterConcepts.map((ch, i) => ({
        key: `chapter-${i}`,
        label: ch.title,
        content: ch.content,
      })),
      { key: "logicFramework", label: "逻辑框架", content: s.logicFramework },
      { key: "highFreqPoints", label: "高频考点", content: s.highFreqPoints },
      { key: "formulaTable", label: "公式速查", content: s.formulaTable },
      { key: "problemMethods", label: "解题方法", content: s.problemMethods },
      { key: "typicalExamples", label: "典型例题", content: s.typicalExamples },
      { key: "commonTraps", label: "常见陷阱", content: s.commonTraps },
      { key: "memoryChecklist", label: "记忆清单", content: s.memoryChecklist },
      { key: "reviewPlan", label: "复习计划", content: s.reviewPlan },
      { key: "mockExam", label: "模拟试卷", content: s.mockExam },
      { key: "answerKey", label: "答案解析", content: s.answerKey },
      { key: "finalSprint", label: "考前冲刺", content: s.finalSprint },
      { key: "references", label: "参考资料", content: s.references },
    ];
  }, [reviewPackage]);

  const qualityBadgeData = reviewPackage ? qualityBadge(reviewPackage.qualityReport) : null;

  return (
    <PageTransition>
    <div className="relative flex flex-col gap-6 pb-20">
      <PackBackground />

      {/* ── Page Header ── */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-display font-serif">学习包</h1>
          <p className="text-sm text-fg-muted">AI 生成复习讲义 · 多源研究 · 导出 Word/PDF</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setView("history"); refreshPacks(); }}
            className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              view === "history" ? "bg-primary-subtle text-primary" : "text-fg-muted hover:text-fg hover:bg-bg-muted")}>
            <History className="size-3.5" /> 历史
          </button>
          <button onClick={() => { setView("wizard"); setStep("input"); }}
            className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              view === "wizard" ? "bg-primary-subtle text-primary" : "text-fg-muted hover:text-fg hover:bg-bg-muted")}>
            <Plus className="size-3.5" /> 新建
          </button>
        </div>
      </header>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* ═══ HISTORY VIEW ═══ */}
          {view === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-4">
              {recentPacks.length === 0 ? (
                <EmptyState onStart={() => { setView("wizard"); setStep("input"); }} />
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-fg-muted">
                    <History className="size-3.5" /> {recentPacks.length} 个学习包
                  </div>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {recentPacks.map(pack => (
                      <div key={pack.id}
                        className="card-card p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="flex items-start justify-between">
                          <div className="size-10 rounded-xl bg-primary-subtle flex items-center justify-center">
                            <GraduationCap className="size-5 text-primary" />
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={async () => {
                              const dup = await duplicateStudyPack(pack.id);
                              if (dup) refreshPacks();
                            }} className="size-7 rounded-lg hover:bg-primary-subtle flex items-center justify-center"
                              title="复制"><Layers className="size-3" /></button>
                            <button onClick={() => {
                              const newName = prompt("重命名学习包", pack.courseName);
                              if (newName && newName.trim()) {
                                renameStudyPack(pack.id, newName.trim()).then(refreshPacks);
                              }
                            }} className="size-7 rounded-lg hover:bg-bg-muted flex items-center justify-center"
                              title="重命名"><Pencil className="size-3" /></button>
                            <button onClick={() => handleOpenPack(pack)}
                              className="size-7 rounded-lg hover:bg-primary-subtle flex items-center justify-center"
                              title="打开"><ExternalLink className="size-3.5" /></button>
                            <button onClick={() => {
                              if (confirm("确定删除？")) { deleteStudyPackSync(pack.id); refreshPacks(); }
                            }} className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center"
                              title="删除"><Trash2 className="size-3.5 text-red-400" /></button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium leading-snug">{pack.courseName}</p>
                          {pack.school && <p className="text-[11px] text-fg-muted">{pack.school}</p>}
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-[10px] rounded-full px-2 py-0.5 bg-bg-muted text-fg-muted">
                            {new Date(pack.createdAt).toLocaleDateString("zh-CN")}
                          </span>
                          <span className="text-[10px] rounded-full px-2 py-0.5 bg-primary-subtle text-primary font-medium">
                            {pack.qualityScore}分
                          </span>
                          <span className="text-[10px] text-fg-muted/50 ml-auto">
                            {pack.status === "complete" ? "已完成" : "草稿"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ═══ WIZARD VIEW ═══ */}
          {view === "wizard" && (
            <motion.div key="wizard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-6">
              {/* ── Desktop 3-Column Cockpit ── */}
              <div className="hidden lg:grid lg:grid-cols-[260px_1fr_280px] gap-6 items-start">

                {/* Left: Context & Progress */}
                <div className="flex flex-col gap-4 sticky top-20">
                  {step === "researching" || step === "generating" ? (
                    <div className="card-card p-4">
                      <span className="text-[10px] uppercase tracking-wider text-fg-muted font-medium">生成进度</span>
                      <div className="mt-3"><ProgressTimeline currentStep={progressStep} /></div>
                    </div>
                  ) : step === "preview" && sources.length > 0 ? (
                    <div className="card-card p-4 flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-wider text-fg-muted font-medium">研究来源</span>
                      <div className="flex flex-col gap-2">
                        {sources.slice(0, 8).map(s => {
                          const rel = getReliabilityLabel(s.reliabilityScore);
                          return (
                            <a key={s.id} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                              className="rounded-lg border border-border/40 p-2.5 hover:border-primary/30 transition-colors group">
                              <div className="flex items-center gap-1.5 mb-1">
                                {PLATFORM_ICONS[s.platform] ?? <Globe className="size-3" />}
                                <span className="text-[9px] text-fg-muted uppercase">{s.platform}</span>
                                <span className={cn("text-[8px] rounded-full px-1 py-0.5 ml-auto", rel.color)}>{rel.label}</span>
                              </div>
                              <p className="text-[11px] font-medium line-clamp-2 group-hover:text-primary">{s.title}</p>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ) : step === "input" && hasPacks ? (
                    <div className="card-card p-4 flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-wider text-fg-muted font-medium">继续学习</span>
                      {recentPacks.slice(0, 4).map(pack => (
                        <button key={pack.id} onClick={() => handleOpenPack(pack)}
                          className="flex items-center gap-2 rounded-lg p-2 hover:bg-bg-muted transition-colors text-left">
                          <FileText className="size-3.5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium truncate">{pack.courseName}</p>
                            <p className="text-[9px] text-fg-muted">{new Date(pack.createdAt).toLocaleDateString("zh-CN")}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Center: Document Workspace */}
                <div className="flex flex-col gap-4">
                  {step === "input" && (
                    <WizardInput
                      courseName={courseName} setCourseName={setCourseName}
                      school={school} setSchool={setSchool}
                      professor={professor} setProfessor={setProfessor}
                      textbook={textbook} setTextbook={setTextbook}
                      examScope={examScope} setExamScope={setExamScope}
                      targetScore={targetScore} setTargetScore={setTargetScore}
                      timeLeft={timeLeft} setTimeLeft={setTimeLeft}
                      additionalNotes={additionalNotes} setAdditionalNotes={setAdditionalNotes}
                      uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                      fileInputRef={fileInputRef} handleFileUpload={handleFileUpload}
                      handleGenerate={handleGenerate}
                    />
                  )}
                  {step === "researching" && <ResearchingState />}
                  {step === "error" && <ErrorState error={error} onRetry={() => { setStep("input"); setError(""); }} />}
                  {step === "preview" && reviewPackage && (
                    <PreviewState
                      reviewPackage={reviewPackage}
                      sources={sources}
                      warnings={warnings}
                      qualityBadgeData={qualityBadgeData}
                      sectionKeys={sectionKeys}
                      previewSection={previewSection}
                      setPreviewSection={setPreviewSection}
                      exportFormat={exportFormat}
                      setExportFormat={setExportFormat}
                      exporting={exporting}
                      handleExport={handleExport}
                      onRegenerate={() => setStep("input")}
                    />
                  )}
                  {step === "practicing" && reviewPackage && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-title font-serif">闪卡练习</h3>
                        <Button variant="ghost" size="sm" onClick={() => setStep("preview")} className="gap-1.5">
                          <ArrowLeft className="size-3.5" /> 返回讲义
                        </Button>
                      </div>
                      <PackPractice generatedHandout={reviewPackage} onClose={() => setStep("preview")} />
                    </div>
                  )}
                </div>

                {/* Right: Quality & Export */}
                <div className="flex flex-col gap-4 sticky top-20">
                  {step === "preview" && reviewPackage && (
                    <>
                      <div className="card-card p-4 flex flex-col gap-3">
                        <span className="text-[10px] uppercase tracking-wider text-fg-muted font-medium">质量评估</span>
                        {qualityBadgeData && (
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] rounded-full px-2.5 py-1 font-medium"
                              style={{ backgroundColor: qualityBadgeData.color, color: qualityBadgeData.textColor }}>
                              {qualityBadgeData.label}
                            </span>
                            <span className="text-2xl font-bold font-serif">{reviewPackage.meta.qualityScore}<span className="text-sm text-fg-muted font-normal">/100</span></span>
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5 text-[11px] text-fg-muted">
                          <span className="flex justify-between"><span>来源数量</span><span className="font-medium text-fg">{reviewPackage.meta.sourceCount}</span></span>
                          <span className="flex justify-between"><span>生成时间</span><span className="font-medium text-fg">{new Date(reviewPackage.meta.generatedAt).toLocaleString("zh-CN")}</span></span>
                        </div>
                      </div>
                      <div className="card-card p-4 flex flex-col gap-3">
                        <span className="text-[10px] uppercase tracking-wider text-fg-muted font-medium">导出</span>
                        <select value={exportFormat} onChange={e => setExportFormat(e.target.value as "docx" | "pdf" | "md")}
                          className="text-xs border border-border rounded-lg px-3 py-2 bg-bg-surface">
                          <option value="docx">Word (.doc) · 推荐</option>
                          <option value="pdf">PDF (打印)</option>
                          <option value="md">Markdown</option>
                        </select>
                        <Button onClick={handleExport} disabled={exporting} className="gap-2 w-full rounded-xl" size="sm">
                          {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                          导出文件
                        </Button>
                        <Button onClick={() => setStep("practicing")} variant="secondary" className="gap-2 w-full rounded-xl" size="sm">
                          <Brain className="size-3.5" /> 闪卡练习
                        </Button>
                        <p className="text-[9px] text-fg-muted/50 text-center">导出为 {exportFormat === "docx" ? "HTML 格式 Word 文档" : exportFormat === "pdf" ? "浏览器打印 PDF" : "纯文本 Markdown"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Mobile Stacked Layout ── */}
              <div className="lg:hidden flex flex-col gap-4">
                {step === "input" && (
                  <WizardInput
                    courseName={courseName} setCourseName={setCourseName}
                    school={school} setSchool={setSchool}
                    professor={professor} setProfessor={setProfessor}
                    textbook={textbook} setTextbook={setTextbook}
                    examScope={examScope} setExamScope={setExamScope}
                    targetScore={targetScore} setTargetScore={setTargetScore}
                    timeLeft={timeLeft} setTimeLeft={setTimeLeft}
                    additionalNotes={additionalNotes} setAdditionalNotes={setAdditionalNotes}
                    uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                    fileInputRef={fileInputRef} handleFileUpload={handleFileUpload}
                    handleGenerate={handleGenerate}
                  />
                )}
                {step === "researching" && (
                  <div className="flex flex-col gap-4">
                    <ResearchingState />
                    <div className="card-card p-4"><ProgressTimeline currentStep={progressStep} /></div>
                  </div>
                )}
                {step === "error" && <ErrorState error={error} onRetry={() => { setStep("input"); setError(""); }} />}
                {step === "preview" && reviewPackage && (
                  <div className="flex flex-col gap-4">
                    {/* Quality + Export (mobile: above content) */}
                    <div className="card-card p-4 flex items-center gap-4 flex-wrap">
                      {qualityBadgeData && (
                        <span className="text-[11px] rounded-full px-2.5 py-1 font-medium"
                          style={{ backgroundColor: qualityBadgeData.color, color: qualityBadgeData.textColor }}>
                          {qualityBadgeData.label} ({reviewPackage.meta.qualityScore}分)
                        </span>
                      )}
                      <span className="text-[10px] text-fg-muted">{reviewPackage.meta.sourceCount} 个来源</span>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1.5">
                        <select value={exportFormat} onChange={e => setExportFormat(e.target.value as "docx" | "pdf" | "md")}
                          className="text-[10px] border border-border rounded-md px-2 py-1.5 bg-bg-surface">
                          <option value="docx">Word</option>
                          <option value="pdf">PDF</option>
                          <option value="md">MD</option>
                        </select>
                        <Button size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5 h-8 text-[11px]">
                          {exporting ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                          导出
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setStep("practicing")} className="gap-1.5 h-8 text-[11px]">
                          <Brain className="size-3" /> 练习
                        </Button>
                      </div>
                    </div>

                    {/* Source cards (collapsible) */}
                    {sources.length > 0 && (
                      <details className="card-card p-4">
                        <summary className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                          <Globe className="size-3.5 text-primary" /> 研究来源 ({sources.length})
                        </summary>
                        <div className="grid gap-2 mt-3 grid-cols-1 sm:grid-cols-2">
                          {sources.slice(0, 6).map(s => {
                            const rel = getReliabilityLabel(s.reliabilityScore);
                            return (
                              <a key={s.id} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                                className="rounded-lg border border-border/50 p-2.5 hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-1.5 mb-1">
                                  {PLATFORM_ICONS[s.platform] ?? <Globe className="size-3" />}
                                  <span className="text-[9px] font-medium text-fg-muted uppercase">{s.platform}</span>
                                  <span className={cn("text-[8px] rounded-full px-1 py-0.5 border ml-auto", rel.color)}>{rel.label}</span>
                                </div>
                                <p className="text-[11px] font-medium line-clamp-2">{s.title}</p>
                              </a>
                            );
                          })}
                        </div>
                      </details>
                    )}

                    {/* Section reader */}
                    <PreviewState
                      reviewPackage={reviewPackage}
                      sources={sources}
                      warnings={warnings}
                      qualityBadgeData={qualityBadgeData}
                      sectionKeys={sectionKeys}
                      previewSection={previewSection}
                      setPreviewSection={setPreviewSection}
                      exportFormat={exportFormat}
                      setExportFormat={setExportFormat}
                      exporting={exporting}
                      handleExport={handleExport}
                      onRegenerate={() => setStep("input")}
                    />

                    <div className="flex justify-center pb-8">
                      <Button variant="outline" onClick={() => setStep("input")} className="gap-2 rounded-xl">
                        <Edit3 className="size-3.5" /> 修改输入重新生成
                      </Button>
                    </div>
                  </div>
                )}
                {step === "practicing" && reviewPackage && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-title font-serif">闪卡练习</h3>
                      <Button variant="ghost" size="sm" onClick={() => setStep("preview")} className="gap-1.5">
                        <ArrowLeft className="size-3.5" /> 返回讲义
                      </Button>
                    </div>
                    <PackPractice generatedHandout={reviewPackage} onClose={() => setStep("preview")} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageTransition>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════

function WizardInput({
  courseName, setCourseName, school, setSchool, professor, setProfessor,
  textbook, setTextbook, examScope, setExamScope, targetScore, setTargetScore,
  timeLeft, setTimeLeft, additionalNotes, setAdditionalNotes,
  uploadedFiles, setUploadedFiles, fileInputRef, handleFileUpload, handleGenerate,
}: {
  courseName: string; setCourseName: (v: string) => void;
  school: string; setSchool: (v: string) => void;
  professor: string; setProfessor: (v: string) => void;
  textbook: string; setTextbook: (v: string) => void;
  examScope: string; setExamScope: (v: string) => void;
  targetScore: string; setTargetScore: (v: string) => void;
  timeLeft: string; setTimeLeft: (v: string) => void;
  additionalNotes: string; setAdditionalNotes: (v: string) => void;
  uploadedFiles: Array<{ name: string; text: string }>;
  setUploadedFiles: React.Dispatch<React.SetStateAction<Array<{ name: string; text: string }>>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerate: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-card p-5 sm:p-7 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap className="size-5 text-primary" />
        <span className="text-base font-semibold font-serif">新建学习包</span>
      </div>
      <p className="text-sm text-fg-muted -mt-1 leading-relaxed">
        输入课程信息，AI 将自动搜索在线资源并生成完整的考试复习讲义——覆盖考纲分析、知识图谱、公式速查、模拟试卷等18个模块。
      </p>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium mb-1 block">课程名称 *</label>
          <Input value={courseName} onChange={e => setCourseName(e.target.value)}
            placeholder="如：商务英语3、微积分B" className="text-sm rounded-xl" autoFocus />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">学校（可选）</label>
          <Input value={school} onChange={e => setSchool(e.target.value)}
            placeholder="如：对外经济贸易大学" className="text-sm rounded-xl" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">教授/老师（可选）</label>
          <Input value={professor} onChange={e => setProfessor(e.target.value)}
            placeholder="授课教师姓名" className="text-sm rounded-xl" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">教材（可选）</label>
          <Input value={textbook} onChange={e => setTextbook(e.target.value)}
            placeholder="主要教材名称" className="text-sm rounded-xl" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">考试范围（可选）</label>
          <Input value={examScope} onChange={e => setExamScope(e.target.value)}
            placeholder="如：第1-8章 或 整本书" className="text-sm rounded-xl" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block">目标分数（可选）</label>
            <Input value={targetScore} onChange={e => setTargetScore(e.target.value)}
              placeholder="如：90+ / A" className="text-sm rounded-xl" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block">剩余时间（可选）</label>
            <Input value={timeLeft} onChange={e => setTimeLeft(e.target.value)}
              placeholder="如：2周 / 7天" className="text-sm rounded-xl" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block">补充说明（可选）</label>
        <Textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
          placeholder="任何额外的信息：重点章节、已复习内容、难点等…" className="text-sm min-h-20 rounded-xl" />
      </div>

      <div>
        <label className="text-xs font-medium mb-1 block">上传资料（可选）</label>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".docx,.pdf,.md,.txt"
            multiple onChange={handleFileUpload}
            className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs file:cursor-pointer" />
          <span className="text-[10px] text-fg-muted">支持 Word/PDF/Markdown</span>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {uploadedFiles.map((f, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] gap-1 pr-1">
                <FileText className="size-3" /> {f.name}
                <button onClick={() => setUploadedFiles(p => p.filter((_, j) => j !== i))}
                  className="hover:text-destructive"><X className="size-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleGenerate} disabled={!courseName.trim()} size="lg" className="self-start gap-2 rounded-xl">
        <Sparkles className="size-4" /> 生成复习讲义
      </Button>
    </motion.div>
  );
}

function ResearchingState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-card p-8 flex flex-col items-center gap-4">
      <div className="relative">
        <div className="size-16 rounded-2xl bg-primary-subtle flex items-center justify-center">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-medium font-serif">正在生成复习讲义…</p>
        <p className="text-sm text-fg-muted mt-1 max-w-xs leading-relaxed">
          搜索在线资源 → 分析资料 → 生成结构化讲义。预计需要 30-60 秒，请耐心等待。
        </p>
      </div>
    </motion.div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-card p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="size-5" />
        <span className="font-medium">生成失败</span>
      </div>
      <p className="text-sm text-fg-muted leading-relaxed">{error}</p>
      <Button variant="outline" onClick={onRetry} className="self-start rounded-xl">返回重试</Button>
    </motion.div>
  );
}

function PreviewState({
  reviewPackage, sources, warnings, qualityBadgeData, sectionKeys,
  previewSection, setPreviewSection, exportFormat, setExportFormat,
  exporting, handleExport, onRegenerate,
}: {
  reviewPackage: ReviewPackage;
  sources: ResearchSource[];
  warnings: string[];
  qualityBadgeData: { label: string; color: string; textColor: string } | null;
  sectionKeys: Array<{ key: string; label: string; content: string }>;
  previewSection: string;
  setPreviewSection: (v: string) => void;
  exportFormat: string;
  setExportFormat: (v: "docx" | "pdf" | "md") => void;
  exporting: boolean;
  handleExport: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="card-card overflow-hidden flex flex-col">
      {/* Section tabs */}
      <div className="flex gap-0.5 border-b border-border/30 px-4 overflow-x-auto bg-bg-muted/20 no-scrollbar">
        {sectionKeys.map(s => (
          <button key={s.key} onClick={() => setPreviewSection(s.key)}
            className={cn(
              "text-xs px-3 py-2.5 border-b-2 -mb-[1px] transition-colors shrink-0 whitespace-nowrap font-medium",
              previewSection === s.key
                ? "border-primary text-primary"
                : "border-transparent text-fg-muted hover:text-fg"
            )}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="p-5 sm:p-7 max-h-[650px] overflow-y-auto">
        <div className="prose prose-sm max-w-none font-serif-leading"
          dangerouslySetInnerHTML={{
            __html: renderMd(sectionKeys.find(s => s.key === previewSection)?.content ?? "")
          }} />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-5 pb-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
            <AlertTriangle className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700">{warnings.join("; ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
