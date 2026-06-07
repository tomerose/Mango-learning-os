// ═══════════════════════════════════════════════════════════════
// Learning Memory — User-specific learning context
// Tracks courses, goals, weak points, preferences, rhythm
// ═══════════════════════════════════════════════════════════════

import type { LearningMemory, WeakPoint, LearningIdentity } from "@/lib/agent/types";

const MEMORY_KEY = "mango-learning-memory-v1";

export function loadMemory(): LearningMemory {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return defaultMemory();
    return { ...defaultMemory(), ...JSON.parse(raw) };
  } catch { return defaultMemory(); }
}

function defaultMemory(): LearningMemory {
  return {
    courses: [],
    goals: [],
    weakPoints: [],
    preferredStyle: "detailed",
    recentMistakes: [],
    completedPacks: [],
    studyRhythm: "irregular",
  };
}

export function saveMemory(memory: Partial<LearningMemory>): void {
  const current = loadMemory();
  const updated = { ...current, ...memory };
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(updated)); } catch { /* noop */ }
}

export function addCourse(course: string): void {
  const memory = loadMemory();
  if (!memory.courses.includes(course)) {
    memory.courses.push(course);
    saveMemory(memory);
  }
}

export function addGoal(goal: string): void {
  const memory = loadMemory();
  if (!memory.goals.includes(goal)) {
    memory.goals.push(goal);
    saveMemory(memory);
  }
}

export function addWeakPoint(point: Omit<WeakPoint, "lastReviewed">): void {
  const memory = loadMemory();
  const existing = memory.weakPoints.find(w => w.topic === point.topic && w.subject === point.subject);
  if (existing) {
    existing.mistakeCount++;
    existing.priority = existing.mistakeCount >= 3 ? "high" : existing.mistakeCount >= 2 ? "medium" : "low";
  } else {
    memory.weakPoints.push({
      ...point,
      lastReviewed: new Date().toISOString().slice(0, 10),
    });
  }
  saveMemory(memory);
}

export function trackCompletedPack(packId: string): void {
  const memory = loadMemory();
  if (!memory.completedPacks.includes(packId)) {
    memory.completedPacks.push(packId);
    saveMemory(memory);
  }
}

export function buildLearningIdentity(): LearningIdentity {
  const memory = loadMemory();

  // Inline mistake counting (avoid circular import)
  let mistakeTotal = 0, mistakeDue = 0;
  try {
    const raw = localStorage.getItem("mango-mistakes-v1");
    if (raw) {
      const mistakes = JSON.parse(raw);
      mistakeTotal = mistakes.length;
      const today = new Date().toISOString().slice(0, 10);
      mistakeDue = mistakes.filter((m: { nextReview: string; mastered: boolean }) =>
        m.nextReview <= today && !m.mastered).length;
    }
  } catch { /* noop */ }

  const mistakeStats = { total: mistakeTotal, mastered: 0, due: mistakeDue, bySubject: {} as Record<string, number> };

  let packs: unknown[] = [];
  try {
    const raw = localStorage.getItem("mango-study-packs-v2");
    if (raw) packs = JSON.parse(raw);
  } catch { /* noop */ }

  let notesCount = 0;
  try {
    const raw = localStorage.getItem("mango-notes");
    if (raw) notesCount = JSON.parse(raw).length;
  } catch { /* noop */ }

  let flashcardsCount = 0;
  try {
    const raw = localStorage.getItem("mango-flashcards");
    if (raw) flashcardsCount = JSON.parse(raw).length;
  } catch { /* noop */ }

  const identity: LearningIdentity = {
    tracks: memory.courses.map(c => ({
      course: c,
      subject: c,
      progress: 0, // Calculate from completed packs
      lastActivity: new Date().toISOString(),
    })),
    targetScores: {},
    strengths: memory.weakPoints.filter(w => w.priority === "low").map(w => w.topic),
    weakPoints: memory.weakPoints.filter(w => w.priority !== "low"),
    studyRhythm: memory.studyRhythm,
    preferredStyle: memory.preferredStyle,
    assetCounts: {
      studyPacks: Array.isArray(packs) ? packs.length : 0,
      notes: notesCount,
      flashcards: flashcardsCount,
      mistakes: mistakeStats.total,
      reviews: mistakeStats.total - mistakeStats.mastered,
    },
    recentRecommendations: generateRecommendations(memory, mistakeStats),
  };

  return identity;
}

function generateRecommendations(
  memory: LearningMemory,
  mistakeStats: { total: number; mastered: number; due: number; bySubject: Record<string, number> },
): string[] {
  const recs: string[] = [];

  if (mistakeStats.due > 0) {
    recs.push(`你有 ${mistakeStats.due} 道错题等待复习`);
  }

  const highPriority = memory.weakPoints.filter(w => w.priority === "high");
  if (highPriority.length > 0) {
    recs.push(`重点攻克：${highPriority.map(w => w.topic).slice(0, 3).join("、")}`);
  }

  if (memory.completedPacks.length === 0) {
    recs.push("生成你的第一个学习包，开启系统化复习");
  }

  if (recs.length === 0) {
    recs.push("今日学习状态良好，可以探索知识森林或创建新的学习包");
  }

  return recs;
}
