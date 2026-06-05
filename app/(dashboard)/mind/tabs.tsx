"use client";

import * as React from "react";
import { BookOpen, Calendar, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JournalEditor } from "@/components/mind/journal-editor";
import { MoodTracker } from "@/components/mind/mood-tracker";
import { CbtReframer } from "@/components/mind/cbt-reframer";
import { AiCompanionChat } from "@/components/mind/ai-companion-chat";
import { GrowthTimeline } from "@/components/mind/growth-timeline";

export function MindTabs() {
  return (
    <Tabs defaultValue="journal">
      <TabsList>
        <TabsTrigger value="journal">
          <BookOpen className="size-4 mr-1.5" /> Journal
        </TabsTrigger>
        <TabsTrigger value="history">
          <Calendar className="size-4 mr-1.5" /> History
        </TabsTrigger>
        <TabsTrigger value="companion">
          <Heart className="size-4 mr-1.5" /> Companion
        </TabsTrigger>
      </TabsList>

      {/* Journal Tab: Editor + CBT Reframer side by side on desktop */}
      <TabsContent value="journal" className="mt-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <JournalEditor />
          <CbtReframer />
        </div>
      </TabsContent>

      {/* History Tab: Mood Tracker + Growth Timeline */}
      <TabsContent value="history" className="mt-4">
        <div className="flex flex-col gap-4">
          <MoodTracker />
          <GrowthTimeline />
        </div>
      </TabsContent>

      {/* Companion Tab: Chat */}
      <TabsContent value="companion" className="mt-4">
        <AiCompanionChat />
      </TabsContent>
    </Tabs>
  );
}
