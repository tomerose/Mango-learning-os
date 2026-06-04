"use client";

import * as React from "react";
import { Plus, Trash2, Edit3, Save, X, Play, BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubjects } from "@/lib/subjects";
import type { ExamQuestion, QuestionType } from "@/lib/types";

const QUESTION_TYPES: { id: QuestionType; label: string }[] = [
  { id: "mcq", label: "选择题" },
  { id: "fill_blank", label: "填空题" },
  { id: "problem", label: "解答题" },
];
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

interface Props {
  questions: ExamQuestion[];
  onAdd: (q: Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">) => void;
  onUpdate: (id: string, q: Partial<ExamQuestion>) => void;
  onDelete: (id: string) => void;
  onStartPractice: (ids: string[]) => void;
  saving: boolean;
  guest: boolean;
}

export function QuestionBank({ questions, onAdd, onUpdate, onDelete, onStartPractice, saving, guest }: Props) {
  const { subjects } = useSubjects();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // New question form state
  const [subj, setSubj] = React.useState(subjects[0]?.id ?? "");
  const [topic, setTopic] = React.useState("");
  const [qtype, setQtype] = React.useState<QuestionType>("mcq");
  const [stem, setStem] = React.useState("");
  const [opts, setOpts] = React.useState(["", "", "", ""]);
  const [answer, setAnswer] = React.useState("");
  const [expl, setExpl] = React.useState("");
  const [diff, setDiff] = React.useState<"easy" | "medium" | "hard">("medium");

  function resetForm() {
    setSubj(subjects[0]?.id ?? "");
    setTopic(""); setQtype("mcq"); setStem("");
    setOpts(["", "", "", ""]); setAnswer(""); setExpl(""); setDiff("medium");
    setShowForm(false);
  }

  function handleAdd() {
    if (!stem.trim() || answer.trim() === "") return;
    onAdd({
      subject: subj, topic, type: qtype, question: stem.trim(),
      options: qtype === "mcq" ? opts.filter(o => o.trim()) : [],
      answer: answer.trim(), explanation: expl.trim(), difficulty: diff,
    });
    resetForm();
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = questions.filter(q => !subj || q.subject === subj);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <select value={subj} onChange={e => setSubj(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm bg-background">
            <option value="">全部学科</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          {selected.size > 0 && (
            <Button size="sm" onClick={() => onStartPractice([...selected])}><Play className="size-3.5" />练习选中 ({selected.size})</Button>
          )}
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>取消选择</Button>
          )}
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="size-4" />新建题目</Button>
        </div>
      </div>

      {/* New question form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="flex flex-col gap-3 pt-4">
            <div className="flex flex-wrap gap-2">
              <select value={subj} onChange={e => setSubj(e.target.value)}
                className="rounded-md border px-2 py-1 text-xs bg-background">
                {subjects.map(s => <option key={s.id} value={s.id}>{s.short}</option>)}
              </select>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="主题" className="w-32 h-8 text-xs" />
              <div className="flex gap-1">
                {QUESTION_TYPES.map(t => (
                  <button key={t.id} onClick={() => setQtype(t.id)}
                    className={`rounded-md border px-2 py-1 text-xs font-medium ${qtype === t.id ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent text-muted-foreground"}`}>{t.label}</button>
                ))}
              </div>
              <div className="flex gap-1">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDiff(d)}
                    className={`rounded-md border px-2 py-1 text-xs ${diff === d ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                    {{easy:"简单",medium:"中等",hard:"困难"}[d]}</button>
                ))}
              </div>
            </div>
            <Textarea value={stem} onChange={e => setStem(e.target.value)} placeholder="题目内容…" className="text-sm min-h-16" autoFocus />
            {qtype === "mcq" && (
              <div className="grid grid-cols-2 gap-2">
                {opts.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">{String.fromCharCode(65+i)}.</span>
                    <Input value={o} onChange={e => { const n = [...opts]; n[i] = e.target.value; setOpts(n); }}
                      placeholder={`选项 ${String.fromCharCode(65+i)}`} className="h-8 text-xs" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder={qtype === "mcq" ? "正确答案（如 B 或选项文本）" : qtype === "fill_blank" ? "正确答案（多答案用 | 分隔）" : "关键得分点，逗号分隔"}
                className="flex-1 h-8 text-xs" />
            </div>
            <Input value={expl} onChange={e => setExpl(e.target.value)} placeholder="解析（可选）" className="h-8 text-xs" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}><X className="size-3.5" />取消</Button>
              <Button size="sm" onClick={handleAdd} disabled={saving || !stem.trim() || answer.trim() === ""}>
                <Save className="size-3.5" /> 保存
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question list */}
      {filtered.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-16 text-center">
          <BookOpen className="size-8 opacity-40" />
          <p className="text-sm">{questions.length === 0 ? "还没有题目，点击「新建题目」开始建立题库" : "该学科暂无题目"}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(q => {
            const meta = { label: q.subject, short: q.subject.slice(0, 4), color: "var(--chart-2)" };
            return (
              <div key={q.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${selected.has(q.id) ? "border-primary/50 bg-primary/5" : "hover:bg-accent/30"}`}>
                <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)}
                  className="mt-1 size-4 rounded accent-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">{{ mcq: "选择", fill_blank: "填空", problem: "解答" }[q.type]}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{{ easy: "简单", medium: "中等", hard: "困难" }[q.difficulty]}</Badge>
                    <span className="text-muted-foreground text-[11px]">{q.topic || q.subject}</span>
                  </div>
                  <p className="text-sm leading-snug">{q.question}</p>
                  {q.options.length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                      {q.options.map((o, i) => (
                        <span key={i} className="text-muted-foreground text-xs">{String.fromCharCode(65+i)}. {o}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-primary/70 text-[11px] mt-1">答案：{q.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onDelete(q.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="size-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {guest && (
        <p className="text-muted-foreground text-[11px] text-center">游客模式 — 题库与结果保存在本地，不会同步到云端</p>
      )}
    </div>
  );
}
