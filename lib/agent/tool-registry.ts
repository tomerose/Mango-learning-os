// ═══════════════════════════════════════════════════════════════
// Mango Agent — Tool Registry (Strict Whitelist)
// Only exposes safe learning tools. No shell/fs/network r/w.
// ═══════════════════════════════════════════════════════════════

import type { AgentToolName, ToolDefinition, AgentContext, TimelineEvent, AgentTaskInput } from "@/lib/agent/types";

// ── Tool Registry ────────────────────────────────────────────────

export const TOOL_REGISTRY: Record<AgentToolName, Omit<ToolDefinition, "execute">> = {
  file_parser: {
    name: "file_parser",
    label: "文件解析",
    description: "解析 PDF/Word/Markdown/TXT 文件，提取文本内容",
    requiresAuth: true,
    requiresFiles: true,
    costLevel: "low",
  },
  ocr_extract: {
    name: "ocr_extract",
    label: "图像识别",
    description: "从截图/照片中提取文字、题目、笔记结构",
    requiresAuth: true,
    requiresFiles: true,
    costLevel: "medium",
  },
  web_research: {
    name: "web_research",
    label: "联网搜索",
    description: "搜索在线资源、学术论文、公开书籍",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "medium",
  },
  source_ranking: {
    name: "source_ranking",
    label: "来源排序",
    description: "对搜索结果进行相关度和可信度排序",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "low",
  },
  study_pack_generator: {
    name: "study_pack_generator",
    label: "学习包生成",
    description: "生成完整考试复习讲义（18个模块）",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "high",
  },
  quiz_generator: {
    name: "quiz_generator",
    label: "测验生成",
    description: "根据知识点生成选择题、填空题、解答题",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "medium",
  },
  flashcard_generator: {
    name: "flashcard_generator",
    label: "闪卡生成",
    description: "自动从内容提取知识点生成 SM-2 闪卡",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "low",
  },
  notes_writer: {
    name: "notes_writer",
    label: "笔记整理",
    description: "自动整理、结构化、补充笔记内容",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "low",
  },
  export_tool: {
    name: "export_tool",
    label: "导出工具",
    description: "导出为 Word/PDF/Markdown/HTML 格式",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "low",
  },
  review_planner: {
    name: "review_planner",
    label: "复习计划",
    description: "根据遗忘曲线和错题生成每日复习计划",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "low",
  },
  mistake_analyzer: {
    name: "mistake_analyzer",
    label: "错题分析",
    description: "分析错题原因，生成类似题目，推荐复习",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "medium",
  },
  concept_explainer: {
    name: "concept_explainer",
    label: "概念讲解",
    description: "6部分结构化概念解释（定义→直觉→推导→例子→陷阱→应用）",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "medium",
  },
  summary_generator: {
    name: "summary_generator",
    label: "摘要生成",
    description: "生成长文本、论文、章节的结构化摘要",
    requiresAuth: true,
    requiresFiles: false,
    costLevel: "low",
  },
};

// ── Task Templates ───────────────────────────────────────────────

export const TASK_TEMPLATES = [
  {
    id: "exam_sprint",
    title: "期末冲刺",
    description: "3天考前突击：从笔记生成精简讲义 + 高频考点",
    icon: "⚡",
    intent: "我有一场考试在3天后，请根据我上传的资料生成一份考前冲刺讲义，包含高频考点、公式速查、典型例题和模拟试卷。",
    suggestedTools: ["file_parser", "web_research", "study_pack_generator", "flashcard_generator"] as AgentToolName[],
    suggestedInputs: [
      { type: "file", label: "课程资料（PDF/Word/笔记）", required: true },
      { type: "text", label: "课程名称", required: true },
      { type: "text", label: "考试范围（如第1-8章）", required: false },
    ],
    category: "exam" as const,
  },
  {
    id: "mistake_practice",
    title: "错题集训",
    description: "从错题库抽取高频错题，生成专项练习",
    icon: "🎯",
    intent: "从我的错题库中提取最常错的题目类型，生成一套专项练习，并给出每个知识点的讲解。",
    suggestedTools: ["mistake_analyzer", "quiz_generator", "concept_explainer"] as AgentToolName[],
    suggestedInputs: [
      { type: "text", label: "科目/主题（可选，留空则全科）", required: false },
    ],
    category: "review" as const,
  },
  {
    id: "paper_summary",
    title: "论文精读",
    description: "上传论文PDF，自动生成结构化摘要和知识卡片",
    icon: "📄",
    intent: "请分析这篇论文，提取核心论点、方法论、关键发现和引用，生成结构化摘要和知识卡片。",
    suggestedTools: ["file_parser", "summary_generator", "flashcard_generator", "notes_writer"] as AgentToolName[],
    suggestedInputs: [
      { type: "file", label: "论文 PDF", required: true },
    ],
    category: "analyze" as const,
  },
  {
    id: "class_notes_organizer",
    title: "课堂笔记整理",
    description: "上传散乱的课堂笔记，AI 自动结构化整理",
    icon: "📝",
    intent: "请将我的课堂笔记整理成结构化文档：按章节分组，提取关键概念，补充解释，标记重点。",
    suggestedTools: ["file_parser", "notes_writer", "summary_generator"] as AgentToolName[],
    suggestedInputs: [
      { type: "file", label: "课堂笔记（照片/PDF/文字）", required: true },
      { type: "text", label: "课程名称", required: true },
    ],
    category: "study" as const,
  },
  {
    id: "seven_day_review",
    title: "7天复习计划",
    description: "根据遗忘曲线生成一周复习计划",
    icon: "📅",
    intent: "请根据我的学习内容和错题记录，生成一个7天复习计划，每天包含闪卡复习、错题重做和知识点回顾。",
    suggestedTools: ["review_planner", "mistake_analyzer", "flashcard_generator"] as AgentToolName[],
    suggestedInputs: [
      { type: "text", label: "要复习的科目/主题", required: true },
    ],
    category: "review" as const,
  },
  {
    id: "knowledge_forest_builder",
    title: "知识森林构建",
    description: "从学习资料中提取知识点，构建知识网络",
    icon: "🌳",
    intent: "请分析我的学习资料，提取所有知识点并构建知识森林：主题→子主题→概念→关系。",
    suggestedTools: ["file_parser", "notes_writer", "flashcard_generator"] as AgentToolName[],
    suggestedInputs: [
      { type: "file", label: "学习资料", required: true },
      { type: "text", label: "主题名称", required: true },
    ],
    category: "create" as const,
  },
  {
    id: "english_speaking",
    title: "英语口语训练",
    description: "生成口语练习话题和范文，支持语音输入",
    icon: "🗣️",
    intent: "请根据我的英语水平生成5个口语练习话题，每个话题包含关键词汇、范文和常见表达。",
    suggestedTools: ["concept_explainer", "quiz_generator"] as AgentToolName[],
    suggestedInputs: [
      { type: "text", label: "当前英语水平（如IELTS 6.0）", required: true },
      { type: "text", label: "想练习的话题方向", required: false },
    ],
    category: "study" as const,
  },
  {
    id: "group_presentation",
    title: "小组展示准备",
    description: "从研究资料生成展示大纲、讲稿和PPT素材",
    icon: "🎤",
    intent: "请根据我的研究资料生成一份小组展示方案：大纲、每页要点、讲稿关键段落和Q&A准备。",
    suggestedTools: ["file_parser", "web_research", "summary_generator", "notes_writer"] as AgentToolName[],
    suggestedInputs: [
      { type: "file", label: "研究资料/参考文献", required: true },
      { type: "text", label: "展示主题", required: true },
      { type: "text", label: "时间限制（分钟）", required: false },
    ],
    category: "create" as const,
  },
];

// ── Tool Availability Check ──────────────────────────────────────

export function getAvailableTools(plan: string): AgentToolName[] {
  const guestTools: AgentToolName[] = []; // Guests can't execute any tools
  const standardTools: AgentToolName[] = [
    "file_parser", "notes_writer", "quiz_generator",
    "flashcard_generator", "export_tool", "review_planner",
    "concept_explainer", "summary_generator",
  ];
  const proTools: AgentToolName[] = [
    ...standardTools,
    "ocr_extract", "web_research", "source_ranking",
    "study_pack_generator", "mistake_analyzer",
  ];

  if (plan === "admin" || plan === "pro") return [...proTools];
  if (plan === "standard") return standardTools;
  return guestTools;
}

export function getToolInfo(name: AgentToolName) {
  return TOOL_REGISTRY[name];
}
