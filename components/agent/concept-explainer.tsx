"use client";

import * as React from "react";
import {
  Lightbulb, Brain, ListOrdered, Beaker, AlertTriangle,
  Loader2, Send, BookOpen, GitGraph, Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { SubjectId } from "@/lib/types";
import { useSubjects } from "@/lib/subjects";

// ─────────────────────────────────────────────────────────────
// Structured Learning Explainer
// 5 层教学内容 + 知识图谱 JSON + 学习路径
// 使用结构化学习 prompt 引擎
// ─────────────────────────────────────────────────────────────

interface ConceptExplainerProps { subject: SubjectId; className?: string; }

interface KnowledgeNode { id: string; type: string; }
interface KnowledgeEdge { from: string; to: string; relation: string; }
interface KnowledgeGraph { nodes: KnowledgeNode[]; edges: KnowledgeEdge[]; }

interface LearningStep { step: number; text: string; duration: string; }

function parseKnowledgeGraph(raw: string): KnowledgeGraph | null {
  const m = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[1]);
    if (obj.nodes && obj.edges) return obj as KnowledgeGraph;
  } catch { /* ignore */ }
  return null;
}

function parseLearningPath(raw: string): LearningStep[] {
  const m = raw.match(/```[\s\S]*?```/);
  const text = m ? m[0].replace(/```/g, "") : raw;
  const steps: LearningStep[] = [];
  const lines = text.split("\n").filter((l) => /Step\s*\d+/i.test(l));
  for (const line of lines) {
    const match = line.match(/Step\s*(\d+)[：:]\s*(.+?)(?:（(.+?)）)?$/);
    if (match) {
      steps.push({ step: parseInt(match[1]), text: match[2].trim(), duration: match[3] ?? "" });
    }
  }
  if (steps.length === 0) {
    // Fallback: each non-empty line is a step
    text.split("\n").filter((l) => l.trim()).forEach((l, i) => {
      steps.push({ step: i + 1, text: l.replace(/^[-*]\s*/, "").trim(), duration: "" });
    });
  }
  return steps.slice(0, 8);
}

const LAYERS = [
  { id: "what", icon: Lightbulb, title: "概念定义", clue: /概念定义|什么是|1\./ },
  { id: "why", icon: Brain, title: "原理机制", clue: /原理机制|为什么|2\./ },
  { id: "how", icon: ListOrdered, title: "结构推导", clue: /结构推导|推导|3\.|Step/ },
  { id: "use", icon: Beaker, title: "应用映射", clue: /应用映射|应用|4\./ },
  { id: "check", icon: AlertTriangle, title: "理解检测", clue: /理解检测|检测|5\.|思考题/ },
];

function splitLayers(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  let remaining = raw;
  for (let i = 0; i < LAYERS.length; i++) {
    const layer = LAYERS[i];
    const nextLayer = LAYERS[i + 1];
    const start = remaining.search(layer.clue);
    if (start === -1) continue;
    let end: number;
    if (nextLayer) {
      const endIdx = remaining.slice(start + 1).search(nextLayer.clue);
      end = endIdx === -1 ? remaining.length : start + 1 + endIdx;
    } else {
      end = remaining.length;
    }
    result[layer.id] = remaining.slice(start, end).trim();
  }
  // If nothing matched, return raw as "what"
  if (Object.keys(result).length === 0) result.what = raw;
  return result;
}

function formatMarkdown(md: string): string {
  let s = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  s = s.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="rounded-xl bg-muted p-3 text-xs overflow-x-auto my-2"><code>${code.trim().replace(/[&<>"']/g, (c: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c] ?? c))}</code></pre>`);
  s = s.replace(/`([^`]+)`/g, "<code class=\"bg-muted px-1 rounded text-xs\">$1</code>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong class=\"text-foreground\">$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/\$(.+?)\$/g, "<code class=\"text-primary\">$1</code>");
  s = s.replace(/\n\n+/g, "<br/><br/>");
  s = s.replace(/\n/g, "<br/>");
  return s;
}

export function ConceptExplainer({ subject, className }: ConceptExplainerProps) {
  const { getMeta } = useSubjects();
  const [concept, setConcept] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rawResponse, setRawResponse] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("content");

  // Parsed outputs
  const layers = React.useMemo(() => splitLayers(rawResponse), [rawResponse]);
  const knowledgeGraph = React.useMemo(() => parseKnowledgeGraph(rawResponse), [rawResponse]);
  const learningPath = React.useMemo(() => parseLearningPath(rawResponse), [rawResponse]);

  async function explain() {
    const trimmed = concept.trim();
    if (!trimmed || loading) return;
    setLoading(true); setError(null); setRawResponse("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          messages: [
            { role: "system", content: `你是结构化学习引擎。对任何学习主题按以下格式输出三层内容：\n\n## 📖 教学内容\n\n### 1. 概念定义\n- 一句话定义核心概念\n- 3-5 个关键词\n\n### 2. 原理机制\n- 底层逻辑、因果关系\n- 如有公式用 $...$ 包裹\n\n### 3. 结构推导\nStep 1: ...\nStep 2: ...\n\n### 4. 应用映射\n- 1 个真实场景\n- 操作步骤\n\n### 5. 理解检测\n- 1-2 个思考题\n- 参考答案\n\n## 🗺️ 知识图谱\n\n\`\`\`json\n{"nodes":[{"id":"概念1","type":"核心"},{"id":"概念2","type":"前置"}],"edges":[{"from":"概念2","to":"概念1","relation":"依赖"}]}\n\`\`\`\n\n## 🧭 学习路径\n\n\`\`\`\nStep 1: 学习 XXX（预估 20 分钟）\nStep 2: 学习 YYY（预估 15 分钟）\n...\n\`\`\`\n\n输出规则：逻辑链式、类教材风格、面向理解和可操作性。` },
            { role: "user", content: `请分析：${trimmed}` },
          ],
        }),
      });
      if (!res.ok || !res.body) throw new Error(`请求失败 (${res.status})`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder(); let acc = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; acc += decoder.decode(value, { stream: true }); }
      setRawResponse(acc);
    } catch (err) { setError(err instanceof Error ? err.message : "出错了，请重试"); }
    finally { setLoading(false); }
  }

  const layerCount = Object.keys(layers).length;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Input */}
      <div className="flex gap-2">
        <Input value={concept} onChange={(e) => setConcept(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); explain(); } }}
          placeholder={'输入想学习的概念，如「反向传播」「CAPM 模型」…'} disabled={loading} className="flex-1 rounded-xl" />
        <Button onClick={explain} disabled={loading || !concept.trim()} className="shrink-0 rounded-xl">
          {loading ? <><Loader2 className="size-4 mr-1.5 animate-spin" />生成中</> : <><Send className="size-4 mr-1.5" />学习</>}
        </Button>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading && (
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          {[1, 2, 3].map((i) => (<div key={i} className="flex gap-3"><div className="size-5 rounded bg-muted animate-pulse" /><div className="flex-1 space-y-1.5"><div className="h-4 w-24 rounded bg-muted animate-pulse" /><div className="h-3 w-full rounded bg-muted/50 animate-pulse" /></div></div>))}
        </div>
      )}

      {rawResponse && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="content" className="flex-1"><BookOpen className="size-3.5" /> 教学内容 {layerCount > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{layerCount} 层</Badge>}</TabsTrigger>
            <TabsTrigger value="graph" className="flex-1"><GitGraph className="size-3.5" /> 知识图谱 {knowledgeGraph && <Badge variant="secondary" className="ml-1 text-[10px]">{knowledgeGraph.nodes.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="path" className="flex-1"><Route className="size-3.5" /> 学习路径 {learningPath.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{learningPath.length} 步</Badge>}</TabsTrigger>
          </TabsList>

          {/* 📖 教学内容 */}
          <TabsContent value="content" className="mt-4">
            <Accordion type="multiple" defaultValue={LAYERS.map((l) => l.id)} className="w-full">
              {LAYERS.map((layer) => {
                const content = layers[layer.id];
                if (!content) return null;
                const Icon = layer.icon;
                return (
                  <AccordionItem key={layer.id} value={layer.id} className="border rounded-2xl mb-3 px-1">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <span className="flex items-center gap-2.5 text-sm font-medium">
                        <Icon className="size-4 text-primary" />{layer.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_pre]:my-2 [&_code]:text-xs"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }} />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          {/* 🗺️ 知识图谱 */}
          <TabsContent value="graph" className="mt-4">
            {!knowledgeGraph ? (
              <div className="text-center py-12 text-muted-foreground text-sm">AI 未生成知识图谱，尝试重新输入更具体的概念</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border bg-card p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {knowledgeGraph.nodes.map((n) => (
                      <Badge key={n.id} variant={n.type === "核心" ? "default" : "secondary"} className="text-xs">
                        {n.type === "核心" ? "●" : "○"} {n.id}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {knowledgeGraph.edges.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{e.from}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">{e.relation}</span>
                        <span className="text-primary">→</span>
                        <span className="font-medium">{e.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Mini graph visualization */}
                <div className="rounded-2xl border bg-card p-4 min-h-[200px] relative overflow-hidden">
                  {knowledgeGraph.nodes.map((n, i) => {
                    const row = Math.floor(i / 3);
                    const col = i % 3;
                    return (
                      <div key={n.id}
                        className="absolute rounded-xl border px-3 py-1.5 text-xs font-medium bg-background shadow-sm transition-all hover:scale-105 cursor-default"
                        style={{
                          left: `${10 + col * 30}%`, top: `${15 + row * 30}%`,
                          borderColor: n.type === "核心" ? "var(--primary)" : "var(--border)",
                          color: n.type === "核心" ? "var(--primary)" : "var(--muted-foreground)",
                        }}
                      >
                        {n.id}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* 🧭 学习路径 */}
          <TabsContent value="path" className="mt-4">
            {learningPath.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">AI 未生成学习路径</div>
            ) : (
              <div className="space-y-0">
                {learningPath.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        step.step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        {step.step}
                      </div>
                      {i < learningPath.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{step.text}</p>
                      {step.duration && <p className="text-xs text-muted-foreground mt-0.5">{step.duration}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
