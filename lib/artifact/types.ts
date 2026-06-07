/**
 * MangoOS V14.2 — Unified Artifact Type System
 *
 * All learning outputs (Agent, Study Pack, Notes, Planner, Mind Garden, Voice)
 * converge into a single Artifact type. One store, one viewer, one export pipeline.
 */
import type { PlanTier } from "@/lib/plan/types";

// ── Artifact identity ────────────────────────────────────────
export type ArtifactType =
  | "exam_review"      // 期末复习讲义
  | "study_pack"       // 学习包
  | "document_reading" // 文档/论文阅读卡
  | "notes_organize"   // 笔记整理
  | "mistake_training" // 错题训练报告
  | "english_speaking" // 英语口语训练
  | "presentation"     // 演讲准备
  | "concept_explain"  // 概念解释
  | "knowledge_forest" // 知识森林
  | "general";         // 通用学习任务

export const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  exam_review: "期末复习讲义",
  study_pack: "学习包",
  document_reading: "文档阅读卡",
  notes_organize: "笔记整理",
  mistake_training: "错题训练报告",
  english_speaking: "英语口语训练",
  presentation: "演讲准备",
  concept_explain: "概念解释",
  knowledge_forest: "知识森林",
  general: "学习任务",
};

export type ArtifactStatus = "draft" | "generating" | "complete" | "reviewed" | "archived";

export type ExportFormat = "markdown" | "html" | "docx" | "pdf";

export type StorageMode = "local" | "cloud";

// ── Artifact section ──────────────────────────────────────────
export interface ArtifactSection {
  id: string;
  title: string;
  content: string;       // markdown
  order: number;
  importance: "critical" | "high" | "medium" | "reference";
}

// ── Source reference ──────────────────────────────────────────
export interface ArtifactSource {
  id: string;
  title: string;
  url?: string;
  platform: string;      // "wikipedia" | "duckduckgo" | "openlibrary" | "dictionary" | "user-upload" | "ai-generated"
  relevance: number;     // 0-1
  reliability: "high" | "medium" | "low" | "unverified";
  excerpt?: string;
}

// ── Quality score breakdown ───────────────────────────────────
export interface QualityScore {
  total: number;             // 0-100
  completeness: number;      // 内容覆盖度
  structure: number;         // 结构清晰度
  actionability: number;     // 可执行性（有行动/练习/下一步）
  exampleDensity: number;    // 例题/案例密度
  personalization: number;   // 个性化程度
  sourceCredibility: number; // 来源可信度
  languageQuality: number;   // 语言质量
  exportReadiness: number;   // 导出可用性
}

// ── Generation trace ──────────────────────────────────────────
export interface GenerationTrace {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  model: string;
  intent: string;
  template: string;
  retries: number;
  fallbackUsed: boolean;
}

// ── Unified Artifact ──────────────────────────────────────────
export interface Artifact {
  // Identity
  id: string;
  type: ArtifactType;
  status: ArtifactStatus;

  // Content
  title: string;
  summary: string;                  // 1-2 sentence summary
  content: string;                  // full markdown body
  sections: ArtifactSection[];

  // Metadata
  tags: string[];
  subject?: string;
  course?: string;
  school?: string;

  // Quality
  qualityScore: number;             // 0-100 aggregate
  qualityBreakdown?: QualityScore;

  // Sources
  sources: ArtifactSource[];

  // Generation
  originTask: string;               // original user prompt / task description
  generationTrace?: GenerationTrace;
  identityContext?: string;         // learning identity used

  // Export
  exportFormats: ExportFormat[];
  lastExportedAt?: string;
  lastExportedFormat?: ExportFormat;

  // Storage
  storageMode: StorageMode;
  owner: string;                    // user id or "guest"

  // Plan gate
  planTier: PlanTier;

  // Timestamps
  createdAt: string;                // ISO 8601
  updatedAt: string;

  // Relations
  derivedFrom?: string;             // parent artifact id
  derivedTasks?: string[];          // derived planner task ids
  derivedFlashcards?: string[];     // derived flashcard ids
}

// ── Artifact creation input ───────────────────────────────────
export interface ArtifactInput {
  type: ArtifactType;
  prompt: string;              // user's raw input
  subject?: string;
  course?: string;
  school?: string;
  files?: { name: string; content: string }[];
  identityContext?: string;
  planTier: PlanTier;
  storageMode: StorageMode;
  owner: string;
}

// ── Filter / search params ────────────────────────────────────
export interface ArtifactFilter {
  types?: ArtifactType[];
  statuses?: ArtifactStatus[];
  tags?: string[];
  subject?: string;
  search?: string;
  sortBy?: "updatedAt" | "createdAt" | "qualityScore" | "title";
  sortDir?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// ── Factory ───────────────────────────────────────────────────
export function createArtifactId(): string {
  return `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
