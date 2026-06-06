"use client";

import * as React from "react";
import { Network, FileText, BookMarked, Trees, GraduationCap } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotesTab } from "@/components/knowledge-hub/notes-tab";
import { ResourcesTab } from "@/components/knowledge-hub/resources-tab";
import { KnowledgeNetwork } from "@/components/knowledge-hub/knowledge-network";
import { KnowledgeForest } from "@/components/knowledge-hub/knowledge-forest";
import { ExamReviewTab } from "@/components/knowledge-hub/exam-review-tab";
import { PageTransition } from "@/components/layout/page-transition";
import { ExamBackground } from "@/components/ui/module-backgrounds";

export default function ExamPage() {
  const [tab, setTab] = React.useState("exam-review");

  return (<PageTransition>
    <div className="relative">
      <ExamBackground />
      <PageShell title="Mangoing" description="你的知识操作系统 — 备考 · 捕捉 · 连接 · 组织 · 生长">
        <div className="relative z-10">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="exam-review"><GraduationCap className="size-4 mr-1.5" />期末备考</TabsTrigger>
              <TabsTrigger value="forest"><Trees className="size-4 mr-1.5" />知识森林</TabsTrigger>
              <TabsTrigger value="graph"><Network className="size-4 mr-1.5" />知识网络</TabsTrigger>
              <TabsTrigger value="notes"><FileText className="size-4 mr-1.5" />笔记</TabsTrigger>
              <TabsTrigger value="resources"><BookMarked className="size-4 mr-1.5" />资源</TabsTrigger>
            </TabsList>
            <TabsContent value="exam-review" className="mt-4"><ExamReviewTab /></TabsContent>
            <TabsContent value="forest" className="mt-4"><KnowledgeForest /></TabsContent>
            <TabsContent value="graph" className="mt-4"><KnowledgeNetwork /></TabsContent>
            <TabsContent value="notes" className="mt-4"><NotesTab /></TabsContent>
            <TabsContent value="resources" className="mt-4"><ResourcesTab /></TabsContent>
          </Tabs>
        </div>
      </PageShell>
    </div>
    </PageTransition>
  );
}
