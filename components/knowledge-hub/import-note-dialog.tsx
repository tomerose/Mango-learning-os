"use client";

import * as React from "react";
import {
  Download, Loader2, AlertCircle, CheckCircle2,
  FileText, Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Note, SubjectId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Import dialog — multi-source note import with optional AI
// auto-organization. Supports: file (.docx/.pdf/.md/.enex/.csv),
// URL import, and direct paste.
// ─────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultSource: "file" | "url" | "notion" | "evernote";
}

type ImportSource = "file" | "url" | "paste";

interface PendingItem {
  title: string;
  body: string;
  tags: string[];
  subject: SubjectId;
}

export function ImportNoteDialog({ open, onOpenChange, defaultSource }: Props) {
  const { addNote } = useStore();
  const [source, setSource] = React.useState<ImportSource>(
    defaultSource === "url" ? "url" : "file"
  );
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState("");
  const [previewText, setPreviewText] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [useAI, setUseAI] = React.useState(true);
  const [pendingNotes, setPendingNotes] = React.useState<PendingItem[] | null>(null);
  // Store extracted text for the confirm step
  const extractedRef = React.useRef<{ text: string; title: string }>({ text: "", title: "" });

  function reset() {
    setError(""); setResult(""); setPreviewText("");
    setFileName(""); setPendingNotes(null);
    extractedRef.current = { text: "", title: "" };
  }

  // ─── Common: finalize text → add note ──────────────────────
  async function finalize(text: string, fallbackTitle: string, hintSubject?: string) {
    if (useAI) {
      try {
        const res = await fetch("/api/notes/ai-organize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.slice(0, 6000), subjectHint: hintSubject }),
        });
        const data = await res.json();
        if (res.ok && data.title) {
          const aiBody = data.summary
            ? `> **AI 摘要**：${data.summary}\n\n---\n\n${text}`
            : text;
          addNote({
            subject: (data.subject ?? hintSubject ?? "ai") as SubjectId,
            title: data.title,
            body: aiBody.slice(0, 80000),
            tags: data.tags ?? [],
          });
          setResult("已创建笔记（AI 整理）");
          setTimeout(() => { onOpenChange(false); reset(); }, 1000);
          return;
        }
      } catch { /* fall through */ }
    }
    // Manual
    addNote({
      subject: (hintSubject ?? "ai") as SubjectId,
      title: fallbackTitle.slice(0, 80),
      body: text.slice(0, 80000),
      tags: [],
    });
    setResult("已创建笔记");
    setTimeout(() => { onOpenChange(false); reset(); }, 1000);
  }

  // ─── URL import ────────────────────────────────────────────
  async function importUrl() {
    if (!url.trim()) { setError("请输入 URL"); return; }
    setLoading(true); setError(""); setResult(""); setPreviewText("");
    try {
      const res = await fetch("/api/notes/import/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "抓取失败");
      const title = data.title || url;
      extractedRef.current = { text: data.text, title };
      setPreviewText(data.text.slice(0, 2000));
      setFileName(title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "链接导入失败");
    } finally { setLoading(false); }
  }

  async function confirmUrlImport() {
    const { text, title } = extractedRef.current;
    if (!text) return;
    setLoading(true);
    await finalize(text, title || "网页笔记");
    setLoading(false);
  }

  // ─── File import ───────────────────────────────────────────
  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setLoading(true); setError(""); setResult(""); setPreviewText("");
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/notes/import/file", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "文件解析失败");

      if (data.multi && data.notes) {
        const notes: PendingItem[] = (data.notes as Array<{
          title: string; body: string; tags: string[];
        }>).map((n) => ({
          ...n,
          subject: "ai" as SubjectId,
        }));
        setPendingNotes(notes);
        setPreviewText(`检测到 ${notes.length} 条笔记，确认后批量导入。`);
      } else {
        const text = data.text ?? "";
        extractedRef.current = {
          text,
          title: data.fileName?.replace(/\.[^.]+$/, "") || "导入笔记",
        };
        setPreviewText(text.slice(0, 2000));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "文件解析失败");
    } finally { setLoading(false); }
  }

  async function confirmFileImport() {
    const { text, title } = extractedRef.current;
    if (!text) return;
    setLoading(true);
    await finalize(text, title || "导入笔记");
    setLoading(false);
  }

  async function confirmMultiImport() {
    if (!pendingNotes) return;
    setLoading(true);
    for (const n of pendingNotes) {
      addNote({
        subject: n.subject,
        title: n.title.slice(0, 80),
        body: n.body.slice(0, 80000),
        tags: n.tags,
      });
    }
    setResult(`成功导入 ${pendingNotes.length} 条笔记`);
    setTimeout(() => { onOpenChange(false); reset(); }, 1000);
    setLoading(false);
  }

  // ─── Paste import ───────────────────────────────────────────
  const [pasteText, setPasteText] = React.useState("");

  async function confirmPasteImport() {
    if (!pasteText.trim()) { setError("请输入文本内容"); return; }
    setLoading(true);
    await finalize(pasteText, "手动粘贴笔记");
    setLoading(false);
  }

  // Reset when source changes
  React.useEffect(() => { reset(); setUrl(""); setPasteText(""); }, [source]);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-4" />导入笔记
          </DialogTitle>
          <DialogDescription>
            支持 Word/PDF/Markdown 文件、网页链接、Evernote 导出。AI 可自动整理标签和摘要。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Source switcher */}
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            {([
              { id: "file" as const, label: "📄 文件" },
              { id: "url" as const, label: "🔗 链接" },
              { id: "paste" as const, label: "📋 粘贴" },
            ]).map((m) => (
              <button
                key={m.id}
                onClick={() => setSource(m.id)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                  source === m.id
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* AI toggle */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="size-3.5 accent-primary"
            />
            <Sparkles className="size-3" />
            AI 自动整理（生成标题、标签、摘要）
          </label>

          {/* File input */}
          {source === "file" && (
            <div>
              <input
                type="file"
                accept=".docx,.pdf,.md,.txt,.enex,.csv"
                onChange={importFile}
                className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs"
              />
              <p className="text-muted-foreground text-[10px] mt-1">
                支持 Word (.docx)、PDF、Markdown (.md)、Evernote (.enex)、CSV、纯文本
              </p>
            </div>
          )}

          {/* URL input */}
          {source === "url" && (
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                onKeyDown={(e) => e.key === "Enter" && importUrl()}
                autoFocus
              />
              <Button size="sm" onClick={importUrl} disabled={loading || !url.trim()}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : "抓取"}
              </Button>
            </div>
          )}

          {/* Paste input */}
          {source === "paste" && (
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="粘贴文本内容…"
              className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              rows={5}
            />
          )}

          {/* Preview */}
          {previewText && (
            <div className="bg-muted/50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="flex items-center gap-1 mb-1">
                <FileText className="size-3 text-muted-foreground" />
                <span className="text-xs font-medium">{fileName || "预览"}</span>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6">
                {previewText}
              </p>
            </div>
          )}

          {/* Status */}
          {loading && <Progress value={60} className="h-1.5" />}
          {error && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <AlertCircle className="size-3" />{error}
            </p>
          )}
          {result && (
            <p className="text-green-600 text-xs flex items-center gap-1">
              <CheckCircle2 className="size-3" />{result}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          {source === "url" && previewText && !pendingNotes && (
            <Button onClick={confirmUrlImport} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "确认导入"}
            </Button>
          )}
          {source === "file" && previewText && !pendingNotes && (
            <Button onClick={confirmFileImport} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "确认导入"}
            </Button>
          )}
          {pendingNotes && (
            <Button onClick={confirmMultiImport} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : `导入 ${pendingNotes.length} 条笔记`}
            </Button>
          )}
          {source === "paste" && pasteText.trim() && (
            <Button onClick={confirmPasteImport} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "确认导入"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
