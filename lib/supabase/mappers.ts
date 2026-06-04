import type {
  DashboardStats,
  Flashcard,
  Note,
  QuizAttempt,
  Reflection,
  SubjectId,
  Task,
} from "@/lib/types";

// XP needed to clear each level (linear). Level N spans
// [(N-1)*STEP, N*STEP) total XP.
export const XP_PER_LEVEL = 500;

// ─────────────────────────────────────────────────────────────
// Row mappers: DB (snake_case) ↔ domain (camelCase).
// One place to keep the column↔field translation, so query
// functions stay clean and the UI never sees snake_case.
// Each `from*` is tolerant of partial rows (Supabase select shapes).
// ─────────────────────────────────────────────────────────────

// ---- Task ----------------------------------------------------
export interface TaskRow {
  id: string;
  title: string;
  subject: SubjectId;
  done: boolean;
  priority: Task["priority"];
  due_at: string | null;
  estimated_min: number;
}

export function fromTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    done: row.done,
    priority: row.priority,
    dueLabel: row.due_at ?? "",
    estimatedMin: row.estimated_min,
  };
}

export function toTaskRow(task: Partial<Task>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {};
  if (task.id !== undefined) row.id = task.id;
  if (task.title !== undefined) row.title = task.title;
  if (task.subject !== undefined) row.subject = task.subject;
  if (task.done !== undefined) row.done = task.done;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.estimatedMin !== undefined) row.estimated_min = task.estimatedMin;
  return row;
}

// ---- Note ----------------------------------------------------
export interface NoteRow {
  id: string;
  title: string;
  subject: SubjectId;
  body: string;
  tags: string[];
  updated_at: string | null;
}

export function fromNoteRow(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    body: row.body,
    tags: row.tags ?? [],
    updatedLabel: row.updated_at ?? "",
  };
}

export function toNoteRow(note: Partial<Note>): Partial<NoteRow> {
  const row: Partial<NoteRow> = {};
  if (note.id !== undefined) row.id = note.id;
  if (note.title !== undefined) row.title = note.title;
  if (note.subject !== undefined) row.subject = note.subject;
  if (note.body !== undefined) row.body = note.body;
  if (note.tags !== undefined) row.tags = note.tags;
  return row;
}

// ---- Flashcard (SM-2 fields) ---------------------------------
export interface FlashcardRow {
  id: string;
  deck: string;
  subject: SubjectId;
  front: string;
  back: string;
  ease: number;
  interval_days: number;
  repetitions: number;
  due_on: string;
}

export function fromFlashcardRow(row: FlashcardRow): Flashcard {
  return {
    id: row.id,
    deck: row.deck,
    subject: row.subject,
    front: row.front,
    back: row.back,
    ease: row.ease,
    intervalDays: row.interval_days,
    repetitions: row.repetitions,
    dueOn: row.due_on,
  };
}

export function toFlashcardRow(card: Partial<Flashcard>): Partial<FlashcardRow> {
  const row: Partial<FlashcardRow> = {};
  if (card.id !== undefined) row.id = card.id;
  if (card.deck !== undefined) row.deck = card.deck;
  if (card.subject !== undefined) row.subject = card.subject;
  if (card.front !== undefined) row.front = card.front;
  if (card.back !== undefined) row.back = card.back;
  if (card.ease !== undefined) row.ease = card.ease;
  if (card.intervalDays !== undefined) row.interval_days = card.intervalDays;
  if (card.repetitions !== undefined) row.repetitions = card.repetitions;
  if (card.dueOn !== undefined) row.due_on = card.dueOn;
  return row;
}

// ---- Reflection ----------------------------------------------
export interface ReflectionRow {
  id: string;
  mood: string | null;
  body: string;
  created_at: string | null;
}

export function fromReflectionRow(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    mood: row.mood ?? "",
    body: row.body,
    dateLabel: row.created_at ? row.created_at.slice(0, 10) : "",
  };
}

export function toReflectionRow(
  r: Partial<Reflection>
): Partial<ReflectionRow> {
  const row: Partial<ReflectionRow> = {};
  if (r.id !== undefined) row.id = r.id;
  if (r.mood !== undefined) row.mood = r.mood;
  if (r.body !== undefined) row.body = r.body;
  return row;
}

// ---- Profile → DashboardStats --------------------------------
export interface ProfileRow {
  id: string;
  display_name: string;
  university: string | null;
  major: string | null;
  level: number;
  total_xp: number;
  streak_days: number;
  last_active: string | null;
}

// Derive level + level boundaries from raw XP so stats stay consistent
// regardless of what `level` the row stores. tasksDone/Total and the
// minutes fields are computed in the store from live data, so this only
// fills the XP/level/streak portion.
export function profileToStats(
  row: ProfileRow,
  tasksDoneToday: number,
  tasksTotalToday: number
): DashboardStats {
  const level = Math.floor(row.total_xp / XP_PER_LEVEL) + 1;
  return {
    streakDays: row.streak_days,
    totalXp: row.total_xp,
    level,
    xpForCurrentLevel: (level - 1) * XP_PER_LEVEL,
    xpToNextLevel: level * XP_PER_LEVEL,
    minutesToday: 0,
    minutesGoal: 180,
    tasksDoneToday,
    tasksTotalToday,
  };
}

// ---- QuizAttempt ---------------------------------------------
export interface QuizAttemptRow {
  id: string;
  subject: SubjectId;
  topic: string | null;
  total: number;
  correct: number;
  created_at: string | null;
}

export function fromQuizAttemptRow(row: QuizAttemptRow): QuizAttempt {
  return {
    id: row.id,
    subject: row.subject,
    topic: row.topic ?? "",
    total: row.total,
    correct: row.correct,
    createdAt: row.created_at ?? "",
  };
}

export function toQuizAttemptRow(a: Partial<QuizAttempt>): Partial<QuizAttemptRow> {
  const row: Partial<QuizAttemptRow> = {};
  if (a.id !== undefined) row.id = a.id;
  if (a.subject !== undefined) row.subject = a.subject;
  if (a.topic !== undefined) row.topic = a.topic;
  if (a.total !== undefined) row.total = a.total;
  if (a.correct !== undefined) row.correct = a.correct;
  return row;
}

// ---- Exam Question --------------------------------------------
export interface ExamQuestionRow {
  id: string; user_id: string; subject: string; topic: string;
  type: string; question: string; options: unknown; answer: string;
  explanation: string; difficulty: string; created_at: string; updated_at: string;
}
export function fromExamQuestionRow(row: ExamQuestionRow) {
  return {
    id: row.id, userId: row.user_id, subject: row.subject, topic: row.topic,
    type: (row.type ?? "mcq") as import("@/lib/types").QuestionType,
    question: row.question,
    options: Array.isArray(row.options) ? row.options as string[] : [],
    answer: row.answer ?? "", explanation: row.explanation ?? "",
    difficulty: (row.difficulty ?? "medium") as "easy"|"medium"|"hard",
    createdAt: row.created_at ?? "", updatedAt: row.updated_at ?? "",
  };
}

// ---- Exam Result ----------------------------------------------
export interface ExamResultRow {
  id: string; user_id: string; subject: string; topic: string;
  score: number; total: number; details: unknown; created_at: string;
}
export function fromExamResultRow(row: ExamResultRow) {
  return {
    id: row.id, userId: row.user_id, subject: row.subject, topic: row.topic,
    score: row.score ?? 0, total: row.total ?? 0,
    percentage: row.total > 0 ? Math.round((row.score / row.total) * 100) : 0,
    details: Array.isArray(row.details) ? row.details as import("@/lib/types").ExamResultDetail[] : [],
    createdAt: row.created_at ?? "",
  };
}
