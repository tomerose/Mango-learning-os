import { FileText, Layers, BookMarked, Network, Search } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { NotesTab } from "@/components/knowledge-hub/notes-tab";
import { FlashcardsTab } from "@/components/knowledge-hub/flashcards-tab";
import { ResourcesTab } from "@/components/knowledge-hub/resources-tab";
import { GraphTab } from "@/components/knowledge-hub/graph-tab";

export const metadata = { title: "Knowledge Hub · Mango Learning OS" };

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

        <TabsContent value="notes" className="mt-4"><NotesTab /></TabsContent>
        <TabsContent value="flashcards" className="mt-4"><FlashcardsTab /></TabsContent>
        <TabsContent value="resources" className="mt-4"><ResourcesTab /></TabsContent>
        <TabsContent value="graph" className="mt-4"><GraphTab /></TabsContent>
      </Tabs>
    </div>
  );
}
