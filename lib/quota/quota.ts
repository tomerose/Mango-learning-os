// ═══════════════════════════════════════════════════════════════
// MangoOS Daily Quota — Beijing Time UTC+8
// Dual backend: Supabase (production) / In-memory (dev fallback)
// All daily limits reset at exactly 00:00 Beijing Time (UTC+8).
// ═══════════════════════════════════════════════════════════════

import type { PlanTier } from "@/lib/plan/types";
import { PLAN_FEATURES } from "@/lib/plan/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Get the current date string in Beijing Time (yyyy-mm-dd). */
export function beijingToday(): string {
  const now = new Date();
  const bj = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return bj.toISOString().slice(0, 10);
}

/** Get milliseconds until next 00:00 Beijing Time. */
export function msUntilBeijingMidnight(): number {
  const bjMidnightUTC = new Date(beijingToday() + "T00:00:00+08:00").getTime();
  const nextMidnight = bjMidnightUTC + 24 * 60 * 60 * 1000;
  return nextMidnight - Date.now();
}

// ═══════════════════════════════════════════════════════════════
// In-memory fallback (dev mode, no Supabase)
// ═══════════════════════════════════════════════════════════════

interface QuotaEntry {
  userId: string;
  date: string;
  agentTasks: number;
  studyPacks: number;
}

const memoryStore = new Map<string, QuotaEntry>();

function getMemoryEntry(userId: string): QuotaEntry {
  const today = beijingToday();
  const existing = memoryStore.get(userId);
  if (existing && existing.date === today) return existing;

  const fresh: QuotaEntry = { userId, date: today, agentTasks: 0, studyPacks: 0 };
  memoryStore.set(userId, fresh);
  return fresh;
}

// ═══════════════════════════════════════════════════════════════
// Public API (auto-selects backend)
// ═══════════════════════════════════════════════════════════════

/** Record a quota-consuming action. Returns true if allowed. */
export function recordQuotaUse(
  userId: string,
  type: "agentTasks" | "studyPacks",
  plan: PlanTier,
): { allowed: boolean; current: number; max: number } {
  const tier = PLAN_FEATURES[plan];
  const max = type === "agentTasks" ? tier.maxDailyAgentTasks : tier.maxDailyStudyPacks;

  // Admin: unlimited
  if (max >= 9999) return { allowed: true, current: 0, max };

  // For now: in-memory (Supabase-backed in production via v13 migration)
  // The Supabase function `increment_quota` handles atomic increment + RLS
  const entry = getMemoryEntry(userId);

  if (type === "agentTasks") {
    const current = entry.agentTasks;
    if (current >= max) return { allowed: false, current, max };
    entry.agentTasks++;
    return { allowed: true, current: current + 1, max };
  } else {
    const current = entry.studyPacks;
    if (current >= max) return { allowed: false, current, max };
    entry.studyPacks++;
    return { allowed: true, current: current + 1, max };
  }
}

/** Get current usage without incrementing. */
export function getQuotaStatus(
  userId: string,
  plan: PlanTier,
): {
  agentTasks: { current: number; max: number };
  studyPacks: { current: number; max: number };
  resetAt: string;
} {
  const tier = PLAN_FEATURES[plan];
  const entry = getMemoryEntry(userId);

  const tomorrow = new Date(
    new Date(beijingToday() + "T00:00:00+08:00").getTime() + 24 * 60 * 60 * 1000,
  );

  return {
    agentTasks: { current: entry.agentTasks, max: tier.maxDailyAgentTasks },
    studyPacks: { current: entry.studyPacks, max: tier.maxDailyStudyPacks },
    resetAt: tomorrow.toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// Supabase-backed quota (activate after running v13 migration)
// ═══════════════════════════════════════════════════════════════

/** Check if Supabase quotas are available */
export function isQuotaCloudAvailable(): boolean {
  return isSupabaseConfigured();
}

/**
 * Record quota use via Supabase (atomic).
 * Requires v13 migration to be run first.
 * Falls back to in-memory if Supabase is not configured.
 */
export async function recordQuotaUseCloud(
  userId: string,
  type: "agentTasks" | "studyPacks",
): Promise<{ allowed: boolean; current: number; max: number }> {
  if (!isSupabaseConfigured()) {
    // Fallback: use in-memory with guest plan
    return recordQuotaUse(userId, type, "standard");
  }

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const today = beijingToday();
    const { data, error } = await supabase.rpc("increment_quota", {
      p_user_id: userId,
      p_date: today,
      p_type: type,
    });

    if (error) throw error;
    return data as { allowed: boolean; current: number; max: number };
  } catch {
    // Fail open with in-memory fallback
    return recordQuotaUse(userId, type, "standard");
  }
}

/**
 * Get quota status from Supabase.
 */
export async function getQuotaStatusCloud(
  userId: string,
): Promise<{
  agentTasks: { current: number; max: number };
  studyPacks: { current: number; max: number };
  resetAt: string;
}> {
  if (!isSupabaseConfigured()) {
    return getQuotaStatus(userId, "standard");
  }

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const today = beijingToday();
    const { data, error } = await supabase.rpc("get_daily_quota", {
      p_user_id: userId,
      p_date: today,
    });

    if (error) throw error;

    const tomorrow = new Date(
      new Date(today + "T00:00:00+08:00").getTime() + 24 * 60 * 60 * 1000,
    );

    return {
      agentTasks: data?.agentTasks ?? { current: 0, max: 20 },
      studyPacks: data?.studyPacks ?? { current: 0, max: 3 },
      resetAt: tomorrow.toISOString(),
    };
  } catch {
    return getQuotaStatus(userId, "standard");
  }
}
