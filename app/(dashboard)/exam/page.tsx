"use client";

import * as React from "react";
import { Network, FileText, BookMarked, Trees, GraduationCap, Map, Target, ClipboardList } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotesTab } from "@/components/knowledge-hub/notes-tab";
import { ResourcesTab } from "@/components/knowledge-hub/resources-tab";
import { KnowledgeNetwork } from "@/components/knowledge-hub/knowledge-network";
import { KnowledgeForest } from "@/components/knowledge-hub/knowledge-forest";
import { ExamReviewTab } from "@/components/knowledge-hub/exam-review-tab";
import { PageTransition } from "@/components/layout/page-transition";
import { ExamBackground } from "@/components/ui/module-backgrounds";
import { GenerateTemplateCard, MissionHero, MobileShell } from "@/components/mobile/premium-mobile";

export default function ExamPage() {
  const [tab, setTab] = React.useState("exam-review");

  React.useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (requestedTab && ["exam-review", "forest", "graph", "notes", "resources"].includes(requestedTab)) {
      setTab(requestedTab);
    }
  }, []);

  const templates = [
    {
      title: "Final Review Pack",
      description: "期末冲刺复习包，适合 3-14 天备考。",
      input: "课程名/范围/资料",
      process: "多源研究 + 质量检查",
      output: "18 section 讲义",
      icon: GraduationCap,
    },
    {
      title: "Mistake Training",
      description: "把薄弱点转成错题训练路径。",
      input: "错题/章节",
      process: "错因归类",
      output: "练习任务",
      icon: Target,
    },
    {
      title: "Paper Reading",
      description: "把论文拆成摘要、框架和术语卡。",
      input: "PDF/URL",
      process: "结构化提取",
      output: "阅读笔记",
      icon: FileText,
    },
    {
      title: "Knowledge Map",
      description: "把分散资料整理成知识森林。",
      input: "主题/笔记",
      process: "概念连接",
      output: "地图与路径",
      icon: Map,
    },
    {
      title: "Class Notes",
      description: "把课堂材料整理成复习笔记。",
      input: "文档/文本",
      process: "自动整理",
      output: "可编辑笔记",
      icon: ClipboardList,
    },
    {
      title: "Exam Prediction",
      description: "根据范围整理高频考点与陷阱。",
      input: "考纲/范围",
      process: "重点排序",
      output: "冲刺清单",
      icon: BookMarked,
    },
  ];

  return (<PageTransition>
    <div className="relative">
      <ExamBackground />
      <div className="md:hidden">
        <MobileShell stage="paper">
          <MissionHero
            eyebrow="Generate Studio"
            title="把资料变成可交付学习包"
            description="课程输入、文件上传、来源卡片、质量评分和导出入口全部保留；这里只升级移动端工作流。"
            icon={BookMarked}
          />

          <section className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <GenerateTemplateCard key={template.title} {...template} onSelect={() => setTab("exam-review")} />
            ))}
          </section>

          <section className="mango-paper-card p-3">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="exam-review"><GraduationCap className="size-4 mr-1.5" />生成</TabsTrigger>
                <TabsTrigger value="forest"><Trees className="size-4 mr-1.5" />森林</TabsTrigger>
                <TabsTrigger value="graph"><Network className="size-4 mr-1.5" />网络</TabsTrigger>
                <TabsTrigger value="notes"><FileText className="size-4 mr-1.5" />笔记</TabsTrigger>
                <TabsTrigger value="resources"><BookMarked className="size-4 mr-1.5" />资源</TabsTrigger>
              </TabsList>
              <TabsContent value="exam-review" className="mt-4"><ExamReviewTab /></TabsContent>
              <TabsContent value="forest" className="mt-4"><KnowledgeForest /></TabsContent>
              <TabsContent value="graph" className="mt-4"><KnowledgeNetwork /></TabsContent>
              <TabsContent value="notes" className="mt-4"><NotesTab /></TabsContent>
              <TabsContent value="resources" className="mt-4"><ResourcesTab /></TabsContent>
            </Tabs>
          </section>
        </MobileShell>
      </div>

      <div className="hidden md:block">
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
    </div>
    </PageTransition>
  );
}
