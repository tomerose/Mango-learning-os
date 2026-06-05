// ─────────────────────────────────────────────────────────────
// Agent Memory — persistent context layer for the Learning Agent.
//
// Stores key/value memories keyed by user + type so the agent can
// "remember" what a user is studying, their weak areas, goals, and
// recent topics across sessions.
//
// Cloud mode: Supabase agent_memory table.
// Guest mode: localStorage (same origin as the rest of the guest store).
// ─────────────────────────────────────────────────────────────

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────

export type MemoryType = "goal" | "weak_area" | "topic" | "preference" | "summary";

export interface MemoryEntry {
  id?: string;
  user_id?: string;
  type: MemoryType;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Guest-mode localStorage ──────────────────────────────────

const MEMORY_KEY = "ai-learning-os::agent-memory";

interface GuestMemoryStore {
  entries: MemoryEntry[];
  userId: string;
}

function loadGuest(userId: string): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    const store: GuestMemoryStore = JSON.parse(raw);
    return store.userId === userId ? store.entries : [];
  } catch {
    return [];
  }
}

function saveGuest(userId: string, entries: MemoryEntry[]): void {
  try {
    const store: GuestMemoryStore = { userId, entries };
    localStorage.setItem(MEMORY_KEY, JSON.stringify(store));
  } catch {
    // storage full or disabled — degrade silently
  }
}

// ─── Cloud-mode Supabase ───────────────────────────────────────

async function cloudUpsert(
  userId: string,
  type: MemoryType,
  key: string,
  value: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("agent_memory").upsert(
    {
      user_id: userId,
      type,
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,key" }
  );
  if (error) console.error("[agent-memory] upsert error:", error);
}

async function cloudFetch(
  userId: string,
  type?: MemoryType
): Promise<MemoryEntry[]> {
  const supabase = createClient();
  let query = supabase
    .from("agent_memory")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[agent-memory] fetch error:", error);
    return [];
  }
  return (data ?? []) as MemoryEntry[];
}

async function cloudDelete(
  userId: string,
  key: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("agent_memory")
    .delete()
    .eq("user_id", userId)
    .eq("key", key);
  if (error) console.error("[agent-memory] delete error:", error);
}

// ─── Public API ────────────────────────────────────────────────

/**
 * Store a memory entry. If a memory with the same userId + key
 * already exists, it is updated (upsert semantic).
 */
export async function remember(
  userId: string,
  type: MemoryType,
  key: string,
  value: string
): Promise<void> {
  if (!userId) return;

  if (isSupabaseConfigured()) {
    await cloudUpsert(userId, type, key, value);
  } else {
    const entries = loadGuest(userId);
    const idx = entries.findIndex((e) => e.key === key);
    const entry: MemoryEntry = {
      type,
      key,
      value,
      updated_at: new Date().toISOString(),
    };
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...entry };
    } else {
      entries.push({ ...entry, created_at: new Date().toISOString() });
    }
    saveGuest(userId, entries);
  }
}

/**
 * Retrieve memories for a user, optionally filtered by type.
 * Returns newest-first.
 */
export async function recall(
  userId: string,
  type?: MemoryType
): Promise<MemoryEntry[]> {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    return cloudFetch(userId, type);
  }

  const entries = loadGuest(userId);
  if (type) return entries.filter((e) => e.type === type);
  return entries;
}

/**
 * Remove a memory by user and key.
 */
export async function forget(
  userId: string,
  key: string
): Promise<void> {
  if (!userId) return;

  if (isSupabaseConfigured()) {
    await cloudDelete(userId, key);
  } else {
    const entries = loadGuest(userId);
    saveGuest(userId, entries.filter((e) => e.key !== key));
  }
}

/**
 * Build a context summary string from all stored memories.
 * Useful for injecting into the agent's system prompt.
 */
export async function summarizeContext(userId: string): Promise<string> {
  if (!userId) return "";

  const memories = await recall(userId);
  if (memories.length === 0) return "";

  const byType: Record<string, string[]> = {};
  for (const m of memories) {
    const label = typeLabel(m.type);
    if (!byType[label]) byType[label] = [];
    byType[label].push(`- ${m.key}: ${m.value}`);
  }

  const parts: string[] = [];
  for (const [label, items] of Object.entries(byType)) {
    parts.push(`${label}:\n${items.join("\n")}`);
  }

  return `\n\n【用户学习档案】\n${parts.join("\n\n")}`;
}

function typeLabel(type: MemoryType): string {
  const map: Record<MemoryType, string> = {
    goal: "目标",
    weak_area: "薄弱领域",
    topic: "最近学习主题",
    preference: "偏好设置",
    summary: "对话摘要",
  };
  return map[type] ?? type;
}
