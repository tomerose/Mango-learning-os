"use client";

import * as React from "react";
import { CalendarCheck, Plus, Upload, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SUBJECT_META } from "@/lib/mock-data";
import { useSubjects } from "@/lib/subjects";
import type { SubjectId, Priority } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Mango Plan — 智能生成 + 手动任务管理
// ─────────────────────────────────────────────────────────────

const WEEK_DAYS = ["周一","周二","周三","周四","周五","周六","周日"];
const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "high", label: "高" }, { id: "medium", label: "中" }, { id: "low", label: "低" },
];
const HORIZONS = ["日计划", "周计划", "月计划", "学期计划"];

export function PlannerContent() {
  const { tasks, addTask, toggleTask, hydrated } = useStore();
  const { subjects } = useSubjects();

  const [newOpen, setNewOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newSubject, setNewSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");
  const [newPriority, setNewPriority] = React.useState<Priority>("medium");
  const [newDue, setNewDue] = React.useState("");

  function addManualTask() {
    if (!newTitle.trim()) return;
    addTask({ title: newTitle.trim(), subject: newSubject, done: false, priority: newPriority, dueLabel: newDue || "今天", estimatedMin: 30 });
    setNewTitle(""); setNewOpen(false);
  }

  // ── AI generation ──
  const [aiTab, setAiTab] = React.useState<"file" | "prompt">("prompt");
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiDuration, setAiDuration] = React.useState("一周");
  const [aiSubject, setAiSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [aiResult, setAiResult] = React.useState("");
  const [aiError, setAiError] = React.useState("");
  const [fileName, setFileName] = React.useState("");

  async function generatePlan() {
    if (!aiPrompt.trim()) { setAiError("请输入学习目标或任务描述"); return; }
    setAiGenerating(true); setAiError(""); setAiResult("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: aiSubject,
          messages: [
            { role: "system", content: `你是学习计划生成助手。根据用户输入生成${aiDuration}结构化学习计划。中文Markdown：## 总体目标\n## 每日计划（表格：日期/时段/任务/学科/时长）\n## 关键里程碑\n## 注意事项` },
            { role: "user", content: `生成${aiDuration}学习计划：\n${aiPrompt}` },
          ],
        }),
      });
      const reader = res.body?.getReader(); const decoder = new TextDecoder(); let text = "";
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; text += decoder.decode(value, { stream: true }); } }
      setAiResult(text || "计划已生成");
      for (const line of text.split("\n").filter((l) => l.includes("|") && l.includes("min"))) {
        const parts = line.split("|").map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 3) addTask({ title: parts[2] || parts[1] || parts[0]?.slice(0, 40) || "学习任务", subject: aiSubject, done: false, priority: "medium", dueLabel: parts[1] || "待定", estimatedMin: 30 });
      }
    } catch (err) { setAiError(err instanceof Error ? err.message : "生成失败"); }
    finally { setAiGenerating(false); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setFileName(file.name); setAiGenerating(true); setAiError(""); setAiResult("");
    try {
      const form = new FormData(); form.append("file", file);
      const ex = await fetch("/api/notes/import/file", { method: "POST", body: form });
      const exData = await ex.json();
      if (!ex.ok) throw new Error(exData.error || "文件解析失败");
      const text = (exData.text ?? "").slice(0, 6000);
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: aiSubject,
          messages: [
            { role: "system", content: `根据上传文件生成${aiDuration}结构化计划。识别课表则按课表安排，任务列表则合理分配到每天。中文Markdown。` },
            { role: "user", content: `文件内容：\n${text}\n\n生成${aiDuration}计划。` },
          ],
        }),
      });
      const reader = res.body?.getReader(); const decoder = new TextDecoder(); let out = "";
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; out += decoder.decode(value, { stream: true }); } }
      setAiResult(out || "计划已生成");
    } catch (err) { setAiError(err instanceof Error ? err.message : "生成失败"); }
    finally { setAiGenerating(false); }
  }

  const todayTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 智能生成 ── */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="size-5 text-primary" />智能生成学习计划</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-sm text-muted-foreground">学科：</span>
            {subjects.map((s) => (
              <button key={s.id} onClick={() => setAiSubject(s.id)} className={cn("rounded-full border px-3 py-0.5 text-xs transition-colors", aiSubject === s.id ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>{s.label}</button>
            ))}
          </div>
          <div className="flex rounded-lg border bg-muted/30 p-0.5 mb-3 max-w-xs">
            <button onClick={() => setAiTab("prompt")} className={cn("flex-1 rounded-md py-1.5 text-xs font-medium transition-colors", aiTab === "prompt" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>📝 文字描述</button>
            <button onClick={() => setAiTab("file")} className={cn("flex-1 rounded-md py-1.5 text-xs font-medium transition-colors", aiTab === "file" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>📎 上传课表</button>
          </div>
          {aiTab === "prompt" ? (
            <div className="space-y-3">
              <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="描述学习目标、任务和可用时间…" className="min-h-20" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">周期：</span>
                {HORIZONS.map((d) => (<button key={d} onClick={() => setAiDuration(d)} className={cn("rounded-full border px-3 py-0.5 text-xs transition-colors", aiDuration === d ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>{d}</button>))}
              </div>
              <Button onClick={generatePlan} disabled={aiGenerating || !aiPrompt.trim()} size="sm">
                {aiGenerating ? <><Loader2 className="size-4 animate-spin mr-1" />生成中…</> : <><Sparkles className="size-4 mr-1" />生成计划</>}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">周期：</span>
                {HORIZONS.map((d) => (<button key={d} onClick={() => setAiDuration(d)} className={cn("rounded-full border px-3 py-0.5 text-xs transition-colors", aiDuration === d ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>{d}</button>))}
              </div>
              <input type="file" accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.webp" onChange={handleFileUpload} className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs" />
              <p className="text-[10px] text-muted-foreground">支持 PDF、Word、纯文本、课表图片。AI 分析后自动生成结构化学习计划</p>
              {fileName && <p className="text-xs text-muted-foreground">已选择：{fileName}</p>}
            </div>
          )}
          {aiGenerating && <Progress value={60} className="h-1 mt-3" />}
          {aiError && <p className="text-destructive text-xs flex items-center gap-1 mt-2"><AlertCircle className="size-3" />{aiError}</p>}
          {aiResult && (
            <div className="mt-4 rounded-xl border bg-card p-4 max-h-64 overflow-y-auto">
              <p className="text-xs text-green-600 flex items-center gap-1 mb-2"><CheckCircle2 className="size-3" />计划已生成</p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">{aiResult.slice(0, 5000)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 任务管理 ── */}
      <Tabs defaultValue="today">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="today"><CalendarCheck className="size-4" /> 今日任务</TabsTrigger>
            <TabsTrigger value="week"><CalendarCheck className="size-4" /> 本周计划</TabsTrigger>
            <TabsTrigger value="done"><CheckCircle2 className="size-4" /> 已完成</TabsTrigger>
          </TabsList>
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-4" />新建任务</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>新建任务</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-3">
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="任务标题" autoFocus />
                <div className="flex flex-wrap gap-2">{subjects.map((s) => (
                  <button key={s.id} onClick={() => setNewSubject(s.id)} className={cn("rounded-full border px-3 py-1 text-xs transition-colors", newSubject === s.id ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}>{s.label}</button>
                ))}</div>
                <div className="flex gap-2">{PRIORITIES.map((p) => (
                  <button key={p.id} onClick={() => setNewPriority(p.id)} className={cn("rounded-full border px-3 py-1 text-xs transition-colors", newPriority === p.id ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}>{p.label}</button>
                ))}</div>
                <Input value={newDue} onChange={(e) => setNewDue(e.target.value)} placeholder="截止日期（如：周五 14:00）" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setNewOpen(false)}>取消</Button><Button onClick={addManualTask} disabled={!newTitle.trim()}>添加</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="today" className="mt-4">
          {!hydrated ? <p className="text-sm text-muted-foreground">加载中…</p> :
           todayTasks.length === 0 ? <p className="text-center py-16 text-muted-foreground text-sm">没有待办任务 🎉</p> :
           <div className="grid gap-3 sm:grid-cols-2">
            {todayTasks.map((t) => (
              <Card key={t.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-3 py-3 px-4">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="size-4 accent-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", t.done && "line-through text-muted-foreground")}>{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">{SUBJECT_META[t.subject]?.short ?? t.subject}</Badge>
                      <span className="text-[10px] text-muted-foreground">{t.dueLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          <div className="grid gap-3">
            {WEEK_DAYS.map((day) => {
              const dayTasks = tasks.filter((t) => t.dueLabel?.includes(day) && !t.done);
              return (
                <Card key={day}><CardContent className="py-3 px-4">
                  <p className="text-sm font-medium mb-2">{day}</p>
                  {dayTasks.length === 0 ? <p className="text-xs text-muted-foreground">无任务</p> :
                   dayTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground ml-2 py-0.5">
                      <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="size-3 accent-primary" />
                      <span className={t.done ? "line-through" : ""}>{t.title}</span>
                    </div>
                  ))}
                </CardContent></Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="done" className="mt-4">
          {doneTasks.length === 0 ? <p className="text-center py-12 text-muted-foreground text-sm">暂无已完成任务</p> :
           <div className="space-y-1">{doneTasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
              <CheckCircle2 className="size-3 text-green-500 shrink-0" />
              <span className="line-through">{t.title}</span>
            </div>
          ))}</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
