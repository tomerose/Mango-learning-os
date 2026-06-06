// ═══════════════════════════════════════════════════════════════
// Study Pack Persistence Store
// Saves generated Exam Review packages to localStorage (guest)
// or Supabase (cloud mode). Survives page refresh.
// ═══════════════════════════════════════════════════════════════

import type { ResearchSource } from "@/lib/ai/research-orchestrator";

export interface StudyPackSession {
  id: string;
  courseName: string;
  school?: string;
  examScope?: string;
  createdAt: string;
  updatedAt: string;
  sources: ResearchSource[];
  outline: Record<string, unknown>;
  generatedHandout: Record<string, unknown>;
  qualityScore: number;
  status: "generating" | "complete" | "error";
  exportMetadata?: {
    lastExportFormat?: "docx" | "pdf" | "md";
    lastExportedAt?: string;
  };
}

const STORAGE_KEY = "mango-study-packs-v1";
const MAX_PACKS = 20;

/** Load all study packs from localStorage */
export function loadStudyPacks(): StudyPackSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudyPackSession[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_PACKS) : [];
  } catch {
    return [];
  }
}

/** Save a study pack to localStorage */
export function saveStudyPack(pack: StudyPackSession): void {
  try {
    const packs = loadStudyPacks();
    const idx = packs.findIndex((p) => p.id === pack.id);
    const updated = { ...pack, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      packs[idx] = updated;
    } else {
      packs.unshift(updated);
    }
    // Keep only MAX_PACKS
    const trimmed = packs.slice(0, MAX_PACKS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/** Delete a study pack */
export function deleteStudyPack(id: string): void {
  try {
    const packs = loadStudyPacks().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  } catch { /* silent */ }
}

/** Get most recent study pack */
export function getLatestStudyPack(): StudyPackSession | null {
  const packs = loadStudyPacks();
  return packs.length > 0 ? packs[0] : null;
}

/** Get recent study packs (last 3) for Hub display */
export function getRecentStudyPacks(count = 3): StudyPackSession[] {
  return loadStudyPacks().slice(0, count);
}

/** Generate a unique pack ID */
export function generatePackId(): string {
  return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Build a StudyPackSession from API response */
export function buildPackFromResponse(
  courseName: string,
  school: string | undefined,
  examScope: string | undefined,
  sources: ResearchSource[],
  reviewPackage: Record<string, unknown>,
  qualityScore: number,
): StudyPackSession {
  return {
    id: generatePackId(),
    courseName,
    school,
    examScope,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sources,
    outline: (reviewPackage.sections as Record<string, unknown>) ?? {},
    generatedHandout: reviewPackage,
    qualityScore,
    status: "complete",
  };
}
