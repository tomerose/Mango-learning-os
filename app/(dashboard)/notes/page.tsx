"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, BookOpen, Lightbulb, Mic, Search,
  Target, BookMarked, Trash2, Edit3, Clock, Layers,
  ChevronRight, Loader2, PenLine, FileUp, Brain,
  Upload, Sparkles, Check, X, ArrowLeft,
  Copy, Wand2,
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
   Notes V2 — NotebookLM / Notion Style
   Templates fill content · AI 分析 · Sections editor
   ═══════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  { id: "cornell", name: "Cornell", icon: "📝", desc: "关键词/笔记/总结", hint: "课堂记录",
    template: "## Cornell 笔记\n\n### 📌 关键词 / 提示\n\n\n### 📝 笔记正文\n\n\n### 💡 总结\n\n" },
  { id: "concept", name: "概念笔记", icon: "💡", desc: "定义→理解→例子→应用", hint: "学习新概念",
    template: "## 概念笔记\n\n### 📖 定义\n\n\n### 🧠 直觉理解\n\n\n### 📐 推导 / 步骤\n\n\n### 📋 例子\n\n- \n- \n\n### ⚠️ 易错点\n\n\n### 🚀 应用\n\n" },
  { id: "lecture", name: "课堂笔记", icon: "🎙️", desc: "章节→要点→疑问→总结", hint: "听课记录",
    template: "## 课堂笔记\n\n### 📅 日期：\n### 👤 讲师：\n### 📚 章节：\n\n### 📌 核心要点\n\n- \n- \n\n### ❓ 疑问\n\n- \n\n### 📝 课后总结\n\n" },
  { id: "exam", name: "考试复习", icon: "🎯", desc: "考点→公式→例题→陷阱", hint: "考前整理",
    template: "## 考试复习\n\n### 🎯 考试范围\n\n\n### 📊 高频考点\n\n1. \n2. \n3. \n\n### 📐 公式速查\n\n| 公式 | 条件 | 说明 |\n|------|------|------|\n| | | |\n\n### 📝 典型例题\n\n**题1：** \n**解：** \n\n### ⚠️ 常见陷阱\n\n- \n\n### ✅ 考前检查清单\n\n- [ ] \n- [ ] \n" },
  { id: "reading", name: "阅读摘要", icon: "📖", desc: "来源→论点→证据→评价", hint: "论文/书籍",
    template: "## 阅读摘要\n\n### 📚 来源信息\n- 作者：\n- 标题：\n- 年份：\n\n### 🎯 核心论点\n\n\n### 📊 关键证据\n\n- \n- \n\n### 🤔 个人评价\n\n\n### 🔗 与其他知识的关联\n\n" },
  { id: "mistake", name: "错题笔记", icon: "✏️", desc: "错题→原因→正解→同类题", hint: "整理错题",
    template: "## 错题笔记\n\n### ❌ 原题\n\n\n### 📝 我的答案（错误）\n\n\n### ✅ 正确答案\n\n\n### 🔍 错误原因\n- [ ] 概念不清\n- [ ] 计算失误\n- [ ] 记忆遗忘\n- [ ] 粗心\n\n### 💡 正确解法\n\n\n### 🔄 同类题练习\n\n" },
];

type View = "list" | "create" | "edit" | "detail";

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [view, setView] = React.useState<View>("list");
  const [search, setSearch] = React.useState("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [detailNote, setDetailNote] = React.useState<Note | null>(null);

  // Editor state
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [content, setContent] = React.useState("");
  const [aiProcessing, setAiProcessing] = React.useState(false);
  const [aiResult, setAiResult] = React.useState("");

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.body?.toLowerCase().includes(q) ||
      n.subject?.toLowerCase().includes(q)
    );
  }, [notes, search]);

  // ── Template click → fill content ──────────────────────────
  function selectTemplate(id: string) {
    setSelectedTemplateId(id);
    const tpl = TEMPLATES.find(t => t.id === id);
    if (tpl && !content.trim()) {
      setContent(tpl.template);
    }
  }

  // ── AI 分析笔记 ────────────────────────────────────────────
  async function analyzeWithAI() {
    if (!content.trim() || aiProcessing) return;
    setAiProcessing(true);
    setAiResult("");
    try {
      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: `请分析并结构化以下笔记内容：\n\n${content.slice(0, 3000)}` }),
      });
      const data = await res.json();
      if (data.outputs?.[0]?.content?.explanation) {
        setAiResult(data.outputs[0].content.explanation);
      } else if (data.summary) {
        setAiResult(data.summary);
      } else {
        setAiResult("AI 分析完成。请在下方查看建议。");
      }
    } catch { setAiResult("AI 分析暂时不可用，请稍后重试。"); }
    finally { setAiProcessing(false); }
  }

  function applyAiResult() {
    if (aiResult) setContent(prev => prev + "\n\n---\n## 🤖 AI 分析\n\n" + aiResult);
    setAiResult("");
  }

  // ── CRUD ────────────────────────────────────────────────────
  function handleCreate() {
    if (!title.trim() && !content.trim()) return;
    addNote({
      title: title.trim() || "无标题笔记",
      subject: subject.trim() || "未分类",
      body: content.trim(),
      tags: [],
      template: selectedTemplateId ?? undefined,
    });
    setView("list"); resetForm();
  }

  function handleUpdate() {
    if (!editingNote) return;
    updateNote(editingNote.id, {
      title: title.trim() || editingNote.title,
      subject: subject.trim() || editingNote.subject,
      body: content.trim(),
    });
    setView("list"); resetForm();
  }

  function openDetail(note: Note) { setDetailNote(note); setView("detail"); }
  function openEdit(note: Note) {
    setEditingNote(note);
    setTitle(note.title || "");
    setSubject(note.subject || "");
    setContent(note.body || "");
    setSelectedTemplateId((note as Note & { template?: string }).template ?? null);
    setView("edit");
  }
  function handleDelete(id: string) { if (confirm("确定删除？")) deleteNote(id); }
  function resetForm() {
    setTitle(""); setSubject(""); setContent("");
    setSelectedTemplateId(null); setEditingNote(null); setAiResult("");
  }

  return (
    <PageTransition>
    <div className="flex flex-col gap-5 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display font-serif">笔记</h1>
          <p className="text-sm text-fg-muted">NotebookLM 风格 · AI 增强 · 6种模板</p>
        </div>
        {view !== "list" ? (
          <button onClick={() => { setView("list"); resetForm(); }}
            className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors">
            <ArrowLeft className="size-4" /> 返回
          </button>
        ) : (
          <Button onClick={() => setView("create")} size="sm" className="rounded-xl gap-1.5">
            <Plus className="size-3.5" /> 新建笔记
          </Button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {/* ═══ LIST ═══ */}
        {view === "list" && (
          <motion.div key="list" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex flex-col gap-4">
            <div className="relative">
              <Search className="size-4 absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle/90" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索笔记…" className="pl-10 h-11 rounded-xl" />
            </div>
            {filtered.length === 0 ? (
              <EmptyState hasSearch={!!search} onCreate={() => setView("create")} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(note => (
                  <NoteCard key={note.id} note={note} onClick={() => openDetail(note)} onEdit={() => openEdit(note)} onDelete={() => handleDelete(note.id)} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ CREATE / EDIT ═══ */}
        {(view === "create" || view === "edit") && (
          <motion.div key="editor" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="flex flex-col gap-5">
            {/* Template selector */}
            <div className="card-card p-4">
              <p className="text-xs font-medium text-fg-muted mb-3 flex items-center gap-1.5">
                <Layers className="size-3" /> 选择模板 ({selectedTemplate ? selectedTemplate.name : "自由格式"})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => selectTemplate(tpl.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all",
                      selectedTemplateId === tpl.id
                        ? "border-primary bg-primary-subtle ring-1 ring-primary/20"
                        : "border-border hover:border-primary/20"
                    )}>
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor card */}
            <div className="card-card p-5 flex flex-col gap-4">
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="笔记标题" className="h-12 rounded-xl text-lg font-serif font-medium border-0 bg-transparent px-0 focus-visible:ring-0" />
              <Input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="科目 / 主题" className="h-9 rounded-xl text-sm" />

              {/* Notion-style sections editor */}
              <div className="relative">
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={selectedTemplate
                    ? "模板已加载，开始填写内容…"
                    : "开始写笔记… 支持 Markdown 格式"}
                  className="min-h-[350px] text-sm rounded-xl font-mono leading-relaxed"
                />
                {/* AI toolbar */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <button onClick={analyzeWithAI} disabled={aiProcessing || !content.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 shadow-sm">
                    {aiProcessing ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
                    AI 分析
                  </button>
                </div>
              </div>

              {/* AI result */}
              {aiResult && (
                <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                  className="bg-primary-subtle rounded-xl p-4 text-sm leading-relaxed">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary flex items-center gap-1"><Sparkles className="size-3" /> AI 分析结果</span>
                    <div className="flex gap-1">
                      <button onClick={applyAiResult} className="text-[10px] text-primary font-medium hover:underline">应用到笔记</button>
                      <button onClick={() => setAiResult("")} className="text-[10px] text-fg-muted hover:text-fg">×</button>
                    </div>
                  </div>
                  <p className="text-xs text-fg-muted/70 whitespace-pre-wrap">{aiResult}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                <Button onClick={view === "edit" ? handleUpdate : handleCreate}
                  disabled={!title.trim() && !content.trim()}
                  className="rounded-xl gap-1.5">
                  <Check className="size-3.5" />
                  {view === "edit" ? "保存修改" : "保存笔记"}
                </Button>
                <button onClick={() => { setView("list"); resetForm(); }}
                  className="text-sm text-fg-muted hover:text-fg px-3">取消</button>
                <ImportButton onImported={(t) => setContent(prev => prev ? prev + "\n\n" + t : t)} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ DETAIL ═══ */}
        {view === "detail" && detailNote && (
          <motion.div key="detail" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="card-card p-5 sm:p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-serif font-semibold">{detailNote.title || "无标题"}</h2>
              <p className="text-xs text-fg-muted/90 mt-1">
                {detailNote.subject} · {detailNote.updatedLabel}
                {(detailNote as Note & { template?: string }).template && (
                  <Badge variant="secondary" className="ml-2 text-[9px]">
                    {TEMPLATES.find(t => t.id === (detailNote as Note & { template?: string }).template)?.name || "模板"}
                  </Badge>
                )}
              </p>
            </div>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap text-fg-muted/80">
              {detailNote.body || "（空内容）"}
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/30">
              <Button onClick={() => openEdit(detailNote)} variant="outline" size="sm" className="rounded-xl gap-1.5">
                <Edit3 className="size-3" /> 编辑
              </Button>
              <Button onClick={() => handleDelete(detailNote.id)} variant="outline" size="sm"
                className="rounded-xl gap-1.5 text-red-500 hover:text-red-600">
                <Trash2 className="size-3" /> 删除
              </Button>
              <button onClick={() => navigator.clipboard.writeText(detailNote.body || "")}
                className="ml-auto text-xs text-fg-muted hover:text-fg flex items-center gap-1 px-2">
                <Copy className="size-3" /> 复制
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  );
}

// ── Note Card ───────────────────────────────────────────────────

function NoteCard({ note, onClick, onEdit, onDelete }: {
  note: Note; onClick: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const tplName = TEMPLATES.find(t => t.id === (note as Note & { template?: string }).template)?.name;
  return (
    <motion.div layout onClick={onClick}
      className="card-card p-4 flex flex-col gap-3 group hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{note.title || "无标题"}</p>
          <p className="text-[10px] text-fg-muted/80 mt-0.5">{note.subject} · {note.updatedLabel}</p>
        </div>
        <Badge variant="outline" className="text-[9px] shrink-0">{tplName || "自由"}</Badge>
      </div>
      <p className="text-xs text-fg-muted/70 line-clamp-3 leading-relaxed">{note.body?.slice(0, 150) || "（空内容）"}</p>
      <div className="flex items-center gap-1 mt-auto pt-2 border-t border-border/30" onClick={e => e.stopPropagation()}>
        <button onClick={onEdit} className="flex-1 text-[10px] text-fg-muted hover:text-primary flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-bg-subtle"><Edit3 className="size-3" />编辑</button>
        <button onClick={onDelete} className="flex-1 text-[10px] text-fg-muted hover:text-red-500 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-red-50"><Trash2 className="size-3" />删除</button>
      </div>
    </motion.div>
  );
}

function EmptyState({ hasSearch, onCreate }: { hasSearch: boolean; onCreate: () => void }) {
  return (
    <div className="text-center py-16 card-card">
      <FileText className="size-12 text-fg-muted/15 mx-auto mb-4" />
      <p className="text-sm font-medium text-fg-muted">{hasSearch ? "没有匹配的笔记" : "还没有笔记"}</p>
      <p className="text-xs text-fg-muted/80 mt-1 mb-4">{hasSearch ? "试试其他关键词" : "选择模板，用 AI 增强你的笔记"}</p>
      {!hasSearch && <Button onClick={onCreate} className="rounded-xl gap-1.5"><Plus className="size-3.5" />新建笔记</Button>}
    </div>
  );
}

// ── Import ──────────────────────────────────────────────────────

function ImportButton({ onImported }: { onImported: (text: string) => void }) {
  const [importing, setImporting] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      let text = await file.text();
      if (file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        text = text.replace(/[^\x20-\x7E一-鿿　-〿＀-￯\n\r]/g, " ").replace(/\s{3,}/g, "\n").trim();
        if (text.length < 20) text = `[${file.name}] 二进制格式无法直接读取。请：\n1. 复制粘贴原文内容\n2. 导出为 .txt 后导入\n3. 在 Agent 页面上传并让 AI 提取内容`;
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
        {importing ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}导入
      </button>
    </>
  );
}
