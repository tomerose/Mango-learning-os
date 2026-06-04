import { FileText, Layers, BookMarked, Network, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NotesTab } from "@/components/knowledge-hub/notes-tab";
import { FlashcardsTab } from "@/components/knowledge-hub/flashcards-tab";
import { SUBJECT_META } from "@/lib/mock-data";
import type { SubjectId } from "@/lib/types";

export const metadata = { title: "Knowledge Hub · Mango Learning OS" };

const resources = [
  { title: "Attention Is All You Need", type: "论文", subject: "ai" as SubjectId },
  { title: "3Blue1Brown 线性代数", type: "视频", subject: "math" as SubjectId },
  { title: "经济学人 · 每周精读", type: "文章", subject: "english" as SubjectId },
  { title: "Damodaran 估值课程", type: "课程", subject: "finance" as SubjectId },
];

export default function KnowledgeHubPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">知识中心</h1>
        <p className="text-muted-foreground text-sm">
          笔记、闪卡、资源库与知识图谱 —— 你的第二大脑
        </p>
      </header>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input placeholder="搜索笔记、闪卡、资源…" className="pl-9" />
      </div>

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes"><FileText className="size-4" />笔记</TabsTrigger>
          <TabsTrigger value="flashcards"><Layers className="size-4" />闪卡</TabsTrigger>
          <TabsTrigger value="resources"><BookMarked className="size-4" />资源</TabsTrigger>
          <TabsTrigger value="graph"><Network className="size-4" />图谱</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-4">
          <NotesTab />
        </TabsContent>

        <TabsContent value="flashcards" className="mt-4">
          <FlashcardsTab />
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-1 pt-0">
              {resources.map((r, i) => {
                const meta = SUBJECT_META[r.subject];
                return (
                  <div key={i} className="hover:bg-accent/50 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors">
                    <BookMarked className="size-4 shrink-0" style={{ color: meta.color }} />
                    <span className="flex-1 text-sm font-medium">{r.title}</span>
                    <Badge variant="outline">{r.type}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="mt-4">
          <Card>
            <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
              <Network className="size-8 opacity-40" />
              <p className="text-sm">知识图谱可视化即将上线 —— 将连接概念间的依赖关系</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
