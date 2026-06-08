// ═══════════════════════════════════════════════════════════════
// Mango Code Engine v2 — Supabase-backed with localStorage fallback
// V14.7.5: Migrated from in-memory to Supabase mango_codes table
// Anti-double-spend: atomic DB transaction via redeem_mango_code()
// ═══════════════════════════════════════════════════════════════

import type { MangoCode, RedeemResult, GenerateCodeRequest, GenerateCodeResult } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const STORAGE_KEY = "mango-codes-v2";
const isServer = typeof window === "undefined";

// ═══════════════════════════════════════════════════════════════
// Supabase client (server-side only)
// ═══════════════════════════════════════════════════════════════

async function getSupabaseAdmin() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

// ═══════════════════════════════════════════════════════════════
// Admin check via ADMIN_EMAILS env var
// ═══════════════════════════════════════════════════════════════

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export function isAdminSession(plan: string, email?: string | null): boolean {
  if (plan === "admin") return true;
  if (isAdminEmail(email)) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════
// Code generation
// ═══════════════════════════════════════════════════════════════

function generateCodeString(plan: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const prefix = plan === "admin" ? "MANGO-ADM-" : plan === "pro" ? "MANGO-PRO-" : "MANGO-FREE-";
  let code = prefix;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    if (i < 2) code += "-";
  }
  return code;
}

/** Generate codes via Supabase (or localStorage fallback) */
export async function generateCodes(
  req: GenerateCodeRequest,
  adminUserId: string,
): Promise<GenerateCodeResult> {
  const count = req.count ?? 1;
  const generated: string[] = [];

  if (isSupabaseConfigured()) {
    try {
      const sb = await getSupabaseAdmin();
      for (let i = 0; i < count; i++) {
        const codeStr = generateCodeString(req.planGranted);
        const { error } = await sb.from("mango_codes").insert({
          code: codeStr,
          plan_granted: req.planGranted,
          duration_type: req.durationType ?? "days",
          duration_value: req.durationDays ?? 30,
          max_uses: req.maxRedemptions ?? 1,
          note: req.notes,
          created_by: adminUserId,
          expires_at: req.expiresAt || null,
        });
        if (!error) generated.push(codeStr);
      }
      if (generated.length > 0) {
        return { codes: generated, planGranted: req.planGranted as any, durationDays: req.durationDays ?? 30 };
      }
    } catch { /* fallback to localStorage */ }
  }

  // localStorage fallback
  const codes = loadCodesLocal();
  for (let i = 0; i < count; i++) {
    const codeStr = generateCodeString(req.planGranted);
    codes.push({
      id: `mc-${Date.now()}-${i}`,
      code: codeStr,
      planGranted: req.planGranted as any,
      durationDays: req.durationDays ?? 30,
      maxRedemptions: req.maxRedemptions ?? 1,
      usedCount: 0,
      status: "active",
      createdBy: adminUserId,
      notes: req.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    generated.push(codeStr);
  }
  saveCodesLocal(codes);
  return { codes: generated, planGranted: req.planGranted as any, durationDays: req.durationDays ?? 30 };
}

// ═══════════════════════════════════════════════════════════════
// Code listing
// ═══════════════════════════════════════════════════════════════

/** List all codes — from Supabase (or localStorage fallback) */
export async function listCodes(): Promise<MangoCode[]> {
  if (isSupabaseConfigured()) {
    try {
      const sb = await getSupabaseAdmin();
      const { data, error } = await sb
        .from("mango_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!error && data) {
        return data.map(mapRowToCode);
      }
    } catch { /* fallback */ }
  }
  return loadCodesLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Get stats: counts by status */
export async function getCodeStats(): Promise<{ total: number; active: number; used: number; expired: number; disabled: number }> {
  if (isSupabaseConfigured()) {
    try {
      const sb = await getSupabaseAdmin();
      const { data, error } = await sb.from("mango_codes").select("status");
      if (!error && data) {
        return {
          total: data.length,
          active: data.filter((r: any) => r.status === "active").length,
          used: data.filter((r: any) => r.status === "used").length,
          expired: data.filter((r: any) => r.status === "expired").length,
          disabled: data.filter((r: any) => r.status === "disabled" || r.status === "revoked").length,
        };
      }
    } catch { /* fallback */ }
  }
  const all = loadCodesLocal();
  return {
    total: all.length,
    active: all.filter(c => c.status === "active").length,
    used: all.filter(c => c.status === "used").length,
    expired: all.filter(c => c.status === "expired").length,
    disabled: all.filter(c => c.status === "disabled" || c.status === "revoked").length,
  };
}

// ═══════════════════════════════════════════════════════════════
// Code status management
// ═══════════════════════════════════════════════════════════════

export async function updateCodeStatus(code: string, status: "active" | "disabled" | "revoked"): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const sb = await getSupabaseAdmin();
      const { error } = await sb.from("mango_codes").update({ status, updated_at: new Date().toISOString() }).eq("code", code.toUpperCase().trim());
      return !error;
    } catch { /* fallback */ }
  }
  const codes = loadCodesLocal();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());
  if (!entry) return false;
  entry.status = status;
  entry.updatedAt = new Date().toISOString();
  saveCodesLocal(codes);
  return true;
}

export async function deleteCode(code: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const sb = await getSupabaseAdmin();
      const { error } = await sb.from("mango_codes").delete().eq("code", code.toUpperCase().trim());
      return !error;
    } catch { /* fallback */ }
  }
  const codes = loadCodesLocal().filter(c => c.code !== code.toUpperCase().trim());
  saveCodesLocal(codes);
  return true;
}

// ═══════════════════════════════════════════════════════════════
// Redemption (Supabase atomic or localStorage)
// ═══════════════════════════════════════════════════════════════

export async function redeemCode(code: string, userId: string): Promise<RedeemResult> {
  // Try Supabase atomic redemption first
  if (isSupabaseConfigured()) {
    try {
      const sb = await getSupabaseAdmin();
      const { data, error } = await sb.rpc("redeem_mango_code", {
        p_code: code.toUpperCase().trim(),
        p_user_id: userId,
      });
      if (!error && data) {
        const result = data as any;
        if (result.success) {
          return {
            success: true,
            newPlan: result.new_plan,
            planExpiresAt: result.plan_expires_at,
          };
        }
        return {
          success: false,
          error: result.error || "兑换失败",
          errorCode: result.error_code || "SERVER_ERROR",
        };
      }
    } catch { /* fallback to localStorage */ }
  }

  // localStorage fallback
  const codes = loadCodesLocal();
  const now = new Date().toISOString();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());
  if (!entry) return { success: false, error: "兑换码不存在，请检查输入", errorCode: "INVALID_CODE" };
  if (entry.status === "disabled" || entry.status === "revoked") return { success: false, error: "此兑换码已失效", errorCode: "DISABLED" };
  if (entry.status === "used" || entry.usedCount >= entry.maxRedemptions) return { success: false, error: "此兑换码已被使用", errorCode: "ALREADY_USED" };
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    entry.status = "expired";
    saveCodesLocal(codes);
    return { success: false, error: "此兑换码已过期", errorCode: "EXPIRED" };
  }

  entry.usedCount++;
  entry.status = entry.usedCount >= entry.maxRedemptions ? "used" : "active";
  entry.redeemedBy = userId;
  entry.redeemedAt = now;
  entry.updatedAt = now;
  saveCodesLocal(codes);

  const planExpiresAt = entry.durationDays > 0
    ? new Date(Date.now() + entry.durationDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  return { success: true, newPlan: entry.planGranted, planExpiresAt };
}

export function validateCode(code: string): { valid: boolean; planGranted?: string; error?: string } {
  const codes = loadCodesLocal();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());
  if (!entry) return { valid: false, error: "兑换码不存在" };
  if (entry.status === "disabled" || entry.status === "revoked") return { valid: false, error: "兑换码已失效" };
  if (entry.status === "used" || entry.usedCount >= entry.maxRedemptions) return { valid: false, error: "兑换码已被使用" };
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return { valid: false, error: "兑换码已过期" };
  return { valid: true, planGranted: entry.planGranted };
}

// ═══════════════════════════════════════════════════════════════
// localStorage fallback (dev / no Supabase)
// ═══════════════════════════════════════════════════════════════

function loadCodesLocal(): MangoCode[] {
  try {
    if (isServer) return (globalThis as any).__mango_codes_v2 || [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCodesLocal(codes: MangoCode[]) {
  try {
    if (isServer) {
      (globalThis as any).__mango_codes_v2 = codes;
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    }
  } catch {}
}

/** Seed demo codes for development. Idempotent — only runs in localStorage fallback mode. */
export function seedDemoCodes() {
  if (isSupabaseConfigured()) return; // Don't seed when Supabase is active
  const codes = loadCodesLocal();
  const existing = new Set(codes.map(c => c.code));
  const demos: MangoCode[] = [];
  const now = new Date().toISOString();
  if (!existing.has("MANGO-PRO-DEMO-2026")) {
    demos.push({ id: "demo-pro-1", code: "MANGO-PRO-DEMO-2026", planGranted: "pro", durationDays: 30, maxRedemptions: 50, usedCount: 0, status: "active", createdBy: "system", notes: "Demo Pro 30天 50次", createdAt: now, updatedAt: now });
  }
  if (!existing.has("MANGO-ADMIN-2026")) {
    demos.push({ id: "demo-admin-1", code: "MANGO-ADMIN-2026", planGranted: "admin", durationDays: 0, maxRedemptions: 5, usedCount: 0, status: "active", createdBy: "system", notes: "Demo Admin 永久 5次", createdAt: now, updatedAt: now });
  }
  if (demos.length > 0) {
    codes.push(...demos);
    saveCodesLocal(codes);
  }
}

function mapRowToCode(row: any): MangoCode {
  return {
    id: row.id,
    code: row.code,
    planGranted: row.plan_granted,
    durationDays: row.duration_value || 30,
    maxRedemptions: row.max_uses || 1,
    usedCount: row.used_count || 0,
    status: row.status,
    createdBy: row.created_by,
    redeemedBy: row.redeemed_by,
    redeemedAt: row.redeemed_at,
    expiresAt: row.expires_at,
    notes: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
