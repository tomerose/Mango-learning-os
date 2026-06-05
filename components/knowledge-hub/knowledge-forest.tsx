"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Brain, FileText, Sparkles, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";

/* ═══════════════════════════════════════════════════════════════
   Knowledge Forest v2 — 3D Spherical Orbital Knowledge Network
   Concept nodes orbit around a central core with connection lines.
   ═══════════════════════════════════════════════════════════════ */

interface OrbitalNode {
  id: string; label: string; count: number; subject: string;
  color: string; theta: number; phi: number; radius: number;
}

function sphericalToXY(theta: number, phi: number, radius: number, cx: number, cy: number) {
  // 3D sphere projection to 2D
  const x = cx + radius * Math.sin(phi) * Math.cos(theta);
  const y = cy + radius * Math.cos(phi) * 0.6; // Flatten vertically
  const scale = 0.5 + 0.5 * Math.sin(phi) * 0.8; // Depth cue
  const z = Math.sin(phi) * Math.sin(theta);
  return { x, y, scale: 0.6 + scale * 0.5, zIndex: Math.round(z * 10) };
}

export function KnowledgeForest() {
  const { notes } = useStore();
  const { subjects, getMeta } = useSubjects();
  const [selectedNode, setSelectedNode] = React.useState<OrbitalNode | null>(null);
  const [rotation, setRotation] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Slow auto-rotation
  React.useEffect(() => {
    const id = setInterval(() => setRotation(r => r + 0.15), 50);
    return () => clearInterval(id);
  }, []);

  // Build orbital nodes from note tags
  const nodes: OrbitalNode[] = React.useMemo(() => {
    const result: OrbitalNode[] = [];
    const tagCounts: Record<string, Record<string, number>> = {};

    for (const n of notes) {
      if (!tagCounts[n.subject]) tagCounts[n.subject] = {};
      for (const t of n.tags) {
        tagCounts[n.subject][t] = (tagCounts[n.subject][t] ?? 0) + 1;
      }
    }

    // Central node
    const subjectList = subjects.filter(s => (tagCounts[s.id] && Object.keys(tagCounts[s.id]).length > 0));

    for (const s of subjectList) {
      const meta = getMeta(s.id);
      const entries = Object.entries(tagCounts[s.id] ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
      entries.forEach(([label, count], i) => {
        result.push({
          id: `${s.id}-${label}`,
          label,
          count,
          subject: s.id,
          color: meta.color,
          theta: (i / entries.length) * Math.PI * 2 + (subjectList.indexOf(s) * 0.5),
          phi: 0.3 + (i / entries.length) * 1.2,
          radius: 120 + Math.random() * 40,
        });
      });
    }

    if (result.length === 0) {
      // Fallback demo nodes
      const demoSubjects = subjects.slice(0, 3);
      for (const s of demoSubjects) {
        const meta = getMeta(s.id);
        for (let i = 0; i < 4; i++) {
          result.push({
            id: `demo-${s.id}-${i}`,
            label: ["核心概念", "推导方法", "应用场景", "易错点"][i],
            count: Math.floor(Math.random() * 5) + 1,
            subject: s.id,
            color: meta.color,
            theta: (i / 4) * Math.PI * 2 + demoSubjects.indexOf(s) * 0.5,
            phi: 0.3 + (i / 4) * 1.2,
            radius: 110 + Math.random() * 30,
          });
        }
      }
    }

    return result;
  }, [notes, subjects, getMeta]);

  // Connection lines between nodes sharing subject
  const connections = React.useMemo(() => {
    const lines: { from: OrbitalNode; to: OrbitalNode }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].subject === nodes[j].subject) {
          lines.push({ from: nodes[i], to: nodes[j] });
        }
      }
    }
    return lines.slice(0, nodes.length * 2);
  }, [nodes]);

  // Notes for selected concept
  const selectedNotes = React.useMemo(() => {
    if (!selectedNode) return [];
    return notes.filter(n => n.subject === selectedNode.subject && n.tags.includes(selectedNode.label));
  }, [selectedNode, notes]);

  const cx = 200, cy = 200;
  const totalConcepts = nodes.length;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-small text-fg-muted">
        {totalConcepts > 0 ? `${totalConcepts} 个知识节点 · ${notes.length} 条笔记` : "创建笔记后，知识网络将自动生长"}
      </p>

      {/* ── 3D Spherical Network ── */}
      <div ref={containerRef} className="relative w-full max-w-[440px] mx-auto aspect-square">
        {/* Central core glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-32 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(198,123,45,0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Central knowledge core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-full bg-primary-subtle border border-primary/20 flex items-center justify-center z-10 shadow-lg">
          <Brain className="size-8 text-primary" strokeWidth={1.5} />
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
          {connections.map((conn, i) => {
            const from = sphericalToXY(conn.from.theta + rotation * 0.02, conn.from.phi, conn.from.radius, cx, cy);
            const to = sphericalToXY(conn.to.theta + rotation * 0.02, conn.to.phi, conn.to.radius, cx, cy);
            return (
              <line key={i}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={conn.from.color} strokeOpacity={0.15} strokeWidth={0.8}
              />
            );
          })}
        </svg>

        {/* Orbital nodes */}
        {nodes.map((node) => {
          const pos = sphericalToXY(node.theta + rotation * 0.02, node.phi, node.radius, cx, cy);
          const isSelected = selectedNode?.id === node.id;
          return (
            <motion.button
              key={node.id}
              onClick={() => setSelectedNode(isSelected ? null : node)}
              className="absolute flex flex-col items-center gap-0.5 cursor-pointer group"
              style={{
                left: pos.x,
                top: pos.y,
                transform: `translate(-50%, -50%) scale(${pos.scale})`,
                zIndex: isSelected ? 50 : pos.zIndex + 10,
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-shadow duration-300",
                  isSelected && "ring-2 ring-white/50 shadow-lg",
                )}
                style={{ backgroundColor: node.color }}
                animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {node.label.charAt(0)}
              </motion.div>
              <span className={cn(
                "text-[9px] font-medium leading-tight text-center w-16",
                isSelected ? "text-primary" : "text-fg-muted",
              )}>
                {node.label.length > 4 ? node.label.slice(0, 4) + ".." : node.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Selected Node Detail ── */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="card-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                <span className="text-small font-medium">{selectedNode.label}</span>
                <span className="text-caption">({selectedNode.count} 条笔记)</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="size-7 flex items-center justify-center rounded-lg hover:bg-bg-muted">
                <X className="size-3.5" />
              </button>
            </div>

            {selectedNotes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedNotes.map(n => (
                  <div key={n.id} className="flex items-start gap-2 rounded-lg bg-bg-muted p-3">
                    <FileText className="size-3.5 text-fg-muted mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-caption mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-caption">暂无笔记关联此概念。创建带标签的笔记后自动关联。</p>
            )}

            <Link href={`/agent?subject=${selectedNode.subject}`}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Sparkles className="size-3" /> 向导师学习 {selectedNode.label}
              <ArrowRight className="size-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
