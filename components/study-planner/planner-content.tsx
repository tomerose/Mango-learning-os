"use client";

import { CalendarCheck, Plus, Flag } from "lucide-react";
import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SUBJECT_META } from "@/lib/mock-data";
import { SUBJECTS, type SubjectId } from "@/lib/navigation";
import type { Priority, Task } from "@/lib/types";

const WEEK_DAYS = ["周一","周二","周三","周四","周五","周六","周日"];
const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "high", label: "高" }, { id: "medium", label: "中" }, { id: "low", label: "低" },
];

const semesterGoals = [
  { title: "完成深度学习课程 + 1 个项目", subject: "ai" as SubjectId, pct: 65 },
  { title: "金融建模能力达到实习水平", subject: "finance" as SubjectId, pct: 48 },
  { title: "数学分析期末 90+", subject: "math" as SubjectId, pct: 72 },
  { title: "雅思模考稳定 7.0", subject: "english" as SubjectId, pct: 55 },
];

function PlanRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const meta = SUBJECT_META[task.subject];
  return (
    <button onClick={onToggle} className="text-left w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-accent/30 transition-colors">
      <span className="text-muted-foreground w-12 shrink-0 text-sm tabular-nums">{task.dueLabel || "—"}</span>
      <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
      <div className="min-w-0 flex-1">
        <p className={task.done ? "text-muted-foreground text-sm line-through" : "text-sm font-medium"}>{task.title}</p>
        <p className="text-muted-foreground text-xs">{meta.short} · {task.estimatedMin}min · {task.priority}</p>
      </div>
      {task.done && <Badge variant="success">已完成</Badge>}
    </button>
  );
}

export function StudyPlannerContent() {
  const { tasks, toggleTask, addTask } = useStore();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newSubject, setNewSubject] = React.useState<SubjectId>("ai");
  const [newTitle, setNewTitle] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<Priority>("medium");
  const [newMins, setNewMins] = React.useState(30);

  const pendingTasks = tasks.filter((t) => !t.done);

  function handleAdd() {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      subject: newSubject,
      priority: newPriority,
      done: false,
      dueLabel: "今天",
      estimatedMin: newMins,
    });
    setNewTitle("");
    setDialogOpen(false);
  }

  // Weekly load from live data
  const subjectLoad: Record<SubjectId, number> = { ai:0,economics:0,finance:0,math:0,english:0 };
  for (const t of pendingTasks) subjectLoad[t.subject] += t.estimatedMin;
  const totalLoad = Object.values(subjectLoad).reduce((a,b)=>a+b,0);

  const weekPlan = WEEK_DAYS.map((day, i) => {
    const subjects = Object.entries(subjectLoad).filter(([,m])=>m>0).slice(0,1+(i%3));
    const load = Math.min(6, Math.max(1, Math.round(totalLoad/60)));
    return { day, load: i>=5 ? Math.max(2,load-1) : load, focus: subjects.length ? SUBJECT_META[subjects[0]?.[0] as SubjectId]?.short??"综合":"自由" };
  });

  // Monthly summary — group completed tasks by subject
  const doneBySubject = (["ai","economics","finance","math","english"] as SubjectId[]).map(s => {
    const done = tasks.filter(t=>t.subject===s&&t.done).length;
    const total = tasks.filter(t=>t.subject===s).length;
    return { subject:s, done, total, pct: total>0?Math.round(done/total*100):0 };
  });
  const monthlyGoal = 30;
  const monthlyDone = tasks.filter(t=>t.done).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">学习计划</h1>
          <p className="text-muted-foreground text-sm">日 / 周 / 月 / 学期四级规划 · {pendingTasks.length} 项待完成</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="size-4" /> 添加任务</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加学习任务</DialogTitle>
              <DialogDescription>计划每日学习内容，持续积累。</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setNewSubject(s.id)}
                    className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      newSubject===s.id ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}>{s.label}</button>
                ))}
              </div>
              <Input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="任务标题，如「复习 Transformer 自注意力」" autoFocus />
              <div className="flex gap-3 items-center">
                <span className="text-sm text-muted-foreground">优先级</span>
                {PRIORITIES.map(p => (
                  <button key={p.id} onClick={()=>setNewPriority(p.id)}
                    className={cn("rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                      newPriority===p.id ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}>{p.label}</button>
                ))}
                <span className="text-sm text-muted-foreground ml-3">预计</span>
                <select value={newMins} onChange={e=>setNewMins(Number(e.target.value))}
                  className="rounded-md border px-2 py-1 text-xs bg-background">{[15,30,45,60,90,120].map(m=><option key={m} value={m}>{m}分</option>)}</select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setDialogOpen(false)}>取消</Button>
              <Button onClick={handleAdd} disabled={!newTitle.trim()}>添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">每日</TabsTrigger>
          <TabsTrigger value="weekly">每周</TabsTrigger>
          <TabsTrigger value="monthly">每月</TabsTrigger>
          <TabsTrigger value="semester">学期</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarCheck className="size-4" /> 今日任务列表</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {tasks.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">暂无任务。点击上方「添加任务」开始规划。</div>
              ) : (
                tasks.map(task => <PlanRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader><CardTitle>本周负荷分布</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {weekPlan.map(d => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-sm font-medium">{d.day}</span>
                  <div className="flex-1"><Progress value={(d.load/6)*100} /></div>
                  <span className="text-muted-foreground w-28 shrink-0 text-right text-xs">{d.focus} · {d.load}h</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader><CardTitle>本月概览</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-muted-foreground text-xs">本月任务完成</span>
                  <div className="flex items-baseline gap-1"><span className="text-2xl font-semibold tabular-nums">{monthlyDone}</span><span className="text-muted-foreground text-sm">/ {monthlyGoal} 目标</span></div>
                </div>
                <Progress value={Math.min(100,Math.round(monthlyDone/monthlyGoal*100))} className="flex-1" />
              </div>
              <div className="flex flex-col gap-2">
                {doneBySubject.map(d=>{
                  const meta = SUBJECT_META[d.subject];
                  return (
                    <div key={d.subject} className="flex items-center gap-3">
                      <span className="w-16 text-sm text-muted-foreground">{meta.short}</span>
                      <div className="flex-1"><Progress value={d.pct} /></div>
                      <span className="text-muted-foreground text-xs tabular-nums w-12 text-right">{d.done}/{d.total}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semester" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Flag className="size-4" /> 本学期目标</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              {semesterGoals.map((g,i)=>{
                const meta = SUBJECT_META[g.subject];
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium"><span className="size-2 rounded-full" style={{backgroundColor:meta.color}}/>{g.title}</span>
                      <span className="text-muted-foreground tabular-nums">{g.pct}%</span>
                    </div>
                    <Progress value={g.pct} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
