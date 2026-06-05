"use client";

import * as React from "react";
import { Dna, Heart, Sparkles, Sprout, Brain, Target, Layers, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MangoDNAContent } from "@/components/mango-dna/mango-dna-content";
import { VoiceSoulContent } from "@/components/mango-dna/voice-soul/VoiceSoulContent";
import { JournalEditor } from "@/components/mind/journal-editor";
import { MoodTracker } from "@/components/mind/mood-tracker";
import { AiCompanionChat } from "@/components/mind/ai-companion-chat";
import { SkillTree } from "@/components/ui/skill-tree";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [selectedSkill, setSelectedSkill] = React.useState<{label:string; pct:number} | null>(null);
  const router = useRouter();

  return (
    <PageShell title="Mango DNA" description="你的学习身份与成长轨迹">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dna"><Dna className="size-4 mr-1.5" />学习身份</TabsTrigger>
          <TabsTrigger value="skills"><Sprout className="size-4 mr-1.5" />技能树</TabsTrigger>
          <TabsTrigger value="garden"><Heart className="size-4 mr-1.5" />心灵花园</TabsTrigger>
          <TabsTrigger value="voice-soul"><Sparkles className="size-4 mr-1.5" />声魂蒸馏</TabsTrigger>
        </TabsList>
        <TabsContent value="dna" className="mt-4"><MangoDNAContent /></TabsContent>
        <TabsContent value="skills" className="mt-4">
          <div className="card-card p-5">
            <p className="text-small font-medium mb-4">技能树 · 点击跳转学习</p>
            <SkillTree skills={DEMO_SKILLS} onSelect={setSelectedSkill} />
            {selectedSkill && (
              <div className="mt-4 card-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-small font-medium">{selectedSkill.label} · 掌握度 {selectedSkill.pct}%</span>
                  <button onClick={() => setSelectedSkill(null)} className="text-caption hover:underline">关闭</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "去学习", icon: Brain, href: `/agent?subject=ai&q=${encodeURIComponent("请讲解：" + selectedSkill.label)}` },
                    { label: "去练习", icon: Target, href: `/agent` },
                    { label: "去复习", icon: Layers, href: `/planner` },
                    { label: "查看笔记", icon: FileText, href: `/exam` },
                  ].map(a => (
                    <Link key={a.label} href={a.href}
                      className="flex items-center gap-2 rounded-xl border border-border p-3 text-xs hover:bg-bg-muted transition-colors">
                      <a.icon className="size-4 text-primary" /> {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="garden" className="mt-4 flex flex-col gap-6">
          <div className="card-card p-5"><JournalEditor /></div>
          <MoodTracker />
          <AiCompanionChat />
        </TabsContent>
        <TabsContent value="voice-soul" className="mt-4"><VoiceSoulContent /></TabsContent>
      </Tabs>
    </PageShell>
  );
}
