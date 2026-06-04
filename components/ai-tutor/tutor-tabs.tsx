"use client";

import * as React from "react";
import { MessageSquare, ListChecks, Heart, BookMarked } from "lucide-react";

import { ChatPanel } from "@/components/ai-tutor/chat-panel";
import { QuizPanel } from "@/components/ai-tutor/quiz-panel";
import { TreeHoleChat } from "@/components/ai-tutor/treehole-chat";
import { MindGardenContent } from "@/components/mind-garden/mind-garden-content";
import { ExamMasterContent } from "@/components/exam-master/exam-master-content";
import { SubjectManager } from "@/components/subject-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubjectId } from "@/lib/types";

interface TutorTabsProps {
  initialTab?: string;
  initialSubject?: SubjectId;
  initialTopic?: string;
}

const TAB_CONFIG = [
  { value: "chat", icon: MessageSquare, label: "对话讲解", wide: false },
  { value: "quiz", icon: ListChecks, label: "测验练习", wide: false },
  { value: "mindgarden", icon: Heart, label: "Mind Garden", wide: true },
  { value: "exammaster", icon: BookMarked, label: "Exam Master", wide: true },
];

export function TutorTabs({ initialTab, initialSubject, initialTopic }: TutorTabsProps) {
  const defaultTab = ["chat", "quiz", "mindgarden", "exammaster"].includes(initialTab ?? "")
    ? initialTab! : "chat";

  return (
    <Tabs defaultValue={defaultTab}>
      {/* Tab bar with SubjectManager */}
      <div className="flex items-center justify-between gap-2 mb-1 overflow-x-auto">
        <TabsList className="shrink-0">
          {TAB_CONFIG.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              <t.icon className="size-4" />
              <span className={t.wide ? "hidden sm:inline" : ""}>{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="shrink-0"><SubjectManager /></div>
      </div>

      {/* Chat */}
      <TabsContent value="chat" className="mt-4"><ChatPanel /></TabsContent>

      {/* Quiz */}
      <TabsContent value="quiz" className="mt-4">
        <QuizPanel initialSubject={initialSubject} initialTopic={initialTopic} />
      </TabsContent>

      {/* Mind Garden — embedded with its own sub-tabs */}
      <TabsContent value="mindgarden" className="mt-4">
        <MindGardenContent embedded />
      </TabsContent>

      {/* Exam Master — embedded */}
      <TabsContent value="exammaster" className="mt-4">
        <ExamMasterContent embedded />
      </TabsContent>
    </Tabs>
  );
}
