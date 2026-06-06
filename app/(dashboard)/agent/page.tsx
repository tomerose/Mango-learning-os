"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Sparkles, Zap, FileText, Target, BookOpen,
  Clock, CheckCircle2, Loader2, AlertTriangle, ArrowRight,
  Plus, Play, Pause, RotateCcw, ExternalLink, ChevronRight,
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
import type { AgentTask, AgentTaskInput, AgentTaskStatus, TimelineEvent, AgentTaskOutput, AgentToolName } from "@/lib/agent/types";
import dynamic from "next/dynamic";
const VoiceInput = dynamic(() => import("@/components/agent/voice-input"), { ssr: false });

/* ═══════════════════════════════════════════════════════════════
   Mango Agent V1 — Personal Learning Engine
   Task Center | Templates | Timeline | Results
   ═══════════════════════════════════════════════════════════════ */

type View = "templates" | "running" | "result" | "tasks";

// ── Task Store (localStorage) ───────────────────────────────────

function loadTasks(): AgentTask[] {
  try { const raw = localStorage.getItem("mango-agent-tasks-v1"); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function saveTasks(tasks: AgentTask[]) { try { localStorage.setItem("mango-agent-tasks-v1", JSON.stringify(tasks.slice(0, 50))); } catch { /* noop */ } }

export default function AgentPage() {
  const [view, setView] = React.useState<View>("templates");
  const [tasks, setTasks] = React.useState<AgentTask[]>([]);
  const [activeTask, setActiveTask] = React.useState<AgentTask | null>(null);
  const [composeInput, setComposeInput] = React.useState("");
  const [composeFiles, setComposeFiles] = React.useState<AgentTaskInput[]>([]);
  const [timeline, setTimeline] = React.useState<TimelineEvent[]>([]);
  const [plan] = React.useState(() => {
    try { return localStorage.getItem("mango-user-plan") || "standard"; } catch { return "standard"; }
  });
  const [expandedOutputId, setExpandedOutputId] = React.useState<string | null>(null);
  const availableTools = getAvailableTools(plan);

  React.useEffect(() => { setTasks(loadTasks().slice(0, 20)); }, []);

  // ── Create task from template ──────────────────────────────
  function startFromTemplate(templateId: string) {
    const tpl = TASK_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    setComposeInput(tpl.intent);
    setComposeFiles([]);
    // Stay in templates view — compose form is already rendered there
    // Scroll to compose area
    setTimeout(() => {
      document.getElementById("agent-compose")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // ── Execute task ───────────────────────────────────────────
  async function executeTask() {
    if (!composeInput.trim()) return;
    setView("running");
    const taskId = `task-${Date.now()}`;
    const iso = new Date().toISOString();
    const events: TimelineEvent[] = [];
    const toolsUsed: AgentTask["toolsUsed"] = [];
    const addEvent = (type: TimelineEvent["type"], message: string, toolName?: AgentTask["toolsUsed"][number]) => {
      events.push({ id: `ev-${events.length}`, timestamp: new Date().toISOString(), type, message, toolName, status: type === "error" ? "error" : "done" });
      setTimeline([...events]);
    };

    // Try real Agent API first
    addEvent("thinking","调用 AI Agent 引擎…");
    try {
      const res = await fetch("/api/agent/execute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({intent:composeInput,files:composeFiles.map(f=>({name:f.label??f.value,text:""}))})});
      if(res.ok){const data=await res.json();for(const ev of data.timeline??[])addEvent(ev.status==="done"?"tool_end":"tool_start",ev.message,ev.tool);addEvent("output",data.summary??"执行完成");
        const apiOuts:AgentTaskOutput[]=(data.outputs??[]).map((o:AgentTaskOutput,i:number)=>({...o,id:`out-${Date.now()}-${i}`,linkedIds:[],editable:true,saved:true}));
        const task:AgentTask={id:taskId,title:composeInput.slice(0,40),intent:composeInput,status:"completed",inputs:[{type:"text",value:composeInput},...composeFiles],timeline:events,toolsUsed:(data.toolsUsed??[]) as AgentTask["toolsUsed"],outputs:apiOuts.length>0?apiOuts:[{id:`out-${Date.now()}-sum`,type:"summary",title:"执行摘要",content:{summary:data.summary??"完成"},linkedIds:[],editable:false,saved:true}],sources:[],qualityScore:data.qualityScore??80,createdAt:iso,updatedAt:iso,completedAt:iso};
        setActiveTask(task);const all=[task,...tasks];setTasks(all);saveTasks(all);setView("result");return;}}catch{/*fall through*/}

    // Simulation fallback
    addEvent("thinking","API 不可用，本地模拟执行…");
    if(composeFiles.length>0){addEvent("tool_end",`解析${composeFiles.length}个文件`,"file_parser");toolsUsed.push("file_parser")}
    if(composeInput.includes("讲义")||composeInput.includes("复习")||composeInput.includes("冲刺")){addEvent("tool_end","学习包生成完成","study_pack_generator");toolsUsed.push("study_pack_generator")}
    if(composeInput.includes("闪卡")||composeInput.includes("记忆")){addEvent("tool_end","闪卡生成完成","flashcard_generator");toolsUsed.push("flashcard_generator")}
    if(composeInput.includes("题")||composeInput.includes("练习")){addEvent("tool_end","练习题生成完成","quiz_generator");toolsUsed.push("quiz_generator")}
    if(composeInput.includes("笔记")){addEvent("tool_end","笔记整理完成","notes_writer");toolsUsed.push("notes_writer")}
    addEvent("output","任务执行完成（模拟模式）");
    const simOuts:AgentTaskOutput[]=[{id:`out-${Date.now()}-sim`,type:"summary",title:"执行摘要",content:{summary:`完成「${composeInput.slice(0,40)}」（模拟模式）`},linkedIds:[],editable:false,saved:true}];

    const task:AgentTask={id:taskId,title:composeInput.slice(0,40),intent:composeInput,status:"completed",inputs:[{type:"text",value:composeInput},...composeFiles],timeline:events,toolsUsed,outputs:simOuts,sources:[],qualityScore:70,createdAt:iso,updatedAt:iso,completedAt:iso};
    setActiveTask(task);const all=[task,...tasks];setTasks(all);saveTasks(all);setView("result");
  }

  function deleteTask(id: string) {
    const filtered = tasks.filter(t => t.id !== id);
    setTasks(filtered);
    saveTasks(filtered);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const f of Array.from(files)) {
      setComposeFiles(prev => [...prev, { type: "file" as const, value: f.name, label: f.name, mimeType: f.type }]);
    }
  }

  return (
    <PageTransition>
    <div className="relative flex flex-col gap-6 pb-20">
      <TutorBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-display font-serif">Mango Agent</h1>
          <p className="text-sm text-fg-muted">个人学习引擎 · 任务执行 · 智能工具</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setView("tasks"); setTasks(loadTasks()); }}
            className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              view === "tasks" ? "bg-primary-subtle text-primary" : "text-fg-muted hover:text-fg hover:bg-bg-muted")}>
            <History className="size-3.5" /> 历史
          </button>
          <button onClick={() => setView("templates")}
            className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              view === "templates" ? "bg-primary-subtle text-primary" : "text-fg-muted hover:text-fg hover:bg-bg-muted")}>
            <Sparkles className="size-3.5" /> 模板
          </button>
        </div>
      </header>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* ═══ TEMPLATES ═══ */}
          {view === "templates" && (
            <motion.div key="templates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="size-4 text-primary" />
                <span className="text-sm font-medium">选择任务模板开始</span>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {TASK_TEMPLATES.map(tpl => (
                  <motion.button key={tpl.id} whileTap={{ scale: 0.98 }}
                    onClick={() => startFromTemplate(tpl.id)}
                    className="card-card p-4 flex flex-col gap-3 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{tpl.icon}</span>
                      <ArrowRight className="size-4 text-fg-muted/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold font-serif">{tpl.title}</p>
                      <p className="text-xs text-fg-muted leading-relaxed">{tpl.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {tpl.suggestedTools.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] rounded-full px-2 py-0.5 bg-bg-muted text-fg-muted">{getToolInfo(t)?.label ?? t}</span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Free-form input */}
              <div id="agent-compose" className="card-card p-5 flex flex-col gap-3 mt-4 scroll-mt-20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  <span className="text-sm font-medium font-serif">自由描述任务</span>
                </div>
                <Textarea value={composeInput} onChange={e => setComposeInput(e.target.value)}
                  placeholder="用自然语言描述你想做的事。例如：「帮我整理微观经济学第3-5章的笔记，生成闪卡和练习题」…"
                  className="text-sm min-h-24 rounded-xl" />
                <div className="flex items-center gap-2">
                  <VoiceInput onTranscript={(text) => setComposeInput(prev => prev + " " + text)} />
                  <label className="cursor-pointer flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors">
                    <FileUp className="size-3.5" /> 上传文件
                    <input type="file" multiple className="hidden" onChange={handleFileInput}
                      accept=".pdf,.docx,.md,.txt,.png,.jpg,.jpeg" />
                  </label>
                  {composeFiles.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {composeFiles.map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] gap-1 pr-1">
                          <FileText className="size-3" /> {f.label}
                          <button onClick={() => setComposeFiles(prev => prev.filter((_, j) => j !== i))}
                            className="hover:text-destructive"><X className="size-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex-1" />
                  <Button onClick={executeTask} disabled={!composeInput.trim()} className="gap-2 rounded-xl">
                    <Play className="size-4" /> 执行任务
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ RUNNING ═══ */}
          {view === "running" && (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card-card p-6 sm:p-8 flex flex-col gap-5">
              {/* Animated Agent indicator */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="size-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/20"
                >
                  <span className="text-2xl">🥭</span>
                </motion.div>
                <div>
                  <p className="text-base font-semibold font-serif">
                    {timeline.length <= 2 ? "Agent 分析任务中…" :
                     timeline.some(e => e.status === "error") ? "部分完成…" :
                     "正在执行…"}
                  </p>
                  <p className="text-xs text-fg-muted">{composeInput.slice(0, 60)}</p>
                </div>
              </div>

              {/* Step descriptions — show what Agent is actually doing */}
              <div className="text-xs text-fg-muted/60 bg-bg-subtle rounded-xl p-3 mb-1">
                {timeline.length <= 2 && "🧠 正在理解你的需求，规划最佳执行方案…"}
                {timeline.length > 2 && timeline.length < 5 && "🔧 正在调用工具处理任务…"}
                {timeline.length >= 5 && "📝 正在整理结果，生成结构化输出…"}
              </div>

              {/* Timeline */}
              <div className="flex flex-col gap-1.5">
                {timeline.map((ev, i) => (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm",
                      ev.status === "error" ? "bg-red-50 text-red-600" :
                      ev.type === "output" ? "bg-emerald-50 text-emerald-700 font-medium" :
                      "text-fg-muted")}>
                    {ev.status === "done" ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> :
                     ev.status === "error" ? <AlertTriangle className="size-4 shrink-0" /> :
                     <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                       <Loader2 className="size-4 text-primary shrink-0" />
                     </motion.span>}
                    <span>{ev.message}</span>
                    {ev.toolName && (
                      <Badge variant="secondary" className="text-[9px] ml-auto">
                        {getToolInfo(ev.toolName)?.label ?? ev.toolName}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ RESULT ═══ */}
          {view === "result" && activeTask && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-5">
              {/* Task header */}
              <div className="card-card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-500" />
                      <h2 className="text-heading font-serif">{activeTask.title}</h2>
                    </div>
                    <p className="text-xs text-fg-muted">
                      完成于 {new Date(activeTask.completedAt!).toLocaleString("zh-CN")} · 使用 {activeTask.toolsUsed.length} 个工具 · 质量 {activeTask.qualityScore}分
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setView("templates")} className="gap-1.5 rounded-xl text-xs">
                      <Plus className="size-3.5" /> 新任务
                    </Button>
                  </div>
                </div>

                {/* Tools used */}
                <div className="flex flex-wrap gap-1.5">
                  {activeTask.toolsUsed.map(t => {
                    const info = getToolInfo(t);
                    return <Badge key={t} variant="secondary" className="text-[10px] gap-1">
                      <CheckCircle2 className="size-3 text-emerald-500" /> {info?.label ?? t}
                    </Badge>;
                  })}
                </div>

                {/* Outputs */}
                {activeTask.outputs.length > 0 && (
                  <div className="border-t border-border/30 pt-4 flex flex-col gap-2">
                    <span className="text-xs font-medium text-fg-muted">任务产出（点击查看详情）</span>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {activeTask.outputs.map(out => {
                        const contentPreview = out.type === "study_pack"
                          ? (out.content as { handout?: string; courseName?: string })?.handout?.slice(0, 200) || ""
                          : out.type === "notes" || out.type === "summary"
                          ? String(
                              (out.content as { explanation?: string; structuredNote?: string; summary?: string; analysis?: string })
                                ?.explanation ??
                              (out.content as { structuredNote?: string })?.structuredNote ??
                              (out.content as { summary?: string })?.summary ??
                              (out.content as { analysis?: string })?.analysis ?? ""
                            ).slice(0, 200)
                          : out.type === "quiz"
                          ? JSON.stringify((out.content as { quiz?: string })?.quiz ?? "", null, 2).slice(0, 200)
                          : out.type === "flashcards"
                          ? JSON.stringify((out.content as { cards?: string })?.cards ?? "", null, 2).slice(0, 200)
                          : out.type === "plan"
                          ? (out.content as { reviewPlan?: string })?.reviewPlan?.slice(0, 200) || ""
                          : "";

                        return (
                        <div key={out.id} className="rounded-xl border border-border/40 p-3 flex flex-col gap-2 group hover:border-primary/30 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            {out.type === "study_pack" && <GraduationCap className="size-5 text-primary shrink-0" />}
                            {out.type === "flashcards" && <Layers className="size-5 text-accent shrink-0" />}
                            {out.type === "notes" && <FileText className="size-5 text-fg-muted shrink-0" />}
                            {out.type === "quiz" && <Target className="size-5 text-amber-500 shrink-0" />}
                            {out.type === "summary" && <Sparkles className="size-5 text-amber-500 shrink-0" />}
                            {out.type === "plan" && <Target className="size-5 text-blue-500 shrink-0" />}
                            {out.type === "mistake" && <AlertTriangle className="size-5 text-red-400 shrink-0" />}
                            {out.type === "export" && <Download className="size-5 text-green-500 shrink-0" />}
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <span className="text-xs font-medium truncate">{out.title}</span>
                              <span className="text-[10px] text-fg-muted">
                                {out.type === "study_pack" ? "点击查看完整讲义" :
                                 out.type === "flashcards" ? "点击开始闪卡练习" :
                                 out.type === "quiz" ? "点击查看练习题" :
                                 out.type === "notes" ? "点击展开完整笔记" :
                                 out.type === "plan" ? "点击查看完整计划" :
                                 out.type === "summary" ? "点击展开摘要" : "查看详情"}
                              </span>
                            </div>
                            <ArrowRight className="size-3.5 text-fg-muted/30 group-hover:text-primary transition-colors" />
                          </div>
                          {/* Content preview */}
                          {contentPreview && (
                            <div className="text-[10px] text-fg-muted/60 leading-relaxed line-clamp-3 pl-8 border-t border-border/20 pt-2 whitespace-pre-wrap">
                              {contentPreview.slice(0, 200)}…
                            </div>
                          )}
                          {/* Action buttons */}
                          <div className="flex gap-1.5 pl-8">
                            <button onClick={() => {
                              setExpandedOutputId(out.id === expandedOutputId ? null : out.id);
                            }} className="text-[10px] text-primary font-medium hover:underline">
                              {expandedOutputId === out.id ? "收起" : "展开全文"}
                            </button>
                            {out.type === "study_pack" && (
                              <button onClick={() => window.open("/pack", "_blank")}
                                className="text-[10px] text-fg-muted hover:text-primary font-medium transition-colors">
                                导出
                              </button>
                            )}
                          </div>
                          {/* Expanded full content */}
                          {expandedOutputId === out.id && (
                            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                              className="text-xs leading-relaxed max-h-[400px] overflow-y-auto bg-bg-subtle rounded-lg p-3 whitespace-pre-wrap mt-1">
                              {contentPreview || "（内容已生成，请查看关联资源）"}
                            </motion.div>
                          )}
                        </div>
                      )})}
                    </div>
                  </div>
                )}

                {/* Timeline summary */}
                <details className="border-t border-border/30 pt-3">
                  <summary className="text-xs font-medium cursor-pointer text-fg-muted">查看执行时间线</summary>
                  <div className="flex flex-col gap-1 mt-2">
                    {activeTask.timeline.map(ev => (
                      <div key={ev.id} className="flex items-center gap-2 text-xs text-fg-muted py-1">
                        <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                        <span>{ev.message}</span>
                        <span className="text-fg-muted/50 ml-auto">{new Date(ev.timestamp).toLocaleTimeString("zh-CN")}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </motion.div>
          )}

          {/* ═══ TASK HISTORY ═══ */}
          {view === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4">
              {tasks.length === 0 ? (
                <div className="card-card p-8 flex flex-col items-center gap-4 text-center">
                  <Bot className="size-10 text-fg-muted/30" />
                  <div>
                    <p className="text-base font-medium font-serif">暂无任务记录</p>
                    <p className="text-sm text-fg-muted mt-1">选择一个模板或自由描述任务来开始</p>
                  </div>
                  <Button onClick={() => setView("templates")} className="gap-2 rounded-xl">浏览模板</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map(task => (
                    <div key={task.id} className="card-card p-4 flex items-center gap-4 group hover:shadow-sm transition-all">
                      <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0",
                        task.status === "completed" ? "bg-emerald-100" : task.status === "failed" ? "bg-red-100" : "bg-bg-muted")}>
                        {task.status === "completed" ? <CheckCircle2 className="size-4 text-emerald-600" /> :
                         task.status === "failed" ? <AlertTriangle className="size-4 text-red-500" /> :
                         <Loader2 className="size-4 text-primary animate-spin" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-[10px] text-fg-muted">
                          {new Date(task.createdAt).toLocaleDateString("zh-CN")} · {task.toolsUsed.length} 工具 · {task.qualityScore}分
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setActiveTask(task); setView("result"); }}
                          className="size-7 rounded-lg hover:bg-primary-subtle flex items-center justify-center">
                          <ExternalLink className="size-3.5" /></button>
                        <button onClick={() => deleteTask(task.id)}
                          className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center">
                          <Trash2 className="size-3.5 text-red-400" /></button>
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
