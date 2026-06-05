"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Brain, FileText, Layers, ChevronRight, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";

/* ═══════════════════════════════════════════════════════════════
   KnowledgeNetwork — Interactive neural knowledge map
   Subjects → Concepts → Notes. Click to explore.
   ═══════════════════════════════════════════════════════════════ */

interface ConceptNode {
  id: string; label: string; count: number; subject: string;
}

interface NoteDetail {
  id: string; title: string; body: string; tags: string[]; subject: string;
}

export function KnowledgeNetwork() {
  const { notes, flashcards } = useStore();
  const { subjects, getMeta } = useSubjects();

  // Build subject → concepts map from notes tags
  const subjectConcepts = React.useMemo(() => {
    const map: Record<string, ConceptNode[]> = {};
    for (const s of subjects) map[s.id] = [];
    // Gather concepts from note tags
    const tagCounts: Record<string, Record<string, number>> = {};
    for (const n of notes) {
      if (!tagCounts[n.subject]) tagCounts[n.subject] = {};
      for (const t of n.tags) {
        tagCounts[n.subject][t] = (tagCounts[n.subject][t] ?? 0) + 1;
      }
    }
    for (const [subj, tags] of Object.entries(tagCounts)) {
      const entries = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 10);
      map[subj] = entries.map(([label, count], i) => ({
        id: `${subj}-${label}`,
        label,
        count,
        subject: subj,
      }));
    }
    return map;
  }, [notes, subjects]);

  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = React.useState<string | null>(null);
  const [detailNote, setDetailNote] = React.useState<NoteDetail | null>(null);

  // Notes for selected concept
  const conceptNotes = React.useMemo(() => {
    if (!selectedConcept || !selectedSubject) return [];
    const conceptLabel = subjectConcepts[selectedSubject]?.find(c => c.id === selectedConcept)?.label;
    if (!conceptLabel) return [];
    return notes.filter(n => n.subject === selectedSubject && n.tags.includes(conceptLabel));
  }, [selectedConcept, selectedSubject, notes, subjectConcepts]);

  const activeSubjects = subjects.filter(s => (subjectConcepts[s.id]?.length ?? 0) > 0);
  const totalConcepts = Object.values(subjectConcepts).reduce((s, c) => s + c.length, 0);

  if (totalConcepts === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Network className="size-10 text-fg-subtle" strokeWidth={1} />
        <div>
          <p className="text-small font-medium">还没有知识节点</p>
          <p className="text-caption mt-1">在笔记中添加标签后，这里会展示学科知识网络</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Subject Nodes (neural network layer 1) ── */}
      <div>
        <p className="text-label mb-3">学科</p>
        <div className="flex flex-wrap gap-2">
          {activeSubjects.map((s) => {
            const meta = getMeta(s.id);
            const conceptCount = subjectConcepts[s.id]?.length ?? 0;
            const isSelected = selectedSubject === s.id;
            return (
              <motion.button
                key={s.id}
                onClick={() => {
                  setSelectedSubject(isSelected ? null : s.id);
                  setSelectedConcept(null);
                  setDetailNote(null);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition-all duration-200 pressable",
                  isSelected
                    ? "border-primary/40 bg-primary-subtle shadow-md"
                    : "border-border bg-surface-low hover:bg-surface-high",
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="size-3 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-small font-medium">{meta.label}</span>
                <span className="text-caption ml-1">{conceptCount} 概念</span>
                {isSelected && <ChevronRight className="size-3 text-primary rotate-90" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Concept Nodes (layer 2, shown when subject selected) ── */}
      <AnimatePresence>
        {selectedSubject && (() => {
          const meta = getMeta(selectedSubject);
          const concepts = subjectConcepts[selectedSubject] ?? [];
          if (concepts.length === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="ml-4 pl-4 border-l-2 border-border/50">
                <p className="text-label mb-3">{meta.label} · 知识点</p>
                <div className="flex flex-wrap gap-1.5">
                  {concepts.map((c) => {
                    const isSelected = selectedConcept === c.id;
                    return (
                      <motion.button
                        key={c.id}
                        onClick={() => {
                          setSelectedConcept(isSelected ? null : c.id);
                          setDetailNote(null);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all duration-200 pressable",
                          isSelected
                            ? "border-primary/30 bg-primary-subtle"
                            : "border-border/50 hover:bg-surface-high",
                        )}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                      >
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

      {/* ── Notes (layer 3, shown when concept selected) ── */}
      <AnimatePresence>
        {selectedConcept && conceptNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="ml-8 pl-4 border-l-2 border-border/50">
              <p className="text-label mb-3">相关笔记 ({conceptNotes.length})</p>
              <div className="flex flex-col gap-2">
                {conceptNotes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setDetailNote(detailNote?.id === n.id ? null : n)}
                    className={cn(
                      "text-left rounded-xl border px-4 py-3 transition-all duration-200 hover:bg-surface-high",
                      detailNote?.id === n.id
                        ? "border-primary/30 bg-primary-subtle"
                        : "border-border/50 bg-surface-low",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-3.5 text-fg-muted shrink-0" />
                      <span className="text-small font-medium truncate">{n.title}</span>
                      <ChevronRight className={cn("size-3 text-fg-subtle ml-auto transition-transform", detailNote?.id === n.id && "rotate-90")} />
                    </div>
                    <AnimatePresence>
                      {detailNote?.id === n.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-small text-fg-muted mt-2 leading-relaxed whitespace-pre-wrap line-clamp-6">
                            {n.body}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {n.tags.map(t => (
                              <span key={t} className="text-caption bg-bg-muted rounded-md px-1.5 py-0.5">{t}</span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
