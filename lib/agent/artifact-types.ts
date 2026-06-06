// ═══════════════════════════════════════════════════════════════
// AgentArtifact — Structured output for every Agent task
// No task is complete without a valid artifact.
// ═══════════════════════════════════════════════════════════════

import type { AgentToolName, TimelineEvent } from "./types";

export type TaskType =
  | "exam_review"
  | "study_pack"
  | "document_reading"
  | "notes_organize"
  | "mistake_training"
  | "english_speaking"
  | "presentation"
  | "concept_explanation"
  | "knowledge_forest"
  | "general";

export interface ArtifactSource {
  title: string;
  url?: string;
  snippet?: string;
  source: string;
}

export interface ArtifactToolTrace {
  tool: AgentToolName;
  status: "done" | "error" | "skipped";
  message: string;
  contributedContent: boolean;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-100
  checks: {
    hasContent: boolean;
    hasStructure: boolean;
    hasExamples: boolean;
    hasActions: boolean;
    sectionsPresent: string[];
    sectionsMissing: string[];
  };
}

export interface AgentArtifact {
  id: string;
  taskType: TaskType;
  status: "completed" | "partial" | "failed";
  // Input
  input: string;
  files?: string[];
  // Plan
  plan: string[]; // tool names used
  toolsUsed: AgentToolName[];
  toolTraces: ArtifactToolTrace[];
  // Sources
  sources: ArtifactSource[];
  // Artifact content
  artifactTitle: string;
  artifactSummary: string;
  artifactMarkdown: string; // THE key output — rendered to user
  artifactSections: Record<string, string>; // key section name → markdown
  // Quality
  qualityScore: number;
  qualityCheck: QualityCheckResult;
  // Meta
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  // Actions
  exportable: boolean;
  saveable: boolean;
  editable: boolean;
}

export function createEmptyArtifact(id: string, taskType: TaskType, input: string): AgentArtifact {
  return {
    id,
    taskType,
    status: "failed",
    input,
    plan: [],
    toolsUsed: [],
    toolTraces: [],
    sources: [],
    artifactTitle: "",
    artifactSummary: "",
    artifactMarkdown: "",
    artifactSections: {},
    qualityScore: 0,
    qualityCheck: { passed: false, score: 0, checks: { hasContent: false, hasStructure: false, hasExamples: false, hasActions: false, sectionsPresent: [], sectionsMissing: [] } },
    timeline: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exportable: false,
    saveable: false,
    editable: false,
  };
}

export function checkArtifactQuality(artifact: AgentArtifact): QualityCheckResult {
  const sectionsPresent: string[] = [];
  const sectionsMissing: string[] = [];

  const requiredSections: Record<TaskType, string[]> = {
    exam_review: ["核心考点", "知识图谱", "高频考点", "公式速查", "典型例题", "常见陷阱", "模拟题", "复习计划"],
    study_pack: ["课程概览", "核心概念", "例题", "记忆清单", "复习计划"],
    document_reading: ["摘要", "核心论点", "关键术语", "评价", "行动笔记"],
    notes_organize: ["结构化笔记", "关键概念", "复习问题"],
    mistake_training: ["错题分析", "错误分类", "正确解法", "同类练习"],
    english_speaking: ["场景", "表达库", "对话范例", "练习建议"],
    presentation: ["大纲", "每页要点", "讲稿关键段", "QA准备"],
    concept_explanation: ["定义", "直觉理解", "推导", "例子", "易错点", "练习"],
    knowledge_forest: ["主题", "知识点", "关系"],
    general: ["内容", "要点"],
  };

  const required = requiredSections[artifact.taskType] ?? requiredSections.general;
  for (const s of required) {
    if (artifact.artifactMarkdown.includes(s) || artifact.artifactSections[s]) {
      sectionsPresent.push(s);
    } else {
      sectionsMissing.push(s);
    }
  }

  const hasContent = artifact.artifactMarkdown.length > 200;
  const hasStructure = sectionsPresent.length >= Math.min(3, required.length);
  const hasExamples = /例[子题如]|例如|比如|例题|example|Example/.test(artifact.artifactMarkdown);
  const hasActions = /下一步|行动计划|练习|复习|建议|总结/.test(artifact.artifactMarkdown);
  const score = Math.round(
    (hasContent ? 30 : 0) + (hasStructure ? 25 : 0) + (hasExamples ? 20 : 0) + (hasActions ? 15 : 0) + (sectionsPresent.length / Math.max(1, required.length) * 10)
  );
  const passed = hasContent && hasStructure && score >= 60;

  return { passed, score, checks: { hasContent, hasStructure, hasExamples, hasActions, sectionsPresent, sectionsMissing } };
}
