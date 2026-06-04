"use client";

import * as React from "react";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Globe, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useSubjects } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import type { ExamQuestion, QuestionType } from "@/lib/types";

const QUESTION_TYPES: { id: QuestionType; label: string }[] = [
  { id: "mcq", label: "选择题" },
  { id: "fill_blank", label: "填空题" },
  { id: "problem", label: "解答题" },
];
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

interface Props {
  onAddMany: (questions: Omit<ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">[]) => void;
  disabled?: boolean;
}

export function AIGenerateDialog({ onAddMany, disabled }: Props) {
  const { subjects } = useSubjects();
  const [open, setOpen] = React.useState(false);

  const [genMode, setGenMode] = React.useState<"basic" | "urls" | "file">("basic");
  const [genSubj, setGenSubj] = React.useState(subjects[0]?.id ?? "");
  const [genTopic, setGenTopic] = React.useState("");
  const [genCount, setGenCount] = React.useState(5);
  const [genDifficulty, setGenDifficulty] = React.useState<"easy" | "medium" | "hard">("medium");
  const [genTypes, setGenTypes] = React.useState<Set<QuestionType>>(new Set(["mcq"]));
  const [genExtra, setGenExtra] = React.useState("");
  const [sourceUrls, setSourceUrls] = React.useState("");
  const [sourceText, setSourceText] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState("");

  function reset() {
    setGenMode("basic"); setGenTopic(""); setSourceUrls(""); setSourceText(""); setFileName("");
    setError(""); setResult("");
  }

  function toggleType(t: QuestionType) {
    setGenTypes(prev => {
      const n = new Set(prev);
      n.has(t) ? n.delete(t) : n.add(t);
      if (n.size === 0) n.add(t);
      return n;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setProgress(30);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/exam/file-import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      setSourceText(data.text || "");
      setProgress(50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "文件处理失败");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  async function generate() {
    if (!genTopic.trim()) { setError("请输入主题"); return; }
    setLoading(true);
    setError("");
    setResult("");
    setProgress(20);

    try {
      const payload: Record<string, unknown> = {
        subject: genSubj,
        topic: genTopic.trim(),
        count: genCount,
        difficulty: genDifficulty,
        types: [...genTypes].join(","),
        extra: genExtra.trim(),
      };
      if (genMode === "file" && sourceText) payload.sourceText = sourceText;
      if (genMode === "urls" && sourceUrls.trim()) {
        payload.sourceUrls = sourceUrls.split("\n").map(s => s.trim()).filter(Boolean);
      }

      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProgress(70);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `生成失败 (${res.status})`);

      onAddMany(data.questions ?? []);
      setProgress(100);
      setResult(`成功生成 ${data.total ?? data.questions?.length ?? 0} 道题目`);
      setTimeout(() => { setOpen(false); reset(); }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1" disabled={disabled}>
          <Sparkles className="size-3.5" /> AI 生成题库
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />AI 生成题库
          </DialogTitle>
          <DialogDescription>
            AI 根据主题、难度和资料来源自动批量生成题目。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select value={genSubj} onChange={e => setGenSubj(e.target.value)}
              className="rounded-md border px-2 py-1.5 text-sm bg-background flex-1">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={genCount} onChange={e => setGenCount(Number(e.target.value))}
              className="rounded-md border px-2 py-1.5 text-sm bg-background w-20">
              {[3, 5, 8, 10, 15].map(n => <option key={n} value={n}>{n}题</option>)}
            </select>
          </div>
          <Input value={genTopic} onChange={e => setGenTopic(e.target.value)}
            placeholder="主题，如「Transformer 自注意力机制」" autoFocus />
          <div className="flex gap-1">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setGenDifficulty(d)}
                className={cn("rounded-md border px-2 py-1 text-xs", genDifficulty === d ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent")}>
                {{ easy: "简单", medium: "中等", hard: "困难" }[d]}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">题目类型（可多选）</span>
            <div className="flex gap-1">
              {QUESTION_TYPES.map(t => (
                <button key={t.id} onClick={() => toggleType(t.id)}
                  className={cn("rounded-md border px-3 py-1 text-xs font-medium", genTypes.has(t.id) ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent text-muted-foreground")}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Data Source ──────────────────────────────── */}
          <div className="border-t pt-3">
            <span className="text-xs font-medium text-muted-foreground block mb-2">
              数据来源（可选 — AI 基于此资料出题）
            </span>
            <div className="flex rounded-lg border bg-muted/30 p-0.5 mb-3">
              {[
                { id: "basic" as const, label: "仅主题关键词" },
                { id: "urls" as const, label: "网页链接" },
                { id: "file" as const, label: "上传文件/粘贴" },
              ].map(m => (
                <button key={m.id} onClick={() => setGenMode(m.id)}
                  className={cn("flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                    genMode === m.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {m.label}
                </button>
              ))}
            </div>

            {genMode === "urls" && (
              <div>
                <Textarea value={sourceUrls} onChange={e => setSourceUrls(e.target.value)}
                  placeholder={"输入网页链接，每行一个。AI 将抓取内容作为出题依据。\n例如：\nhttps://en.wikipedia.org/wiki/Backpropagation"}
                  className="min-h-20 text-sm font-mono text-xs" />
                <p className="text-muted-foreground text-[10px] mt-1 flex items-center gap-1">
                  <Globe className="size-3" />支持 Wikipedia、ArXiv、技术博客等公开页面
                </p>
              </div>
            )}

            {genMode === "file" && (
              <div className="flex flex-col gap-2">
                <input type="file" onChange={handleFile}
                  accept=".pdf,.docx,.doc,.txt,.md,.html,.htm"
                  className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-primary/90" />
                <p className="text-muted-foreground text-[10px] flex items-center gap-1">
                  <FileText className="size-3" />支持 PDF / Word / TXT / Markdown / HTML
                </p>
                {fileName && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle2 className="size-3" />{fileName} (已提取文本)
                  </p>
                )}
                <span className="text-muted-foreground text-[10px] pt-1">或直接粘贴文本：</span>
                <Textarea value={sourceText} onChange={e => setSourceText(e.target.value)}
                  placeholder="直接粘贴笔记、文章、教材段落…" className="min-h-20 text-sm" />
              </div>
            )}
          </div>

          <Textarea value={genExtra} onChange={e => setGenExtra(e.target.value)}
            placeholder="额外要求（可选）如：侧重应用、包含公式计算…" className="min-h-14 text-sm" />

          {loading && <Progress value={progress} className="h-1.5" />}
          {error && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="size-3" />{error}</p>}
          {result && <p className="text-success text-xs flex items-center gap-1"><CheckCircle2 className="size-3" />{result}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>取消</Button>
          <Button onClick={generate} disabled={loading || !genTopic.trim()}>
            {loading ? <><Loader2 className="size-4 animate-spin" />生成中…</> : <><Sparkles className="size-4" />生成 {genCount} 题</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
