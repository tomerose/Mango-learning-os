"use client";

import * as React from "react";
import { Dna, Heart, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MangoDNAContent } from "@/components/mango-dna/mango-dna-content";
import { VoiceSoulContent } from "@/components/mango-dna/voice-soul/VoiceSoulContent";
import { SkillTree } from "@/components/ui/skill-tree";

export default function DnaPage() {
  const [tab, setTab] = React.useState("dna");

  return (
    <PageShell title="Mango DNA" description="你的学习身份与成长轨迹">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dna"><Dna className="size-4 mr-1.5" />学习身份</TabsTrigger>
          <TabsTrigger value="voice-soul"><Heart className="size-4 mr-1.5" />声魂蒸馏</TabsTrigger>
        </TabsList>
        <TabsContent value="dna" className="mt-4"><MangoDNAContent /></TabsContent>
        <TabsContent value="voice-soul" className="mt-4"><VoiceSoulContent /></TabsContent>
      </Tabs>
    </PageShell>
  );
}
