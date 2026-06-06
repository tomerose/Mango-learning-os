"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain, FileText, Sparkles, X, ArrowRight, Loader2, Trees,
  Download, Check, BookOpen, Layers, Target,
  Upload, Globe, Pencil, Plus, Trash2,
  ChevronDown, ChevronRight, ExternalLink,
  Clock, Bookmark, Tag, FileUp, Link as LinkIcon, Copy,
  Lightbulb, AlertTriangle, ListTodo, GraduationCap,
  PanelLeftClose, PanelLeft, Search, Image, StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { listOfficialForests, getOfficialForest, generateForest, enrichForestFromWeb, type KnowledgeForest as ForestType, type ForestTopic, type ForestNote, type ForestResource, type ForestPath } from "@/lib/ai/forest-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════════════════════════
   Knowledge Forest v4 — Notion-Style Document System
   ┌──────────┬──────────────────────────────────┐
   │ Sidebar  │  Main Content (Structured Page) │
   │ ·Forests │  Cover → Title → Properties →    │
   │ ·Topics  │  Content sections → Comments     │
   │ ·Import  │  TOC on the right               │
   └──────────┴──────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */

// ── Color palette for topic types ───────────────────────────────
const TOPIC_COLORS: Record<string, string> = {
  concept: "#7B8FCA",
  skill: "#C58B74",
  book: "#8A9E8B",
  paper: "#D4A090",
  topic: "#9BB5C4",
  formula: "#C4A882",
  project: "#A08BC4",
};

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  concept: <Brain className="size-3.5" />,
  skill: <Target className="size-3.5" />,
  book: <BookOpen className="size-3.5" />,
  paper: <FileText className="size-3.5" />,
  topic: <Layers className="size-3.5" />,
  formula: <Lightbulb className="size-3.5" />,
  project: <ListTodo className="size-3.5" />,
};

// ── Community note type ─────────────────────────────────────────
interface CommunityNote { title: string; body: string; tags: string; }
interface CommunityForest {
  key: string; title: string; description: string;
  notes: Array<{ title: string; body: string; tags: string[] }>;
  sourceFiles?: Array<{ name: string; text: string }>;
  sourceUrls?: Array<{ url: string; text: string }>;
}

export function KnowledgeForest() {
  const { notes, addNote, updateNote, deleteNote, flashcards } = useStore();
  const { subjects, getMeta } = useSubjects();

  // ── State ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [activeForest, setActiveForest] = React.useState<ForestType | null>(null);
  const [genPrompt, setGenPrompt] = React.useState("");
  const [genLoading, setGenLoading] = React.useState(false);
  const [enrichLoading, setEnrichLoading] = React.useState(false);
  const [savedForests, setSavedForests] = React.useState<string[]>([]);

  // Topic expansion
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = React.useState<string>("topics"); // topics | notes | resources | path | flashcards

  // Note editor
  const [editNoteId, setEditNoteId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editBody, setEditBody] = React.useState("");
  const [editTags, setEditTags] = React.useState("");
  const [enriching, setEnriching] = React.useState(false);

  // Community forest
  const [showCommunityForm, setShowCommunityForm] = React.useState(false);
  const [commTitle, setCommTitle] = React.useState("");
  const [commDesc, setCommDesc] = React.useState("");
  const [commNotes, setCommNotes] = React.useState<CommunityNote[]>([]);
  const [communityForests, setCommunityForests] = React.useState<CommunityForest[]>([]);

  // Multi-source import within community form
  const [importMode, setImportMode] = React.useState<"manual" | "file" | "url">("manual");
  const [importUrl, setImportUrl] = React.useState("");
  const [importLoading, setImportLoading] = React.useState(false);
  const [importedFiles, setImportedFiles] = React.useState<Array<{ name: string; text: string }>>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Search
  const [searchQuery, setSearchQuery] = React.useState("");

  // ── Load community forests ─────────────────────────────────────
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("mango-community-forests-v2");
      if (stored) setCommunityForests(JSON.parse(stored));
    } catch { }
  }, []);

  // ── AI enrich note ─────────────────────────────────────────────
  async function enrichNote() {
    if (!editTitle.trim() || enriching) return;
    setEnriching(true);
    try {
      const res = await fetch("/api/notes/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), topic: editBody.trim().slice(0, 500) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.body) setEditBody(data.body);
        if (data.tags) setEditTags(Array.isArray(data.tags) ? data.tags.join(", ") : data.tags);
      }
    } catch { } finally { setEnriching(false); }
  }

  function saveEditedNote() {
    if (!editNoteId || !editTitle.trim()) return;
    updateNote(editNoteId, {
      title: editTitle.trim(),
      body: editBody.trim(),
      tags: editTags.split(/[,，\s]+/).map((t: string) => t.trim()).filter(Boolean),
    });
    setEditNoteId(null);
  }

  // ── Forest actions ──────────────────────────────────────────────
  async function handleGenerate() {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    const forest = await generateForest(genPrompt.trim());
    setActiveForest(forest);
    setGenLoading(false);
    setActiveSection("topics");
  }

  async function handleEnrichForest() {
    if (!activeForest) return;
    setEnrichLoading(true);
    const enriched = await enrichForestFromWeb(activeForest.title, activeForest);
    setActiveForest(enriched);
    setEnrichLoading(false);
  }

  function loadOfficial(key: string) {
    const forest = getOfficialForest(key);
    if (forest) {
      setActiveForest(forest);
      setActiveSection("topics");
    }
  }

  function saveForestToNotes() {
    if (!activeForest) return;
    activeForest.notes.forEach(n => {
      const subj = subjects.find(s => activeForest.topics.some(t => t.name === n.topic))?.id ?? subjects[0]?.id ?? "ai";
      addNote({ title: n.title, subject: subj, body: n.body, tags: n.tags });
    });
    // Also save flashcards
    activeForest.flashcards.forEach(f => {
      addNote({
        title: f.front,
        subject: subjects[0]?.id ?? "ai",
        body: f.back,
        tags: ["闪卡", activeForest.title],
      });
    });
    setSavedForests(prev => [...prev, activeForest.title]);
  }

  // ── Community forest ───────────────────────────────────────────
  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setImportLoading(true);
    const results: Array<{ name: string; text: string }> = [];

    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/notes/import/file", { method: "POST", body: form });
        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            results.push({ name: file.name, text: data.text });
          } else if (data.notes) {
            for (const n of data.notes as Array<{ title: string; body: string }>) {
              results.push({ name: n.title || file.name, text: n.body || "" });
            }
          }
        }
      } catch { }
    }
    // Convert imported text to community notes
    setCommNotes(prev => [...prev, ...results.map(r => ({
      title: r.name.replace(/\.[^.]+$/, ""),
      body: r.text.slice(0, 2000),
      tags: "导入",
    }))]);
    setImportedFiles(prev => [...prev, ...results]);
    setImportLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUrlImport() {
    if (!importUrl.trim() || importLoading) return;
    setImportLoading(true);
    try {
      const res = await fetch("/api/notes/import/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommNotes(prev => [...prev, {
          title: data.title || importUrl,
          body: (data.text || "").slice(0, 2000),
          tags: "网页导入",
        }]);
      }
    } catch { }
    setImportLoading(false);
    setImportUrl("");
  }

  function publishCommunityForest() {
    if (!commTitle.trim()) return;
    const allNotes = commNotes.map(n => ({
      title: n.title,
      body: n.body,
      tags: n.tags.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean),
    }));
    const newForest: CommunityForest = {
      key: `community-${Date.now()}`,
      title: commTitle.trim(),
      description: commDesc.trim() || "社区共享森林",
      notes: allNotes,
      sourceFiles: importedFiles.length > 0 ? importedFiles : undefined,
    };
    const updated = [newForest, ...communityForests];
    setCommunityForests(updated);
    try { localStorage.setItem("mango-community-forests-v2", JSON.stringify(updated)); } catch { }
    // Also save to user notes
    allNotes.forEach(n => {
      if (n.title.trim()) {
        addNote({
          subject: subjects[0]?.id ?? "ai",
          title: `[社区] ${n.title.trim()}`,
          body: n.body.trim(),
          tags: ["社区森林", commTitle.trim(), ...n.tags],
        });
      }
    });
    setCommTitle(""); setCommDesc(""); setCommNotes([]);
    setImportedFiles([]); setShowCommunityForm(false);
    setGenPrompt(commTitle.trim());
  }

  function deleteCommunityForest(key: string) {
    const updated = communityForests.filter(f => f.key !== key);
    setCommunityForests(updated);
    try { localStorage.setItem("mango-community-forests-v2", JSON.stringify(updated)); } catch { }
  }

  // ── Compute ────────────────────────────────────────────────────
  const officials = listOfficialForests();

  // Filter topics by search
  const filteredTopics = React.useMemo(() => {
    if (!activeForest) return [];
    if (!searchQuery.trim()) return activeForest.topics;
    const q = searchQuery.toLowerCase();
    return activeForest.topics.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.children.some(c => c.toLowerCase().includes(q))
    );
  }, [activeForest, searchQuery]);

  // TOC (Table of Contents) from topics
  const toc = React.useMemo(() => {
    if (!activeForest) return [];
    return activeForest.topics.map(t => ({ name: t.name, type: t.type }));
  }, [activeForest]);

  function toggleTopic(name: string) {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // Save indicator
  const isSaved = activeForest ? savedForests.includes(activeForest.title) : false;

  return (
    <div className="flex gap-0 min-h-[600px]">
      {/* ═══════════════════════════════════════════════════════
          LEFT SIDEBAR — Forest Navigator
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-r border-border/50 bg-bg-muted/30 flex flex-col"
          >
            <div className="p-4 flex flex-col gap-4">
              {/* Generator */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">生成新森林</p>
                <div className="flex gap-1.5">
                  <Input
                    value={genPrompt}
                    onChange={e => setGenPrompt(e.target.value)}
                    placeholder="输入学习目标…"
                    className="text-xs h-8"
                    onKeyDown={e => e.key === "Enter" && handleGenerate()}
                  />
                  <Button size="sm" onClick={handleGenerate} disabled={genLoading || !genPrompt.trim()} className="h-8 text-xs shrink-0">
                    {genLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Official Forests */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">官方森林</p>
                {officials.map(f => (
                  <button
                    key={f.key}
                    onClick={() => loadOfficial(f.key)}
                    className={cn(
                      "flex items-center gap-2 text-left text-xs rounded-lg px-2.5 py-2 transition-colors",
                      activeForest?.title === f.title
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-bg-muted text-fg-muted hover:text-fg"
                    )}
                  >
                    <Trees className="size-3.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{f.title}</p>
                      <p className="text-[10px] opacity-60 truncate">{f.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Community Forests */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">社区森林</p>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] -mr-1"
                    onClick={() => setShowCommunityForm(!showCommunityForm)}>
                    <Plus className="size-3 mr-0.5" /> 上传
                  </Button>
                </div>
                {communityForests.length === 0 ? (
                  <p className="text-[11px] text-fg-muted/60 px-2.5 py-1">
                    还没有社区森林。点击「上传」分享你的知识森林！
                  </p>
                ) : (
                  communityForests.map(f => (
                    <div key={f.key} className="group flex items-center gap-1.5">
                      <button
                        onClick={() => { setGenPrompt(f.title); handleGenerate(); }}
                        className="flex-1 flex items-center gap-2 text-left text-xs rounded-lg px-2.5 py-1.5 hover:bg-bg-muted transition-colors text-fg-muted hover:text-fg"
                      >
                        <Globe className="size-3 shrink-0" />
                        <span className="truncate">{f.title}</span>
                        <span className="text-[10px] opacity-50 shrink-0">{f.notes.length}笔记</span>
                      </button>
                      <button
                        onClick={() => deleteCommunityForest(f.key)}
                        className="opacity-0 group-hover:opacity-100 text-fg-muted hover:text-destructive shrink-0 p-0.5"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          COMMUNITY FOREST UPLOAD FORM (modal overlay)
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCommunityForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCommunityForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-bg-surface rounded-2xl border border-border shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col gap-4 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold">上传社区森林</p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    支持手动输入、文件导入(Word/PDF/MD)、网页链接抓取
                  </p>
                </div>
                <button onClick={() => setShowCommunityForm(false)} className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted">
                  <X className="size-4" />
                </button>
              </div>

              <Input
                value={commTitle}
                onChange={e => setCommTitle(e.target.value)}
                placeholder="森林主题，如：考研数学 · 线性代数" className="text-sm"
              />
              <Textarea
                value={commDesc}
                onChange={e => setCommDesc(e.target.value)}
                placeholder="简介…（可选）" className="text-sm min-h-16"
              />

              {/* ── Import Mode Switch ── */}
              <div className="flex rounded-lg border bg-muted/30 p-0.5">
                {([
                  { id: "manual" as const, label: "✏️ 手动输入", icon: <Pencil className="size-3" /> },
                  { id: "file" as const, label: "📄 文件导入", icon: <FileUp className="size-3" /> },
                  { id: "url" as const, label: "🔗 链接抓取", icon: <LinkIcon className="size-3" /> },
                ]).map(m => (
                  <button key={m.id} onClick={() => setImportMode(m.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors",
                      importMode === m.id
                        ? "bg-background shadow-sm text-fg"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m.icon}{m.label}
                  </button>
                ))}
              </div>

              {/* File Import */}
              {importMode === "file" && (
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf,.md,.txt,.enex,.csv"
                    multiple
                    onChange={handleFileImport}
                    className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs"
                  />
                  <p className="text-[10px] text-fg-muted">
                    支持 Word (.docx)、PDF、Markdown、Evernote (.enex)、纯文本。文件内容将自动转换为笔记。
                  </p>
                  {importedFiles.length > 0 && (
                    <div className="flex flex-col gap-1 bg-bg-muted rounded-lg p-2">
                      <p className="text-xs font-medium">已导入 {importedFiles.length} 个文件：</p>
                      {importedFiles.map((f, i) => (
                        <span key={i} className="text-[11px] text-fg-muted flex items-center gap-1.5">
                          <FileText className="size-3" /> {f.name} ({f.text.length} 字符)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* URL Import */}
              {importMode === "url" && (
                <div className="flex gap-2">
                  <Input
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="text-xs flex-1"
                    onKeyDown={e => e.key === "Enter" && handleUrlImport()}
                  />
                  <Button size="sm" onClick={handleUrlImport} disabled={importLoading || !importUrl.trim()}>
                    {importLoading ? <Loader2 className="size-3.5 animate-spin" /> : "抓取"}
                  </Button>
                </div>
              )}

              {/* Manual Note Entries */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">笔记内容 ({commNotes.length} 条)</span>
                  <button
                    onClick={() => setCommNotes(p => [...p, { title: "", body: "", tags: "" }])}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="size-3" /> 添加笔记
                  </button>
                </div>
                {commNotes.map((n, i) => (
                  <div key={i} className="flex flex-col gap-1.5 border border-border rounded-lg p-2.5 bg-bg-surface">
                    <div className="flex items-center gap-2">
                      <Input
                        value={n.title}
                        onChange={e => {
                          const updated = [...commNotes]; updated[i].title = e.target.value; setCommNotes(updated);
                        }}
                        placeholder={`笔记 ${i + 1} 标题`} className="text-xs flex-1"
                      />
                      <button onClick={() => setCommNotes(p => p.filter((_, j) => j !== i))}
                        className="text-fg-muted hover:text-destructive shrink-0"><X className="size-3.5" /></button>
                    </div>
                    <Textarea
                      value={n.body}
                      onChange={e => {
                        const updated = [...commNotes]; updated[i].body = e.target.value; setCommNotes(updated);
                      }}
                      placeholder="内容…" className="text-xs min-h-14"
                    />
                    <Input
                      value={n.tags}
                      onChange={e => {
                        const updated = [...commNotes]; updated[i].tags = e.target.value; setCommNotes(updated);
                      }}
                      placeholder="标签，逗号分隔" className="text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => {
                  setCommTitle(""); setCommDesc(""); setCommNotes([]);
                  setImportedFiles([]); setShowCommunityForm(false);
                }}>取消</Button>
                <Button size="sm" onClick={publishCommunityForest} disabled={!commTitle.trim()}>
                  <Upload className="size-3.5 mr-1" /> 发布到社区
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT — Notion-style Forest Page
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar: sidebar toggle + breadcrumb */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted text-fg-muted"
            title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
          </button>
          {activeForest && (
            <div className="flex items-center gap-1 text-xs text-fg-muted">
              <Trees className="size-3.5" />
              <span className="text-fg font-medium">{activeForest.title}</span>
              <span className="mx-1">·</span>
              <span>{activeForest.estimatedWeeks}周</span>
              {isSaved && <span className="text-emerald-500 flex items-center gap-1 ml-1"><Check className="size-3" />已保存</span>}
            </div>
          )}
          <div className="flex-1" />
          {activeForest && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleEnrichForest}
                disabled={enrichLoading}
                className="text-[10px] text-fg-muted hover:text-primary flex items-center gap-1 transition-colors"
              >
                {enrichLoading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                网络充实
              </button>
              {!isSaved ? (
                <button onClick={saveForestToNotes}
                  className="text-[10px] text-primary font-medium hover:underline flex items-center gap-1">
                  <Download className="size-3" />保存到笔记
                </button>
              ) : null}
              <button onClick={() => { setActiveForest(null); setSavedForests([]); }}
                className="text-[10px] text-fg-muted hover:text-destructive transition-colors">
                清除
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!activeForest && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <motion.div
              className="size-20 rounded-full bg-primary/5 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Trees className="size-10 text-primary/40" strokeWidth={1.5} />
            </motion.div>
            <div>
              <p className="text-base font-semibold">知识森林</p>
              <p className="text-sm text-fg-muted mt-1 max-w-md">
                选择一个官方森林、输入学习目标生成森林、或上传你的知识体系。
                <br />AI 将自动构建完整的知识结构、笔记、闪卡和学习路径。
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="size-4 text-amber-500" />
              <span className="text-xs text-fg-muted">
                目前 {officials.length} 个官方森林 · {communityForests.length} 个社区森林
              </span>
            </div>
          </div>
        )}

        {/* Active Forest Content */}
        {activeForest && (
          <div className="flex-1 overflow-y-auto">
            {/* ── Cover / Hero ── */}
            <div className="relative bg-gradient-to-b from-primary/5 via-primary/3 to-transparent px-8 pt-8 pb-4">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-serif font-bold tracking-tight">{activeForest.title}</h1>
                <p className="text-sm text-fg-muted mt-1.5">{activeForest.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-fg-muted">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {activeForest.estimatedWeeks} 周</span>
                  <span className="flex items-center gap-1"><Layers className="size-3" /> {activeForest.topics.length} 主题</span>
                  <span className="flex items-center gap-1"><FileText className="size-3" /> {activeForest.notes.length} 笔记</span>
                  <span className="flex items-center gap-1"><Bookmark className="size-3" /> {activeForest.flashcards.length} 闪卡</span>
                </div>
              </div>
            </div>

            {/* ── Properties Bar ── */}
            <div className="px-8 py-2 border-b border-border/30">
              <div className="max-w-3xl mx-auto flex items-center gap-4 text-xs">
                <span className="text-fg-muted">属性</span>
                <Badge variant="secondary" className="text-[10px]">
                  <Clock className="size-3 mr-1" />{activeForest.estimatedWeeks}周完成
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  <GraduationCap className="size-3 mr-1" />{activeForest.topics.length}知识模块
                </Badge>
                {activeForest.learningPath.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    <ListTodo className="size-3 mr-1" />{activeForest.learningPath.length}学习阶段
                  </Badge>
                )}
              </div>
            </div>

            {/* ── Content Body ── */}
            <div className="max-w-3xl mx-auto px-8 py-6 flex flex-col gap-8">
              {/* ── Section Tabs ── */}
              <div className="flex gap-1 border-b border-border/30 pb-0 overflow-x-auto">
                {([
                  { key: "topics", label: "知识体系", icon: <Brain className="size-3.5" />, count: activeForest.topics.length },
                  { key: "notes", label: "学习笔记", icon: <FileText className="size-3.5" />, count: activeForest.notes.length },
                  { key: "resources", label: "学习资源", icon: <BookOpen className="size-3.5" />, count: activeForest.resources.length },
                  { key: "path", label: "学习路径", icon: <ListTodo className="size-3.5" />, count: activeForest.learningPath.length },
                  { key: "flashcards", label: "闪卡复习", icon: <Layers className="size-3.5" />, count: activeForest.flashcards.length },
                ]).map(s => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSection(s.key)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs px-3 py-2 border-b-2 -mb-[1px] transition-colors shrink-0",
                      activeSection === s.key
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-fg-muted hover:text-fg"
                    )}
                  >
                    {s.icon} {s.label}
                    <span className="text-[10px] opacity-60">({s.count})</span>
                  </button>
                ))}
              </div>

              {/* ── TOPICS Section ── */}
              {activeSection === "topics" && (
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="搜索主题…"
                      className="pl-9 text-xs"
                    />
                  </div>

                  {/* Topic cards */}
                  <div className="flex flex-col gap-3">
                    {filteredTopics.map((topic, i) => {
                      const isExpanded = expandedTopics.has(topic.name);
                      const color = TOPIC_COLORS[topic.type] ?? "#9BB5C4";
                      return (
                        <motion.div
                          key={topic.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="rounded-xl border border-border/60 overflow-hidden bg-bg-surface hover:shadow-sm transition-shadow"
                        >
                          {/* Topic header */}
                          <button
                            onClick={() => toggleTopic(topic.name)}
                            className="w-full flex items-start gap-3 p-4 text-left hover:bg-bg-muted/50 transition-colors"
                          >
                            <div
                              className="size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: `${color}15` }}
                            >
                              <span style={{ color }}>{TOPIC_ICONS[topic.type] ?? <Target className="size-3.5" />}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{topic.name}</span>
                                <span
                                  className="text-[10px] rounded-full px-1.5 py-0.5 font-medium"
                                  style={{ backgroundColor: `${color}15`, color }}
                                >
                                  {topic.type}
                                </span>
                              </div>
                              <p className="text-xs text-fg-muted mt-1 leading-relaxed">{topic.summary}</p>
                              {topic.children.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <span className="text-[10px] text-fg-muted/60">
                                    {isExpanded ? "收起" : `${topic.children.length} 个子主题`}
                                  </span>
                                  <ChevronDown className={cn("size-3 text-fg-muted transition-transform", isExpanded && "rotate-180")} />
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Children (expandable) */}
                          <AnimatePresence>
                            {isExpanded && topic.children.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pl-14 flex flex-col gap-1.5">
                                  {topic.children.map((child, ci) => (
                                    <div key={ci}
                                      className="flex items-center gap-2 text-xs text-fg-muted py-1.5 px-3 rounded-lg hover:bg-bg-muted/50 transition-colors"
                                    >
                                      <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                      {child}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {filteredTopics.length === 0 && (
                    <p className="text-sm text-fg-muted text-center py-8">没有匹配的主题</p>
                  )}
                </div>
              )}

              {/* ── NOTES Section ── */}
              {activeSection === "notes" && (
                <div className="flex flex-col gap-4">
                  {activeForest.notes.length === 0 ? (
                    <p className="text-sm text-fg-muted text-center py-8">暂无笔记</p>
                  ) : (
                    activeForest.notes.map((note, i) => {
                      const userNote = notes.find(un => un.title.includes(note.title) || note.title.includes(un.title));
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="rounded-xl border border-border/50 p-4 hover:shadow-sm transition-shadow bg-bg-surface group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <StickyNote className="size-3.5 text-fg-muted shrink-0" />
                                <h3 className="text-sm font-semibold">{note.title}</h3>
                                <span className="text-[10px] text-fg-muted bg-bg-muted rounded-full px-1.5 py-0.5">
                                  {note.topic}
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-fg-muted leading-relaxed whitespace-pre-wrap">
                                {note.body}
                              </div>
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {note.tags.map(tag => (
                                    <span key={tag}
                                      className="text-[9px] rounded-full bg-bg-muted px-2 py-0.5 text-fg-muted/70"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Hover actions */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              {userNote ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditNoteId(userNote.id);
                                      setEditTitle(userNote.title);
                                      setEditBody(userNote.body);
                                      setEditTags(userNote.tags.join(", "));
                                    }}
                                    className="text-[10px] text-primary hover:underline flex items-center gap-1"
                                  >
                                    <Pencil className="size-3" /> 编辑
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditNoteId(userNote.id);
                                      setEditTitle(userNote.title);
                                      setEditBody(userNote.body);
                                      setEditTags(userNote.tags.join(", "));
                                      enrichNote();
                                    }}
                                    className="text-[10px] text-amber-600 hover:underline flex items-center gap-1"
                                  >
                                    <Sparkles className="size-3" /> AI充实
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    addNote({
                                      subject: subjects[0]?.id ?? "ai",
                                      title: note.title,
                                      body: note.body,
                                      tags: note.tags,
                                    });
                                  }}
                                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                                >
                                  <Plus className="size-3" /> 加入笔记
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ── RESOURCES Section ── */}
              {activeSection === "resources" && (
                <div className="flex flex-col gap-3">
                  {activeForest.resources.length === 0 ? (
                    <p className="text-sm text-fg-muted text-center py-8">暂无资源</p>
                  ) : (
                    activeForest.resources.map((res, i) => (
                      <motion.a
                        key={i}
                        href={res.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all bg-bg-surface group"
                      >
                        <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                          <BookOpen className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                              {res.title}
                            </span>
                            <span className="text-[10px] rounded-full bg-bg-muted px-1.5 py-0.5 text-fg-muted">
                              {res.type}
                            </span>
                          </div>
                          <p className="text-xs text-fg-muted mt-1">{res.description}</p>
                          <span className="text-[10px] text-fg-muted/60 mt-1 inline-flex items-center gap-1">
                            <Tag className="size-3" /> {res.forTopic}
                          </span>
                        </div>
                        {res.url && (
                          <ExternalLink className="size-3.5 text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </motion.a>
                    ))
                  )}
                </div>
              )}

              {/* ── LEARNING PATH Section ── */}
              {activeSection === "path" && (
                <div className="flex flex-col gap-4">
                  {activeForest.learningPath.length === 0 ? (
                    <p className="text-sm text-fg-muted text-center py-8">暂无学习路径</p>
                  ) : (
                    <div className="relative pl-8">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                      {activeForest.learningPath.map((phase, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="relative pb-6 last:pb-0"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-8 top-1.5 size-3 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                            <span className="text-[8px] text-primary font-bold">{i + 1}</span>
                          </div>
                          <div className="rounded-xl border border-border/50 p-4 bg-bg-surface">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm font-semibold">{phase.phase}</h3>
                              <Badge variant="secondary" className="text-[10px]">
                                <Clock className="size-3 mr-1" />{phase.duration}
                              </Badge>
                            </div>
                            {phase.tasks.length > 0 && (
                              <div className="flex flex-col gap-1 mb-2">
                                {phase.tasks.map((task, ti) => (
                                  <div key={ti} className="flex items-center gap-2 text-xs text-fg-muted">
                                    <div className="size-1 rounded-full bg-primary/40 shrink-0" />
                                    {task}
                                  </div>
                                ))}
                              </div>
                            )}
                            {phase.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {phase.topics.map(t => (
                                  <span key={t} className="text-[10px] rounded-full bg-primary/5 text-primary px-2 py-0.5">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── FLASHCARDS Section ── */}
              {activeSection === "flashcards" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-fg-muted">
                      共 {activeForest.flashcards.length} 张闪卡
                    </p>
                    <Link
                      href={`/exam?subject=${encodeURIComponent(activeForest.title)}`}
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      开始复习 <ArrowRight className="size-3" />
                    </Link>
                  </div>
                  {activeForest.flashcards.length === 0 ? (
                    <p className="text-sm text-fg-muted text-center py-8">暂无闪卡</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeForest.flashcards.map((card, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="rounded-xl border border-border/50 p-4 bg-bg-surface hover:shadow-sm transition-all group cursor-pointer"
                        >
                          <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                            <Lightbulb className="size-3 text-amber-500" />
                            {card.front}
                          </p>
                          <div className="h-px bg-border/50 my-2" />
                          <p className="text-xs text-fg-muted leading-relaxed">
                            {card.back}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Tutor Prompts (bottom) ── */}
            {activeForest.tutorPrompts.length > 0 && (
              <div className="max-w-3xl mx-auto px-8 pb-8">
                <div className="rounded-xl border border-amber-200/50 bg-amber-50/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="size-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700">AI 导师引导</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {activeForest.tutorPrompts.map((prompt, i) => (
                      <Link
                        key={i}
                        href={`/agent?subject=ai&q=${encodeURIComponent(prompt)}`}
                        className="text-xs text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowRight className="size-3" />
                        {prompt}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Inline Note Editor Modal ── */}
        <AnimatePresence>
          {editNoteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
              onClick={() => setEditNoteId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-bg-surface rounded-2xl border border-border shadow-xl max-w-lg w-full flex flex-col gap-4 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Pencil className="size-4" /> 编辑笔记
                  </span>
                  <button onClick={() => setEditNoteId(null)} className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted">
                    <X className="size-4" />
                  </button>
                </div>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="标题" className="text-sm" autoFocus />
                <div className="relative">
                  <Textarea value={editBody} onChange={e => setEditBody(e.target.value)} placeholder="内容…（支持 Markdown）" className="min-h-36 text-sm" />
                  <button
                    onClick={enrichNote}
                    disabled={enriching || !editTitle.trim()}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-xs rounded-lg bg-amber-100 text-amber-700 px-2 py-1 hover:bg-amber-200 transition-colors disabled:opacity-50"
                  >
                    {enriching ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                    AI 充实
                  </button>
                </div>
                <Input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="标签，逗号分隔" className="text-sm" />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditNoteId(null)}>取消</Button>
                  <Button size="sm" onClick={saveEditedNote} disabled={!editTitle.trim()}>保存修改</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
