// ─────────────────────────────────────────────────────────────
// Domain types — shared across UI and (future) Supabase data layer.
// Keep these as the single source of truth; the DB schema mirrors them.
// ─────────────────────────────────────────────────────────────

export type SubjectId = string;

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  subject: SubjectId;
  done: boolean;
  priority: Priority;
  dueLabel: string; // e.g. "Today 14:00"
  estimatedMin: number;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  subject: SubjectId;
  current: number;
  target: number;
  unit: string; // e.g. "hrs", "cards", "problems"
}

export interface SubjectProgress {
  subject: SubjectId;
  masteryPct: number; // 0-100
  weeklyMinutes: number;
}

export interface ActivityEvent {
  id: string;
  kind: "study" | "quiz" | "note" | "achievement" | "reflection";
  label: string;
  subject?: SubjectId;
  timeLabel: string; // e.g. "2h ago"
}

export interface DashboardStats {
  streakDays: number;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  xpForCurrentLevel: number;
  minutesToday: number;
  minutesGoal: number;
  tasksDoneToday: number;
  tasksTotalToday: number;
}

export interface Note {
  id: string;
  title: string;
  subject: SubjectId;
  body: string;
  tags: string[];
  template?: string; // note template: cornell|concept|lecture|exam|reading|mistake
  updatedLabel: string;
}

export interface Reflection {
  id: string;
  dateLabel: string;
  mood: string;
  body: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

// ─── Quiz attempts + weakness analysis ───────────────────────
// A graded quiz run. Mirrors the quiz_attempts table (subject /
// topic / total / correct / created_at). `id` is client- or DB-minted.
export interface QuizAttempt {
  id: string;
  subject: SubjectId;
  topic: string;
  total: number;
  correct: number;
  createdAt: string; // ISO timestamp
}

// Aggregated weak spot, derived from quiz attempts by subject+topic.
// accuracy is a 0-100 percentage; attempts is how many runs fed it.
export interface WeakArea {
  subject: SubjectId;
  topic: string;
  accuracy: number;
  attempts: number;
}

// ─── Flashcards (SM-2 spaced repetition) ─────────────────────
// Four-button grading maps to SuperMemo quality scores; field
// names mirror the DB schema (ease / interval_days / repetitions
// / due_on) so the Supabase swap is a straight column mapping.
export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface Flashcard {
  id: string;
  deck: string;
  subject: SubjectId;
  front: string;
  back: string;
  ease: number; // SM-2 easiness factor, starts 2.5, floor 1.3
  intervalDays: number; // days until the next review
  repetitions: number; // consecutive successful reviews
  dueOn: string; // YYYY-MM-DD — review when dueOn <= today
}

// ─── Exam Mode — question bank + results ─────────────────────

export type QuestionType = "mcq" | "fill_blank" | "problem";

export interface ExamQuestion {
  id: string;
  userId?: string;
  subject: string;
  topic: string;
  type: QuestionType;
  question: string;           // stem / prompt
  options: string[];           // for MCQ: 4 choices; fill_blank: accepted answers; problem: []
  answer: string;              // correct answer (MCQ: option text; fill_blank: exact; problem: key points)
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  updatedAt: string;
}

export interface ExamResult {
  id: string;
  userId?: string;
  subject: string;
  topic: string;
  score: number;               // points earned
  total: number;               // max points
  percentage: number;          // 0-100
  details: ExamResultDetail[];
  createdAt: string;
}

export interface ExamResultDetail {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
  maxPoints: number;
}
