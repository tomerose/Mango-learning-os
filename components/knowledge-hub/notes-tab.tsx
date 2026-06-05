"use client";

import * as React from "react";
import { Plus, Trash2, FileText, Download, FileUp, Link, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { SubjectId } from "@/lib/types";

export function NotesTab() {
  const { notes, addNote, deleteNote, hydrated } = useStore();
  const { subjects } = useSubjects();
  const [open, setOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importSource, setImportSource] = React.useState<"file" | "url" | "notion" | "evernote">("file");
  const [subject, setSubject] = React.useState<SubjectId>(subjects[0]?.id ?? "ai");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState("");

  function reset() {
    setSubject("ai");
    setTitle("");
    setBody("");
    setTags("");
  }

  function submit() {
    if (!title.trim()) return;
    addNote({
      subject,
      title: title.trim(),
      body: body.trim(),
      tags: tags
        .split(/[,，\s]+/)
        .map((t) => t.trim())
        .filter(Boolean),
    });
    reset();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {hydrated ? `${notes.length} 篇笔记` : "加载中…"}
        </p>
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
              <DialogTitle>新建笔记</DialogTitle>
              <DialogDescription>
                保存到本地，刷新后依然在。配置 Supabase 后将自动云端同步。
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
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="内容…"
                className="min-h-28"
              />
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="标签，用逗号或空格分隔"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={submit} disabled={!title.trim()}>
                保存
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
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {n.updatedLabel}
                      </span>
                      <button
                        onClick={() => deleteNote(n.id)}
                        aria-label="删除笔记"
                        className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
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
