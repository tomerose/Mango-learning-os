"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Brain, FileText, Layers, ChevronRight, BookOpen, ExternalLink, Video, GraduationCap, Sparkles, Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import Link from "next/link";
import { extractFallback, type ExtractedConcept, type ResourceRecommendation } from "@/lib/ai/knowledge-engine";

/* ═══════════════════════════════════════════════════════════════
   KnowledgeNetwork v2 — 4-layer Knowledge OS
   Notes → Concept Nodes → Graph → Resource Intelligence
   ═══════════════════════════════════════════════════════════════ */

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  book: BookOpen, course: GraduationCap, video: Video,
  paper: FileText, article: FileText, project: Target, website: ExternalLink,
};

interface NoteNode { note: { id: string; title: string; body: string; tags: string[]; subject: string }; concepts: ExtractedConcept[]; }

export function KnowledgeNetwork() {
  const { notes, flashcards, addNote } = useStore();
  const { subjects, getMeta } = useSubjects();

  // Build subject → concepts from note tags + AI extraction
  const subjectConcepts = React.useMemo(() => {
    const map: Record<string, { label: string; count: number; noteIds: string[] }[]> = {};
    for (const s of subjects) map[s.id] = [];

    const tagCounts: Record<string, Record<string, { count: number; noteIds: Set<string> }>> = {};
    for (const n of notes) {
      if (!tagCounts[n.subject]) tagCounts[n.subject] = {};
      for (const t of n.tags) {
        if (!tagCounts[n.subject][t]) tagCounts[n.subject][t] = { count: 0, noteIds: new Set() };
        tagCounts[n.subject][t].count++;
        tagCounts[n.subject][t].noteIds.add(n.id);
      }
    }
    for (const [subj, tags] of Object.entries(tagCounts)) {
      const entries = Object.entries(tags).sort((a, b) => b[1].count - a[1].count).slice(0, 12);
      map[subj] = entries.map(([label, data]) => ({
        label, count: data.count, noteIds: [...data.noteIds],
      }));
      if (!map[subj]) map[subj] = [];
    }
    return map;
  }, [notes, subjects]);

  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = React.useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

  const conceptLabel = React.useMemo(() => {
    if (!selectedConcept || !selectedSubject) return "";
    return subjectConcepts[selectedSubject]?.find(c => `${selectedSubject}-${c.label}` === selectedConcept)?.label ?? "";
  }, [selectedConcept, selectedSubject, subjectConcepts]);

  const conceptNotes = React.useMemo(() => {
    if (!conceptLabel || !selectedSubject) return [];
    return notes.filter(n => n.subject === selectedSubject && n.tags.includes(conceptLabel));
  }, [conceptLabel, selectedSubject, notes]);

  const selectedNote = React.useMemo(() => {
    if (!selectedNoteId) return null;
    return notes.find(n => n.id === selectedNoteId) ?? null;
  }, [selectedNoteId, notes]);

  // AI extraction for selected note
  const [noteConcepts, setNoteConcepts] = React.useState<ExtractedConcept[]>([]);
  const [noteResources, setNoteResources] = React.useState<ResourceRecommendation[]>([]);
  React.useEffect(() => {
    if (!selectedNote) { setNoteConcepts([]); setNoteResources([]); return; }
    const result = extractFallback(selectedNote);
    setNoteConcepts(result.concepts);
    setNoteResources(result.resources);
  }, [selectedNote]);

  const activeSubjects = subjects.filter(s => (subjectConcepts[s.id]?.length ?? 0) > 0);
  const totalConcepts = Object.values(subjectConcepts).reduce((s, c) => s + c.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* ── L1: Subject Nodes ── */}
      <div>
        <p className="text-label mb-3">知识森林</p>
        <div className="flex flex-wrap gap-2">
          {activeSubjects.length === 0 && (
            <p className="text-small text-fg-muted py-4">创建笔记并添加标签，知识网络将自动生长</p>
          )}
          {activeSubjects.map((s) => {
            const meta = getMeta(s.id);
            const isSelected = selectedSubject === s.id;
            return (
              <motion.button key={s.id}
                onClick={() => { setSelectedSubject(isSelected ? null : s.id); setSelectedConcept(null); setSelectedNoteId(null); }}
                className={cn("flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition-all duration-200 pressable",
                  isSelected ? "border-primary/40 bg-primary-subtle shadow-md" : "border-border bg-surface-low hover:bg-surface-high")}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <span className="size-3 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-small font-medium">{meta.short}</span>
                <span className="text-caption">{subjectConcepts[s.id]?.length ?? 0} 概念</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── L2: Concept Nodes ── */}
      <AnimatePresence>
        {selectedSubject && (() => {
          const meta = getMeta(selectedSubject);
          const concepts = subjectConcepts[selectedSubject] ?? [];
          if (concepts.length === 0) return null;
          return (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="ml-4 pl-4 border-l-2 border-border/50">
                <p className="text-label mb-3">{meta.label} · 知识节点</p>
                <div className="flex flex-wrap gap-1.5">
                  {concepts.map((c) => {
                    const cid = `${selectedSubject}-${c.label}`;
                    const isSelected = selectedConcept === cid;
                    return (
                      <motion.button key={cid}
                        onClick={() => { setSelectedConcept(isSelected ? null : cid); setSelectedNoteId(null); }}
                        className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all duration-200 pressable",
                          isSelected ? "border-primary/30 bg-primary-subtle" : "border-border/50 hover:bg-surface-high")}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                        <Brain className="size-3 text-fg-muted" />
                        {c.label}
                        <span className="text-caption">({c.count})</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── L3: Notes + Resources ── */}
      <AnimatePresence>
        {selectedConcept && conceptNotes.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="ml-8 pl-4 border-l-2 border-border/50 flex flex-col gap-4">
              {/* Notes */}
              <div>
                <p className="text-label mb-2">相关笔记 ({conceptNotes.length})</p>
                <div className="flex flex-col gap-2">
                  {conceptNotes.map((n) => (
                    <button key={n.id}
                      onClick={() => setSelectedNoteId(selectedNoteId === n.id ? null : n.id)}
                      className={cn("text-left rounded-xl border px-4 py-3 transition-all duration-200 hover:bg-surface-high",
                        selectedNoteId === n.id ? "border-primary/30 bg-primary-subtle" : "border-border/50 bg-surface-low")}>
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-fg-muted shrink-0" />
                        <span className="text-small font-medium truncate">{n.title}</span>
                        <ChevronRight className={cn("size-3 text-fg-subtle ml-auto transition-transform", selectedNoteId === n.id && "rotate-90")} />
                      </div>
                      <AnimatePresence>
                        {selectedNoteId === n.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <p className="text-small text-fg-muted mt-2 leading-relaxed whitespace-pre-wrap line-clamp-8">{n.body}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {n.tags.map(t => (<span key={t} className="text-caption bg-bg-muted rounded-md px-1.5 py-0.5">{t}</span>))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </div>
              </div>

              {/* L4: Resource Intelligence (for selected note) */}
              {selectedNote && noteConcepts.length > 0 && (
                <div className="card-card p-4">
                  <p className="text-small font-medium mb-3 flex items-center gap-1.5">
                    <Sparkles className="size-4 text-primary" /> 知识提取
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {noteConcepts.map(c => (
                      <span key={c.name} className="inline-flex items-center gap-1 text-xs bg-primary-subtle rounded-lg px-2 py-1">
                        {c.type === "formula" ? "📐" : c.type === "method" ? "⚙️" : c.type === "book" ? "📖" : "💡"}
                        {c.name}
                      </span>
                    ))}
                  </div>
                  {noteResources.length > 0 && (
                    <>
                      <p className="text-label mb-2">推荐资源</p>
                      <div className="flex flex-col gap-1.5">
                        {noteResources.slice(0, 4).map((r, i) => {
                          const Icon = RESOURCE_ICONS[r.type] ?? BookOpen;
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs text-fg-muted">
                              <Icon className="size-3 shrink-0" />
                              <span className="flex-1 truncate">{r.title}</span>
                              <span className="text-caption capitalize">{r.type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Learning path */}
              {selectedNote && (
                <Link href={`/agent?subject=${selectedSubject}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <ArrowRight className="size-3" /> 向导师学习这个概念
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {totalConcepts === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Network className="size-12 text-fg-subtle" strokeWidth={1} />
          <div>
            <p className="text-small font-medium">你的知识森林</p>
            <p className="text-caption mt-1 max-w-xs">创建笔记并添加标签，AI 将自动提取概念、建立关系、推荐学习资源</p>
          </div>
        </div>
      )}
    </div>
  );
}

