import { createClient } from "@/lib/supabase/client";
import {
  fromTaskRow,
  toTaskRow,
  fromNoteRow,
  toNoteRow,
  fromFlashcardRow,
  toFlashcardRow,
  fromReflectionRow,
  toReflectionRow,
  fromExamQuestionRow,
  fromExamResultRow,

  fromQuizAttemptRow,
  toQuizAttemptRow,
  type TaskRow,
  type NoteRow,
  type FlashcardRow,
  type ReflectionRow,
  type ProfileRow,
  type QuizAttemptRow,
  type ExamQuestionRow,
} from "@/lib/supabase/mappers";
import {
  seedTasks,
  seedNotes,
  seedFlashcards,
  seedReflections,
  seedQuizAttempts,
} from "@/lib/mock-data";
import type {
  Flashcard,
  Note,
  QuizAttempt,
  Reflection,
  Task,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Typed CRUD query layer (browser client).
// Each function maps rows → domain types so callers never touch
// snake_case or the raw Supabase response shape. RLS on the DB side
// scopes every query to auth.uid(), so no explicit user_id filter
// is needed on reads — the policy enforces it.
//
// This layer is the seam the store swaps onto once Supabase is live:
// lib/store.tsx currently reads/writes localStorage; pointing its
// actions at these functions makes data cloud-backed with no UI change.
// ─────────────────────────────────────────────────────────────

// ---- Tasks ---------------------------------------------------
export async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("due_at", { ascending: true });
  if (error) throw error;
  return (data as TaskRow[]).map(fromTaskRow);
}

export async function upsertTask(userId: string, task: Partial<Task>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .upsert({ ...toTaskRow(task), user_id: userId });
  if (error) throw error;
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  if (error) throw error;
}

// ---- Notes ---------------------------------------------------
export async function fetchNotes(): Promise<Note[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_notes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as NoteRow[]).map(fromNoteRow);
}

export async function insertNote(
  userId: string,
  note: Omit<Note, "id" | "updatedLabel">
): Promise<Note> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_notes")
    .insert({ ...toNoteRow(note), user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return fromNoteRow(data as NoteRow);
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("knowledge_notes").delete().eq("id", id);
  if (error) throw error;
}

// ---- Flashcards (SM-2) ---------------------------------------
export async function fetchFlashcards(): Promise<Flashcard[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .order("due_on", { ascending: true });
  if (error) throw error;
  return (data as FlashcardRow[]).map(fromFlashcardRow);
}

// Persist the SM-2 result of a review. Pass only the scheduling fields.
export async function updateFlashcardSchedule(
  id: string,
  sm2: Pick<Flashcard, "ease" | "intervalDays" | "repetitions" | "dueOn">
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("flashcards")
    .update(toFlashcardRow(sm2))
    .eq("id", id);
  if (error) throw error;
}

// ---- Reflections ---------------------------------------------
export async function fetchReflections(): Promise<Reflection[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReflectionRow[]).map(fromReflectionRow);
}

export async function insertReflection(
  userId: string,
  r: Omit<Reflection, "id" | "dateLabel">
): Promise<Reflection> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reflections")
    .insert({ ...toReflectionRow(r), user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return fromReflectionRow(data as ReflectionRow);
}

// ---- Quiz attempts -------------------------------------------
export async function fetchQuizAttempts(): Promise<QuizAttempt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as QuizAttemptRow[]).map(fromQuizAttemptRow);
}

export async function insertQuizAttempt(
  userId: string,
  a: Omit<QuizAttempt, "id" | "createdAt">
): Promise<QuizAttempt> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({ ...toQuizAttemptRow(a), user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return fromQuizAttemptRow(data as QuizAttemptRow);
}

// ---- Profile -------------------------------------------------
export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

// Atomic-ish XP bump. Reads current XP then writes the new total; the
// handle_new_user trigger guarantees the row exists, and RLS scopes it to
// this user. Recomputes `level` from the new total so the two never drift.
export async function addProfileXp(userId: string, delta: number): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const nextXp = Math.max(0, (data?.total_xp ?? 0) + delta);
  const level = Math.floor(nextXp / 500) + 1;
  const { error: upErr } = await supabase
    .from("profiles")
    .update({ total_xp: nextXp, level })
    .eq("id", userId);
  if (upErr) throw upErr;
}

// ─────────────────────────────────────────────────────────────
// First-run seeding. A freshly-signed-up account has an empty DB
// (the handle_new_user trigger only creates the profile row). To make
// the product feel alive on first login — and to mirror the guest demo
// experience — we bulk-insert the same seed content the mock layer uses.
// Idempotent by design: the store only calls this when all tables read
// empty, so re-runs can't duplicate.
// ─────────────────────────────────────────────────────────────
export async function seedNewUser(userId: string): Promise<void> {
  const supabase = createClient();

  const taskRows = seedTasks.map((t) => ({
    ...toTaskRow(t),
    id: undefined, // let the DB mint UUIDs; seed ids like "t1" aren't UUIDs
    user_id: userId,
  }));
  const noteRows = seedNotes.map((n) => ({
    ...toNoteRow(n),
    id: undefined,
    user_id: userId,
  }));
  const cardRows = seedFlashcards.map((c) => ({
    ...toFlashcardRow(c),
    id: undefined,
    user_id: userId,
  }));
  const reflRows = seedReflections.map((r) => ({
    ...toReflectionRow(r),
    id: undefined,
    user_id: userId,
  }));
  const quizRows = seedQuizAttempts.map((a) => ({
    ...toQuizAttemptRow(a),
    id: undefined,
    user_id: userId,
  }));

  const results = await Promise.all([
    supabase.from("tasks").insert(taskRows),
    supabase.from("knowledge_notes").insert(noteRows),
    supabase.from("flashcards").insert(cardRows),
    supabase.from("reflections").insert(reflRows),
    supabase.from("quiz_attempts").insert(quizRows),
  ]);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) throw firstErr;
}

/** Migrate guest localStorage data to the cloud on first login. */
export async function migrateGuestToCloud(
  userId: string,
  guest: { tasks: Task[]; notes: Note[]; reflections: Reflection[]; flashcards: Flashcard[]; quizAttempts: QuizAttempt[] }
): Promise<void> {
  const supabase = createClient();
  const { tasks, notes, reflections, flashcards, quizAttempts } = guest;

  const taskRows = tasks.map((t) => ({ ...toTaskRow(t), id: undefined, user_id: userId }));
  const noteRows = notes.map((n) => ({ ...toNoteRow(n), id: undefined, user_id: userId }));
  const reflRows = reflections.map((r) => ({ ...toReflectionRow(r), id: undefined, user_id: userId }));
  const cardRows = flashcards.map((c) => ({ ...toFlashcardRow(c), id: undefined, user_id: userId }));
  const quizRows = quizAttempts.map((a) => ({ ...toQuizAttemptRow(a), id: undefined, user_id: userId }));

  const results = await Promise.all([
    supabase.from("tasks").insert(taskRows.length > 0 ? taskRows : []),
    supabase.from("knowledge_notes").insert(noteRows.length > 0 ? noteRows : []),
    supabase.from("reflections").insert(reflRows.length > 0 ? reflRows : []),
    supabase.from("flashcards").insert(cardRows.length > 0 ? cardRows : []),
    supabase.from("quiz_attempts").insert(quizRows.length > 0 ? quizRows : []),
  ]);

  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) throw firstErr;
}

// ---- Exam Questions (user bank) --------------------------------
export async function fetchExamQuestions(): Promise<import("@/lib/types").ExamQuestion[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exam_questions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ExamQuestionRow[]).map(fromExamQuestionRow);
}
export async function insertExamQuestion(
  userId: string,
  q: Omit<import("@/lib/types").ExamQuestion, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<import("@/lib/types").ExamQuestion> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exam_questions")
    .insert({ user_id: userId, subject: q.subject, topic: q.topic, type: q.type, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation, difficulty: q.difficulty })
    .select("*").single();
  if (error) throw error;
  return fromExamQuestionRow(data as ExamQuestionRow);
}
export async function updateExamQuestion(
  id: string,
  q: Partial<import("@/lib/types").ExamQuestion>
): Promise<void> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (q.subject !== undefined) row.subject = q.subject;
  if (q.topic !== undefined) row.topic = q.topic;
  if (q.question !== undefined) row.question = q.question;
  if (q.options !== undefined) row.options = q.options;
  if (q.answer !== undefined) row.answer = q.answer;
  if (q.explanation !== undefined) row.explanation = q.explanation;
  if (q.difficulty !== undefined) row.difficulty = q.difficulty;
  const { error } = await supabase.from("exam_questions").update(row).eq("id", id);
  if (error) throw error;
}
export async function deleteExamQuestion(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exam_questions").delete().eq("id", id);
  if (error) throw error;
}

// ---- Exam Results ----------------------------------------------
export async function fetchExamResults(): Promise<import("@/lib/types").ExamResult[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exam_results").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as import("@/lib/supabase/mappers").ExamResultRow[]).map(fromExamResultRow);
}
export async function insertExamResult(
  userId: string,
  r: Omit<import("@/lib/types").ExamResult, "id" | "userId" | "createdAt" | "percentage">
): Promise<import("@/lib/types").ExamResult> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exam_results")
    .insert({ user_id: userId, subject: r.subject, topic: r.topic, score: r.score, total: r.total, details: r.details })
    .select("*").single();
  if (error) throw error;
  return fromExamResultRow(data as import("@/lib/supabase/mappers").ExamResultRow);
}
