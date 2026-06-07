"use client";

import * as React from "react";
import { Heart, MessageCircle, Sprout, Feather, Flower } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JournalEditor } from "@/components/mind/journal-editor";
import { MoodTracker } from "@/components/mind/mood-tracker";
import { CbtReframer } from "@/components/mind/cbt-reframer";
import { AiCompanionChat } from "@/components/mind/ai-companion-chat";
import { MindGardenV2 } from "@/components/mind/mind-garden-v2";
import { PageTransition } from "@/components/layout/page-transition";
import { MissionHero, MobileShell } from "@/components/mobile/premium-mobile";

export default function GrowPage() {
  const [tab, setTab] = React.useState("mind-garden");

  return (
    <PageTransition>
    <div className="relative">
      {/* Ambient watercolor blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 w-48 h-48 rounded-full watercolor-rose opacity-50" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full watercolor-sage opacity-40" />
      </div>

      <div className="relative z-10">
        <div className="md:hidden">
          <MobileShell>
            <MissionHero
              eyebrow="Mind Garden"
              title="先恢复，再继续学习"
              description="本地优先、明确同意后才使用云端分析。日记、情绪、CBT 和陪伴功能保持原实现。"
              icon={Flower}
            />
            <section className="mango-paper-card p-3">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="mind-garden"><Flower className="size-3.5 mr-1" />Pro</TabsTrigger>
                  <TabsTrigger value="journal"><Feather className="size-3.5 mr-1" />日记</TabsTrigger>
                  <TabsTrigger value="mood"><Heart className="size-3.5 mr-1" />情绪</TabsTrigger>
                  <TabsTrigger value="cbt"><Sprout className="size-3.5 mr-1" />重构</TabsTrigger>
                  <TabsTrigger value="companion"><MessageCircle className="size-3.5 mr-1" />陪伴</TabsTrigger>
                </TabsList>
                <TabsContent value="mind-garden" className="mt-4">
                  <MindGardenV2 />
                </TabsContent>
                <TabsContent value="journal" className="mt-4">
                  <JournalEditor />
                  <div className="mt-6"><MoodTracker /></div>
                </TabsContent>
                <TabsContent value="mood" className="mt-4">
                  <MoodTracker />
                </TabsContent>
                <TabsContent value="cbt" className="mt-4">
                  <CbtReframer />
                </TabsContent>
                <TabsContent value="companion" className="mt-4">
                  <AiCompanionChat />
                </TabsContent>
              </Tabs>
            </section>
          </MobileShell>
        </div>

        <div className="hidden md:block">
        <PageShell title="心灵花园" description="反思 · 情绪 · 成长 · 陪伴">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full max-w-xl">
              <TabsTrigger value="mind-garden"><Flower className="size-3.5 mr-1" />心灵花园 Pro</TabsTrigger>
              <TabsTrigger value="journal"><Feather className="size-3.5 mr-1" />日记</TabsTrigger>
              <TabsTrigger value="mood"><Heart className="size-3.5 mr-1" />情绪</TabsTrigger>
              <TabsTrigger value="cbt"><Sprout className="size-3.5 mr-1" />重构</TabsTrigger>
              <TabsTrigger value="companion"><MessageCircle className="size-3.5 mr-1" />陪伴</TabsTrigger>
            </TabsList>
            <TabsContent value="mind-garden" className="mt-4">
              <MindGardenV2 />
            </TabsContent>
            <TabsContent value="journal" className="mt-4">
              <JournalEditor />
              <div className="mt-6"><MoodTracker /></div>
            </TabsContent>
            <TabsContent value="mood" className="mt-4">
              <MoodTracker />
            </TabsContent>
            <TabsContent value="cbt" className="mt-4">
              <CbtReframer />
            </TabsContent>
            <TabsContent value="companion" className="mt-4">
              <AiCompanionChat />
            </TabsContent>
          </Tabs>
        </PageShell>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
