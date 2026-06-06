// ═══════════════════════════════════════════════════════════════
// Study Pack Persistence Store V2
// Primary: IndexedDB (full content) → Fallback: localStorage (metadata)
// Survives page refresh, browser restart, and quota pressure.
// ═══════════════════════════════════════════════════════════════

import type { ResearchSource } from "@/lib/ai/research-orchestrator";
import {
  putPack, getPack, getAllPacks, deletePackFromIDB,
  buildPackMeta, isIDBAvailable,
  type IDBPackRecord,
} from "@/lib/db/study-pack-idb";

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

const STORAGE_KEY = "mango-study-packs-v2";
const MAX_PACKS = 30;

// ── LocalStorage helpers (metadata fallback) ──────────────────

interface PackMetadata {
  id: string;
  courseName: string;
  school?: string;
  examScope?: string;
  createdAt: string;
  updatedAt: string;
  qualityScore: number;
  status: StudyPackSession["status"];
  sourceCount: number;
  sectionCount: number;
}

function loadMetadata(): PackMetadata[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PackMetadata[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_PACKS) : [];
  } catch {
    return [];
  }
}

function saveMetadata(meta: PackMetadata[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta.slice(0, MAX_PACKS)));
  } catch { /* silent */ }
}

function toMetadata(pack: IDBPackRecord): PackMetadata {
  return {
    id: pack.id,
    courseName: pack.courseName,
    school: pack.school,
    examScope: pack.examScope,
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
    qualityScore: pack.qualityScore,
    status: pack.status,
    sourceCount: pack._meta.sourceCount,
    sectionCount: pack._meta.sectionCount,
  };
}

// ── Public API ─────────────────────────────────────────────────

/** Load all study packs (metadata from IDB, fallback to localStorage) */
export async function loadStudyPacks(): Promise<StudyPackSession[]> {
  // Try IndexedDB first
  if (isIDBAvailable()) {
    try {
      const packs = await getAllPacks();
      if (packs.length > 0) {
        return packs.map(toSession);
      }
    } catch { /* fall through to localStorage */ }
  }

  // Fallback: localStorage → return metadata-only sessions (content loaded on demand)
  const meta = loadMetadata();
  return meta.map(m => ({
    id: m.id,
    courseName: m.courseName,
    school: m.school,
    examScope: m.examScope,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    sources: [],
    outline: {},
    generatedHandout: {},
    qualityScore: m.qualityScore,
    status: m.status,
  }));
}

/** Synchronous wrapper for component mount (uses localStorage metadata only) */
export function loadStudyPacksSync(): StudyPackSession[] {
  const meta = loadMetadata();
  return meta.map(m => ({
    id: m.id,
    courseName: m.courseName,
    school: m.school,
    examScope: m.examScope,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    sources: [],
    outline: {},
    generatedHandout: {},
    qualityScore: m.qualityScore,
    status: m.status,
  }));
}

/** Save a study pack (dual-write: IDB full + localStorage metadata) */
export async function saveStudyPack(pack: StudyPackSession): Promise<void> {
  const now = new Date().toISOString();
  const updated = { ...pack, updatedAt: now };

  // Build IDB record
  const idbPack: IDBPackRecord = {
    ...updated,
    qualityReport: undefined,
    _meta: buildPackMeta({
      id: pack.id,
      courseName: pack.courseName,
      school: pack.school,
      examScope: pack.examScope,
      createdAt: pack.createdAt,
      updatedAt: now,
      sources: pack.sources,
      outline: pack.outline,
      generatedHandout: pack.generatedHandout,
      qualityScore: pack.qualityScore,
      status: pack.status,
      exportMetadata: pack.exportMetadata,
    }),
  };

  // Write to IndexedDB (primary)
  if (isIDBAvailable()) {
    try { await putPack(idbPack); } catch { /* fall through */ }
  }

  // Write metadata to localStorage (fallback)
  const meta = loadMetadata();
  const idx = meta.findIndex(m => m.id === pack.id);
  const newMeta = toMetadata(idbPack);
  if (idx >= 0) {
    meta[idx] = newMeta;
  } else {
    meta.unshift(newMeta);
  }
  saveMetadata(meta);
}

/** Synchronous save for localStorage-only mode */
export function saveStudyPackSync(pack: StudyPackSession): void {
  const now = new Date().toISOString();
  const meta = loadMetadata();
  const idx = meta.findIndex(m => m.id === pack.id);
  const newMeta: PackMetadata = {
    id: pack.id,
    courseName: pack.courseName,
    school: pack.school,
    examScope: pack.examScope,
    createdAt: pack.createdAt,
    updatedAt: now,
    qualityScore: pack.qualityScore,
    status: pack.status,
    sourceCount: pack.sources?.length ?? 0,
    sectionCount: Object.keys(pack.generatedHandout?.sections ?? {}).length,
  };
  if (idx >= 0) {
    meta[idx] = newMeta;
  } else {
    meta.unshift(newMeta);
  }
  saveMetadata(meta);

  // Also save full content to localStorage if it fits
  try {
    const key = `mango-pack-content-${pack.id}`;
    const content = {
      sources: pack.sources,
      outline: pack.outline,
      generatedHandout: pack.generatedHandout,
    };
    localStorage.setItem(key, JSON.stringify(content));
  } catch { /* content too large for localStorage */ }
}

/** Get a full pack by ID (tries IDB first, then localStorage content) */
export async function getPackById(id: string): Promise<StudyPackSession | null> {
  // Try IDB
  if (isIDBAvailable()) {
    try {
      const pack = await getPack(id);
      if (pack) return toSession(pack);
    } catch { /* fall through */ }
  }

  // Try localStorage content
  try {
    const key = `mango-pack-content-${id}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const content = JSON.parse(raw);
      const meta = loadMetadata().find(m => m.id === id);
      if (meta) {
        return {
          id: meta.id,
          courseName: meta.courseName,
          school: meta.school,
          examScope: meta.examScope,
          createdAt: meta.createdAt,
          updatedAt: meta.updatedAt,
          sources: content.sources ?? [],
          outline: content.outline ?? {},
          generatedHandout: content.generatedHandout ?? {},
          qualityScore: meta.qualityScore,
          status: meta.status,
        };
      }
    }
  } catch { /* not found in localStorage */ }

  return null;
}

/** Delete a study pack from all stores */
export async function deleteStudyPack(id: string): Promise<void> {
  // IDB
  if (isIDBAvailable()) {
    try { await deletePackFromIDB(id); } catch { /* best effort */ }
  }
  // localStorage metadata
  const meta = loadMetadata().filter(m => m.id !== id);
  saveMetadata(meta);
  // localStorage content
  try { localStorage.removeItem(`mango-pack-content-${id}`); } catch { /* noop */ }
}

/** Synchronous delete (localStorage only) */
export function deleteStudyPackSync(id: string): void {
  const meta = loadMetadata().filter(m => m.id !== id);
  saveMetadata(meta);
  try { localStorage.removeItem(`mango-pack-content-${id}`); } catch { /* noop */ }
}

/** Rename a study pack */
export async function renameStudyPack(id: string, newName: string): Promise<void> {
  const pack = await getPackById(id);
  if (pack) {
    pack.courseName = newName;
    await saveStudyPack(pack);
  }
}

/** Duplicate a study pack */
export async function duplicateStudyPack(id: string): Promise<StudyPackSession | null> {
  const pack = await getPackById(id);
  if (!pack) return null;
  const newPack: StudyPackSession = {
    ...pack,
    id: generatePackId(),
    courseName: `${pack.courseName} (副本)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveStudyPack(newPack);
  return newPack;
}

/** Get most recent study pack */
export async function getLatestStudyPack(): Promise<StudyPackSession | null> {
  const packs = await loadStudyPacks();
  return packs.length > 0 ? packs[0] : null;
}

/** Get recent study packs for Hub display */
export function getRecentStudyPacks(count = 3): StudyPackSession[] {
  return loadStudyPacksSync().slice(0, count);
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

/** Convert IDB record to session */
function toSession(pack: IDBPackRecord): StudyPackSession {
  return {
    id: pack.id,
    courseName: pack.courseName,
    school: pack.school,
    examScope: pack.examScope,
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
    sources: pack.sources ?? [],
    outline: pack.outline ?? {},
    generatedHandout: pack.generatedHandout ?? {},
    qualityScore: pack.qualityScore,
    status: pack.status,
    exportMetadata: pack.exportMetadata,
  };
}

/** Migrate old localStorage packs (from v1 key) to new store */
export function migrateOldPacks(): void {
  try {
    const old = localStorage.getItem("mango-study-packs-v1");
    if (!old) return;
    const oldPacks = JSON.parse(old) as StudyPackSession[];
    if (!Array.isArray(oldPacks) || oldPacks.length === 0) return;

    const existing = loadMetadata();
    for (const pack of oldPacks) {
      if (existing.some(m => m.id === pack.id)) continue;
      saveStudyPackSync(pack);
    }
    // Remove old key after migration
    localStorage.removeItem("mango-study-packs-v1");
  } catch { /* silent */ }
}
