"use client";

import * as React from "react";
import { GraduationCap, FileText, Layers, BookMarked, Network } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExamWorkspace } from "@/components/exam/exam-workspace";
import { NotesTab } from "@/components/knowledge-hub/notes-tab";
import { FlashcardsTab } from "@/components/knowledge-hub/flashcards-tab";
import { ResourcesTab } from "@/components/knowledge-hub/resources-tab";
import { GraphTab } from "@/components/knowledge-hub/graph-tab";

// ─────────────────────────────────────────────────────────────
// Mangoing — 考试备战 + 知识库（笔记·闪卡·资源·图谱）
// ─────────────────────────────────────────────────────────────

export default function ExamPage() {
  const [tab, setTab] = React.useState("exam");

  return (
    <PageShell
      title="Mangoing"
      description="联网搜索 · AI 讲义生成 · 刷题训练 · 知识库管理"
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="exam"><GraduationCap className="size-4" /> 考试备战</TabsTrigger>
          <TabsTrigger value="notes"><FileText className="size-4" /> 笔记</TabsTrigger>
          <TabsTrigger value="flashcards"><Layers className="size-4" /> 闪卡</TabsTrigger>
          <TabsTrigger value="resources"><BookMarked className="size-4" /> 资源</TabsTrigger>
          <TabsTrigger value="graph"><Network className="size-4" /> 图谱</TabsTrigger>
        </TabsList>

        <TabsContent value="exam" className="mt-4">
          <ExamWorkspace />
        </TabsContent>
        <TabsContent value="notes" className="mt-4">
          <NotesTab />
        </TabsContent>
        <TabsContent value="flashcards" className="mt-4">
          <FlashcardsTab />
        </TabsContent>
        <TabsContent value="resources" className="mt-4">
          <ResourcesTab />
        </TabsContent>
        <TabsContent value="graph" className="mt-4">
          <GraphTab />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
