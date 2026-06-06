"use client";

import * as React from "react";
import { Plus, Trash2, FileText, Download, FileUp, Link, Copy, FileOutput, Printer, Pencil, Sparkles, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUBJECT_META } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { ImportNoteDialog } from "@/components/knowledge-hub/import-note-dialog";
import { RichEditor } from "@/components/knowledge-hub/rich-editor";
import type { SubjectId } from "@/lib/types";

export function NotesTab() {
  const { notes, addNote, updateNote, deleteNote, hydrated } = useStore();
  const { subjects } = useSubjects();
  const [open, setOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importSource, setImportSource] = React.useState<"file" | "url" | "notion" | "evernote">("file");
  const [subject, setSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [enriching, setEnriching] = React.useState(false);

  function reset() {
    setSubject("ai");
    setTitle("");
    setBody("");
    setTags("");
    setEditingId(null);
  }

  function startEdit(note: typeof notes[0]) {
    setEditingId(note.id);
    setSubject(note.subject);
    setTitle(note.title);
    setBody(note.body);
    setTags(note.tags.join(", "));
    setOpen(true);
  }

  // AI enrichment via Wikipedia + web search
  async function enrichContent() {
    if (!title.trim() || enriching) return;
    setEnriching(true);
    try {
      const res = await fetch("/api/notes/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), topic: body.trim().slice(0, 500) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.body) setBody(data.body);
        if (data.tags) setTags(Array.isArray(data.tags) ? data.tags.join(", ") : data.tags);
      }
    } catch {} finally { setEnriching(false); }
  }

  // ── Export helpers ─────────────────────────────────────
  function exportAsWord(note: typeof notes[0]) {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><style>body{font-family:'Microsoft YaHei',sans-serif;line-height:1.8;padding:2cm;}h1{font-size:22px;}p{font-size:14px;}</style></head>
<body><h1>${note.title}</h1><p><em>学科: ${SUBJECT_META[note.subject]?.label ?? note.subject} | 标签: ${note.tags.join(", ") || "无"}</em></p><hr><p>${note.body.replace(/\n/g, "<br>")}</p></body></html>`;
    downloadBlob(html, `${note.title}.doc`, "application/msword");
  }

  function exportAsPDF(note: typeof notes[0]) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${note.title}</title>
<style>body{font-family:'Microsoft YaHei',sans-serif;line-height:1.8;padding:2cm;max-width:800px;margin:auto;color:#1a1a1a;}
h1{font-size:22px;border-bottom:2px solid #e0e0e0;padding-bottom:8px;}
.meta{color:#888;font-size:13px;margin-bottom:20px;}
.content{font-size:14px;white-space:pre-wrap;}</style></head>
<body><h1>${note.title}</h1><p class="meta">学科: ${SUBJECT_META[note.subject]?.label ?? note.subject} | 标签: ${note.tags.join(", ") || "无"} | ${note.updatedLabel}</p>
<div class="content">${note.body}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  function exportAll() {
    const allHtml = notes.map((n) => `<div style="margin-bottom:40px;"><h1>${n.title}</h1><p style="color:#888;">学科: ${SUBJECT_META[n.subject]?.label ?? n.subject} | 标签: ${n.tags.join(", ")}</p><p style="white-space:pre-wrap;">${n.body}</p></div>`).join("<hr>");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><style>body{font-family:'Microsoft YaHei',sans-serif;line-height:1.8;padding:2cm;}h1{font-size:20px;}</style></head>
<body><h1 style="text-align:center;">📝 Mango OS 笔记导出</h1><p style="text-align:center;color:#888;">共 ${notes.length} 篇 · ${new Date().toLocaleDateString("zh-CN")}</p>${allHtml}</body></html>`;
    downloadBlob(html, `Mango_笔记_${new Date().toISOString().slice(0,10)}.doc`, "application/msword");
  }

  function downloadBlob(content: string, filename: string, mime: string) {
    const blob = new Blob(["﻿" + content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function submit() {
    if (!title.trim()) return;
    const noteData = {
      subject,
      title: title.trim(),
      body: body.trim(),
      tags: tags.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean),
    };
    if (editingId) {
      updateNote(editingId, noteData);
    } else {
      addNote(noteData);
    }
    reset();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">
            {hydrated ? `${notes.length} 篇笔记` : "加载中…"}
          </p>
          {notes.length > 0 && (
            <button onClick={exportAll} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <Download className="size-3" /> 全部导出
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ImportNoteDialog
            open={importOpen}
            onOpenChange={setImportOpen}
            defaultSource={importSource}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Download className="size-4" /> 导入
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => { setImportSource("file"); setImportOpen(true); }}
              >
                <FileUp className="size-4" /> 从文件导入
                <span className="text-muted-foreground text-[11px] ml-auto">Word/PDF/MD</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setImportSource("url"); setImportOpen(true); }}
              >
                <Link className="size-4" /> 从链接导入
                <span className="text-muted-foreground text-[11px] ml-auto">网页抓取</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { setImportSource("notion"); setImportOpen(true); }}
              >
                <FileText className="size-4" /> Notion 导出
                <span className="text-muted-foreground text-[11px] ml-auto">MD/CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setImportSource("evernote"); setImportOpen(true); }}
              >
                <Copy className="size-4" /> Evernote 导出
                <span className="text-muted-foreground text-[11px] ml-auto">.enex</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> 新建笔记
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "编辑笔记" : "新建笔记"}</DialogTitle>
              <DialogDescription>
                {editingId ? "修改标题、内容或标签后保存。" : "保存到本地，刷新后依然在。配置 Supabase 后将自动云端同步。"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubject(s.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      subject === s.id
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "hover:bg-accent text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="标题"
                autoFocus
              />
              <div className="flex flex-col gap-1 border rounded-lg overflow-hidden">
                <RichEditor
                  title={title}
                  onTitleChange={setTitle}
                  body={body}
                  onBodyChange={setBody}
                  tags={tags}
                  onTagsChange={setTags}
                  onEnrich={enrichContent}
                  enriching={enriching}
                  className="min-h-48"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
                取消
              </Button>
              <Button onClick={submit} disabled={!title.trim()}>
                {editingId ? "更新" : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <FileText className="size-8 opacity-40" />
          <p className="text-sm">还没有笔记，点「新建笔记」开始沉淀</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((n) => {
            const meta = SUBJECT_META[n.subject];
            return (
              <Card key={n.id} className="group transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: meta.color }}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      {meta.short}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">{n.updatedLabel}</span>
                      <button onClick={() => startEdit(n)} title="编辑" className="text-muted-foreground hover:text-primary opacity-0 transition-opacity group-hover:opacity-100"><Pencil className="size-3" /></button>
                      <button onClick={() => exportAsWord(n)} title="导出 Word" className="text-muted-foreground hover:text-primary opacity-0 transition-opacity group-hover:opacity-100"><FileOutput className="size-3" /></button>
                      <button onClick={() => exportAsPDF(n)} title="打印 PDF" className="text-muted-foreground hover:text-primary opacity-0 transition-opacity group-hover:opacity-100"><Printer className="size-3" /></button>
                      <button onClick={() => deleteNote(n.id)} aria-label="删除笔记" className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                  <h3 className="font-medium">{n.title}</h3>
                  {n.body && (
                    <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">
                      {n.body}
                    </p>
                  )}
                  {n.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {n.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
