"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Lightbulb, Dumbbell, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/lib/subjects";
import { useStore } from "@/lib/store";
import { AgentChat } from "@/components/agent/agent-chat";
import { AgentContextPanel } from "@/components/agent/agent-context-panel";
import { AgentSuggestions } from "@/components/agent/agent-suggestions";
import { ConceptExplainer } from "@/components/agent/concept-explainer";
import { ExerciseGenerator } from "@/components/agent/exercise-generator";
import { MistakeAnalyzer } from "@/components/agent/mistake-analyzer";
import { DocumentImporter } from "@/components/knowledge-tree/document-importer";
import { SubjectManager } from "@/components/subject-manager";
import { TutorBackground } from "@/components/ui/module-backgrounds";
import type { SubjectId } from "@/lib/types";

type AgentTab = "chat" | "explain" | "practice" | "knowledge";

const TABS: { id: AgentTab; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "AI 对话", icon: MessageSquare },
  { id: "explain", label: "概念讲解", icon: Lightbulb },
  { id: "practice", label: "智能练习", icon: Dumbbell },
  { id: "knowledge", label: "知识导入", icon: Upload },
];

function AgentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subjects, getMeta } = useSubjects();
  const store = useStore();
  const [activeTab, setActiveTab] = React.useState<AgentTab>("chat");
  const subjectFromParams = searchParams.get("subject");
  const [subject, setSubject] = React.useState<SubjectId>(
    () => (subjects.find((s) => s.id === subjectFromParams)?.id as SubjectId | undefined) ?? subjects[0]?.id ?? "ai",
  );
  const setSubjectAndParams = React.useCallback((newSubject: SubjectId) => {
    setSubject(newSubject);
    const params = new URLSearchParams(searchParams.toString());
    params.set("subject", newSubject);
    router.replace(`/agent?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);
  const subjectMeta = getMeta(subject);

  function handleSuggestion(prompt: string) {
    setActiveTab("chat");
    window.dispatchEvent(new CustomEvent("agent:suggestion", { detail: { prompt } }));
  }

  const [extractedText, setExtractedText] = React.useState("");
  const [extractedName, setExtractedName] = React.useState("");

  return (
    <div className="relative">
      <TutorBackground />
      <PageShell title="Mango Tutor" description={`${subjectMeta.label} · AI 对话 · 概念讲解 · 智能练习 · 知识导入`}
        rightPanel={<AgentContextPanel subject={subject} memoryCount={0} />}>
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            {subjects.map((s) => (
              <button key={s.id} onClick={() => setSubjectAndParams(s.id)}
                className={cn("inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                  subject === s.id ? "border-transparent bg-primary text-primary-on" : "text-fg-muted hover:bg-bg-muted")}>
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}
              </button>
            ))}
            <SubjectManager />
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AgentTab)}>
            <TabsList className="w-full max-w-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex-1 text-xs">
                    <Icon className="size-3.5 mr-1" />{tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <TabsContent value="chat" className="mt-4">
              <div className="h-[calc(100dvh-16rem)] md:h-[calc(100dvh-13rem)]"><AgentChat subject={subject} className="h-full" /></div>
              <AgentSuggestions subject={subject} onSelect={handleSuggestion} />
              <div className="mt-4"><MistakeAnalyzer subject={subject} /></div>
            </TabsContent>
            <TabsContent value="explain" className="mt-4"><ConceptExplainer subject={subject} /></TabsContent>
            <TabsContent value="practice" className="mt-4"><ExerciseGenerator subject={subject} /></TabsContent>
            <TabsContent value="knowledge" className="mt-4">
              <div className="max-w-2xl space-y-4">
                <DocumentImporter onExtracted={(doc) => { setExtractedText(doc.text); setExtractedName(doc.fileName); }} />
                {extractedText && (
                  <div className="space-y-3">
                    <div className="card-flat p-4 max-h-48 overflow-y-auto">
                      <p className="text-small text-fg-muted whitespace-pre-wrap line-clamp-12">{extractedText.slice(0, 3000)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { store.addNote({ subject, title: extractedName.replace(/\.[^.]+$/, ""), body: extractedText.slice(0, 80000), tags: [subject] }); setExtractedText(""); setExtractedName(""); }}>
                        <Upload className="size-3.5 mr-1" />保存为笔记
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setExtractedText(""); setExtractedName(""); }}>取消</Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageShell>
    </div>
  );
}

export default function AgentPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-fg-muted text-small">加载中…</div>}>
      <AgentPageInner />
    </React.Suspense>
  );
}
