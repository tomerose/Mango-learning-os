"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Lightbulb, Dumbbell, Upload, Mic, User, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/lib/subjects";
import { useStore } from "@/lib/store";
import { AgentChat } from "@/components/agent/agent-chat";
import { AgentSuggestions } from "@/components/agent/agent-suggestions";
import { ConceptExplainer } from "@/components/agent/concept-explainer";
import { ExerciseGenerator } from "@/components/agent/exercise-generator";
import { MistakeAnalyzer } from "@/components/agent/mistake-analyzer";
import { DocumentImporter } from "@/components/knowledge-tree/document-importer";
import { SubjectManager } from "@/components/subject-manager";
import { VoiceOS } from "@/components/agent/voice-os";
import { SkillTree } from "@/components/ui/skill-tree";
import { DEFAULT_IDENTITIES, BUILTIN_PERSONAS, type LearningIdentity } from "@/lib/ai/identity-engine";
import type { SubjectId } from "@/lib/types";
import Link from "next/link";

type MainTab = "chat" | "identity" | "voice";

function AgentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subjects, getMeta } = useSubjects();
  const store = useStore();
  const [mainTab, setMainTab] = React.useState<MainTab>("chat");
  const [chatTab, setChatTab] = React.useState("chat");
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [selectedIdentity, setSelectedIdentity] = React.useState<LearningIdentity | null>(null);

  // Read tab from URL
  React.useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "identity" || t === "voice") setMainTab(t as MainTab);
  }, [searchParams]);

  const subjectFromParams = searchParams.get("subject");
  const [subject, setSubject] = React.useState<SubjectId>(
    () => (subjects.find((s) => s.id === subjectFromParams)?.id as SubjectId | undefined) ?? subjects[0]?.id ?? "ai",
  );
  const autoQuestion = searchParams.get("q");

  React.useEffect(() => {
    if (autoQuestion) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("agent:suggestion", { detail: { prompt: autoQuestion } }));
      }, 500);
    }
  }, [autoQuestion]);

  const setSubjectAndParams = React.useCallback((newSubject: SubjectId) => {
    setSubject(newSubject);
    const params = new URLSearchParams(searchParams.toString());
    params.set("subject", newSubject);
    router.replace(`/agent?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const subjectMeta = getMeta(subject);

  function handleSuggestion(prompt: string) {
    setChatTab("chat");
    window.dispatchEvent(new CustomEvent("agent:suggestion", { detail: { prompt } }));
  }

  const [extractedText, setExtractedText] = React.useState("");
  const [extractedName, setExtractedName] = React.useState("");
  const [captureData, setCaptureData] = React.useState<{question:string; answer:string; subject:string} | null>(null);
  const [captured, setCaptured] = React.useState(false);

  // Listen for knowledge capture events from agent chat
  React.useEffect(() => {
    const handler = (e: CustomEvent) => { setCaptureData(e.detail); setCaptured(false); };
    window.addEventListener("agent:knowledge-capture", handler as EventListener);
    return () => window.removeEventListener("agent:knowledge-capture", handler as EventListener);
  }, []);

  function handleCapture() {
    if (!captureData) return;
    store.addNote({
      subject: captureData.subject,
      title: captureData.question.slice(0, 60),
      body: `Q: ${captureData.question}\n\nA: ${captureData.answer}`,
      tags: ["对话捕获", captureData.subject],
    });
    setCaptured(true);
  }

  // Demo skills for identity skill tree
  const demoSkills = selectedIdentity
    ? selectedIdentity.topics.map((t, i) => ({ label: t, pct: selectedIdentity.progress + Math.floor(Math.random() * 15), color: ["#C58B74", "#8A9E8B", "#7B8FCA", "#D4A090"][i % 4] }))
    : [];

  return (
    <PageShell title="Mango Tutor" description={`${subjectMeta.label} · 对话 · 身份 · 语音`}>
      <div className="flex flex-col gap-4">
        {/* Main tabs: Chat / Identity / Voice */}
        <Tabs value={mainTab} onValueChange={v => setMainTab(v as MainTab)}>
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="chat"><MessageSquare className="size-3.5 mr-1" />对话</TabsTrigger>
            <TabsTrigger value="identity"><User className="size-3.5 mr-1" />学习身份</TabsTrigger>
            <TabsTrigger value="voice"><Mic className="size-3.5 mr-1" />语音</TabsTrigger>
          </TabsList>

          {/* ═══ CHAT TAB ═══ */}
          <TabsContent value="chat" className="mt-4">
            {/* Subject pills */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {subjects.map((s) => (
                <button key={s.id} onClick={() => setSubjectAndParams(s.id)}
                  className={cn("inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                    subject === s.id ? "border-transparent bg-primary text-primary-on" : "text-fg-muted hover:bg-bg-muted")}>
                  <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}
                </button>
              ))}
              <SubjectManager />
            </div>

            {/* Chat sub-tabs */}
            <Tabs value={chatTab} onValueChange={setChatTab}>
              <TabsList className="w-full max-w-xl">
                {[
                  { id: "chat", label: "对话", icon: MessageSquare },
                  { id: "explain", label: "讲解", icon: Lightbulb },
                  { id: "practice", label: "练习", icon: Dumbbell },
                  { id: "knowledge", label: "导入", icon: Upload },
                ].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex-1 text-xs">
                    <tab.icon className="size-3.5 mr-1" />{tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="chat" className="mt-3">
                <div className="h-[calc(100dvh-20rem)] md:h-[calc(100dvh-16rem)]">
                  <AgentChat subject={subject} className="h-full" />
                </div>
                <AgentSuggestions subject={subject} onSelect={handleSuggestion} />
                {/* Knowledge Capture */}
                {captureData && (
                  <div className="mt-2 flex items-center gap-2">
                    {captured ? (
                      <span className="text-xs text-emerald-500">已保存到知识库 ✓</span>
                    ) : (
                      <button onClick={handleCapture}
                        className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-3 py-1.5 hover:bg-primary-subtle hover:border-primary/30 transition-colors">
                        <Brain className="size-3" /> 保存到知识库
                      </button>
                    )}
                  </div>
                )}
                <div className="mt-3"><MistakeAnalyzer subject={subject} /></div>
              </TabsContent>
              <TabsContent value="explain" className="mt-3"><ConceptExplainer subject={subject} /></TabsContent>
              <TabsContent value="practice" className="mt-3"><ExerciseGenerator subject={subject} /></TabsContent>
              <TabsContent value="knowledge" className="mt-3">
                <div className="max-w-2xl space-y-4">
                  <DocumentImporter onExtracted={(doc) => { setExtractedText(doc.text); setExtractedName(doc.fileName); }} />
                  {extractedText && (
                    <div className="space-y-3">
                      <div className="card-card p-4 max-h-48 overflow-y-auto">
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
          </TabsContent>

          {/* ═══ IDENTITY TAB ═══ */}
          <TabsContent value="identity" className="mt-4">
            <div className="flex flex-col gap-6">
              {/* Voice OS trigger */}
              <div className="card-card p-5 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => { setVoiceOpen(true); setMainTab("voice"); }}>
                <div className="size-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "radial-gradient(circle, rgba(197,139,116,0.3) 0%, rgba(197,139,116,0.1) 100%)" }}>
                  <Mic className="size-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-small font-medium">Voice OS</p>
                  <p className="text-caption mt-0.5">全屏沉浸式语音学习体验</p>
                </div>
                <span className="text-caption">5 个内置人格</span>
              </div>

              {/* Learning Identities */}
              <div>
                <p className="text-label mb-3">学习身份</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DEFAULT_IDENTITIES.map(id => (
                    <button key={id.id} onClick={() => setSelectedIdentity(selectedIdentity?.id === id.id ? null : id)}
                      className={cn("card-card p-4 text-left hover:border-primary/30 transition-colors flex flex-col gap-3",
                        selectedIdentity?.id === id.id && "border-primary/40 bg-primary-subtle")}>
                      <div className="flex items-center gap-3">
                        <span className="size-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: id.id === "ielts-candidate" ? "#C58B74" : id.id === "ai-engineer" ? "#7B8FCA" : "#8A9E8B" }}>
                          {id.name.slice(0, 2)}
                        </span>
                        <div>
                          <p className="text-small font-medium">{id.name}</p>
                          <p className="text-caption">{id.goal}</p>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${id.progress}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {id.topics.map(t => (
                          <span key={t} className="text-caption bg-bg-muted rounded-md px-1.5 py-0.5">{t}</span>
                        ))}
                      </div>
                      <p className="text-xs text-fg-muted">人格: {id.persona.name} · {id.persona.voice}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected identity detail + SkillTree */}
              {selectedIdentity && (
                <div className="card-card p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-small font-medium">{selectedIdentity.name} · {selectedIdentity.persona.name}</p>
                      <p className="text-caption mt-0.5">{selectedIdentity.persona.teachingStyle}</p>
                    </div>
                    <Link href={`/agent?subject=ai&q=${encodeURIComponent("我是" + selectedIdentity.name + "，请帮我学习")}`}
                      className="text-xs text-primary hover:underline">开始对话 →</Link>
                  </div>
                  <div>
                    <p className="text-label mb-2">技能进度</p>
                    <SkillTree skills={demoSkills} onSelect={(skill) => {
                      handleSuggestion(`请讲解：${skill.label}（${selectedIdentity.name}学习路径）`);
                      setMainTab("chat");
                    }} />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ═══ VOICE TAB ═══ */}
          <TabsContent value="voice" className="mt-4">
            {voiceOpen ? (
              <VoiceOS onClose={() => setVoiceOpen(false)} subject={subject} />
            ) : (
              <div className="card-card p-8 flex flex-col items-center gap-4 text-center cursor-pointer"
                onClick={() => setVoiceOpen(true)}>
                <div className="size-20 rounded-full flex items-center justify-center"
                  style={{ background: "radial-gradient(circle, rgba(197,139,116,0.3) 0%, rgba(197,139,116,0.05) 100%)" }}>
                  <Mic className="size-10 text-primary" />
                </div>
                <div>
                  <p className="text-small font-medium">点击进入 Voice OS</p>
                  <p className="text-caption mt-1">全屏沉浸式语音对话 · 5个内置人格</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}

export default function AgentPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-fg-muted text-small">加载中…</div>}>
      <AgentPageInner />
    </React.Suspense>
  );
}
