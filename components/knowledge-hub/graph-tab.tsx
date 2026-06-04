"use client";

import { Network } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { SUBJECT_META } from "@/lib/mock-data";
import type { SubjectId } from "@/lib/types";

export function GraphTab() {
  const { notes, flashcards } = useStore();

  // Group notes by subject → tags
  const subjectTags: Record<SubjectId, Map<string, number>> = {
    ai: new Map(), economics: new Map(), finance: new Map(), math: new Map(), english: new Map(),
  };
  for (const n of notes) {
    const m = subjectTags[n.subject];
    if (!m) continue;
    for (const tag of n.tags) {
      m.set(tag, (m.get(tag) ?? 0) + 1);
    }
  }

  // Group flashcards by subject → deck
  const subjectDecks: Record<SubjectId, number> = { ai: 0, economics: 0, finance: 0, math: 0, english: 0 };
  for (const c of flashcards) {
    if (subjectDecks[c.subject] !== undefined) subjectDecks[c.subject]++;
  }

  const subjects = (Object.keys(subjectTags) as SubjectId[]);
  const totalConcepts = notes.reduce((s, n) => s + n.tags.length, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="size-4" /> 知识脉络
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {totalConcepts === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center">
            <Network className="size-8 opacity-40" />
            <p className="text-sm">还没有知识节点</p>
            <p className="text-xs">在笔记中添加标签后，这里会展示各学科的标签分布和概念连接</p>
          </div>
        ) : (
          subjects.map((s) => {
            const meta = SUBJECT_META[s];
            const tags = subjectTags[s];
            const tagEntries = [...tags.entries()].sort((a, b) => b[1] - a[1]);
            if (tagEntries.length === 0) return null;
            const maxCount = tagEntries[0][1];
            return (
              <div key={s} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="text-sm font-medium">{meta.label}</span>
                  <span className="text-muted-foreground text-xs">{subjectDecks[s]} 闪卡 · {tagEntries.length} 标签</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tagEntries.slice(0, 8).map(([tag, count]) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <span className="text-muted-foreground ml-1">×{count}</span>
                    </Badge>
                  ))}
                </div>
                {tagEntries.length > 0 && (
                  <Progress value={Math.round((tagEntries[0][1] / maxCount) * 100)} className="h-1" />
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
