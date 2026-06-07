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

export default function AgentPage() {
  const [view, setView] = React.useState<View>("templates");
  const [tasks, setTasks] = React.useState<AgentTask[]>([]);
  const [activeTask, setActiveTask] = React.useState<AgentTask | null>(null);
  const [composeInput, setComposeInput] = React.useState("");
  const [composeFiles, setComposeFiles] = React.useState<AgentTaskInput[]>([]);
  const [timeline, setTimeline] = React.useState<TimelineEvent[]>([]);
  const [artifact, setArtifact] = React.useState<AgentArtifact | null>(null);
  const [artifactHistory, setArtifactHistory] = React.useState<AgentArtifact[]>([]);
  const [expandedOutputId, setExpandedOutputId] = React.useState<string | null>(null);
  const [plan] = React.useState(() => {
    try { return localStorage.getItem("mango-user-plan") || "standard"; } catch { return "standard"; }
  });
  const availableTools = getAvailableTools(plan);

  React.useEffect(() => { setTasks(loadTasks().slice(0, 20)); setArtifactHistory(loadArtifactHistory().slice(0, 20)); }, []);

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
        body: JSON.stringify({ intent: composeInput, files: composeFiles.map(f => ({ name: f.label ?? f.value, text: "" })) }),
      });
      if (res.ok) {
        const data = await res.json();
        const a: AgentArtifact = data.artifact;
        if (a) {
          for (const ev of a.timeline ?? []) addEvent(ev.type === "error" ? "error" : ev.status === "running" ? "thinking" : "tool_end", ev.message, ev.toolName);
          addEvent("output", a.artifactSummary || "生成完成");
          setArtifact(a);
          const hist = loadArtifactHistory(); hist.unshift(a); saveArtifactHistory(hist.slice(0, 30)); setArtifactHistory(hist.slice(0, 30));
          const task: AgentTask = { id: taskId, title: a.artifactTitle || composeInput.slice(0, 40), intent: composeInput, status: "completed", inputs: [{ type: "text", value: composeInput }, ...composeFiles], timeline: events, toolsUsed: a.toolsUsed, outputs: [{ id: `out-${Date.now()}`, type: "summary", title: a.artifactTitle, content: { summary: a.artifactSummary, markdown: a.artifactMarkdown }, linkedIds: [], editable: true, saved: true }], sources: a.sources.map(s => s.title), qualityScore: a.qualityScore, createdAt: iso, updatedAt: iso, completedAt: iso };
          setActiveTask(task); const all = [task, ...tasks]; setTasks(all); saveTasks(all); setView("result"); return;
        }
      }
    } catch {}
    addEvent("error", "AI 服务暂不可用。请检查 AI_API_KEY 配置后重试。");
    setView("result");
  }

  function deleteTask(id: string) { const f = tasks.filter(t => t.id !== id); setTasks(f); saveTasks(f); }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files) return;
    for (const f of Array.from(files)) setComposeFiles(prev => [...prev, { type: "file" as const, value: f.name, label: f.name, mimeType: f.type }]);
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
                    <div className="flex items-start justify-between"><span className="text-2xl">{tpl.icon}</span><ArrowRight className="size-4 text-fg-muted/30 group-hover:text-primary transition-all" /></div>
                    <div><p className="text-sm font-semibold font-serif">{tpl.title}</p><p className="text-xs text-fg-muted">{tpl.description}</p></div>
                    <div className="flex flex-wrap gap-1 mt-auto">{tpl.suggestedTools.slice(0, 3).map(t => <span key={t} className="text-[9px] rounded-full px-2 py-0.5 bg-bg-muted text-fg-muted">{getToolInfo(t)?.label ?? t}</span>)}</div>
                  </motion.button>
                ))}
              </div>
              <div id="agent-compose" className="card-card p-5 flex flex-col gap-3 mt-4 scroll-mt-20">
                <div className="flex items-center gap-2"><MessageSquare className="size-4 text-primary" /><span className="text-sm font-medium font-serif">自由描述任务</span></div>
                <Textarea value={composeInput} onChange={e => setComposeInput(e.target.value)} placeholder="用自然语言描述你想做的事…" className="text-sm min-h-24 rounded-xl" />
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
              <div className="text-xs text-fg-muted/60 bg-bg-subtle rounded-xl p-3">
                {timeline.length <= 2 && "🧠 正在理解需求，规划执行方案…"}
                {timeline.length > 2 && timeline.length < 5 && "🔧 调用工具处理任务…"}
                {timeline.length >= 5 && "📝 整理结果，生成结构化输出…"}
              </div>
              <div className="flex flex-col gap-1.5">
                {timeline.map((ev, i) => (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm", ev.status === "error" ? "bg-red-50 text-red-600" : ev.type === "output" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-fg-muted")}>
                    {ev.status === "done" ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> : ev.status === "error" ? <AlertTriangle className="size-4 shrink-0" /> : <Loader2 className="size-4 animate-spin shrink-0" />}
                    <span>{ev.message}</span>
                    {ev.toolName && <Badge variant="secondary" className="text-[9px] ml-auto">{getToolInfo(ev.toolName)?.label ?? ev.toolName}</Badge>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ RESULT ═══ */}
          {view === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => { setView("templates"); setArtifact(null); }} className="gap-1.5 rounded-xl text-xs"><Plus className="size-3.5" />新任务</Button>
              </div>
              {artifact ? (
                <ArtifactRenderer
                  artifact={artifact}
                  onClose={() => setView("templates")}
                  onRegenerate={executeTask}
                  onExport={(fmt) => {
                    const blob = new Blob([artifact.artifactMarkdown], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `${artifact.artifactTitle || "artifact"}.md`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                />
              ) : (
                <div className="card-card p-8 text-center">
                  <AlertTriangle className="size-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm font-medium">生成未完成</p>
                  <p className="text-xs text-fg-muted/60 mt-1">请返回重试或检查 AI 服务配置</p>
                  <Button onClick={() => setView("templates")} className="mt-4 rounded-xl">返回模板</Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ HISTORY ═══ */}
          {view === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <div className="relative"><Search className="size-4 absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-muted/40" /><Input placeholder="搜索历史…" className="pl-10 h-11 rounded-xl" /></div>
              {artifactHistory.length === 0 ? (
                <div className="card-card p-8 text-center"><Bot className="size-10 text-fg-muted/20 mx-auto mb-3" /><p className="text-sm font-medium text-fg-muted">暂无执行记录</p><p className="text-xs text-fg-muted/50 mt-1">完成 Agent 任务后自动保存</p></div>
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
