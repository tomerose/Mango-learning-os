"use client";

import { Network } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useSubjects } from "@/lib/subjects";
import { SUBJECT_META } from "@/lib/mock-data";

export function GraphTab() {
  const { notes, flashcards } = useStore();
  const { subjects } = useSubjects();

  // Group notes by subject → tags (dynamic)
  const subjectTags: Record<string, Map<string, number>> = {};
  const subjectDecks: Record<string, number> = {};
  for (const s of subjects) {
    subjectTags[s.id] = new Map();
    subjectDecks[s.id] = 0;
  }
  for (const n of notes) {
    const m = subjectTags[n.subject];
    if (!m) { subjectTags[n.subject] = new Map(); }
    const map = subjectTags[n.subject] ?? new Map();
    for (const tag of n.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
    if (!subjectTags[n.subject]) subjectTags[n.subject] = map;
  }

  for (const c of flashcards) {
    subjectDecks[c.subject] = (subjectDecks[c.subject] ?? 0) + 1;
  }

  const allSubjects = [...new Set([...subjects.map(s => s.id), ...Object.keys(subjectTags)])];
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
          allSubjects.map((id) => {
            const meta = SUBJECT_META[id];
            const tags = subjectTags[id];
            if (!tags || tags.size === 0) return null;
            const tagEntries = [...tags.entries()].sort((a, b) => b[1] - a[1]);
            const maxCount = tagEntries[0][1];
            return (
              <div key={id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="text-sm font-medium">{meta.label}</span>
                  <span className="text-muted-foreground text-xs">{subjectDecks[id] ?? 0} 闪卡 · {tagEntries.length} 标签</span>
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
