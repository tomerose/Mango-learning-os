"use client";

import * as React from "react";
import { Dna, Heart } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MangoDNAContent } from "@/components/mango-dna/mango-dna-content";
import { VoiceSoulContent } from "@/components/mango-dna/voice-soul/VoiceSoulContent";

export default function DnaPage() {
  const [tab, setTab] = React.useState("dna");
  return (
    <PageShell title="Mango DNA" description="AI personality profiles and voice soul distillation">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dna"><Dna className="size-4 mr-1.5" />AI Identity</TabsTrigger>
          <TabsTrigger value="voice-soul"><Heart className="size-4 mr-1.5" />Voice Soul</TabsTrigger>
        </TabsList>
        <TabsContent value="dna" className="mt-4"><MangoDNAContent /></TabsContent>
        <TabsContent value="voice-soul" className="mt-4"><VoiceSoulContent /></TabsContent>
      </Tabs>
    </PageShell>
  );
}
