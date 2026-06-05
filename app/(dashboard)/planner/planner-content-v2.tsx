"use client";

import * as React from "react";
import { CalendarCheck, Plus, Sparkles, Layers, Target, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useSubjects } from "@/lib/subjects";
import { FlashcardsTab } from "@/components/knowledge-hub/flashcards-tab";
import { ExamWorkspace } from "@/components/exam/exam-workspace";
import type { SubjectId, Priority } from "@/lib/types";

const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "high", label: "高" }, { id: "medium", label: "中" }, { id: "low", label: "低" },
];

export function PlannerContent() {
  const { tasks, addTask, toggleTask, hydrated } = useStore();
  const { subjects } = useSubjects();

  const [newOpen, setNewOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newSubject, setNewSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");
  const [newPriority, setNewPriority] = React.useState<Priority>("medium");
  const [newDue, setNewDue] = React.useState("");

  const [mainTab, setMainTab] = React.useState("tasks");

  function addManualTask() {
    if (!newTitle.trim()) return;
    addTask({ title: newTitle.trim(), subject: newSubject, done: false, priority: newPriority, dueLabel: newDue || "今天", estimatedMin: 30 });
    setNewTitle(""); setNewOpen(false);
  }

  // ── AI plan generation ──
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiDuration, setAiDuration] = React.useState("一周");
  const [aiSubject, setAiSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");
  const [aiGenerating, setAiGenerating] = React.useState(false);
  const [aiResult, setAiResult] = React.useState("");
  const [aiError, setAiError] = React.useState("");

  async function generatePlan() {
    if (!aiPrompt.trim()) { setAiError("请输入学习目标"); return; }
    setAiGenerating(true); setAiError(""); setAiResult("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "plan", input: `目标：${aiPrompt.trim()}。时长：${aiDuration}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      const text = typeof data.content === "string" ? data.content
        : data.content?.plan ?? JSON.stringify(data.content);
      setAiResult(text);
    } catch (err) { setAiError(err instanceof Error ? err.message : "生成失败"); }
    finally { setAiGenerating(false); }
  }

  const todayTasks = tasks.filter(t => !t.done);
  const weekTasks = tasks;
  const doneTasks = tasks.filter(t => t.done);

  return (
    <Tabs value={mainTab} onValueChange={setMainTab}>
      <TabsList className="w-full max-w-2xl">
        <TabsTrigger value="tasks"><CalendarCheck className="size-3.5 mr-1" />任务</TabsTrigger>
        <TabsTrigger value="plan"><Sparkles className="size-3.5 mr-1" />智能计划</TabsTrigger>
        <TabsTrigger value="exam"><GraduationCap className="size-3.5 mr-1" />考试备战</TabsTrigger>
        <TabsTrigger value="flashcards"><Layers className="size-3.5 mr-1" />闪卡复习</TabsTrigger>
      </TabsList>

      {/* ── Tasks Tab ── */}
      <TabsContent value="tasks" className="mt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-small text-fg-muted">{todayTasks.length} 个任务待完成</p>
            <Button size="sm" onClick={() => setNewOpen(!newOpen)}>
              <Plus className="size-3.5 mr-1" />添加任务
            </Button>
          </div>

          {newOpen && (
            <div className="card-card p-4 flex flex-col gap-3">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="任务名称" autoFocus />
              <div className="flex gap-2">
                <select value={newSubject} onChange={e => setNewSubject(e.target.value)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm bg-surface">
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm bg-surface">
                  {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}优先</option>)}
                </select>
                <Input value={newDue} onChange={e => setNewDue(e.target.value)} placeholder="截止日期" className="flex-1" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addManualTask}>确认添加</Button>
                <Button size="sm" variant="outline" onClick={() => setNewOpen(false)}>取消</Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {todayTasks.length === 0 && <p className="text-small text-fg-muted text-center py-8">暂无待办任务</p>}
            {todayTasks.map(t => (
              <div key={t.id} className={cn("flex items-center gap-3 rounded-xl border border-border/50 p-3", t.done && "opacity-50")}>
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}
                  className="size-4 rounded accent-primary" />
                <span className={cn("text-small flex-1", t.done && "line-through")}>{t.title}</span>
                <span className={cn("text-caption", t.priority === "high" ? "text-rose-500" : "text-fg-muted")}>
                  {t.priority === "high" ? "高" : t.priority === "medium" ? "中" : "低"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* ── AI Plan Tab ── */}
      <TabsContent value="plan" className="mt-4">
        <div className="max-w-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              placeholder="描述你的学习目标，例如：两周内学完微观经济学第1-5章，每天2小时" className="min-h-24" />
            <div className="flex gap-2 items-center">
              <select value={aiSubject} onChange={e => setAiSubject(e.target.value)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm bg-surface">
                {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select value={aiDuration} onChange={e => setAiDuration(e.target.value)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm bg-surface">
                {["三天","一周","两周","一个月","三个月"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <Button onClick={generatePlan} disabled={aiGenerating || !aiPrompt.trim()} size="sm">
                {aiGenerating ? "生成中..." : "生成计划"}
              </Button>
            </div>
            {aiError && <p className="text-xs text-rose-500">{aiError}</p>}
          </div>
          {aiResult && (
            <div className="card-card p-4">
              <div className="prose prose-sm max-w-none text-small leading-relaxed whitespace-pre-wrap">{aiResult}</div>
            </div>
          )}
        </div>
      </TabsContent>

      {/* ── Exam Prep Tab (考试备战从 Mangoing 迁入) ── */}
      <TabsContent value="exam" className="mt-4">
        <ExamWorkspace />
      </TabsContent>

      {/* ── Flashcards Tab (exam prep moved from Mangoing) ── */}
      <TabsContent value="flashcards" className="mt-4">
        <FlashcardsTab />
      </TabsContent>
    </Tabs>
  );
}
