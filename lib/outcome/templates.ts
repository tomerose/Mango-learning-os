/**
 * MangoOS V14.2 — Outcome Templates
 *
 * Each task type has a structured template with required sections,
 * quality expectations, and output schema. Used by the Outcome Engine
 * to ensure every generation produces a high-quality structured artifact.
 */
import type { ArtifactType } from "@/lib/artifact/types";

export interface TaskTemplate {
  type: ArtifactType;
  label: string;
  icon: string;
  description: string;
  systemPromptIntro: string;
  requiredSections: SectionTemplate[];
  qualityExpectations: string;
  exportDefaults: string[];
}

export interface SectionTemplate {
  id: string;
  title: string;
  importance: "critical" | "high" | "medium" | "reference";
  description: string;
  minLength: number;
}

// ── All 10 templates ───────────────────────────────────────────

export const TASK_TEMPLATES: Record<ArtifactType, TaskTemplate> = {
  // ── 1. 期末复习讲义 ──────────────────────────────────────────
  exam_review: {
    type: "exam_review",
    label: "期末复习讲义",
    icon: "📚",
    description: "基于课程资料生成完整期末复习讲义，含知识框架、重点考点、例题和冲刺计划",
    systemPromptIntro: "你是一位资深大学课程导师。请基于以下资料生成一份期末复习讲义。必须包含完整的知识框架、考点分析、典型例题和复习计划。输出必须是结构化的 Markdown，可以直接导出为 PDF/DOCX。",
    requiredSections: [
      { id: "overview", title: "📋 课程概览与考试范围", importance: "critical", description: "课程整体框架、考试范围说明", minLength: 200 },
      { id: "framework", title: "🧠 知识框架", importance: "critical", description: "核心知识体系结构图/树", minLength: 300 },
      { id: "keypoints", title: "🎯 重点考点分析", importance: "critical", description: "高频考点、难点、易错点标注", minLength: 400 },
      { id: "examples", title: "📝 典型例题精讲", importance: "critical", description: "3-5道代表性题目+详细解答", minLength: 500 },
      { id: "formulas", title: "📐 公式/定理速查", importance: "high", description: "核心公式汇总、定理一览", minLength: 150 },
      { id: "pitfalls", title: "⚠️ 常见错误与避坑", importance: "high", description: "常见解题错误、概念混淆、纠正", minLength: 200 },
      { id: "plan", title: "📅 复习冲刺计划", importance: "high", description: "按天安排的复习任务", minLength: 200 },
      { id: "practice", title: "✏️ 课后练习", importance: "medium", description: "3-5道自测题", minLength: 150 },
    ],
    qualityExpectations: "至少 5 个以上考点分析、3 道以上例题、可执行的每日复习计划",
    exportDefaults: ["markdown", "html", "docx", "pdf"],
  },

  // ── 2. 学习包 ────────────────────────────────────────────────
  study_pack: {
    type: "study_pack",
    label: "学习包",
    icon: "📦",
    description: "综合学习材料包，包含知识梳理、来源资料、练习和导出文档",
    systemPromptIntro: "你是一位专业学习内容设计师。请基于输入资料生成一份综合学习包。必须包含知识体系、多源参考资料、实践练习和课程大纲。输出结构化 Markdown。",
    requiredSections: [
      { id: "overview", title: "📋 学习概览", importance: "critical", description: "主题概述、学习目标", minLength: 200 },
      { id: "outline", title: "📑 知识大纲", importance: "critical", description: "18 section 知识大纲", minLength: 500 },
      { id: "concepts", title: "🔑 核心概念", importance: "critical", description: "8-15个核心概念解释", minLength: 400 },
      { id: "sources", title: "📖 参考来源", importance: "high", description: "推荐阅读、参考链接", minLength: 150 },
      { id: "practice", title: "✏️ 练习任务", importance: "high", description: "配套练习题", minLength: 200 },
      { id: "summary", title: "📊 知识总结", importance: "medium", description: "一页速览", minLength: 150 },
    ],
    qualityExpectations: "18 section 大纲、至少 8 个核心概念、5 个以上来源",
    exportDefaults: ["markdown", "html", "docx", "pdf"],
  },

  // ── 3. 文档阅读卡 ────────────────────────────────────────────
  document_reading: {
    type: "document_reading",
    label: "文档/论文阅读卡",
    icon: "📄",
    description: "把论文或长文档拆成摘要、框架、术语卡和批判思考",
    systemPromptIntro: "你是一位学术阅读教练。请将以下文档拆解为结构化阅读卡。必须包含摘要、核心论点、术语表、方法论分析和批判思考。",
    requiredSections: [
      { id: "abstract", title: "📋 摘要与核心论点", importance: "critical", description: "1-2段精准摘要", minLength: 200 },
      { id: "structure", title: "🏗️ 文章结构", importance: "critical", description: "章节结构、论证链条", minLength: 200 },
      { id: "glossary", title: "📖 术语卡", importance: "high", description: "5-10个关键术语解释", minLength: 200 },
      { id: "methods", title: "🔬 方法论分析", importance: "high", description: "研究方法、数据来源、局限性", minLength: 150 },
      { id: "critique", title: "💭 批判思考", importance: "high", description: "观点评价、延伸问题", minLength: 150 },
      { id: "takeaways", title: "💡 关键收获", importance: "medium", description: "3-5个可迁移的见解", minLength: 100 },
    ],
    qualityExpectations: "完整摘要、术语卡 5+条目、批判分析",
    exportDefaults: ["markdown", "html", "docx"],
  },

  // ── 4. 笔记整理 ──────────────────────────────────────────────
  notes_organize: {
    type: "notes_organize",
    label: "笔记整理",
    icon: "📝",
    description: "把零散笔记整理成结构化知识文档",
    systemPromptIntro: "你是一位知识管理专家。请将以下零散笔记整理成结构化知识文档。必须包含知识分类、概念连接、关键问题索引和复习路径。",
    requiredSections: [
      { id: "categories", title: "📂 知识分类", importance: "critical", description: "按主题/概念分组", minLength: 300 },
      { id: "connections", title: "🔗 概念连接", importance: "high", description: "跨主题关联图", minLength: 150 },
      { id: "questions", title: "❓ 关键问题索引", importance: "high", description: "需深入探索的问题", minLength: 150 },
      { id: "gaps", title: "🕳️ 知识缺口", importance: "medium", description: "待补充内容", minLength: 100 },
      { id: "review", title: "🔄 复习路径", importance: "medium", description: "3轮复习安排", minLength: 100 },
    ],
    qualityExpectations: "分类清晰、概念有连接、复习可执行",
    exportDefaults: ["markdown", "html"],
  },

  // ── 5. 错题训练报告 ──────────────────────────────────────────
  mistake_training: {
    type: "mistake_training",
    label: "错题训练报告",
    icon: "🎯",
    description: "把薄弱点转成错题分析报告和专项训练计划",
    systemPromptIntro: "你是一位学习诊断专家。请基于以下错题信息生成错题训练报告。必须包含错因分析、知识盲区映射、同类题目和训练计划。",
    requiredSections: [
      { id: "analysis", title: "🔍 错因分析", importance: "critical", description: "错误类型分类+根因", minLength: 300 },
      { id: "blindspots", title: "🎯 知识盲区", importance: "critical", description: "薄弱知识点映射", minLength: 200 },
      { id: "similar", title: "📝 同类题训练", importance: "high", description: "3-5道类似题目+解答", minLength: 300 },
      { id: "strategies", title: "💡 解题策略", importance: "high", description: "通用解题框架/技巧", minLength: 150 },
      { id: "progress", title: "📊 进步追踪", importance: "medium", description: "训练建议+自测", minLength: 100 },
    ],
    qualityExpectations: "错因归类准确、同类题 3+、策略可复用",
    exportDefaults: ["markdown", "html", "docx"],
  },

  // ── 6. 英语口语训练 ──────────────────────────────────────────
  english_speaking: {
    type: "english_speaking",
    label: "英语口语训练",
    icon: "🗣️",
    description: "生成口语话题、模板回答、高频词汇和练习指南",
    systemPromptIntro: "你是一位英语口语教练（雅思口语考官风格）。请基于以下话题生成口语训练材料。必须包含话题分析、模板回答、高分词汇/短语和练习建议。使用英文为主，中文标注为辅。",
    requiredSections: [
      { id: "topic", title: "🎯 话题分析", importance: "critical", description: "话题拆解、答题角度", minLength: 200 },
      { id: "model", title: "📝 模板回答", importance: "critical", description: "2-3个完整回答模板", minLength: 400 },
      { id: "vocab", title: "📖 高分词汇/短语", importance: "high", description: "10+词汇+例句", minLength: 200 },
      { id: "structures", title: "🏗️ 句型结构", importance: "high", description: "常用句型+替换", minLength: 150 },
      { id: "practice", title: "🎙️ 练习指南", importance: "high", description: "自录音+自评标准", minLength: 100 },
    ],
    qualityExpectations: "模板回答自然流畅、词汇准确、练习可操作",
    exportDefaults: ["markdown", "html"],
  },

  // ── 7. 演讲准备 ──────────────────────────────────────────────
  presentation: {
    type: "presentation",
    label: "演讲准备",
    icon: "🎤",
    description: "生成演讲大纲、关键论点、视觉建议和 Q&A 预判",
    systemPromptIntro: "你是一位演讲教练。请基于以下主题生成演讲准备材料。必须包含演讲结构、关键论点、视觉辅助建议和预期问答。",
    requiredSections: [
      { id: "outline", title: "📋 演讲大纲", importance: "critical", description: "开场-主体-结尾完整结构", minLength: 300 },
      { id: "arguments", title: "💪 关键论点", importance: "critical", description: "3-5个核心论点+支撑", minLength: 300 },
      { id: "visuals", title: "🎨 视觉建议", importance: "high", description: "幻灯片/图表/故事建议", minLength: 150 },
      { id: "rehearsal", title: "🎙️ 彩排清单", importance: "high", description: "计时/停顿/语调/肢体", minLength: 100 },
      { id: "qa", title: "❓ 预期问答", importance: "medium", description: "5个可能提问+回答要点", minLength: 150 },
    ],
    qualityExpectations: "结构逻辑清晰、论点有说服力、Q&A 覆盖全面",
    exportDefaults: ["markdown", "html"],
  },

  // ── 8. 概念解释 ──────────────────────────────────────────────
  concept_explain: {
    type: "concept_explain",
    label: "概念解释",
    icon: "💡",
    description: "深度解释一个概念，含定义、直觉理解、例子、易混淆点和应用",
    systemPromptIntro: "你是一位善于把复杂概念讲明白的老师。请深度解释以下概念。必须包含直觉理解、多个角度的例子、常见混淆概念辨析和实际应用。",
    requiredSections: [
      { id: "definition", title: "📖 核心定义", importance: "critical", description: "一句话定义+详细解释", minLength: 150 },
      { id: "intuition", title: "💡 直觉理解", importance: "critical", description: "用类比/故事帮助理解", minLength: 200 },
      { id: "examples", title: "📝 多角度例子", importance: "critical", description: "3+个不同场景的例子", minLength: 300 },
      { id: "confusions", title: "⚠️ 常见混淆", importance: "high", description: "与相似概念的区别", minLength: 150 },
      { id: "applications", title: "🔧 实际应用", importance: "high", description: "在哪些场景中使用", minLength: 150 },
    ],
    qualityExpectations: "直觉理解到位、例子丰富、混淆点清晰",
    exportDefaults: ["markdown", "html"],
  },

  // ── 9. 知识森林 ──────────────────────────────────────────────
  knowledge_forest: {
    type: "knowledge_forest",
    label: "知识森林",
    icon: "🌳",
    description: "把分散知识点连接成知识树/森林，含学习路径建议",
    systemPromptIntro: "你是一位知识架构师。请将以下知识点组织成知识森林。必须包含主题树、概念依赖关系、学习路径和深度探索建议。",
    requiredSections: [
      { id: "tree", title: "🌳 知识树", importance: "critical", description: "主题-子主题层级结构", minLength: 300 },
      { id: "dependencies", title: "🔗 依赖关系", importance: "high", description: "概念间前置/后置关系", minLength: 200 },
      { id: "paths", title: "🗺️ 学习路径", importance: "high", description: "推荐学习顺序+时间", minLength: 200 },
      { id: "deepdive", title: "🏊 深度探索", importance: "medium", description: "进阶方向+资源", minLength: 150 },
    ],
    qualityExpectations: "层级清晰、依赖准确、路径可跟随",
    exportDefaults: ["markdown", "html"],
  },

  // ── 10. 通用学习任务 ─────────────────────────────────────────
  general: {
    type: "general",
    label: "通用学习任务",
    icon: "📋",
    description: "通用 AI 学习助手，适配各种学习需求",
    systemPromptIntro: "你是一位全能学习导师。请基于以下需求生成结构化学习内容。必须包含清晰的章节、可执行建议和实践练习。",
    requiredSections: [
      { id: "overview", title: "📋 任务概览", importance: "critical", description: "目标、范围、预期成果", minLength: 150 },
      { id: "body", title: "📖 核心内容", importance: "critical", description: "主体学习内容", minLength: 400 },
      { id: "practice", title: "✏️ 练习/应用", importance: "high", description: "实践任务或自测", minLength: 150 },
      { id: "next", title: "📅 下一步", importance: "medium", description: "后续学习建议", minLength: 100 },
    ],
    qualityExpectations: "有清晰章节、可执行练习、有下一步",
    exportDefaults: ["markdown", "html"],
  },
};

/** Infer task type from user prompt */
export function inferTaskType(prompt: string): ArtifactType {
  const lower = prompt.toLowerCase();
  if (/期末|考试|复习|冲刺|exam|test|备考/.test(lower)) return "exam_review";
  if (/学习包|study.?pack|资料包/.test(lower)) return "study_pack";
  if (/论文|paper|文献|阅读卡|精读|pdf/.test(lower)) return "document_reading";
  if (/笔记|整理|organize|归纳/.test(lower)) return "notes_organize";
  if (/错题|错误|mistake|薄弱|训练/.test(lower)) return "mistake_training";
  if (/口语|英语|ielts|speaking|english|toefl/.test(lower)) return "english_speaking";
  if (/演讲|presentation|present|展示|汇报/.test(lower)) return "presentation";
  if (/概念|什么是|解释|定义|explain/.test(lower)) return "concept_explain";
  if (/知识森林|知识树|知识网络|knowledge.?forest|思维导图/.test(lower)) return "knowledge_forest";
  return "general";
}
