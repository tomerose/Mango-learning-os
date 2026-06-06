"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, BookOpen, FileText, Download, FileOutput, Printer,
  Search, Loader2, Sparkles, CheckCircle2, AlertTriangle,
  ExternalLink, ChevronRight, Clock, Target, Tag, Globe,
  Github, Youtube, FileUp, X, Layers, Shield, Eye, Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { qualityBadge } from "@/lib/ai/content-quality-v2";
import type { ResearchSource } from "@/lib/ai/research-orchestrator";
import type { QualityReport } from "@/lib/ai/content-quality-v2";

/* ═══════════════════════════════════════════════════════════════
   Exam Review Tab — Full exam preparation module
   Input → Research → Source Cards → Generate → Export
   ═══════════════════════════════════════════════════════════════ */

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

type Step = "input" | "researching" | "sources" | "generating" | "preview" | "error";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  web: <Globe className="size-3" />,
  academic: <BookOpen className="size-3" />,
  github: <Github className="size-3" />,
  youtube: <Youtube className="size-3" />,
  official: <Shield className="size-3" />,
  local: <FileUp className="size-3" />,
  zhihu: <Target className="size-3" />,
};

const RELIABILITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "高可信度", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "中等可信", color: "bg-amber-50 text-amber-700 border-amber-200" },
  low: { label: "低可信度", color: "bg-red-50 text-red-700 border-red-200" },
};

function getReliabilityLabel(score: number) {
  if (score >= 0.8) return RELIABILITY_LABELS.high;
  if (score >= 0.5) return RELIABILITY_LABELS.medium;
  return RELIABILITY_LABELS.low;
}

export function ExamReviewTab() {
  // ── Input state ──────────────────────────────────────────
  const [step, setStep] = React.useState<Step>("input");
  const [courseName, setCourseName] = React.useState("");
  const [school, setSchool] = React.useState("");
  const [professor, setProfessor] = React.useState("");
  const [textbook, setTextbook] = React.useState("");
  const [examScope, setExamScope] = React.useState("");
  const [targetScore, setTargetScore] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState("");
  const [additionalNotes, setAdditionalNotes] = React.useState("");

  // ── Results state ────────────────────────────────────────
  const [reviewPackage, setReviewPackage] = React.useState<ReviewPackage | null>(null);
  const [sources, setSources] = React.useState<ResearchSource[]>([]);
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);

  // ── Preview state ────────────────────────────────────────
  const [previewSection, setPreviewSection] = React.useState<string>("courseOverview");
  const [exportFormat, setExportFormat] = React.useState<"docx" | "pdf" | "md">("docx");
  const [exporting, setExporting] = React.useState(false);

  // ── Uploaded files ───────────────────────────────────────
  const [uploadedFiles, setUploadedFiles] = React.useState<Array<{ name: string; text: string }>>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  // ── Generate ────────────────────────────────────────────
  async function handleGenerate() {
    if (!courseName.trim()) return;
    setStep("researching");
    setError("");
    setWarnings([]);

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

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "生成失败");
      }

      setReviewPackage(data.reviewPackage);
      setSources(data.reviewPackage.sources ?? []);
      setWarnings(data.warnings ?? []);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
      setStep("error");
    }
  }

  // ── Export ───────────────────────────────────────────────
  async function handleExport() {
    if (!reviewPackage) return;
    setExporting(true);
    try {
      const res = await fetch("/api/exam-review/export", {
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
        const ext = exportFormat === "docx" ? "doc" : exportFormat === "md" ? "md" : "html";
        a.download = `${reviewPackage.meta.courseName}_复习讲义.${ext}`;
        a.click();
        URL.revokeObjectURL(url);

        // For PDF, open in new window for print
        if (exportFormat === "pdf") {
          const html = await blob.text();
          const w = window.open("", "_blank");
          if (w) {
            w.document.write(html);
            w.document.close();
            setTimeout(() => w.print(), 500);
          }
        }
      }
    } catch (err) {
      setError(`导出失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setExporting(false);
    }
  }

  const qualityBadgeData = reviewPackage
    ? qualityBadge(reviewPackage.qualityReport)
    : null;

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

  // Simple markdown → HTML renderer for preview
  function renderMd(text: string): string {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-bg-muted rounded px-1 py-0.5 text-xs">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input Form ── */}
      {step === "input" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="size-5 text-primary" />
            <span className="text-base font-semibold">期末备考 · 复习讲义生成</span>
          </div>
          <p className="text-sm text-fg-muted -mt-1">
            输入课程信息，AI 将自动搜索在线资源 + 分析上传文件，生成完整的考试复习讲义。
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium mb-1 block">课程名称 *</label>
              <Input value={courseName} onChange={e => setCourseName(e.target.value)}
                placeholder="如：商务英语3、微积分B" className="text-sm" autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">学校（可选）</label>
              <Input value={school} onChange={e => setSchool(e.target.value)}
                placeholder="如：对外经济贸易大学" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">教授/老师（可选）</label>
              <Input value={professor} onChange={e => setProfessor(e.target.value)}
                placeholder="授课教师姓名" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">教材（可选）</label>
              <Input value={textbook} onChange={e => setTextbook(e.target.value)}
                placeholder="主要教材名称" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">考试范围（可选）</label>
              <Input value={examScope} onChange={e => setExamScope(e.target.value)}
                placeholder="如：第1-8章 或 整本书" className="text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block">目标分数（可选）</label>
                <Input value={targetScore} onChange={e => setTargetScore(e.target.value)}
                  placeholder="如：90+ / A / 及格" className="text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block">剩余时间（可选）</label>
                <Input value={timeLeft} onChange={e => setTimeLeft(e.target.value)}
                  placeholder="如：2周 / 7天" className="text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">补充说明（可选）</label>
            <Textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="任何额外的信息：重点章节、已复习内容、难点等…" className="text-sm min-h-20" />
          </div>

          {/* File upload */}
          <div>
            <label className="text-xs font-medium mb-1 block">上传资料（可选）</label>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept=".docx,.pdf,.md,.txt"
                multiple onChange={handleFileUpload}
                className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs" />
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

          <Button onClick={handleGenerate} disabled={!courseName.trim()} size="lg" className="self-start gap-2">
            <Sparkles className="size-4" /> 生成复习讲义
          </Button>
        </motion.div>
      )}

      {/* ── Researching ── */}
      {step === "researching" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="size-8 text-primary animate-spin" />
          <div className="text-center">
            <p className="text-base font-medium">正在生成复习讲义…</p>
            <p className="text-sm text-fg-muted mt-1">
              搜索在线资源 → 分析资料 → 生成结构化讲义（约需30-60秒）
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-fg-muted max-w-md">
            <div className="flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-500" /> 查询扩展</div>
            <div className="flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> 多源搜索 (Web + GitHub + Academic)</div>
            <div className="flex items-center gap-2 text-fg-muted/40">源排序与去重</div>
            <div className="flex items-center gap-2 text-fg-muted/40">AI 生成讲义 (18个section)</div>
            <div className="flex items-center gap-2 text-fg-muted/40">质量检查与导出准备</div>
          </div>
        </motion.div>
      )}

      {/* ── Error ── */}
      {step === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-card p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            <span className="font-medium">生成失败</span>
          </div>
          <p className="text-sm text-fg-muted">{error}</p>
          <Button variant="outline" onClick={() => { setStep("input"); setError(""); }}>返回重试</Button>
        </motion.div>
      )}

      {/* ── Preview ── */}
      {step === "preview" && reviewPackage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          {/* Meta bar */}
          <div className="card-card p-4 flex items-center gap-4 flex-wrap">
            {qualityBadgeData && (
              <span className="text-[11px] rounded-full px-2.5 py-1 font-medium"
                style={{ backgroundColor: qualityBadgeData.color, color: qualityBadgeData.textColor }}>
                {qualityBadgeData.label} ({reviewPackage.meta.qualityScore}分)
              </span>
            )}
            <span className="text-xs text-fg-muted flex items-center gap-1">
              <Search className="size-3" /> {reviewPackage.meta.sourceCount} 个来源
            </span>
            <span className="text-xs text-fg-muted flex items-center gap-1">
              <Clock className="size-3" /> {new Date(reviewPackage.meta.generatedAt).toLocaleString("zh-CN")}
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <select value={exportFormat} onChange={e => setExportFormat(e.target.value as "docx" | "pdf" | "md")}
                className="text-xs border border-border rounded-md px-2 py-1.5 bg-bg-surface">
                <option value="docx">Word (.doc)</option>
                <option value="pdf">PDF (打印)</option>
                <option value="md">Markdown</option>
              </select>
              <Button size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
                {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                导出
              </Button>
            </div>
          </div>

          {/* Source cards */}
          {sources.length > 0 && (
            <div className="card-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Globe className="size-3.5 text-primary" /> 研究来源 ({sources.length})
                </span>
                {warnings.length > 0 && (
                  <span className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="size-3" /> {warnings.join("; ")}
                  </span>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sources.map(s => {
                  const rel = getReliabilityLabel(s.reliabilityScore);
                  return (
                    <a key={s.id} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 w-52 rounded-lg border border-border/50 p-3 hover:border-primary/30 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {PLATFORM_ICONS[s.platform] ?? <Globe className="size-3" />}
                        <span className="text-[10px] font-medium text-fg-muted uppercase">{s.platform}</span>
                        <span className={cn("text-[9px] rounded-full px-1.5 py-0.5 border ml-auto", rel.color)}>
                          {rel.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">{s.title}</p>
                      <p className="text-[10px] text-fg-muted mt-1 line-clamp-2">{s.summary}</p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-fg-muted/60">
                        <Tag className="size-2.5" />
                        相关度 {Math.round(s.relevanceScore * 100)}% · 可信度 {Math.round(s.reliabilityScore * 100)}%
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section viewer */}
          <div className="card-card overflow-hidden">
            {/* Section tabs */}
            <div className="flex gap-0.5 border-b border-border/30 px-4 overflow-x-auto bg-bg-muted/20">
              {sectionKeys.map(s => (
                <button key={s.key} onClick={() => setPreviewSection(s.key)}
                  className={cn(
                    "text-xs px-3 py-2.5 border-b-2 -mb-[1px] transition-colors shrink-0 whitespace-nowrap",
                    previewSection === s.key
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-fg-muted hover:text-fg"
                  )}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Section content */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderMd(sectionKeys.find(s => s.key === previewSection)?.content ?? "")
                }} />
            </div>
          </div>

          {/* Regenerate button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setStep("input")} className="gap-2">
              <Edit3 className="size-3.5" /> 修改输入重新生成
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
