"use client";

import * as React from "react";
import { Dna, Heart } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MangoDNAContent } from "@/components/mango-dna/mango-dna-content";
import { VoiceSoulContent } from "@/components/mango-dna/voice-soul/VoiceSoulContent";

// ─────────────────────────────────────────────────────────────
// Mango DNA — AI 人格档案 + 声魂蒸馏
// ─────────────────────────────────────────────────────────────

export default function DnaPage() {
  const [tab, setTab] = React.useState("dna");

  return (
    <PageShell
      title="Mango DNA"
      description="构建专属 AI 人格代理 · 声魂蒸馏重建数字挚友"
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dna"><Dna className="size-4" /> AI 人格</TabsTrigger>
          <TabsTrigger value="voice-soul"><Heart className="size-4" /> 声魂蒸馏</TabsTrigger>
        </TabsList>
        <TabsContent value="dna" className="mt-4">
          <MangoDNAContent />
        </TabsContent>
        <TabsContent value="voice-soul" className="mt-4">
          <VoiceSoulContent />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
