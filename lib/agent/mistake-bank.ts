// ═══════════════════════════════════════════════════════════════
// Mistake Bank — Store, review, and learn from mistakes
// localStorage (guest) + Supabase (cloud) dual-mode
// ═══════════════════════════════════════════════════════════════

import type { MistakeEntry } from "@/lib/agent/types";

const STORAGE_KEY = "mango-mistakes-v1";
const MAX_MISTAKES = 200;

export function loadMistakes(): MistakeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMistakes(mistakes: MistakeEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes.slice(0, MAX_MISTAKES)));
  } catch { /* noop */ }
}

export function addMistake(entry: Omit<MistakeEntry, "id" | "reviewCount" | "lastReviewed" | "nextReview" | "mastered" | "similarQuestions" | "createdAt">): MistakeEntry {
  const now = new Date().toISOString();
  const mistake: MistakeEntry = {
    ...entry,
    id: `mist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    reviewCount: 0,
    lastReviewed: now.slice(0, 10),
    nextReview: now.slice(0, 10), // Review today
    mastered: false,
    similarQuestions: [],
    createdAt: now,
  };

  const mistakes = loadMistakes();
  mistakes.unshift(mistake);
  saveMistakes(mistakes);
  return mistake;
}

export function reviewMistake(id: string, correct: boolean): void {
  const mistakes = loadMistakes();
  const idx = mistakes.findIndex(m => m.id === id);
  if (idx < 0) return;

  const m = mistakes[idx];
  m.reviewCount++;
  m.lastReviewed = new Date().toISOString().slice(0, 10);

  if (correct) {
    // SM-2 style: increase interval
    const nextDays = Math.min(1 * Math.pow(2, m.reviewCount), 60);
    m.nextReview = new Date(Date.now() + nextDays * 86400_000).toISOString().slice(0, 10);
    if (m.reviewCount >= 3) m.mastered = true;
  } else {
    m.nextReview = new Date().toISOString().slice(0, 10); // Review again today
    m.mastered = false;
  }

  mistakes[idx] = m;
  saveMistakes(mistakes);
}

export function getMistakesDue(): MistakeEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  return loadMistakes().filter(m => m.nextReview <= today && !m.mastered);
}

export function getMistakesBySubject(subject: string): MistakeEntry[] {
  return loadMistakes().filter(m => m.subject === subject);
}

export function getMistakeStats(): { total: number; mastered: number; due: number; bySubject: Record<string, number> } {
  const all = loadMistakes();
  const due = getMistakesDue();
  const bySubject: Record<string, number> = {};
  for (const m of all) {
    bySubject[m.subject] = (bySubject[m.subject] ?? 0) + 1;
  }
  return {
    total: all.length,
    mastered: all.filter(m => m.mastered).length,
    due: due.length,
    bySubject,
  };
}

export function deleteMistake(id: string): void {
  saveMistakes(loadMistakes().filter(m => m.id !== id));
}
