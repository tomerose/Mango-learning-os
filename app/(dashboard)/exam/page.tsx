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
import { PageTransition } from "@/components/layout/page-transition";
import { ExamBackground } from "@/components/ui/module-backgrounds";

export default function ExamPage() {
  const [tab, setTab] = React.useState("exam");

  return (<PageTransition>
    <div className="relative">
      <ExamBackground />
      <PageShell title="Mangoing" description="联网搜索 · 讲义生成 · 刷题训练 · 知识库管理">
        <div className="relative z-10">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="exam"><GraduationCap className="size-4 mr-1.5" />考试备战</TabsTrigger>
              <TabsTrigger value="notes"><FileText className="size-4 mr-1.5" />笔记</TabsTrigger>
              <TabsTrigger value="flashcards"><Layers className="size-4 mr-1.5" />闪卡</TabsTrigger>
              <TabsTrigger value="resources"><BookMarked className="size-4 mr-1.5" />资源</TabsTrigger>
              <TabsTrigger value="graph"><Network className="size-4 mr-1.5" />图谱</TabsTrigger>
            </TabsList>
            <TabsContent value="exam" className="mt-4"><ExamWorkspace /></TabsContent>
            <TabsContent value="notes" className="mt-4"><NotesTab /></TabsContent>
            <TabsContent value="flashcards" className="mt-4"><FlashcardsTab /></TabsContent>
            <TabsContent value="resources" className="mt-4"><ResourcesTab /></TabsContent>
            <TabsContent value="graph" className="mt-4"><GraphTab /></TabsContent>
          </Tabs>
        </div>
      </PageShell>
    </div>
    </PageTransition>
  );
}
