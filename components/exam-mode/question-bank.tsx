"use client";

import * as React from "react";
import {
  Plus, Trash2, Save, X, Play, BookOpen,
  Sparkles, Download, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
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
  const [showForm, setShowForm] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // Manual form state
  const [subj, setSubj] = React.useState(subjects[0]?.id ?? "");
  const [topic, setTopic] = React.useState("");
  const [qtype, setQtype] = React.useState<QuestionType>("mcq");
  const [stem, setStem] = React.useState("");
  const [opts, setOpts] = React.useState(["", "", "", ""]);
  const [answer, setAnswer] = React.useState("");
  const [expl, setExpl] = React.useState("");
  const [diff, setDiff] = React.useState<"easy" | "medium" | "hard">("medium");

  // AI generation dialog state
  const [genOpen, setGenOpen] = React.useState(false);
  const [genSubj, setGenSubj] = React.useState(subjects[0]?.id ?? "");
  const [genTopic, setGenTopic] = React.useState("");
  const [genCount, setGenCount] = React.useState(5);
  const [genDifficulty, setGenDifficulty] = React.useState<"easy" | "medium" | "hard">("medium");
  const [genTypes, setGenTypes] = React.useState<Set<QuestionType>>(new Set<QuestionType>(["mcq"]));
  const [genExtra, setGenExtra] = React.useState("");
  const [genLoading, setGenLoading] = React.useState(false);
  const [genError, setGenError] = React.useState("");
  const [genProgress, setGenProgress] = React.useState(0);
  const [genResult, setGenResult] = React.useState("");

  // Import dialog state
  const [impOpen, setImpOpen] = React.useState(false);
  const [impUrl, setImpUrl] = React.useState("");
  const [impLoading, setImpLoading] = React.useState(false);
  const [impError, setImpError] = React.useState("");
  const [impResult, setImpResult] = React.useState("");

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

  // ── AI Generation ─────────────────────────────────────────
  async function handleGenerate() {
    if (!genTopic.trim()) { setGenError("请输入主题"); return; }
    setGenLoading(true); setGenError(""); setGenResult("");
    setGenProgress(20);

    try {
      const typesStr = [...genTypes].join(",");
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: genSubj, topic: genTopic.trim(),
          count: genCount, difficulty: genDifficulty,
          types: typesStr, extra: genExtra.trim(),
        }),
      });
      setGenProgress(70);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `生成失败 (${res.status})`);

      // Add all generated questions
      let added = 0;
      for (const q of data.questions ?? []) {
        onAdd(q);
        added++;
      }
      setGenProgress(100);
      setGenResult(`成功生成 ${added} 道题目，已加入题库`);
      setTimeout(() => setGenOpen(false), 1500);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setGenLoading(false);
    }
  }

  function toggleGenType(t: QuestionType) {
    setGenTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      if (next.size === 0) next.add(t); // keep at least one
      return next;
    });
  }

  // ── Import from URL ───────────────────────────────────────
  async function handleImport() {
    if (!impUrl.trim()) { setImpError("请输入 URL"); return; }
    setImpLoading(true); setImpError(""); setImpResult("");

    try {
      // Try direct fetch (CORS-proxy via our own API)
      const url = impUrl.trim();
      let json: unknown;

      // If it's a GitHub raw URL, use our API
      if (url.includes("github.com") || url.includes("raw.githubusercontent.com")) {
        const res = await fetch(`/api/exam/github-sync?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `导入失败 (${res.status})`);
        json = data.questions;
      } else {
        // Try direct fetch
        const res = await fetch(url);
        if (!res.ok) throw new Error(`请求失败: ${res.status}`);
        json = await res.json();
      }

      const arr = Array.isArray(json) ? json : (json as Record<string,unknown>)?.questions ?? [];
      if (!Array.isArray(arr)) throw new Error("无法解析 — 期望 JSON 数组或 {questions:[...]} 格式");

      let added = 0;
      for (const item of arr) {
        if (!item.question || item.answer === undefined) continue;
        onAdd({
          subject: (item.subject as string) ?? genSubj,
          topic: (item.topic as string) ?? "导入",
          type: (["mcq","fill_blank","problem"].includes(item.type as string) ? item.type : "mcq") as QuestionType,
          question: String(item.question),
          options: Array.isArray(item.options) ? item.options as string[] : [],
          answer: String(item.answer),
          explanation: (item.explanation as string) ?? "",
          difficulty: (["easy","medium","hard"].includes(item.difficulty as string) ? item.difficulty : "medium") as "easy"|"medium"|"hard",
        });
        added++;
      }

      if (added === 0) throw new Error("未找到有效题目");

      setImpResult(`成功导入 ${added} 道题目，已加入题库`);
      setTimeout(() => setImpOpen(false), 1500);
    } catch (err) {
      setImpError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImpLoading(false);
    }
  }

  // Sample import URL for quick test
  function fillSampleUrl() {
    setImpUrl("https://raw.githubusercontent.com/tomerose/Mango-learning-os/main/data/exam-questions.json");
  }

  const filtered = questions.filter(q => !subj || q.subject === subj);

  // ── Render ────────────────────────────────────────────────
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

          {/* AI 生成按钮 */}
          <Dialog open={genOpen} onOpenChange={setGenOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Sparkles className="size-3.5" /> AI 生成题库
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Sparkles className="size-4" />AI 生成题库</DialogTitle>
                <DialogDescription>输入学科、主题和要求，AI 自动批量生成题目并加入题库。</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <select value={genSubj} onChange={e => setGenSubj(e.target.value)}
                    className="rounded-md border px-2 py-1.5 text-sm bg-background flex-1">
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select value={genCount} onChange={e => setGenCount(Number(e.target.value))}
                    className="rounded-md border px-2 py-1.5 text-sm bg-background w-20">
                    {[3,5,8,10,15].map(n => <option key={n} value={n}>{n}题</option>)}
                  </select>
                </div>
                <Input value={genTopic} onChange={e => setGenTopic(e.target.value)}
                  placeholder="主题，如「Transformer 自注意力机制」" autoFocus />
                <div className="flex gap-1">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setGenDifficulty(d)}
                      className={`rounded-md border px-2 py-1 text-xs ${genDifficulty === d ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                      {{easy:"简单",medium:"中等",hard:"困难"}[d]}</button>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">题目类型（可多选）</span>
                  <div className="flex gap-1">
                    {QUESTION_TYPES.map(t => (
                      <button key={t.id} onClick={() => toggleGenType(t.id)}
                        className={`rounded-md border px-3 py-1 text-xs font-medium ${genTypes.has(t.id) ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent text-muted-foreground"}`}>
                        {t.label}</button>
                    ))}
                  </div>
                </div>
                <Textarea value={genExtra} onChange={e => setGenExtra(e.target.value)}
                  placeholder="额外要求（可选）如：侧重应用场景、包含公式计算…"
                  className="min-h-16 text-sm" />
                {genLoading && <Progress value={genProgress} className="h-1.5" />}
                {genError && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="size-3"/>{genError}</p>}
                {genResult && <p className="text-success text-xs flex items-center gap-1"><CheckCircle2 className="size-3"/>{genResult}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGenOpen(false)}>取消</Button>
                <Button onClick={handleGenerate} disabled={genLoading || !genTopic.trim()}>
                  {genLoading ? <><Loader2 className="size-4 animate-spin"/>生成中…</> : <><Sparkles className="size-4"/>生成 {genCount} 题</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 导入按钮 */}
          <Dialog open={impOpen} onOpenChange={setImpOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Download className="size-3.5" /> 导入
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Download className="size-4"/>一键导入题库</DialogTitle>
                <DialogDescription>从 GitHub raw URL 或其他 JSON 地址批量导入题目。</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input value={impUrl} onChange={e => setImpUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/.../exam-questions.json"
                  autoFocus />
                <Button variant="outline" size="sm" onClick={fillSampleUrl} className="text-xs w-fit">
                  填入示例 URL
                </Button>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <p className="font-medium mb-1">JSON 格式要求：</p>
                  <code className="text-[11px]">{'[{"question":"...","type":"mcq|fill_blank|problem","options":["A.xx","B.xx","C.xx","D.xx"],"answer":"...","explanation":"...","subject":"ai","topic":"ML","difficulty":"medium"}]'}</code>
                </div>
                {impLoading && <Progress value={60} className="h-1.5" />}
                {impError && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="size-3"/>{impError}</p>}
                {impResult && <p className="text-success text-xs flex items-center gap-1"><CheckCircle2 className="size-3"/>{impResult}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImpOpen(false)}>取消</Button>
                <Button onClick={handleImport} disabled={impLoading || !impUrl.trim()}>
                  {impLoading ? <><Loader2 className="size-4 animate-spin"/>导入中…</> : <><Download className="size-4"/>导入</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="size-4" />新建题目</Button>
        </div>
      </div>

      {/* Manual new question form */}
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

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-16 text-center">
          <BookOpen className="size-8 opacity-40" />
          <p className="text-sm">{questions.length === 0 ? "还没有题目 —— 用「AI 生成题库」或「新建题目」开始建立题库" : "该学科暂无题目"}</p>
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
