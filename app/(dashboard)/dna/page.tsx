"use client";

import * as React from "react";
import { Dna, Heart, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MangoDNAContent } from "@/components/mango-dna/mango-dna-content";
import { VoiceSoulContent } from "@/components/mango-dna/voice-soul/VoiceSoulContent";
import { SkillTree } from "@/components/ui/skill-tree";
import { useRouter } from "next/navigation";

const DEMO_SKILLS = [
  { label: "深度学习", pct: 72, color: "var(--color-primary)", children: [
    { label: "Transformer", pct: 78 }, { label: "反向传播", pct: 65 }, { label: "注意力机制", pct: 70 },
  ]},
  { label: "经济学", pct: 58, color: "#8A9E8B", children: [
    { label: "微观经济", pct: 62 }, { label: "宏观经济", pct: 54 },
  ]},
  { label: "数学", pct: 81, color: "#7B8FCA", children: [
    { label: "线性代数", pct: 85 }, { label: "微积分", pct: 78 },
  ]},
];

export default function DnaPage() {
  const [tab, setTab] = React.useState("dna");
  const router = useRouter();

  return (
    <PageShell title="Mango DNA" description="你的学习身份与成长轨迹">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dna"><Dna className="size-4 mr-1.5" />学习身份</TabsTrigger>
          <TabsTrigger value="voice-soul"><Heart className="size-4 mr-1.5" />声魂蒸馏</TabsTrigger>
        </TabsList>
        <TabsContent value="dna" className="mt-4 flex flex-col gap-6">
          <div className="card-card p-5">
            <p className="text-small font-medium mb-4">技能树</p>
            <SkillTree skills={DEMO_SKILLS} onSelect={(skill) => router.push(`/agent?subject=${skill.label === "深度学习" ? "ai" : skill.label === "经济学" ? "economics" : "math"}`)} />
          </div>
          <MangoDNAContent />
        </TabsContent>
        <TabsContent value="voice-soul" className="mt-4"><VoiceSoulContent /></TabsContent>
      </Tabs>
    </PageShell>
  );
}
