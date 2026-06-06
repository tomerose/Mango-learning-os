// ═══════════════════════════════════════════════════════════════
// MangoOS Cognitive Engine — Cognitive Reconstruction System
// Input: user text → Output: cognitive restructuring path
// NOT a chatbot. NOT an assistant. A cognitive reconstruction engine.
// ═══════════════════════════════════════════════════════════════

import { completeChat, extractJson } from "@/lib/ai/client";

// ═══ Types ═══

export type CognitiveState = "novice" | "partial" | "confused" | "structured";

export interface CognitiveAnalysis {
  user_current_state: CognitiveState;
  misconceptions: string[];
  missing_prerequisites: string[];
  confidence_estimate: number; // 0-1
}

export interface KnowledgeGraphNode { concept: string; domain?: string; }
export interface KnowledgeGraphEdge { from: string; to: string; type: "prerequisite" | "related" | "component" | "contradicts"; }

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface LearningStep {
  step: number;
  concept: string;
  reason: string;
  exercise: string;
  type: "repair" | "build" | "verify" | "extend";
}

export interface CognitivePath { path: LearningStep[]; estimated_sessions: number; }

export interface TutorLesson {
  concept_reconstruction: string;
  current_problem: string;
  correct_structure: string;
  common_misconception: string;
  concrete_example: string;
  test_question: string;
  next_step: string;
}

export interface MangoDNAEntry {
  concept: string;
  cognitive_state_before: CognitiveState;
  cognitive_state_after: CognitiveState;
  error_patterns: string[];
  timestamp: string;
}

export interface CognitiveResponse {
  analysis: CognitiveAnalysis;
  graph: KnowledgeGraph;
  path: CognitivePath;
  lesson: TutorLesson;
}

// ═══ Cognitive State Estimator ═══

const STATE_SYSTEM = `你是认知状态分析引擎。分析用户输入，判断其知识掌握程度。

输出严格JSON：
{
  "user_current_state": "novice|partial|confused|structured",
  "misconceptions": ["错误理解1", "错误理解2"],
  "missing_prerequisites": ["缺失前置知识1"],
  "confidence_estimate": 0.5
}

状态定义：
- novice: 完全不了解
- partial: 知道一些但不完整
- confused: 有错误理解或概念混淆
- structured: 理解正确且结构清晰`;

export async function estimateCognitiveState(input: string): Promise<CognitiveAnalysis> {
  try {
    const raw = await completeChat([
      { role: "system", content: STATE_SYSTEM },
      { role: "user", content: input.slice(0, 2000) },
    ], { temperature: 0.2 });

    const json = extractJson(raw);
    const parsed = JSON.parse(json);
    return {
      user_current_state: parsed.user_current_state ?? "partial",
      misconceptions: parsed.misconceptions ?? [],
      missing_prerequisites: parsed.missing_prerequisites ?? [],
      confidence_estimate: parsed.confidence_estimate ?? 0.5,
    };
  } catch {
    return { user_current_state: "partial", misconceptions: [], missing_prerequisites: [], confidence_estimate: 0.5 };
  }
}

// ═══ Knowledge Graph Builder ═══

const GRAPH_SYSTEM = `你是知识图谱构建引擎。从用户的学习内容中提取概念和依赖关系。

输出JSON：
{
  "nodes": [{"concept":"概念名","domain":"领域"}],
  "edges": [{"from":"前置概念","to":"目标概念","type":"prerequisite|related|component|contradicts"}]
}`;

export async function buildKnowledgeGraph(input: string, state: CognitiveAnalysis): Promise<KnowledgeGraph> {
  try {
    const raw = await completeChat([
      { role: "system", content: GRAPH_SYSTEM },
      { role: "user", content: `主题：${input.slice(0, 1000)}\n用户状态：${state.user_current_state}\n缺失前置：${state.missing_prerequisites.join(",")}` },
    ], { temperature: 0.3 });
    const json = extractJson(raw);
    const parsed = JSON.parse(json);
    return { nodes: parsed.nodes ?? [], edges: parsed.edges ?? [] };
  } catch {
    return { nodes: [{ concept: input.slice(0, 30) }], edges: [] };
  }
}

// ═══ Learning Path Generator ═══

const PATH_SYSTEM = `你是认知修复路径生成器。不是生成课程，而是生成"认知修复路径"。

输出JSON：
{
  "path": [
    {"step":1,"concept":"概念","reason":"为什么学这个（基于认知状态）","exercise":"验证题","type":"repair|build|verify|extend"}
  ],
  "estimated_sessions": 3
}

type说明：
- repair: 修复错误理解
- build: 构建新知识
- verify: 验证理解
- extend: 知识迁移`;

export async function generateLearningPath(graph: KnowledgeGraph, state: CognitiveAnalysis): Promise<CognitivePath> {
  try {
    const raw = await completeChat([
      { role: "system", content: PATH_SYSTEM },
      { role: "user", content: `图谱：${JSON.stringify(graph.nodes.slice(0, 5))}\n认知状态：${state.user_current_state}\n误解：${state.misconceptions.join(",")}` },
    ], { temperature: 0.4 });
    const json = extractJson(raw);
    const parsed = JSON.parse(json);
    return { path: parsed.path ?? [], estimated_sessions: parsed.estimated_sessions ?? 3 };
  } catch {
    return { path: [{ step: 1, concept: "基础知识", reason: "建立正确认知", exercise: "请用自己的话解释核心概念", type: "build" }], estimated_sessions: 2 };
  }
}

// ═══ Tutor Execution Agent (4-step cognitive teaching) ═══

const TUTOR_SYSTEM = `你是认知教学执行器。遵守4步教学法：

1. 建模 (Explain structure) — 揭示概念的本质结构
2. 对比 (Common misconception) — 指出常见错误理解
3. 举例 (Concrete example) — 给出具体可验证的例子
4. 迁移 (New problem) — 给一个新问题检验理解

输出JSON：
{
  "concept_reconstruction": "📘 概念重构",
  "current_problem": "【你现在的认知问题】...",
  "correct_structure": "【正确结构】...",
  "common_misconception": "【常见误解】...",
  "concrete_example": "【例子】...",
  "test_question": "【测试你是否理解】...",
  "next_step": "【下一步】..."
}

格式：中文，术语带英文。结构清晰，认知导向，非答案导向。`;

export async function executeTutor(path: CognitivePath, state: CognitiveAnalysis, input: string): Promise<TutorLesson> {
  try {
    const raw = await completeChat([
      { role: "system", content: TUTOR_SYSTEM },
      { role: "user", content: `用户输入：${input.slice(0, 1000)}\n认知状态：${state.user_current_state}\n误解：${state.misconceptions.join(",")}\n路径：${path.path.map(p => p.concept).join(" → ")}` },
    ], { temperature: 0.5 });
    const json = extractJson(raw);
    const parsed = JSON.parse(json);
    return {
      concept_reconstruction: parsed.concept_reconstruction ?? "📘 概念重构",
      current_problem: parsed.current_problem ?? "",
      correct_structure: parsed.correct_structure ?? "",
      common_misconception: parsed.common_misconception ?? "",
      concrete_example: parsed.concrete_example ?? "",
      test_question: parsed.test_question ?? "",
      next_step: parsed.next_step ?? "继续下一步学习",
    };
  } catch {
    return {
      concept_reconstruction: "📘 概念重构",
      current_problem: "系统正在分析你的认知状态...",
      correct_structure: "",
      common_misconception: "",
      concrete_example: "",
      test_question: "",
      next_step: "请重新输入以获得完整的认知分析",
    };
  }
}

// ═══ MangoDNA — Cognitive Memory (not chat history) ═══

const DNA_KEY = "mango-cognitive-dna";

export interface MangoDNAStore {
  entries: MangoDNAEntry[];
  last_state: CognitiveState;
}

export function loadDNA(): MangoDNAStore {
  try {
    const raw = localStorage.getItem(DNA_KEY);
    return raw ? JSON.parse(raw) : { entries: [], last_state: "novice" as CognitiveState };
  } catch { return { entries: [], last_state: "novice" as CognitiveState }; }
}

export function saveDNA(dna: MangoDNAStore): void {
  try { localStorage.setItem(DNA_KEY, JSON.stringify(dna)); } catch {}
}

export function updateDNA(entry: MangoDNAEntry): void {
  const dna = loadDNA();
  dna.entries.push(entry);
  dna.last_state = entry.cognitive_state_after;
  // Keep last 20 entries
  if (dna.entries.length > 20) dna.entries = dna.entries.slice(-20);
  saveDNA(dna);
}

export function getCognitiveHistory(concept: string): MangoDNAEntry[] {
  return loadDNA().entries.filter(e => e.concept === concept);
}

// ═══ WeChat Fast Mode — Single combined call + 3s timeout ═══

const FAST_SYSTEM = `认知重构引擎。用中文+英文术语，输出JSON：
{"state":"novice|partial|confused|structured","reconstruction":"指出认知问题→正确结构→误解对比","example":"具体例子","test":"检验题"}
精简、300字内、认知导向。`;

export interface FastCognitiveResponse {
  state: CognitiveState;
  reconstruction: string;
  example: string;
  test: string;
  fullResponse: string;
}

export async function cognitiveFast(input: string, timeoutMs: number = 3000): Promise<FastCognitiveResponse> {
  // timeoutMs = 0 means no timeout (async customer-service mode)
  const controller = new AbortController();
  const timeout = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const raw = await completeChat([
      { role: "system", content: FAST_SYSTEM },
      { role: "user", content: input.slice(0, 500) },
    ], { temperature: 0.3, signal: controller.signal, maxTokens: 400 });

    if (timeout) clearTimeout(timeout);
    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    const result: FastCognitiveResponse = {
      state: parsed.state ?? "partial",
      reconstruction: parsed.reconstruction ?? "",
      example: parsed.example ?? "",
      test: parsed.test ?? "",
      fullResponse: "",
    };

    result.fullResponse = [
      "🧠 认知分析",
      `状态: ${result.state}`,
      "",
      "【认知重构】",
      result.reconstruction,
      "",
      "【例子】",
      result.example,
      "",
      "🧪 " + (result.test || "请用自己的话解释这个概念"),
    ].join("\n");

    return result;
  } catch (err: unknown) {
    if (timeout) clearTimeout(timeout);
    const name = (err as {name?:string}).name ?? "";
    const code = (err as {code?:string}).code ?? "";
    if ((name === "AbortError" || name === "TimeoutError") || (code === "AbortError" || code === "ETIMEDOUT")) {
      return {
        state: "partial", reconstruction: "", example: "", test: "",
        fullResponse: "芒宝正在思考中，请重新发送你的问题。\n\n（AI 分析需要更长时间，请稍后再试）",
      };
    }
    throw err;
  }
}

// ═══ Main Cognitive OS Controller ═══

export async function cognitiveOS(input: string): Promise<CognitiveResponse> {
  // 1. Cognitive State Analysis
  const state = await estimateCognitiveState(input);

  // 2. Build Knowledge Graph
  const graph = await buildKnowledgeGraph(input, state);

  // 3. Generate Learning Path
  const path = await generateLearningPath(graph, state);

  // 4. Execute Tutoring
  const lesson = await executeTutor(path, state, input);

  // 5. Update MangoDNA
  updateDNA({
    concept: graph.nodes[0]?.concept ?? input.slice(0, 30),
    cognitive_state_before: loadDNA().last_state,
    cognitive_state_after: state.user_current_state,
    error_patterns: state.misconceptions,
    timestamp: new Date().toISOString(),
  });

  return { analysis: state, graph, path, lesson };
}

// ═══ Compose structured response ═══

export function composeCognitiveResponse(resp: CognitiveResponse): string {
  const { analysis, path, lesson } = resp;
  return [
    "🧠 认知重构分析",
    "",
    `【你的当前理解】\n认知状态: ${analysis.user_current_state}\n置信度: ${(analysis.confidence_estimate * 100).toFixed(0)}%`,
    "",
    analysis.misconceptions.length > 0 ? `【问题本质】\n${analysis.misconceptions.map(m => `• ${m}`).join("\n")}` : "",
    "",
    "━━━━━━━━━━━━",
    "",
    lesson.concept_reconstruction,
    "",
    lesson.current_problem,
    "",
    lesson.correct_structure,
    "",
    lesson.common_misconception,
    "",
    lesson.concrete_example,
    "",
    "━━━━━━━━━━━━",
    "",
    "🧪 认知验证",
    lesson.test_question,
    "",
    "━━━━━━━━━━━━",
    "",
    `➡ ${lesson.next_step}`,
    "",
    path.path.length > 0 ? `📊 学习路径 (${path.estimated_sessions} sessions): ${path.path.map(p => `${p.step}.${p.concept}`).join(" → ")}` : "",
  ].filter(Boolean).join("\n");
}
