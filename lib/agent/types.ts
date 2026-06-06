// ═══════════════════════════════════════════════════════════════
// Mango Agent — Personal Learning Engine Types
// AgentTask, ToolRegistry, TaskTemplate, TimelineEvent
// ═══════════════════════════════════════════════════════════════

export type AgentTaskStatus = "draft" | "queued" | "running" | "completed" | "failed" | "paused";

export type AgentToolName =
  | "file_parser"
  | "ocr_extract"
  | "web_research"
  | "source_ranking"
  | "study_pack_generator"
  | "quiz_generator"
  | "flashcard_generator"
  | "notes_writer"
  | "export_tool"
  | "review_planner"
  | "mistake_analyzer"
  | "concept_explainer"
  | "summary_generator";

export interface AgentTaskInput {
  type: "text" | "file" | "image" | "url" | "voice";
  value: string;
  label?: string;
  mimeType?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "tool_start" | "tool_end" | "thinking" | "output" | "error" | "user_input";
  toolName?: AgentToolName;
  message: string;
  detail?: string;
  status: "pending" | "running" | "done" | "error";
}

export interface AgentTaskOutput {
  id: string;
  type: "study_pack" | "notes" | "flashcards" | "mistake" | "quiz" | "summary" | "plan" | "export";
  title: string;
  content: Record<string, unknown>;
  linkedIds: string[]; // IDs of created/updated assets
  editable: boolean;
  saved: boolean;
}

export interface AgentTask {
  id: string;
  userId?: string;
  title: string;
  intent: string;          // Natural language description of what user wants
  status: AgentTaskStatus;
  templateId?: string;     // If created from a template
  inputs: AgentTaskInput[];
  timeline: TimelineEvent[];
  toolsUsed: AgentToolName[];
  outputs: AgentTaskOutput[];
  sources: string[];
  qualityScore: number;
  relatedStudyPackId?: string;
  relatedNoteId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;            // emoji
  intent: string;          // Pre-filled intent
  suggestedTools: AgentToolName[];
  suggestedInputs: { type: AgentTaskInput["type"]; label: string; required: boolean }[];
  category: "exam" | "study" | "review" | "create" | "analyze";
}

export interface ToolDefinition {
  name: AgentToolName;
  label: string;
  description: string;
  requiresAuth: boolean;
  requiresFiles: boolean;
  costLevel: "free" | "low" | "medium" | "high";
  execute: (inputs: AgentTaskInput[], context: AgentContext) => Promise<TimelineEvent[]>;
}

export interface AgentContext {
  taskId: string;
  userId?: string;
  plan: "guest" | "standard" | "pro" | "admin";
  memory: LearningMemory;
  onProgress: (event: TimelineEvent) => void;
}

// ── Learning Memory ─────────────────────────────────────────────

export interface LearningMemory {
  courses: string[];
  goals: string[];
  weakPoints: WeakPoint[];
  preferredStyle: "concise" | "detailed" | "example-heavy" | "visual";
  recentMistakes: string[]; // Mistake IDs
  completedPacks: string[]; // Study Pack IDs
  studyRhythm: "morning" | "afternoon" | "evening" | "irregular";
}

export interface WeakPoint {
  topic: string;
  subject: string;
  mistakeCount: number;
  lastReviewed: string;
  priority: "high" | "medium" | "low";
}

// ── Mistake Bank ─────────────────────────────────────────────────

export interface MistakeEntry {
  id: string;
  userId?: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  knowledgePoint: string;
  subject: string;
  source: "quiz" | "agent" | "tutor" | "manual" | "image";
  reason: "concept" | "calculation" | "memory" | "careless" | "unknown";
  reviewCount: number;
  lastReviewed: string;
  nextReview: string;
  mastered: boolean;
  similarQuestions: string[];
  createdAt: string;
}

// ── Review Plan ──────────────────────────────────────────────────

export interface ReviewPlan {
  id: string;
  date: string;
  userId?: string;
  items: ReviewItem[];
  estimatedMinutes: number;
  completedCount: number;
}

export interface ReviewItem {
  id: string;
  type: "flashcard" | "mistake" | "study_pack_section" | "quiz" | "concept";
  title: string;
  reason: string;           // Why this is recommended
  linkedAssetId: string;    // Flashcard/Mistake/Pack ID
  linkedAssetType: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
}

// ── Learning Identity ────────────────────────────────────────────

export interface LearningTrack {
  course: string;
  subject: string;
  progress: number;
  lastActivity: string;
}

export interface LearningIdentity {
  tracks: LearningTrack[];
  targetScores: Record<string, number>;
  strengths: string[];
  weakPoints: WeakPoint[];
  studyRhythm: LearningMemory["studyRhythm"];
  preferredStyle: LearningMemory["preferredStyle"];
  assetCounts: {
    studyPacks: number;
    notes: number;
    flashcards: number;
    mistakes: number;
    reviews: number;
  };
  recentRecommendations: string[];
}
