// ═══════════════════════════════════════════════════════════════
// Study Pack IndexedDB Storage
// Primary large-content persistence for generated study packs.
// Falls back to localStorage metadata when IDB is unavailable.
// ═══════════════════════════════════════════════════════════════

import type { ResearchSource } from "@/lib/ai/research-orchestrator";

const DB_NAME = "mango-study-packs";
const DB_VERSION = 1;
const STORE_NAME = "packs";

export interface IDBPackRecord {
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
  qualityReport?: Record<string, unknown>;
  status: "generating" | "complete" | "error";
  exportMetadata?: {
    lastExportFormat?: "docx" | "pdf" | "md";
    lastExportedAt?: string;
  };
  _meta: {
    sectionCount: number;
    sourceCount: number;
    totalChars: number;
    hasPractice: boolean;
  };
}

/** Open the IndexedDB database (creates if not exists) */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Store a full pack record in IndexedDB */
export async function putPack(pack: IDBPackRecord): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(pack);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    // IndexedDB unavailable — caller should fall back to localStorage
  }
}

/** Get a single pack by ID */
export async function getPack(id: string): Promise<IDBPackRecord | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** Get all packs sorted by updatedAt descending */
export async function getAllPacks(): Promise<IDBPackRecord[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index("updatedAt");
    return new Promise((resolve, reject) => {
      const req = idx.getAll();
      req.onsuccess = () => {
        const results = (req.result ?? []) as IDBPackRecord[];
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/** Delete a pack by ID */
export async function deletePackFromIDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Best effort
  }
}

/** Get storage estimate for quota management */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number; pct: number } | null> {
  try {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const est = await navigator.storage.estimate();
      const usage = est.usage ?? 0;
      const quota = est.quota ?? 0;
      return { usage, quota, pct: quota > 0 ? usage / quota : 0 };
    }
  } catch { /* noop */ }
  return null;
}

/** Check if IndexedDB is available */
export function isIDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Build _meta from a pack record */
export function buildPackMeta(pack: Omit<IDBPackRecord, "_meta">): IDBPackRecord["_meta"] {
  const handout = pack.generatedHandout;
  const sections = (handout?.sections ?? {}) as Record<string, unknown>;
  const chapterConcepts = (sections?.chapterConcepts ?? []) as unknown[];
  let totalChars = 0;
  try {
    totalChars = JSON.stringify(handout).length;
  } catch { /* ignore */ }

  return {
    sectionCount: Object.keys(sections).length + (chapterConcepts?.length ?? 0),
    sourceCount: pack.sources?.length ?? 0,
    totalChars,
    hasPractice: !!(sections?.mockExam || sections?.answerKey),
  };
}
