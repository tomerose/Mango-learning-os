// IndexedDB wrapper — local-first storage for Mind Garden & Final Exam Master
// Usage: const db = await openDB(); db.put('store', value); db.getAll('store');

type StoreName = "mind_garden_entries" | "mind_garden_moods" | "exam_master_packages" | "exam_master_sources";

interface IDBSchema { key: string; value: unknown; }

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("mango_learning_os", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("mind_garden_entries")) db.createObjectStore("mind_garden_entries", { keyPath: "id" });
      if (!db.objectStoreNames.contains("mind_garden_moods")) db.createObjectStore("mind_garden_moods", { keyPath: "id" });
      if (!db.objectStoreNames.contains("exam_master_packages")) db.createObjectStore("exam_master_packages", { keyPath: "id" });
      if (!db.objectStoreNames.contains("exam_master_sources")) db.createObjectStore("exam_master_sources", { keyPath: "id" });
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

async function withStore<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  const tx = db.transaction(store, mode);
  const s = tx.objectStore(store);
  return new Promise((resolve, reject) => {
    const req = fn(s);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const idb = {
  put: <T extends { id: string }>(store: StoreName, value: T) => withStore(store, "readwrite", s => s.put(value)),
  get: <T>(store: StoreName, id: string) => withStore<T | undefined>(store, "readonly", s => s.get(id)),
  getAll: <T>(store: StoreName) => withStore<T[]>(store, "readonly", s => s.getAll()),
  delete: (store: StoreName, id: string) => withStore(store, "readwrite", s => s.delete(id)),
  clear: (store: StoreName) => withStore(store, "readwrite", s => s.clear()),
  count: (store: StoreName) => withStore<number>(store, "readonly", s => s.count()),
};
