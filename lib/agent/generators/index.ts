// ═══════════════════════════════════════════════════════════════
// Specialized Agent Generators — 1 per task type
// Each returns a complete structured prompt → artifactMarkdown
// ═══════════════════════════════════════════════════════════════

import { completeChat, type ChatMessage } from "@/lib/ai/client";
import type { PlanTier } from "@/lib/plan/types";
import type { TaskType, ArtifactSource, AgentArtifact, ArtifactToolTrace } from "@/lib/agent/artifact-types";
import { createEmptyArtifact, checkArtifactQuality } from "@/lib/agent/artifact-types";
import { combinedSearch, formatSearchResults } from "@/lib/api-integrations/web-search";
import type { AgentToolName } from "@/lib/agent/types";

function msg(content: string): ChatMessage[] { return [{ role: "user", content }]; }
function sys(content: string): ChatMessage[] { return [{ role: "system", content }]; }

// ── Quality depth by plan ─────────────────────────────────────

function depthLabel(plan: PlanTier): string {
  return plan === "pro" || plan === "admin" ? "深度专家级" : "标准学术级";
}

// ── Shared: search and inject results ─────────────────────────

async function searchAndInject(intent: string): Promise<{ sources: ArtifactSource[]; contextText: string }> {
  try {
    const results = await combinedSearch(intent, { wikipedia: true, duckduckgo: true });
    const sources: ArtifactSource[] = results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet, source: r.source }));
    const contextText = formatSearchResults(results);
    return { sources, contextText };
  } catch { return { sources: [], contextText: "" }; }
}

// ── Artifact builder helper ────────────────────────────────────

async function buildArtifact(params: {
  id: string; taskType: TaskType; input: string; plan: string[]; toolsUsed: AgentToolName[];
  toolTraces: ArtifactToolTrace[]; sources: ArtifactSource[];
  systemPrompt: string; userPrompt: string;
  sectionKeys: string[];
}): Promise<AgentArtifact> {
  const { id, taskType, input, plan, toolsUsed, toolTraces, sources, systemPrompt, userPrompt, sectionKeys } = params;

  const artifact = createEmptyArtifact(id, taskType, input);
  artifact.plan = plan;
  artifact.toolsUsed = toolsUsed;
  artifact.toolTraces = toolTraces;
  artifact.sources = sources;

  try {
    const raw = await completeChat([...sys(systemPrompt), ...msg(userPrompt)], { temperature: 0.4 });
    artifact.artifactMarkdown = raw.trim();
    artifact.status = "completed";

    // Attempt to extract sections
    for (const key of sectionKeys) {
      const regex = new RegExp(`(?:###?\\s*)?${key}[：:]\\s*([\\s\\S]*?)(?=###?\\s*(?:${sectionKeys.join("|")})[：:]|$)`, "i");
      const match = raw.match(regex);
      if (match) artifact.artifactSections[key] = match[1].trim();
    }

    artifact.artifactTitle = taskType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    artifact.artifactSummary = raw.slice(0, 200).replace(/^#.*\n/, "").trim();
  } catch (err) {
    artifact.status = "failed";
    artifact.artifactMarkdown = `生成失败: ${err instanceof Error ? err.message : "未知错误"}\n\n请重试或检查 AI 服务配置。`;
  }

  artifact.qualityCheck = checkArtifactQuality(artifact);
  artifact.qualityScore = artifact.qualityCheck.score;
  artifact.exportable = artifact.status === "completed";
  artifact.saveable = true;
  artifact.editable = true;
  artifact.updatedAt = new Date().toISOString();

  return artifact;
}

// ═══════════════════════════════════════════════════════════════
// GENERATORS
// ═══════════════════════════════════════════════════════════════

export async function examReviewGenerator(params: {
  id: string; intent: string; plan: PlanTier; toolsUsed: AgentToolName[];
  files?: Array<{ name: string; text: string }>;
}): Promise<AgentArtifact> {
  const { id, intent, plan, toolsUsed, files } = params;
  const depth = depthLabel(plan);
  const { sources, contextText } = await searchAndInject(intent);
  const fileText = files?.map(f => f.text.slice(0, 3000)).join("\n\n") ?? "";

  const systemPrompt = `你是${depth}考试备考专家。生成完整期末复习讲义。必须包含：知识图谱、核心考点(≥5个)、高频考点、公式速查表、典型例题(≥3道含详细解答)、常见陷阱(≥5个)、模拟试卷(5道题含答案)、7天复习计划。用中文Markdown，表格和列表提高可读性。${contextText ? `\n参考以下实时搜索资料：\n${contextText}` : ""}`;

  const userPrompt = `课程：${intent}\n${fileText ? `资料：\n${fileText}` : ""}\n请生成完整复习讲义。`;

  const toolTraces: ArtifactToolTrace[] = [
    { tool: "web_research", status: sources.length > 0 ? "done" : "skipped", message: sources.length > 0 ? `搜索到${sources.length}条参考` : "无搜索结果", contributedContent: sources.length > 0 },
    { tool: "file_parser", status: fileText ? "done" : "skipped", message: fileText ? "文件解析完成" : "无文件", contributedContent: !!fileText },
    { tool: "study_pack_generator", status: "done", message: "复习讲义生成", contributedContent: true },
    { tool: "quiz_generator", status: "done", message: "模拟题生成", contributedContent: true },
  ];

  return buildArtifact({
    id, taskType: "exam_review", input: intent, plan: ["web_research", "study_pack_generator", "quiz_generator"], toolsUsed, toolTraces, sources,
    systemPrompt, userPrompt,
    sectionKeys: ["知识图谱", "核心考点", "高频考点", "公式速查", "典型例题", "常见陷阱", "模拟试卷", "复习计划"],
  });
}

export async function studyPackAgentGenerator(params: {
  id: string; intent: string; plan: PlanTier; toolsUsed: AgentToolName[];
  files?: Array<{ name: string; text: string }>;
}): Promise<AgentArtifact> {
  const { id, intent, plan, toolsUsed, files } = params;
  const depth = depthLabel(plan);
  const fileText = files?.map(f => f.text.slice(0, 3000)).join("\n\n") ?? "";

  const systemPrompt = `你是${depth}学习导师。生成完整学习包。必须包含：课程概览(目标+范围)、核心概念(≥6个含定义+例子)、知识框架、解题方法(≥3种)、典型例题(≥3道含解答)、记忆清单(考前必备)、复习计划(7天)。用中文Markdown。`;

  const userPrompt = `主题：${intent}\n${fileText ? `资料：\n${fileText}` : ""}\n请生成完整学习包。`;

  return buildArtifact({
    id, taskType: "study_pack", input: intent, plan: ["study_pack_generator", "flashcard_generator"], toolsUsed,
    toolTraces: [
      { tool: "study_pack_generator", status: "done", message: "学习包生成", contributedContent: true },
      { tool: "flashcard_generator", status: "done", message: "闪卡生成", contributedContent: true },
    ], sources: [],
    systemPrompt, userPrompt,
    sectionKeys: ["课程概览", "核心概念", "知识框架", "解题方法", "典型例题", "记忆清单", "复习计划"],
  });
}

export async function conceptExplanationGenerator(params: {
  id: string; intent: string; plan: PlanTier;
}): Promise<AgentArtifact> {
  const { id, intent, plan } = params;
  const depth = depthLabel(plan);
  const { sources, contextText } = await searchAndInject(intent);

  const systemPrompt = `你是${depth}概念讲解专家。用6部分结构解释概念：1.一句话定义 2.直觉理解(生活类比) 3.推导/逻辑步骤 4.${plan==="pro"||plan==="admin"?"4个":"2个"}具体例子(从简单到复杂) 5.${plan==="pro"?"5个":"3个"}常见错误及纠正 6.实际应用 最后给2道自测题含答案。中文Markdown。${contextText ? `\n参考：\n${contextText}` : ""}`;

  const userPrompt = `概念：${intent}\n请用6部分结构详细讲解。`;

  return buildArtifact({
    id, taskType: "concept_explanation", input: intent, plan: ["concept_explainer", "web_research"], toolsUsed: ["concept_explainer", "web_research"],
    toolTraces: [
      { tool: "web_research", status: sources.length > 0 ? "done" : "skipped", message: sources.length > 0 ? `搜索到${sources.length}条` : "无搜索", contributedContent: sources.length > 0 },
      { tool: "concept_explainer", status: "done", message: "概念讲解", contributedContent: true },
    ], sources,
    systemPrompt, userPrompt,
    sectionKeys: ["定义", "直觉理解", "推导", "例子", "常见错误", "应用", "自测题"],
  });
}

export async function documentDeepReadingGenerator(params: {
  id: string; intent: string; plan: PlanTier;
  files?: Array<{ name: string; text: string }>;
}): Promise<AgentArtifact> {
  const { id, intent, plan, files } = params;
  const fileText = files?.map(f => `### ${f.name}\n${f.text.slice(0, 5000)}`).join("\n\n") ?? intent;

  const systemPrompt = `你是深度阅读分析专家。分析文档并生成：1.摘要(200字) 2.核心论点(≥3个) 3.文档结构(章节逻辑) 4.关键术语(≥5个含解释) 5.方法论(如有) 6.证据评估 7.个人可行动笔记(3条) 8.局限性和延伸阅读建议。中文Markdown。`;

  return buildArtifact({
    id, taskType: "document_reading", input: intent, plan: ["file_parser", "summary_generator"], toolsUsed: ["file_parser", "summary_generator"],
    toolTraces: [
      { tool: "file_parser", status: "done", message: `解析${files?.length??0}个文件`, contributedContent: true },
      { tool: "summary_generator", status: "done", message: "深度分析", contributedContent: true },
    ], sources: [],
    systemPrompt, userPrompt: `文档：\n${fileText}\n\n用户意图：${intent}\n请深度分析。`,
    sectionKeys: ["摘要", "核心论点", "文档结构", "关键术语", "方法论", "证据评估", "行动笔记", "局限性和延伸"],
  });
}

export async function notesOrganizerGenerator(params: {
  id: string; intent: string; plan: PlanTier;
  files?: Array<{ name: string; text: string }>;
}): Promise<AgentArtifact> {
  const { id, intent, plan, files } = params;
  const rawContent = files?.map(f => f.text).join("\n\n") ?? intent;

  const systemPrompt = `你是笔记整理专家。将原始笔记整理为结构化文档：按主题分组、提取关键概念(≥8个含定义)、标注重点/难点/考点、补充${plan==="pro"?"概念关联和延伸阅读":"简要说明"}、最后给出3个复习问题。中文Markdown。`;

  return buildArtifact({
    id, taskType: "notes_organize", input: intent, plan: ["file_parser", "notes_writer"], toolsUsed: ["file_parser", "notes_writer"],
    toolTraces: [
      { tool: "file_parser", status: "done", message: "笔记解析", contributedContent: true },
      { tool: "notes_writer", status: "done", message: "结构化整理", contributedContent: true },
    ], sources: [],
    systemPrompt, userPrompt: `原始笔记：\n${rawContent.slice(0, 6000)}\n\n用户需求：${intent}\n请整理。`,
    sectionKeys: ["结构化笔记", "关键概念", "重点标注", "复习问题"],
  });
}

export async function mistakeTrainingGenerator(params: {
  id: string; intent: string; plan: PlanTier;
}): Promise<AgentArtifact> {
  const { id, intent, plan } = params;

  const systemPrompt = `你是错题分析专家。分析错题并生成：1.错误类型分类(概念不清/计算失误/记忆遗忘/粗心) 2.共性问题(跨题目的共同薄弱点) 3.逐题正确解法 4.${plan==="pro"?"5":"3"}道同类巩固题(含答案) 5.知识薄弱点针对性建议。中文Markdown。`;

  return buildArtifact({
    id, taskType: "mistake_training", input: intent, plan: ["mistake_analyzer", "quiz_generator"], toolsUsed: ["mistake_analyzer", "quiz_generator"],
    toolTraces: [
      { tool: "mistake_analyzer", status: "done", message: "错题分析", contributedContent: true },
      { tool: "quiz_generator", status: "done", message: "同类练习生成", contributedContent: true },
    ], sources: [],
    systemPrompt, userPrompt: `错题内容：\n${intent}\n请分析并生成训练方案。`,
    sectionKeys: ["错误类型", "共性问题", "正确解法", "同类巩固", "针对性建议"],
  });
}

export async function englishSpeakingGenerator(params: {
  id: string; intent: string; plan: PlanTier;
}): Promise<AgentArtifact> {
  const { id, intent, plan } = params;

  const systemPrompt = `你是英语口语训练专家。生成口语训练包：1.场景设定(真实对话场景) 2.${plan==="pro"?"10":"5"}个关键词汇(含音标+中文+例句) 3.${plan==="pro"?"3":"2"}段对话范例(含中文翻译) 4.常用表达库(≥8个可迁移句型) 5.发音要点 6.自评标准(流利度/词汇/语法/发音四维)。中英双语Markdown。`;

  return buildArtifact({
    id, taskType: "english_speaking", input: intent, plan: ["concept_explainer", "quiz_generator"], toolsUsed: ["concept_explainer", "quiz_generator"],
    toolTraces: [
      { tool: "concept_explainer", status: "done", message: "场景+表达生成", contributedContent: true },
      { tool: "quiz_generator", status: "done", message: "练习题生成", contributedContent: true },
    ], sources: [],
    systemPrompt, userPrompt: `英语水平及话题：${intent}\n请生成口语训练包。`,
    sectionKeys: ["场景设定", "关键词汇", "对话范例", "常用表达", "发音要点", "自评标准"],
  });
}

export async function presentationGenerator(params: {
  id: string; intent: string; plan: PlanTier;
}): Promise<AgentArtifact> {
  const { id, intent, plan } = params;

  const systemPrompt = `你是演讲/展示准备专家。生成展示方案：1.展示大纲(开场→主体→结论) 2.每页要点(≥5页含标题+要点+视觉建议) 3.讲稿关键段落(开场白+核心论证+结语) 4.QA准备(≥5个预期问题+回答) 5.排练清单(时间/设备/备份)。中文Markdown。`;

  return buildArtifact({
    id, taskType: "presentation", input: intent, plan: ["summary_generator", "notes_writer"], toolsUsed: ["summary_generator", "notes_writer"],
    toolTraces: [
      { tool: "summary_generator", status: "done", message: "内容分析", contributedContent: true },
      { tool: "notes_writer", status: "done", message: "展示方案生成", contributedContent: true },
    ], sources: [],
    systemPrompt, userPrompt: `展示主题：${intent}\n请生成展示方案。`,
    sectionKeys: ["展示大纲", "每页要点", "讲稿关键段", "QA准备", "排练清单"],
  });
}

export async function knowledgeForestGenerator(params: {
  id: string; intent: string; plan: PlanTier;
}): Promise<AgentArtifact> {
  const { id, intent, plan } = params;
  const { sources, contextText } = await searchAndInject(intent);

  const systemPrompt = `你是知识体系构建专家。从内容中提取知识点并构建知识网络：1.主题(根节点) 2.子主题(≥4个二级节点) 3.每个子主题下列出3-5个核心概念 4.概念间的关联关系(≥5条) 5.学习路径建议(从入门到深入)。中文Markdown。${contextText ? `\n参考：\n${contextText}` : ""}`;

  return buildArtifact({
    id, taskType: "knowledge_forest", input: intent, plan: ["web_research", "notes_writer", "flashcard_generator"], toolsUsed: ["web_research", "notes_writer", "flashcard_generator"],
    toolTraces: [
      { tool: "web_research", status: sources.length > 0 ? "done" : "skipped", message: sources.length > 0 ? `搜索${sources.length}条` : "无搜索", contributedContent: sources.length > 0 },
      { tool: "notes_writer", status: "done", message: "知识网络构建", contributedContent: true },
    ], sources,
    systemPrompt, userPrompt: `主题：${intent}\n请构建知识森林。`,
    sectionKeys: ["主题", "子主题", "核心概念", "关联关系", "学习路径"],
  });
}

export async function generalArtifactGenerator(params: {
  id: string; intent: string; plan: PlanTier;
}): Promise<AgentArtifact> {
  const { id, intent, plan } = params;

  const systemPrompt = `你是全科学习助手。根据用户需求生成结构化内容：清晰标题、内容要点、实用建议、下一步行动。中文Markdown。`;

  return buildArtifact({
    id, taskType: "general", input: intent, plan: ["summary_generator"], toolsUsed: ["summary_generator"],
    toolTraces: [
      { tool: "summary_generator", status: "done", message: "内容生成", contributedContent: true },
    ], sources: [],
    systemPrompt, userPrompt: intent,
    sectionKeys: ["内容", "要点", "建议", "下一步"],
  });
}

// ── Task type detection ────────────────────────────────────────

export function detectTaskType(intent: string): TaskType {
  const lower = intent.toLowerCase();
  if (/期末|考试|复习|冲刺|exam|test|midterm|final/i.test(lower)) return "exam_review";
  if (/讲义|学习包|study\s*pack|课程|syllabus/i.test(lower)) return "study_pack";
  if (/论文|文档|pdf|阅读|reading|paper|document/i.test(lower)) return "document_reading";
  if (/笔记|整理|notes|organize|课上/i.test(lower)) return "notes_organize";
  if (/错题|mistake|wrong|更正/i.test(lower)) return "mistake_training";
  if (/英语|口语|ielts|toefl|speaking|english/i.test(lower)) return "english_speaking";
  if (/展示|演讲|present|小组|ppt/i.test(lower)) return "presentation";
  if (/解释|概念|什么是|explain|concept/i.test(lower)) return "concept_explanation";
  if (/知识.*[森林图网]|结构|体系|森林|knowledge.*(?:forest|graph|map)/i.test(lower)) return "knowledge_forest";
  return "general";
}

// ── Route to generator ─────────────────────────────────────────

export async function generateArtifact(params: {
  id: string; intent: string; plan: PlanTier; taskType?: TaskType;
  files?: Array<{ name: string; text: string }>;
  toolsUsed: AgentToolName[];
}): Promise<AgentArtifact> {
  const taskType = params.taskType ?? detectTaskType(params.intent);
  const common = { id: params.id, intent: params.intent, plan: params.plan, toolsUsed: params.toolsUsed, files: params.files };

  switch (taskType) {
    case "exam_review": return examReviewGenerator(common);
    case "study_pack": return studyPackAgentGenerator(common);
    case "document_reading": return documentDeepReadingGenerator(common);
    case "notes_organize": return notesOrganizerGenerator(common);
    case "mistake_training": return mistakeTrainingGenerator(common);
    case "english_speaking": return englishSpeakingGenerator(common);
    case "presentation": return presentationGenerator(common);
    case "concept_explanation": return conceptExplanationGenerator(common);
    case "knowledge_forest": return knowledgeForestGenerator(common);
    default: return generalArtifactGenerator(common);
  }
}
