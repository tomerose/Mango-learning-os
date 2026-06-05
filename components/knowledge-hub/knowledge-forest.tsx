"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain, FileText, Sparkles, X, ArrowRight, Loader2, Trees,
  Download, Check, BookOpen, GraduationCap, Layers, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { listOfficialForests, getOfficialForest, generateForest, type KnowledgeForest as ForestType } from "@/lib/ai/forest-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ═══════════════════════════════════════════════════════════════
   Knowledge Forest v3 — Hierarchical 3D Sphere System
   Big spheres = subjects → click → concept nodes orbit → click → notes
   ═══════════════════════════════════════════════════════════════ */

// ═══ Spherical projection ═══
function sphereProject(x: number, y: number, z: number, cx: number, cy: number) {
  const r = 140;
  const px = cx + r * Math.sin(x) * Math.cos(y);
  const py = cy + r * Math.cos(x) * 0.55;
  const scale = 0.5 + 0.5 * Math.sin(x) * 0.8;
  return { px, py, scale: 0.6 + scale * 0.4, zi: Math.round(Math.sin(x) * Math.sin(y) * 10) };
}

export function KnowledgeForest() {
  const { notes, addNote, flashcards } = useStore();
  const { subjects, getMeta } = useSubjects();

  // State
  const [genPrompt, setGenPrompt] = React.useState("");
  const [genLoading, setGenLoading] = React.useState(false);
  const [activeForest, setActiveForest] = React.useState<ForestType | null>(null);
  const [savedForests, setSavedForests] = React.useState<string[]>([]);
  const [rotation, setRotation] = React.useState(0);
  const [mouseOver, setMouseOver] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-rotation
  React.useEffect(() => {
    if (mouseOver) return;
    const id = setInterval(() => setRotation(r => r + 0.12), 50);
    return () => clearInterval(id);
  }, [mouseOver]);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    setRotation(r => r + x * 0.4);
  }, []);

  // Build subjects from active forest or user notes
  const subjectNodes = React.useMemo(() => {
    if (activeForest) {
      // From forest: group topics by first topic as subject
      return activeForest.topics.slice(0, 6).map((t, i) => ({
        id: t.name,
        label: t.name,
        type: t.type,
        children: t.children ?? [],
        color: ["#C58B74", "#8A9E8B", "#7B8FCA", "#D4A090", "#9BB5C4", "#C4A882"][i % 6],
        theta: (i / 6) * Math.PI * 2,
        phi: 0.3 + Math.random() * 0.4,
        count: activeForest.notes.filter(n => n.topic === t.name).length || 1,
      }));
    }
    // From user notes: subjects with concepts
    return subjects.filter(s => notes.some(n => n.subject === s.id)).map((s, i) => {
      const meta = getMeta(s.id);
      const count = notes.filter(n => n.subject === s.id).length;
      return {
        id: s.id,
        label: meta.label,
        type: "subject" as const,
        children: [...new Set(notes.filter(n => n.subject === s.id).flatMap(n => n.tags))].slice(0, 6),
        color: meta.color,
        theta: (i / Math.max(1, subjects.length)) * Math.PI * 2,
        phi: 0.3 + (i * 0.4),
        count,
      };
    });
  }, [activeForest, notes, subjects, getMeta]);

  // Demo nodes when nothing exists
  const hasData = subjectNodes.length > 0;
  const demoNodes = !hasData ? ["AI", "经济", "金融", "数学", "英语"].map((l, i) => ({
    id: `demo-${l}`,
    label: l,
    type: "subject" as const,
    children: ["概念1", "概念2", "概念3"],
    color: ["#C58B74", "#8A9E8B", "#7B8FCA", "#D4A090", "#9BB5C4"][i],
    theta: (i / 5) * Math.PI * 2,
    phi: 0.3 + i * 0.3,
    count: 1,
  })) : [];

  const displayNodes = hasData ? subjectNodes : demoNodes;
  const cx = 220, cy = 200;

  // Concept nodes for selected subject
  const conceptNodes = React.useMemo(() => {
    if (!selectedSubject) return [];
    const parent = displayNodes.find(n => n.id === selectedSubject);
    if (!parent) return [];
    return parent.children.map((c, i) => ({
      id: `${selectedSubject}-${c}`,
      label: c,
      theta: (i / parent.children.length) * Math.PI * 2 + rotation * 0.03,
      phi: 0.8 + (i * 0.3),
      radius: 80 + i * 15,
      color: parent.color,
    }));
  }, [selectedSubject, displayNodes, rotation]);

  // Notes for selected concept
  const conceptNotes = React.useMemo(() => {
    if (!selectedConcept || !activeForest) return [];
    return activeForest.notes.filter(n => n.topic === selectedConcept || n.tags.includes(selectedConcept));
  }, [selectedConcept, activeForest]);

  // ═══ Actions ═══
  async function handleGenerate() {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    const forest = await generateForest(genPrompt.trim());
    setActiveForest(forest);
    setGenLoading(false);
  }

  function loadOfficial(key: string) {
    const forest = getOfficialForest(key);
    if (forest) setActiveForest(forest);
  }

  function saveForestToNotes() {
    if (!activeForest) return;
    activeForest.notes.forEach(n => {
      // Find matching subject or default to "ai"
      const subj = subjects.find(s => activeForest.topics.some(t => t.name === n.topic))?.id ?? subjects[0]?.id ?? "ai";
      addNote({ title: n.title, subject: subj, body: n.body, tags: n.tags });
    });
    setSavedForests(prev => [...prev, activeForest.title]);
  }

  const officials = listOfficialForests();

  return (
    <div className="flex flex-col gap-6">
      {/* ── Generator ── */}
      <div className="card-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <p className="text-small font-medium">生成知识森林</p>
        </div>
        <div className="flex gap-2">
          <Input value={genPrompt} onChange={e => setGenPrompt(e.target.value)}
            placeholder='输入学习目标，如"IELTS 7.5"或"成为AI工程师"'
            onKeyDown={e => e.key === "Enter" && handleGenerate()} />
          <Button onClick={handleGenerate} disabled={genLoading || !genPrompt.trim()}>
            {genLoading ? <Loader2 className="size-4 animate-spin mr-1" /> : <Sparkles className="size-4 mr-1" />}生成
          </Button>
        </div>
        {officials.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-caption">官方森林：</span>
              {officials.map(f => (
                <button key={f.key} onClick={() => loadOfficial(f.key)}
                  className="inline-flex items-center gap-1 text-xs rounded-full border border-border px-3 py-1 hover:bg-primary-subtle hover:border-primary/30 transition-colors">
                  <Trees className="size-3" /> {f.title}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-caption">社区森林：</span>
              {[
                { key: "community-1", title: "考研数学" },
                { key: "community-2", title: "Python入门" },
                { key: "community-3", title: "日语N2" },
              ].map(f => (
                <button key={f.key} onClick={() => { setGenPrompt(f.title); handleGenerate(); }}
                  className="inline-flex items-center gap-1 text-xs rounded-full border border-border px-3 py-1 hover:bg-primary-subtle hover:border-primary/30 transition-colors text-fg-muted">
                  {f.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Active forest info ── */}
      <AnimatePresence>
        {activeForest && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small font-medium">{activeForest.title}</p>
                <p className="text-caption mt-0.5">{activeForest.description} · {activeForest.estimatedWeeks}周</p>
              </div>
              <div className="flex items-center gap-2">
                {savedForests.includes(activeForest.title) ? (
                  <span className="text-xs text-emerald-500 flex items-center gap-1"><Check className="size-3" />已保存</span>
                ) : (
                  <button onClick={saveForestToNotes} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Download className="size-3" />保存到我的笔记
                  </button>
                )}
                <button onClick={() => { setActiveForest(null); setSelectedSubject(null); setSelectedConcept(null); }} className="text-caption hover:underline">清除</button>
              </div>
            </div>
            {activeForest.learningPath.length > 0 && (
              <div className="flex gap-2">
                {activeForest.learningPath.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs bg-bg-muted rounded-lg px-2 py-1">
                    <span className="size-4 rounded-full bg-primary-subtle text-primary flex items-center justify-center text-[9px] font-bold">{i+1}</span>
                    {p.phase} · {p.duration}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3D Spherical Knowledge Network ── */}
      <div ref={containerRef}
        className="relative w-full max-w-[460px] mx-auto aspect-square cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        onMouseMove={handleMouseMove}>

        {/* Core glow */}
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-28 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(197,139,116,0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5,0.8,0.5] }}
          transition={{ duration: 4, repeat: Infinity }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full bg-primary-subtle border border-primary/20 flex items-center justify-center z-20">
          <Brain className="size-7 text-primary" strokeWidth={1.5} />
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 460 460">
          {conceptNodes.length > 0 && conceptNodes.map((cnode, i) => {
            const parent = displayNodes.find(n => n.id === selectedSubject);
            if (!parent) return null;
            const pp = sphereProject(parent.theta + rotation * 0.02, parent.phi, 140, cx, cy);
            const cp = sphereProject(cnode.theta, cnode.phi, cnode.radius, cx, cy);
            return <line key={i} x1={pp.px} y1={pp.py} x2={cp.px} y2={cp.py} stroke={cnode.color} strokeOpacity={0.25} strokeWidth={1} />;
          })}
        </svg>

        {/* Subject spheres (big) */}
        {displayNodes.map((node) => {
          const pos = sphereProject(node.theta + rotation * 0.02, node.phi, 140, cx, cy);
          const isSelected = selectedSubject === node.id;
          return (
            <motion.button key={node.id}
              onClick={() => {
                setSelectedSubject(isSelected ? null : node.id);
                setSelectedConcept(null);
              }}
              className="absolute flex flex-col items-center gap-1"
              style={{ left: pos.px, top: pos.py, transform: `translate(-50%, -50%) scale(${pos.scale})`, zIndex: isSelected ? 50 : pos.zi + 10 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}>
              <motion.div className={cn(
                "size-12 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transition-shadow",
                isSelected && "ring-2 ring-white/60",
              )} style={{ backgroundColor: node.color }}
                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}>
                {node.label.slice(0, 2)}
              </motion.div>
              <span className={cn("text-[10px] font-medium text-center w-14 leading-tight", isSelected ? "text-primary" : "text-fg-muted")}>
                {node.label}
              </span>
            </motion.button>
          );
        })}

        {/* Concept spheres (small, orbit around selected subject) */}
        {conceptNodes.map((cnode, i) => {
          const cp = sphereProject(cnode.theta, cnode.phi, cnode.radius, cx, cy);
          const isSelected = selectedConcept === cnode.id;
          return (
            <motion.button key={cnode.id}
              onClick={(e) => { e.stopPropagation(); setSelectedConcept(isSelected ? null : cnode.id); }}
              className="absolute flex flex-col items-center gap-0.5"
              style={{ left: cp.px, top: cp.py, transform: `translate(-50%, -50%) scale(${0.7})`, zIndex: isSelected ? 60 : 20 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}>
              <motion.div className={cn(
                "size-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-md",
                isSelected && "ring-2 ring-white/60",
              )} style={{ backgroundColor: cnode.color }}
                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}>
                {cnode.label.charAt(0)}
              </motion.div>
              <span className="text-[8px] text-fg-muted text-center w-12 leading-tight truncate">{cnode.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Selected Concept → Notes ── */}
      <AnimatePresence>
        {selectedConcept && activeForest && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="card-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-primary" />
                <span className="text-small font-medium">{selectedConcept}</span>
              </div>
              <button onClick={() => setSelectedConcept(null)} className="size-7 flex items-center justify-center rounded-lg hover:bg-bg-muted"><X className="size-3.5" /></button>
            </div>

            {conceptNotes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {conceptNotes.map(n => (
                  <div key={n.title} className="flex items-start gap-2 rounded-lg bg-bg-muted p-3">
                    <FileText className="size-3.5 text-fg-muted mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-caption mt-0.5 line-clamp-3">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-caption">{'暂无笔记。点击上方「保存到我的笔记」导入森林内容。'}</p>
            )}

            <div className="flex gap-2">
              <Link href={`/agent?subject=ai&q=${encodeURIComponent("请讲解：" + selectedConcept)}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                <Brain className="size-3" /> 向导师学习
              </Link>
              {activeForest.resources.filter(r => r.forTopic === selectedConcept).map(r => (
                <a key={r.title} href={r.url ?? "#"} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-primary transition-colors">
                  <BookOpen className="size-3" /> {r.title}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
