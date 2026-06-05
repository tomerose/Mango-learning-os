"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trees, ArrowRight, Sparkles, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";

/* ═══════════════════════════════════════════════════════════════
   Knowledge Forest — Topic clusters & learning paths
   "My knowledge is growing" — not "I am managing nodes"
   ═══════════════════════════════════════════════════════════════ */

export function KnowledgeForest() {
  const { notes, flashcards } = useStore();
  const { subjects, getMeta } = useSubjects();

  // Build topic clusters from note tags
  const clusters = React.useMemo(() => {
    const map: Record<string, {
      subject: string; concepts: Map<string, number>; noteCount: number;
      cardCount: number; totalTags: number;
    }> = {};

    for (const s of subjects) {
      map[s.id] = { subject: s.id, concepts: new Map(), noteCount: 0, cardCount: 0, totalTags: 0 };
    }

    for (const n of notes) {
      const c = map[n.subject] ?? { subject: n.subject, concepts: new Map(), noteCount: 0, cardCount: 0, totalTags: 0 };
      c.noteCount++;
      for (const t of n.tags) { c.concepts.set(t, (c.concepts.get(t) ?? 0) + 1); c.totalTags++; }
      map[n.subject] = c;
    }
    for (const f of flashcards) {
      const c = map[f.subject];
      if (c) c.cardCount++;
    }

    return Object.values(map)
      .filter(c => c.noteCount > 0 || c.cardCount > 0)
      .sort((a, b) => b.noteCount - a.noteCount);
  }, [notes, flashcards, subjects]);

  if (clusters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Trees className="size-12 text-fg-subtle" strokeWidth={1} />
        <div>
          <p className="text-small font-medium">你的知识森林</p>
          <p className="text-caption mt-1 max-w-xs">
            创建第一条笔记，你的知识森林将开始生长。AI 会自动提取概念、建立联系。
          </p>
        </div>
        <Link href="/agent" className="text-xs text-primary hover:underline">
          去创建笔记 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-small text-fg-muted">
        {clusters.length} 个知识簇 · {notes.length} 条笔记 · {flashcards.length} 张闪卡
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clusters.map((cluster, idx) => {
          const meta = getMeta(cluster.subject);
          const topConcepts = [...cluster.concepts.entries()]
            .sort((a, b) => b[1] - a[1]).slice(0, 5);
          const growth = cluster.noteCount > 0 ? Math.min(100, cluster.noteCount * 20) : 10;

          return (
            <motion.div key={cluster.subject}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="card-card p-5 flex flex-col gap-4 group"
            >
              {/* Subject header */}
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: meta.color }}>
                  {meta.short}
                </span>
                <div>
                  <p className="text-small font-medium">{meta.label}</p>
                  <p className="text-caption">{cluster.noteCount} 笔记 · {cluster.cardCount} 闪卡</p>
                </div>
              </div>

              {/* Growth indicator */}
              <div className="h-1 rounded-full bg-bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ backgroundColor: meta.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${growth}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }} />
              </div>

              {/* Top concepts */}
              {topConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {topConcepts.map(([label, count]) => (
                    <span key={label} className="text-caption bg-bg-muted rounded-lg px-2 py-0.5">
                      {label} ({count})
                    </span>
                  ))}
                </div>
              )}

              {/* Action */}
              <div className="flex gap-2 mt-auto pt-2">
                <Link href={`/agent?subject=${cluster.subject}`}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Brain className="size-3" /> 学习
                </Link>
                <Link href={`/exam`}
                  className="flex items-center gap-1 text-xs text-fg-muted hover:underline ml-auto">
                  图谱 <ArrowRight className="size-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* What to learn next */}
      <div className="card-card p-5 flex items-center gap-4">
        <Sparkles className="size-8 text-primary" strokeWidth={1} />
        <div className="flex-1">
          <p className="text-small font-medium">下一步学习建议</p>
          <p className="text-caption mt-0.5">
            {clusters.some(c => c.cardCount > 5)
              ? "你有待复习的闪卡，去巩固已有知识"
              : "创建更多笔记，AI 将为你生成个性化学习路径"}
          </p>
        </div>
        <Link href="/planner" className="text-xs text-primary hover:underline shrink-0">
          查看计划 →
        </Link>
      </div>
    </div>
  );
}
