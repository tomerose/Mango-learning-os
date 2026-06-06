"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, BookOpen, Lightbulb, Mic, Search,
  Target, BookMarked, Trash2, Edit3, Clock, Layers,
  ChevronRight, Loader2, PenLine, FileUp, Brain,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/page-transition";
import { useStore } from "@/lib/store";
import type { Note } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════
   Notes — 6 Templates, Real CRUD, Mobile-First
   ═══════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  { id: "cornell", name: "Cornell 笔记", icon: BookOpen, desc: "关键词/笔记/总结三栏", hint: "适合课堂记录和复习" },
  { id: "concept", name: "概念笔记", icon: Lightbulb, desc: "定义→理解→例子→应用", hint: "适合学习新概念" },
  { id: "lecture", name: "课堂笔记", icon: Mic, desc: "章节→要点→疑问→总结", hint: "适合听课记录" },
  { id: "exam", name: "考试复习", icon: Target, desc: "考点→公式→例题→陷阱", hint: "适合考前整理" },
  { id: "reading", name: "阅读摘要", icon: BookMarked, desc: "来源→论点→证据→评价", hint: "适合论文/书籍阅读" },
  { id: "mistake", name: "错题笔记", icon: PenLine, desc: "错题→原因→正解→同类题", hint: "适合整理错题" },
];

type View = "list" | "create" | "edit";

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [view, setView] = React.useState<View>("list");
  const [search, setSearch] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);

  // Create form state
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [content, setContent] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.body?.toLowerCase().includes(q) ||
      n.subject?.toLowerCase().includes(q)
    );
  }, [notes, search]);

  function handleCreate() {
    if (!title.trim() && !content.trim()) return;
    addNote({
      title: title.trim() || "无标题笔记",
      subject: subject.trim() || "未分类",
      body: content.trim(),
      tags: [],
      template: selectedTemplate ?? undefined,
    });
    setView("list");
    resetForm();
  }

  function handleUpdate() {
    if (!editingNote) return;
    updateNote(editingNote.id, {
      title: title.trim() || editingNote.title,
      subject: subject.trim() || editingNote.subject,
      body: content.trim(),
    });
    setView("list");
    resetForm();
  }

  function handleEdit(note: Note) {
    setEditingNote(note);
    setTitle(note.title || "");
    setSubject(note.subject || "");
    setContent(note.body || "");
    setSelectedTemplate((note as Note & { template?: string }).template ?? null);
    setView("edit");
  }

  function handleDelete(id: string) {
    if (confirm("确定删除这条笔记？")) deleteNote(id);
  }

  function resetForm() {
    setTitle(""); setSubject(""); setContent(""); setSelectedTemplate(null); setEditingNote(null);
  }

  function getTemplateLabel(templateId?: string): string {
    const t = TEMPLATES.find(t => t.id === templateId);
    return t ? `${t.name}` : "";
  }

  return (
    <PageTransition>
    <div className="flex flex-col gap-5 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display font-serif">笔记</h1>
          <p className="text-sm text-fg-muted">结构化学习笔记 · 6种模板</p>
        </div>
        <div className="flex items-center gap-2">
          {view !== "list" ? (
            <button onClick={() => { setView("list"); resetForm(); }}
              className="text-sm text-fg-muted hover:text-fg transition-colors">
              ← 返回列表
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <ImportButton onImported={(text) => { setContent(text); setView("create"); }} />
              <Button onClick={() => setView("create")} size="sm" className="rounded-xl gap-1.5">
                <Plus className="size-3.5" /> 新建笔记
              </Button>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* ═══ LIST VIEW ═══ */}
        {view === "list" && (
          <motion.div key="list" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="size-4 absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-muted/40" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索笔记…"
                className="pl-10 h-11 rounded-xl"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 card-card">
                <FileText className="size-10 text-fg-muted/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-fg-muted">{search ? "没有匹配的笔记" : "还没有笔记"}</p>
                <p className="text-xs text-fg-muted/50 mt-1">
                  {search ? "试试其他关键词" : "点击「新建笔记」开始记录"}
                </p>
                {!search && (
                  <Button onClick={() => setView("create")} size="sm" className="mt-4 rounded-xl">
                    <Plus className="size-3.5 mr-1.5" /> 新建笔记
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(note => (
                  <motion.div key={note.id} layout
                    className="card-card p-4 flex flex-col gap-3 group hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{note.title || "无标题"}</p>
                        <p className="text-[10px] text-fg-muted/50 mt-0.5">
                          {note.subject} · {note.updatedLabel}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        {getTemplateLabel((note as Note & { template?: string }).template) || "自由"}
                      </Badge>
                    </div>
                    <p className="text-xs text-fg-muted/70 line-clamp-3 leading-relaxed">
                      {note.body?.slice(0, 150) || "（空内容）"}
                    </p>
                    <div className="flex items-center gap-1 mt-auto pt-2 border-t border-border/30">
                      <button onClick={() => handleEdit(note)}
                        className="flex-1 text-[10px] text-fg-muted hover:text-primary flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-bg-subtle transition-colors">
                        <Edit3 className="size-3" /> 编辑
                      </button>
                      <button onClick={() => handleDelete(note.id)}
                        className="flex-1 text-[10px] text-fg-muted hover:text-red-500 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="size-3" /> 删除
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ CREATE / EDIT VIEW ═══ */}
        {(view === "create" || view === "edit") && (
          <motion.div key="create" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="card-card p-5 sm:p-6 flex flex-col gap-5">
            <h2 className="text-lg font-serif font-medium">
              {view === "edit" ? "编辑笔记" : "新建笔记"}
            </h2>

            {/* Template selector */}
            <div>
              <p className="text-xs font-medium text-fg-muted mb-2">选择模板</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TEMPLATES.map(tpl => {
                  const Icon = tpl.icon;
                  return (
                    <button key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-xs",
                        selectedTemplate === tpl.id
                          ? "border-primary bg-primary-subtle"
                          : "border-border hover:border-primary/30"
                      )}>
                      <Icon className="size-3.5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{tpl.name}</p>
                        <p className="text-[10px] text-fg-muted/50 truncate">{tpl.hint}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3">
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="笔记标题" className="h-11 rounded-xl text-sm" />
              <Input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="科目/主题" className="h-11 rounded-xl text-sm" />
              <Textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder={selectedTemplate
                  ? `${TEMPLATES.find(t => t.id === selectedTemplate)?.desc}…`
                  : "开始写笔记…"}
                className="min-h-[200px] text-sm rounded-xl" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={view === "edit" ? handleUpdate : handleCreate}
                disabled={!title.trim() && !content.trim()}
                className="rounded-xl gap-1.5">
                {view === "edit" ? "保存修改" : "保存笔记"}
              </Button>
              <button onClick={() => { setView("list"); resetForm(); }}
                className="text-sm text-fg-muted hover:text-fg transition-colors px-3">
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  );
}

// ── Import Button: TXT/MD/PDF/DOCX → text ──────────────────────

function ImportButton({ onImported }: { onImported: (text: string) => void }) {
  const [importing, setImporting] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      let text = await file.text();
      if (file.name.endsWith(".pdf") || file.name.endsWith(".docx")) {
        text = text.replace(/[^\x20-\x7E一-鿿　-〿＀-￯\n\r]/g, " ").replace(/\s{3,}/g, "\n").trim();
        if (text.length < 10) text = `[${file.name}] 二进制格式，请复制粘贴内容或使用 AI Agent 上传分析`;
      }
      if (text.trim()) onImported(text.trim());
    } catch { alert("导入失败，请复制粘贴内容。"); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".txt,.md,.pdf,.docx,.doc" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current?.click()} disabled={importing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs text-fg-muted hover:text-fg hover:border-primary/30 transition-colors">
        {importing ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        导入
      </button>
    </>
  );
}
