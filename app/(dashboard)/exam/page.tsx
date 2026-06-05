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
import { StepWizard } from "@/components/ui/step-wizard";

const EXAM_STEPS = [
  { id: "upload", label: "上传资料", desc: "PDF/Word/笔记" },
  { id: "configure", label: "配置参数", desc: "主题 & 难度" },
  { id: "generate", label: "AI生成", desc: "复习包生成" },
  { id: "review", label: "查看讲义", desc: "结构化复习" },
  { id: "practice", label: "刷题练习", desc: "MCQ/填空/大题" },
  { id: "export", label: "导出保存", desc: "PDF/笔记" },
];

export default function ExamPage() {
  const [tab, setTab] = React.useState("exam");
  const [wizardStep, setWizardStep] = React.useState(0);

  return (<PageTransition>
    <div className="relative">
      <ExamBackground />
      <PageShell title="Mangoing" description="联网搜索 · 讲义生成 · 刷题训练 · 知识库管理">
        <div className="relative z-10">
          {/* 6-Step Exam Preparation Wizard */}
          <StepWizard steps={EXAM_STEPS} current={wizardStep} onStep={setWizardStep}>
            <p className="text-small text-fg-muted text-center py-8">
              {wizardStep === 0 && "上传你的学习资料——PDF、Word、PPT 或纯文本笔记"}
              {wizardStep === 1 && "选择考试主题、题目数量和难度等级"}
              {wizardStep === 2 && "AI 自动生成结构化复习包、练习题和闪卡"}
              {wizardStep === 3 && "查看讲义、知识图谱和常见错误分析"}
              {wizardStep === 4 && "开始练习——选择题、填空题、大题，即时评分"}
              {wizardStep === 5 && "导出为 PDF 或保存到笔记库"}
            </p>
          </StepWizard>

          <div className="mt-6">
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
        </div>
      </PageShell>
    </div>
    </PageTransition>
  );
}
