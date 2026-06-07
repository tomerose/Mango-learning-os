/**
 * MangoOS V14.2 — Unified Artifact Store
 *
 * Three-tier storage: IndexedDB (full content), localStorage (metadata index), Supabase (cloud sync).
 * Compatible with Guest / Standard / Pro / Admin plan tiers.
 */
import type { Artifact, ArtifactFilter, ArtifactInput, StorageMode } from "./types";
import { createArtifactId } from "./types";

// ── Keys ───────────────────────────────────────────────────────
const META_KEY = "mango-artifacts-meta-v1";
const IDB_NAME = "mango-artifacts";
const IDB_VERSION = 1;
const STORE_NAME = "artifacts";

// ── Metadata index ─────────────────────────────────────────────
export interface ArtifactMeta {
  id: string;
  type: string;
  title: string;
  summary: string;
  tags: string[];
  subject?: string;
  qualityScore: number;
  status: string;
  storageMode: string;
  createdAt: string;
  updatedAt: string;
}

// ── IndexedDB helpers ──────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("type", "type", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putFullArtifact(artifact: Artifact): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(artifact);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    db.close();
  } catch {
    // IndexedDB unavailable — metadata only
  }
}

async function getFullArtifact(id: string): Promise<Artifact | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const result = await new Promise<Artifact | undefined>((res, rej) => {
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    db.close();
    return result ?? null;
  } catch {
    return null;
  }
}

async function getAllFromIDB(): Promise<Artifact[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const result = await new Promise<Artifact[]>((res, rej) => {
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    db.close();
    return result;
  } catch {
    return [];
  }
}

// ── Metadata index (localStorage) ──────────────────────────────

function loadMetaIndex(): ArtifactMeta[] {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveMetaIndex(meta: ArtifactMeta[]): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // quota exceeded — silently degrade
  }
}

function artifactToMeta(a: Artifact): ArtifactMeta {
  return {
    id: a.id,
    type: a.type,
    title: a.title,
    summary: a.summary,
    tags: a.tags,
    subject: a.subject,
    qualityScore: a.qualityScore,
    status: a.status,
    storageMode: a.storageMode,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

// ── Public API ─────────────────────────────────────────────────

export async function saveArtifact(artifact: Artifact): Promise<void> {
  // Update timestamp
  artifact.updatedAt = new Date().toISOString();

  // Save full content to IndexedDB
  await putFullArtifact(artifact);

  // Update metadata index in localStorage
  const meta = loadMetaIndex();
  const idx = meta.findIndex(m => m.id === artifact.id);
  const metaEntry = artifactToMeta(artifact);
  if (idx >= 0) meta[idx] = metaEntry;
  else meta.unshift(metaEntry);
  saveMetaIndex(meta);
}

export async function getArtifact(id: string): Promise<Artifact | null> {
  return getFullArtifact(id);
}

export async function listArtifacts(filter: ArtifactFilter = {}): Promise<ArtifactMeta[]> {
  let meta = loadMetaIndex();

  if (filter.types && filter.types.length > 0) {
    meta = meta.filter(m => filter.types!.includes(m.type as any));
  }
  if (filter.statuses && filter.statuses.length > 0) {
    meta = meta.filter(m => filter.statuses!.includes(m.status as any));
  }
  if (filter.tags && filter.tags.length > 0) {
    meta = meta.filter(m => m.tags.some(t => filter.tags!.includes(t)));
  }
  if (filter.subject) {
    meta = meta.filter(m => m.subject === filter.subject);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    meta = meta.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const sortBy = filter.sortBy ?? "updatedAt";
  const sortDir = filter.sortDir ?? "desc";
  meta.sort((a, b) => {
    const aVal = sortBy === "qualityScore" ? a.qualityScore : new Date(a[sortBy as "createdAt" | "updatedAt"]).getTime();
    const bVal = sortBy === "qualityScore" ? b.qualityScore : new Date(b[sortBy as "createdAt" | "updatedAt"]).getTime();
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const offset = filter.offset ?? 0;
  const limit = filter.limit ?? 50;
  return meta.slice(offset, offset + limit);
}

export async function deleteArtifact(id: string): Promise<void> {
  // Remove from IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    db.close();
  } catch {}

  // Remove from metadata index
  const meta = loadMetaIndex().filter(m => m.id !== id);
  saveMetaIndex(meta);
}

export async function updateArtifact(id: string, updates: Partial<Pick<Artifact, "title" | "content" | "sections" | "status" | "tags">>): Promise<Artifact | null> {
  const artifact = await getFullArtifact(id);
  if (!artifact) return null;

  Object.assign(artifact, updates);
  await saveArtifact(artifact);
  return artifact;
}

export async function getAllArtifacts(): Promise<Artifact[]> {
  return getAllFromIDB();
}

export async function getArtifactCount(): Promise<number> {
  return loadMetaIndex().length;
}

export function createArtifactFromInput(input: ArtifactInput): Artifact {
  const now = new Date().toISOString();
  return {
    id: createArtifactId(),
    type: input.type,
    status: "generating",
    title: input.prompt.slice(0, 80),
    summary: "",
    content: "",
    sections: [],
    tags: [],
    subject: input.subject,
    course: input.course,
    school: input.school,
    qualityScore: 0,
    sources: [],
    originTask: input.prompt,
    exportFormats: ["markdown", "html"],
    storageMode: input.storageMode,
    owner: input.owner,
    planTier: input.planTier,
    createdAt: now,
    updatedAt: now,
  };
}
