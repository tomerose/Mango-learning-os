"use client";

import * as React from "react";
import { Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ExamQuestion } from "@/lib/types";

interface Props {
  onAddMany: (questions: Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">[]) => void;
  defaultSubject: string;
  disabled?: boolean;
}

function addOne(item: Record<string, unknown>, defSubject: string): Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt"> | null {
  if (!item.question || item.answer === undefined) return null;
  return {
    subject: String(item.subject ?? defSubject),
    topic: String(item.topic ?? "导入"),
    type: (["mcq", "fill_blank", "problem"].includes(String(item.type)) ? String(item.type) : "mcq") as ExamQuestion["type"],
    question: String(item.question),
    options: Array.isArray(item.options) ? item.options as string[] : [],
    answer: String(item.answer),
    explanation: String(item.explanation ?? ""),
    difficulty: (["easy", "medium", "hard"].includes(String(item.difficulty)) ? String(item.difficulty) : "medium") as ExamQuestion["difficulty"],
  };
}

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(s => s.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",").map(s => s.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
}

export function ImportDialog({ onAddMany, defaultSubject, disabled }: Props) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"url" | "file" | "doc">("url");
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState("");
  const [fileName, setFileName] = React.useState("");

  function reset() { setError(""); setResult(""); setFileName(""); }

  // URL import
  async function importUrl() {
    if (!url.trim()) { setError("请输入 URL"); return; }
    setLoading(true); setError(""); setResult("");
    try {
      let json: unknown;
      if (url.includes("github.com") || url.includes("raw.githubusercontent.com")) {
        const r = await fetch(`/api/exam/github-sync?url=${encodeURIComponent(url.trim())}`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "请求失败");
        json = d.questions;
      } else {
        const r = await fetch(url.trim());
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        json = await r.json();
      }
      const arr = Array.isArray(json) ? json : (json as Record<string, unknown>)?.questions ?? [];
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("未找到有效题目");
      const added = arr.map((q: Record<string, unknown>) => addOne(q, defaultSubject)).filter(Boolean) as Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">[];
      onAddMany(added);
      setResult(`成功导入 ${added.length} 道题目`);
      setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally { setLoading(false); }
  }

  // File import (JSON/CSV)
  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setLoading(true); setError(""); setResult("");
    try {
      const raw = await file.text();
      const isCsv = file.name.endsWith(".csv");
      const arr: Record<string, unknown>[] = isCsv ? parseCsv(raw) : JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("未找到有效题目");
      const added = arr.map(q => addOne(q, defaultSubject)).filter(Boolean) as Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">[];
      onAddMany(added);
      setResult(`成功导入 ${added.length} 道题目`);
      setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "文件解析失败");
    } finally { setLoading(false); }
  }

  // Document → AI extraction
  async function importDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setLoading(true); setError(""); setResult("");
    setFileName(file.name + " 解析中…");
    try {
      const form = new FormData(); form.append("file", file);
      const exRes = await fetch("/api/exam/file-import", { method: "POST", body: form });
      const exData = await exRes.json();
      if (!exRes.ok) throw new Error(exData.error || "文件解析失败");
      setFileName(file.name + " → AI 出题中…");
      const gRes = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: defaultSubject,
          topic: file.name.replace(/\.[^.]+$/, ""),
          count: 5, difficulty: "medium", types: "mcq",
          sourceText: exData.text,
          extra: "严格基于上传文档内容出题",
        }),
      });
      const gData = await gRes.json();
      if (!gRes.ok) throw new Error(gData.error || "AI 生成失败");
      onAddMany(gData.questions ?? []);
      setResult(`成功从文档提取 ${gData.total ?? gData.questions?.length ?? 0} 道题目`);
      setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败");
    } finally { setLoading(false); setFileName(""); }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1" disabled={disabled}>
          <Download className="size-3.5" /> 导入
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-4" />一键导入题库
          </DialogTitle>
          <DialogDescription>
            支持 JSON 链接、上传 JSON/CSV 文件、或上传文档由 AI 提取题目。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            {[
              { id: "url" as const, label: "JSON 链接" },
              { id: "file" as const, label: "上传 JSON 文件" },
              { id: "doc" as const, label: "上传文档→AI提取" },
            ].map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setError(""); setResult(""); }}
                className={cn("flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                  mode === m.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === "url" && (
            <Input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/.../questions.json" autoFocus />
          )}
          {mode === "file" && (
            <div>
              <input type="file" accept=".json,.csv" onChange={importFile}
                className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs" />
              <p className="text-muted-foreground text-[10px] mt-1">支持 .json 或 .csv 文件</p>
            </div>
          )}
          {mode === "doc" && (
            <div>
              <input type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={importDoc}
                className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs" />
              <p className="text-muted-foreground text-[10px] mt-1">上传 PDF/Word/笔记，AI 自动从内容中提取题目</p>
              {fileName && <p className="text-xs text-info mt-1">{fileName}</p>}
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">JSON 格式：</p>
            <code className="text-[11px] leading-relaxed break-all">
              {'[{"question":"...","type":"mcq","options":["A.","B.","C.","D."],"answer":"A.","explanation":"..."}]'}
            </code>
          </div>

          {loading && <Progress value={60} className="h-1.5" />}
          {error && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="size-3" />{error}</p>}
          {result && <p className="text-success text-xs flex items-center gap-1"><CheckCircle2 className="size-3" />{result}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          {mode === "url" && (
            <Button onClick={importUrl} disabled={loading || !url.trim()}>
              {loading ? <><Loader2 className="size-4 animate-spin" />导入中…</> : <><Download className="size-4" />导入</>}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
