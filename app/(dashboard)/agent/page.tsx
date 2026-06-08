"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Sparkles, Zap, FileText, Target, BookOpen,
  Clock, CheckCircle2, Loader2, AlertTriangle, ArrowRight,
  Plus, Play, RotateCcw, ExternalLink, ChevronRight,
  Brain, Lightbulb, MessageSquare, Upload, Layers, History,
  X, Download, Edit3, Trash2, Search, Globe,
  GraduationCap, Dumbbell, Mic, FileUp, Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/page-transition";
import { TutorBackground } from "@/components/ui/module-backgrounds";
import { TASK_TEMPLATES, getAvailableTools, getToolInfo } from "@/lib/agent/tool-registry";
import type { AgentTask, AgentTaskInput, TimelineEvent, AgentToolName } from "@/lib/agent/types";
import type { AgentArtifact } from "@/lib/agent/artifact-types";
import { ArtifactRenderer } from "@/components/agent/artifact-renderer";
import { OutcomeDocument } from "@/components/agent/outcome-document";
import type { IntentType } from "@/lib/today/intent-router";
import { OutcomeActionsBar } from "@/components/agent/outcome-actions-bar";
import { readFileAsText, isSupportedFile, isLargeFile, formatFileSize } from "@/lib/file/file-reader";
import { saveArtifact, getArtifact, listArtifacts } from "@/lib/artifact/artifact-store";
import { evaluateQualityV2 } from "@/lib/agent/quality-gate-v2";
import type { Artifact } from "@/lib/artifact/types";
import { createArtifactId } from "@/lib/artifact/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
const VoiceInput = dynamic(() => import("@/components/agent/voice-input"), { ssr: false });

type View = "templates" | "running" | "result" | "tasks";

// ── Artifact History (localStorage) ────────────────────────────

function loadArtifactHistory(): AgentArtifact[] {
  try { const r = localStorage.getItem("mango-artifacts-v1"); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveArtifactHistory(artifacts: AgentArtifact[]) {
  try { localStorage.setItem("mango-artifacts-v1", JSON.stringify(artifacts.slice(0, 50))); } catch {}
}

// ── Legacy task store ──────────────────────────────────────────

function loadTasks(): AgentTask[] {
  try { const r = localStorage.getItem("mango-agent-tasks-v1"); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveTasks(tasks: AgentTask[]) { try { localStorage.setItem("mango-agent-tasks-v1", JSON.stringify(tasks.slice(0, 50))); } catch {} }

function AgentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = React.useState<View>("templates");
  const [tasks, setTasks] = React.useState<AgentTask[]>([]);
  const [activeTask, setActiveTask] = React.useState<AgentTask | null>(null);
  const [composeInput, setComposeInput] = React.useState("");
  const [composeFiles, setComposeFiles] = React.useState<AgentTaskInput[]>([]);
  const [fileUploading, setFileUploading] = React.useState(false);
  const [timeline, setTimeline] = React.useState<TimelineEvent[]>([]);
  const [artifact, setArtifact] = React.useState<AgentArtifact | null>(null);
  const [artifactHistory, setArtifactHistory] = React.useState<AgentArtifact[]>([]);
  const [expandedOutputId, setExpandedOutputId] = React.useState<string | null>(null);
  const [savedToLibrary, setSavedToLibrary] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [intentType, setIntentType] = React.useState<string>("");
  const [tabHint, setTabHint] = React.useState<string>(""); // V14.7.1: tab=knowledge hint
  const [proMode, setProMode] = React.useState(false);
  const [researchStages, setResearchStages] = React.useState<any[]>([]);
  const [researchSources, setResearchSources] = React.useState<any[]>([]);
  const [networkAvailable, setNetworkAvailable] = React.useState(true);
  const [qualityV3, setQualityV3] = React.useState<any>(null);
  const [deepenRounds, setDeepenRounds] = React.useState(0);
  const [taskFailed, setTaskFailed] = React.useState(false); // V14.8.1: Pro/Admin hard gate fail
  const [failedDims, setFailedDims] = React.useState<any[]>([]); // V14.8.1: failed dimensions detail
  const [plan] = React.useState(() => {
    try { return localStorage.getItem("mango-user-plan") || "standard"; } catch { return "standard"; }
  });
  const availableTools = getAvailableTools(plan);

  // ── Parse markdown into sections for OutcomeDocument (V14.7.1) ──
  function parseMarkdownSections(md: string): { title: string; content: string }[] {
    if (!md) return [];
    const sections: { title: string; content: string }[] = [];
    const lines = md.split("\n");
    let currentTitle = "";
    let currentContent: string[] = [];
    for (const line of lines) {
      if (/^###?\s/.test(line)) {
        if (currentTitle || currentContent.length > 0) {
          sections.push({ title: currentTitle || "概述", content: currentContent.join("\n").trim() });
        }
        currentTitle = line.replace(/^###?\s*/, "").trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    if (currentTitle || currentContent.length > 0) {
      sections.push({ title: currentTitle || "概述", content: currentContent.join("\n").trim() });
    }
    return sections.length > 0 ? sections : [{ title: "内容", content: md.trim() }];
  }

  function qualityGrade(score: number): string {
    if (score >= 80) return "excellent";
    if (score >= 60) return "passed";
    if (score >= 40) return "partial";
    return "failed";
  }

  React.useEffect(() => { setTasks(loadTasks().slice(0, 20)); setArtifactHistory(loadArtifactHistory().slice(0, 20)); }, []);

  // ── Read Mango Today intent from URL params (V14.7.1 fix) ────
  const intentLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (intentLoadedRef.current) return;
    const q = searchParams.get("q");
    const intent = searchParams.get("intent");
    const tab = searchParams.get("tab");
    if (q) {
      intentLoadedRef.current = true;
      setComposeInput(q);
      setIntentType(intent ?? "");
    }
    if (tab === "knowledge") {
      setTabHint("请粘贴笔记内容或点击「上传」按钮上传文件，Agent 将为你整理为结构化笔记。");
    }
  }, [searchParams]);

  function startFromTemplate(templateId: string) {
    const tpl = TASK_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    setComposeInput(tpl.intent);
    setTimeout(() => document.getElementById("agent-compose")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  // ── Execute task → AgentArtifact ─────────────────────────────

  async function executeTask() {
    if (!composeInput.trim()) return;
    setView("running");
    setArtifact(null);
    setTaskFailed(false);
    setFailedDims([]);
    const taskId = `task-${Date.now()}`;
    const iso = new Date().toISOString();
    const events: TimelineEvent[] = [];
    const addEvent = (type: TimelineEvent["type"], message: string, toolName?: AgentToolName) => {
      events.push({ id: `ev-${events.length}`, timestamp: new Date().toISOString(), type, message, toolName, status: type === "error" ? "error" : "done" });
      setTimeline([...events]);
    };

    addEvent("thinking", "Agent 分析任务中…");
    try {
      const res = await fetch("/api/agent/execute", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: composeInput, files: composeFiles.filter(f => !f.value.startsWith("⚠️") && !f.value.startsWith("文件")).map(f => ({ name: f.label ?? f.value, text: f.value ?? "" })) }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        addEvent("error", (errData as any).error || (errData as any).retryHint || `请求失败 (${res.status})`);
        setView("result");
        return;
      }
      const data = await res.json();
      const a: AgentArtifact = data.artifact;
      // V14.7.2: Capture research pipeline data
      setProMode(data.proMode === true);
      if (data.researchPipeline) {
        const rp = data.researchPipeline;
        for (const s of rp.stages ?? []) addEvent(s.status === "done" ? "tool_end" : "thinking", s.detail || s.label, "web_research" as AgentToolName);
        setResearchStages(rp.stages ?? []);
        setResearchSources(rp.sources ?? []);
        setNetworkAvailable(rp.networkAvailable !== false);
        if (data.qualityV3) setQualityV3(data.qualityV3);
        if (data.qualityV3?.deepenRound !== undefined) setDeepenRounds(data.qualityV3.deepenRound);
        // V14.8.1: Capture failed dimensions for Pro/Admin hard gate
        if (!data.success && data.failedDimensions) setFailedDims(data.failedDimensions);
        setTaskFailed(!data.success && data.proMode === true);
      } else {
        setResearchStages([]);
        setResearchSources([]);
      }
      if (a) {
        for (const ev of a.timeline ?? []) addEvent(ev.type === "error" ? "error" : ev.status === "running" ? "thinking" : "tool_end", ev.message, ev.toolName);
        addEvent("output", a.artifactSummary || "生成完成");
        setArtifact(a);
        const hist = loadArtifactHistory(); hist.unshift(a); saveArtifactHistory(hist.slice(0, 30)); setArtifactHistory(hist.slice(0, 30));
        const task: AgentTask = { id: taskId, title: a.artifactTitle || composeInput.slice(0, 40), intent: composeInput, status: "completed", inputs: [{ type: "text", value: composeInput }, ...composeFiles], timeline: events, toolsUsed: a.toolsUsed, outputs: [{ id: `out-${Date.now()}`, type: "summary", title: a.artifactTitle, content: { summary: a.artifactSummary, markdown: a.artifactMarkdown }, linkedIds: [], editable: true, saved: true }], sources: a.sources.map(s => s.title), qualityScore: a.qualityScore, createdAt: iso, updatedAt: iso, completedAt: iso };
        setActiveTask(task); const all = [task, ...tasks]; setTasks(all); saveTasks(all); setView("result"); return;
      }
      addEvent("error", "生成返回为空，请重试。");
    } catch (err) {
      addEvent("error", `网络请求失败: ${err instanceof Error ? err.message : "请检查网络连接后重试"}`);
    }
    setView("result");
  }

  function deleteTask(id: string) { const f = tasks.filter(t => t.id !== id); setTasks(f); saveTasks(f); }
  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files) return;
    for (const f of Array.from(files)) {
      setFileUploading(true);
      const result = await readFileAsText(f);
      setFileUploading(false);
      if (result.error) {
        setComposeFiles(prev => [...prev, { type: "file" as const, value: result.error ?? "文件读取失败", label: `⚠️ ${f.name}`, mimeType: f.type }]);
      } else if (!isSupportedFile(f)) {
        setComposeFiles(prev => [...prev, { type: "file" as const, value: `⚠️ 暂不支持此格式 (${f.type || f.name.split('.').pop()})，请使用 txt/md/csv/json`, label: `⚠️ ${f.name}`, mimeType: f.type }]);
      } else {
        const text = (result.text ?? "").slice(0, 8000);
        setComposeFiles(prev => [...prev, { type: "file" as const, value: text, label: `${f.name} (${formatFileSize(f.size)})`, mimeType: f.type }]);
      }
    }
  }

  return (
    <PageTransition>
    <div className="relative flex flex-col gap-6 pb-20">
      <TutorBackground />
      <header className="relative z-10 flex items-center justify-between">
        <div><h1 className="text-display font-serif">Mango Agent</h1><p className="text-sm text-fg-muted">任务执行 · 结构化产出 · 智能工具</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setView("tasks"); setArtifactHistory(loadArtifactHistory().slice(0, 20)); }} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors", view === "tasks" ? "bg-primary-subtle text-primary" : "text-fg-muted hover:text-fg")}><History className="size-3.5" /> 历史</button>
          <button onClick={() => setView("templates")} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors", view === "templates" ? "bg-primary-subtle text-primary" : "text-fg-muted hover:text-fg")}><Sparkles className="size-3.5" /> 模板</button>
        </div>
      </header>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* ═══ TEMPLATES ═══ */}
          {view === "templates" && (
            <motion.div key="templates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2"><Zap className="size-4 text-primary" /><span className="text-sm font-medium">选择任务模板开始</span></div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {TASK_TEMPLATES.map(tpl => (
                  <motion.button key={tpl.id} whileTap={{ scale: 0.98 }} onClick={() => startFromTemplate(tpl.id)} className="card-card p-4 flex flex-col gap-3 text-left hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between"><span className="text-2xl">{tpl.icon}</span><ArrowRight className="size-4 text-fg-subtle/80 group-hover:text-primary transition-all" /></div>
                    <div><p className="text-sm font-semibold font-serif">{tpl.title}</p><p className="text-xs text-fg-muted">{tpl.description}</p></div>
                    <div className="flex flex-wrap gap-1 mt-auto">{tpl.suggestedTools.slice(0, 3).map(t => <span key={t} className="text-[9px] rounded-full px-2 py-0.5 bg-bg-muted text-fg-muted">{getToolInfo(t)?.label ?? t}</span>)}</div>
                  </motion.button>
                ))}
              </div>
              <div id="agent-compose" className="card-card p-5 flex flex-col gap-3 mt-4 scroll-mt-20">
                <div className="flex items-center gap-2"><MessageSquare className="size-4 text-primary" /><span className="text-sm font-medium font-serif">自由描述任务</span>
                {plan === "guest" && <span className="text-[10px] rounded-full bg-amber-50 text-amber-600 px-2 py-0.5 font-medium">游客演示</span>}
                {plan === "standard" && <span className="text-[10px] rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 font-medium">Standard</span>}
                {plan === "pro" && <span className="text-[10px] rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 font-medium">Pro</span>}
                </div>
                <Textarea value={composeInput} onChange={e => setComposeInput(e.target.value)} placeholder="用自然语言描述你想做的事…" className="text-sm min-h-24 rounded-xl" />
                {tabHint && <p className="text-xs text-primary/70 bg-primary-subtle rounded-xl px-3 py-2">{tabHint}</p>}
                <div className="flex items-center gap-2">
                  <VoiceInput onTranscript={(text) => setComposeInput(prev => prev + " " + text)} />
                  <label className="cursor-pointer flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg"><FileUp className="size-3.5" />上传<input type="file" multiple onChange={handleFileInput} className="hidden" /></label>
                  {composeFiles.length > 0 && <span className="text-[10px] text-fg-muted">{composeFiles.length} 个文件</span>}
                  <Button onClick={executeTask} disabled={!composeInput.trim()} className="gap-2 rounded-xl ml-auto"><Play className="size-4" />执行</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ RUNNING ═══ */}
          {view === "running" && (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-card p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="size-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/20"><span className="text-2xl">🥭</span></motion.div>
                <div><p className="text-base font-semibold font-serif">{timeline.length <= 2 ? "Agent 分析任务中…" : "正在执行…"}</p><p className="text-xs text-fg-muted">{composeInput.slice(0, 60)}</p></div>
              </div>
              <div className="text-xs text-fg-muted/90 bg-bg-subtle rounded-xl p-3 space-y-1.5 max-h-48 overflow-y-auto">
                {timeline.map((ev, i) => (
                  <div key={ev.id} className="flex items-start gap-2">
                    {ev.status === "done" ? <CheckCircle2 className="size-3 text-emerald-500 mt-0.5 shrink-0" /> :
                     ev.type === "error" ? <AlertTriangle className="size-3 text-red-400 mt-0.5 shrink-0" /> :
                     <Loader2 className="size-3 animate-spin text-amber-400 mt-0.5 shrink-0" />}
                    <span className={ev.type === "error" ? "text-red-500" : "text-fg-muted/90"}>{ev.message}</span>
                    {ev.toolName && <span className="text-[9px] text-fg-subtle/90 ml-auto shrink-0">{getToolInfo(ev.toolName)?.label ?? ev.toolName}</span>}
                  </div>
                ))}
                {timeline.length === 0 && "🧠 正在理解需求，规划执行方案…"}
                {plan === "guest" && <p className="mt-2 text-amber-500/80">⚠️ 游客模式使用本地演示，登录后可获得完整 AI 能力。</p>}
              </div>
            </motion.div>
          )}

          {/* ═══ RESULT ═══ */}
          {view === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => { setView("templates"); setArtifact(null); setSavedToLibrary(false); }} className="gap-1.5 rounded-xl text-xs"><Plus className="size-3.5" />新任务</Button>
              </div>
              {/* V14.8.1: Pro/Admin hard gate FAILED banner */}
              {taskFailed && (
                <div className="card-card p-5 bg-red-50/50 border border-red-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-red-500" />
                    <p className="text-sm font-semibold text-red-700">Pro 成品未达标</p>
                  </div>
                  <p className="text-xs text-red-600">
                    当前质量评分 {qualityV3?.percentage || artifact?.qualityScore}分，Pro 要求 ≥90 分。
                    已自动深化 {deepenRounds || (qualityV3?.deepenRound ?? 0)} 次，仍未通过。
                  </p>
                  {failedDims.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-red-500">未达标维度：</p>
                      {failedDims.map((d: any) => (
                        <p key={d.key} className="text-[10px] text-red-500/80">• {d.label}: {d.score}分 — {d.suggestion || "需改进"}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" onClick={executeTask} className="rounded-lg gap-1 text-xs"><RotateCcw className="size-3" />重新生成</Button>
                    <p className="text-[10px] text-red-400">建议补充资料或修改任务描述后重试</p>
                  </div>
                </div>
              )}
              {artifact ? (
                <>
                <ArtifactRenderer
                  artifact={artifact}
                  onClose={() => setView("templates")}
                  onRegenerate={executeTask}
                />
                <OutcomeDocument
                  title={artifact.artifactTitle || composeInput.slice(0, 60)}
                  summary={artifact.artifactSummary || ""}
                  sections={parseMarkdownSections(artifact.artifactMarkdown || "")}
                  qualityScore={artifact.qualityScore || 0}
                  qualityGrade={qualityGrade(artifact.qualityScore || 0)}
                  intentType={(intentType || artifact.taskType || "general") as IntentType}
                  generatedAt={artifact.createdAt || new Date().toISOString()}
                />
                {/* V14.7.4: Pro/Standard/Guest mode label + research sources */}
                {researchSources.length > 0 && (
                  <div className="card-card p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {proMode ? (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">Pro Research</span>
                      ) : (
                        <span className="text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">Standard 搜索</span>
                      )}
                      <span className="text-[10px] text-fg-muted/90">{researchSources.length} 条来源 · {
                        proMode ? "完整联网研究已执行" : "轻量联网搜索已完成"
                      }</span>
                    </div>
                    <div className="space-y-1.5">
                      {researchSources.slice(0, 8).map((s: any, i: number) => (
                        <a key={i} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 rounded-xl bg-bg-subtle hover:bg-primary-subtle/50 p-2.5 transition-colors group">
                          <span className="shrink-0 mt-0.5 text-[10px] font-bold text-fg-subtle/90 bg-white/60 rounded px-1 py-0.5">{s.platform || s.source || "web"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-fg group-hover:text-primary truncate">{s.title || "未命名来源"}</p>
                            {s.snippet && <p className="text-[10px] text-fg-muted/90 mt-0.5 line-clamp-2">{s.snippet}</p>}
                          </div>
                          <ExternalLink className="size-3 text-fg-subtle/90 group-hover:text-primary shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {!proMode && artifact && researchSources.length === 0 && (
                  <p className="text-[11px] text-fg-muted/90 text-center bg-bg-subtle rounded-xl px-3 py-2">Standard 轻量模式：本次搜索未获得可用来源。升级 Pro 可获得多源研究 + 证据支撑。</p>
                )}
                {!networkAvailable && (
                  <p className="text-[11px] text-amber-600/80 bg-amber-50/60 rounded-lg px-3 py-1.5 text-center">⚠️ 网络不可用，本次生成未使用实时搜索。内容基于 AI 知识生成。</p>
                )}
                {/* V14.7.5: Quality Gate V3 breakdown */}
                {qualityV3 && (
                  <div className="card-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">质量评估</span>
                      <span className={`text-xs font-bold ${qualityV3.passed ? "text-emerald-600" : "text-amber-600"}`}>
                        {qualityV3.percentage}/100 · {qualityV3.tier === "pro" || qualityV3.tier === "admin" ? `要求 ≥${qualityV3.thresholdRequired}` : ""}
                        {deepenRounds > 0 && ` · 深化 ${deepenRounds} 次`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {(qualityV3.dimensions || []).slice(0, 8).map((d: any) => (
                        <div key={d.key} className="flex items-center justify-between text-[10px] bg-bg-subtle rounded-lg px-2 py-1">
                          <span className={d.passed ? "text-fg-muted/90" : "text-amber-600"}>{d.label}</span>
                          <span className={`font-semibold ${d.passed ? "text-fg" : "text-amber-600"}`}>{d.score}/{d.maxScore}</span>
                        </div>
                      ))}
                    </div>
                    {qualityV3.improvementHints?.length > 0 && (
                      <details className="text-[10px] text-amber-600/80">
                        <summary className="cursor-pointer font-medium">改进建议 ({qualityV3.improvementHints.length})</summary>
                        <ul className="mt-1 space-y-0.5 list-disc list-inside">
                          {qualityV3.improvementHints.map((h: string, i: number) => <li key={i}>{h}</li>)}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
                <OutcomeActionsBar
                  onCopy={() => { navigator.clipboard.writeText(artifact.artifactMarkdown || "").then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {}); }}
                  copied={copied}
                  onExportMD={() => {
                    const blob = new Blob([artifact.artifactMarkdown || ""], { type: "text/markdown;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `${artifact.artifactTitle || "artifact"}.md`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  onExportHTML={() => {
                    let md = artifact.artifactMarkdown || "";
                    // Basic markdown → HTML
                    let htmlBody = md
                      .replace(/### (.+)/g, "<h3>$1</h3>")
                      .replace(/## (.+)/g, "<h2>$1</h2>")
                      .replace(/# (.+)/g, "<h1>$1</h1>")
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.+?)\*/g, "<em>$1</em>")
                      .replace(/`([^`]+)`/g, "<code>$1</code>")
                      .replace(/^- (.+)/gm, "<li>$1</li>")
                      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
                      .replace(/\n\n/g, "</p><p>")
                      .replace(/\n/g, "<br>");
                    htmlBody = "<p>" + htmlBody + "</p>";
                    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${artifact.artifactTitle || "生成结果"}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.8;color:#1a1a1a}h1{font-size:1.5rem}h2{font-size:1.25rem;margin-top:1.5rem}h3{font-size:1.1rem;margin-top:1rem}code{background:#f0f0f0;padding:0.15em 0.4em;border-radius:4px;font-size:0.9em}li{margin:0.25em 0}</style></head><body>${htmlBody}</body></html>`;
                    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `${artifact.artifactTitle || "artifact"}.html`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  onExportPDF={() => {
                    const title = artifact.artifactTitle || "生成结果";
                    const content = artifact.artifactMarkdown || "";
                    const sourcesText = researchSources.length > 0
                      ? researchSources.map((s: any, i: number) => `[${i + 1}] ${s.title} — ${s.url}`).join("\n")
                      : "";
                    const dateStr = new Date().toISOString().slice(0, 10);
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1.5rem;line-height:1.8;color:#1a1a1a}h1{font-size:1.4rem;border-bottom:2px solid #e0e0e0;padding-bottom:0.5rem}h2{font-size:1.15rem;margin-top:1.5rem}h3{font-size:1rem}code{background:#f0f0f0;padding:0.15em 0.4em;border-radius:3px}pre{background:#f5f5f5;padding:1rem;border-radius:8px;overflow-x:auto}.sources{font-size:0.8rem;color:#666;border-top:1px solid #e0e0e0;margin-top:2rem;padding-top:1rem}.meta{font-size:0.75rem;color:#999;margin-bottom:1.5rem}@media print{body{margin:0;padding:0 1cm}}</style></head><body><h1>${title}</h1><div class="meta">MangoOS · ${dateStr} · 质量 ${qualityV3?.percentage || artifact.qualityScore || 0}分</div><div>${content.replace(/\n/g, "<br>")}</div>${sourcesText ? `<div class="sources"><h3>参考来源</h3><pre>${sourcesText}</pre></div>` : ""}</body></html>`);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  onSave={async () => {
                    const now = new Date().toISOString();
                    const parsedSections = parseMarkdownSections(artifact.artifactMarkdown || "");
                    const libArtifact: Artifact = {
                      id: createArtifactId(), type: "general", status: "complete",
                      title: artifact.artifactTitle || composeInput.slice(0, 80),
                      summary: artifact.artifactSummary || "",
                      content: artifact.artifactMarkdown || "",
                      sections: parsedSections.map((s, i) => ({ id: `sec_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, title: s.title, content: s.content, order: i, importance: i === 0 ? "high" as const : "medium" as const })),
                      tags: [intentType || artifact.taskType || "agent"], qualityScore: artifact.qualityScore || 0,
                      sources: (artifact.sources || []).map(s => ({ id: `s_${Date.now()}`, title: s.title || "", url: s.url, platform: s.source || "ai-generated", relevance: 0.8, reliability: "medium" as const })),
                      originTask: composeInput, exportFormats: ["markdown", "html"],
                      storageMode: "local", owner: "user", planTier: plan as any,
                      createdAt: now, updatedAt: now,
                    };
                    try {
                      await saveArtifact(libArtifact);
                      setSavedToLibrary(true);
                    } catch {
                      setSavedToLibrary(false);
                      alert("保存失败，请重试。如持续失败请检查浏览器存储空间。");
                    }
                  }}
                  saved={savedToLibrary}
                  onContinue={() => { setComposeInput(artifact.artifactTitle || composeInput); setView("templates"); }}
                />
                </>
              ) : (
                <div className="card-card p-8 text-center">
                  <AlertTriangle className="size-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm font-medium">生成未完成</p>
                  <p className="text-xs text-fg-muted/90 mt-1">{timeline.find(e => e.type === "error")?.message || "请返回重试或检查 AI 服务配置"}</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button onClick={executeTask} className="rounded-xl gap-1.5"><RotateCcw className="size-3.5" />重试</Button>
                    <Button variant="outline" onClick={() => setView("templates")} className="rounded-xl">返回模板</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ HISTORY ═══ */}
          {view === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <div className="relative"><Search className="size-4 absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle/90" /><Input placeholder="搜索历史…" className="pl-10 h-11 rounded-xl" /></div>
              {artifactHistory.length === 0 ? (
                <div className="card-card p-8 text-center"><Bot className="size-10 text-fg-muted/20 mx-auto mb-3" /><p className="text-sm font-medium text-fg-muted">暂无执行记录</p><p className="text-xs text-fg-muted/80 mt-1">完成 Agent 任务后自动保存</p></div>
              ) : (
                <div className="flex flex-col gap-2">
                  {artifactHistory.map(a => (
                    <div key={a.id} className="card-card p-4 flex items-center gap-4 group hover:shadow-sm transition-all cursor-pointer" onClick={() => { setArtifact(a); setView("result"); }}>
                      <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", a.status === "completed" ? "bg-emerald-100" : "bg-amber-100")}>
                        {a.status === "completed" ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{a.artifactTitle || "未命名"}</p><p className="text-[10px] text-fg-muted">{new Date(a.createdAt).toLocaleDateString("zh-CN")} · {a.qualityScore}分</p></div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); const hist = artifactHistory.filter(h => h.id !== a.id); setArtifactHistory(hist); saveArtifactHistory(hist); }} className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="size-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageTransition>
  );
}

export default function AgentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-fg-muted">加载中…</div>}>
      <AgentPageInner />
    </Suspense>
  );
}
