"use client";

import { MessageSquare, ListChecks } from "lucide-react";

import { ChatPanel } from "@/components/ai-tutor/chat-panel";
import { QuizPanel } from "@/components/ai-tutor/quiz-panel";
import { SubjectManager } from "@/components/subject-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubjectId } from "@/lib/types";

interface TutorTabsProps {
  initialTab?: string;
  initialSubject?: SubjectId;
  initialTopic?: string;
}

export function TutorTabs({
  initialTab,
  initialSubject,
  initialTopic,
}: TutorTabsProps) {
  const defaultTab = initialTab === "quiz" ? "quiz" : "chat";

  return (
    <Tabs defaultValue={defaultTab}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="chat">
            <MessageSquare className="size-4" /> 对话讲解
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <ListChecks className="size-4" /> 测验练习
          </TabsTrigger>
        </TabsList>
        <SubjectManager />
      </div>

      <TabsContent value="chat" className="mt-4">
        <ChatPanel />
      </TabsContent>

      <TabsContent value="quiz" className="mt-4">
        <QuizPanel
          initialSubject={initialSubject}
          initialTopic={initialTopic}
        />
      </TabsContent>
    </Tabs>
  );
}
