// ═══════════════════════════════════════════════════════════════
// Mango Code Engine v2 — Supabase-backed with file fallback
// V14.7.5: Supabase mango_codes table + atomic redeem_mango_code()
// ═══════════════════════════════════════════════════════════════

import type { MangoCode, RedeemResult, GenerateCodeRequest, GenerateCodeResult } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "mango-codes-v2";
const isServer = typeof window === "undefined";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ═══════════════════════════════════════════════════════════════
// Admin check
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

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function gen(): string {
  let s = "";
  for (let j = 0; j < 4; j++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}

function generateCodeString(plan: string): string {
  const prefix = plan === "admin" ? "MANGO-ADM-" : plan === "pro" ? "MANGO-PRO-" : "MANGO-STD-";
  return `${prefix}${gen()}-${gen()}-${gen()}`;
}

export async function generateCodes(req: GenerateCodeRequest, adminUserId: string): Promise<GenerateCodeResult> {
  const count = req.count ?? 1;
  const generated: string[] = [];
  const sb = getSupabaseAdmin();

  if (sb) {
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
  }

  // Fallback — server memory
  const codes = loadFallback();
  for (let i = 0; i < count; i++) {
    const codeStr = generateCodeString(req.planGranted);
    codes.push({
      id: `mc-${Date.now()}-${i}`, code: codeStr,
      planGranted: req.planGranted as any, durationDays: req.durationDays ?? 30,
      maxRedemptions: req.maxRedemptions ?? 1, usedCount: 0, status: "active",
      createdBy: adminUserId, notes: req.notes,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    generated.push(codeStr);
  }
  saveFallback(codes);
  return { codes: generated, planGranted: req.planGranted as any, durationDays: req.durationDays ?? 30 };
}

// ═══════════════════════════════════════════════════════════════
// Code listing + stats
// ═══════════════════════════════════════════════════════════════

export async function listCodes(): Promise<MangoCode[]> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from("mango_codes").select("*").order("created_at", { ascending: false }).limit(200);
    if (!error && data) return data.map(mapRow);
  }
  return loadFallback().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCodeStats() {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from("mango_codes").select("status");
    if (!error && data) {
      return {
        total: data.length, active: data.filter((r: any) => r.status === "active").length,
        used: data.filter((r: any) => r.status === "used").length,
        expired: data.filter((r: any) => r.status === "expired").length,
        disabled: data.filter((r: any) => r.status === "disabled" || r.status === "revoked").length,
      };
    }
  }
  const all = loadFallback();
  return { total: all.length, active: all.filter(c => c.status === "active").length, used: all.filter(c => c.status === "used").length, expired: all.filter(c => c.status === "expired").length, disabled: all.filter(c => c.status === "disabled" || c.status === "revoked").length };
}

// ═══════════════════════════════════════════════════════════════
// Status management
// ═══════════════════════════════════════════════════════════════

export async function updateCodeStatus(code: string, status: "active" | "disabled" | "revoked"): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("mango_codes").update({ status, updated_at: new Date().toISOString() }).eq("code", code.toUpperCase().trim());
    if (!error) return true;
  }
  const codes = loadFallback();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());
  if (!entry) return false;
  entry.status = status;
  entry.updatedAt = new Date().toISOString();
  saveFallback(codes);
  return true;
}

export async function deleteCode(code: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("mango_codes").delete().eq("code", code.toUpperCase().trim());
    if (!error) return true;
  }
  const codes = loadFallback().filter(c => c.code !== code.toUpperCase().trim());
  saveFallback(codes);
  return true;
}

// ═══════════════════════════════════════════════════════════════
// Redemption (Supabase atomic RPC or fallback)
// ═══════════════════════════════════════════════════════════════

export async function redeemCode(code: string, userId: string): Promise<RedeemResult> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.rpc("redeem_mango_code", {
      p_code: code.toUpperCase().trim(),
      p_user_id: userId,
    });
    if (!error && data) {
      const r = data as any;
      if (r.success) return { success: true, newPlan: r.new_plan, planExpiresAt: r.plan_expires_at };
      return { success: false, error: r.error || "兑换失败", errorCode: r.error_code || "SERVER_ERROR" };
    }
  }
  // Fallback
  const codes = loadFallback();
  const now = new Date().toISOString();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());
  if (!entry) return { success: false, error: "兑换码不存在", errorCode: "INVALID_CODE" };
  if (entry.status !== "active") return { success: false, error: "兑换码已失效", errorCode: "DISABLED" };
  if (entry.usedCount >= entry.maxRedemptions) return { success: false, error: "已被使用", errorCode: "ALREADY_USED" };
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return { success: false, error: "已过期", errorCode: "EXPIRED" };
  entry.usedCount++;
  entry.status = entry.usedCount >= entry.maxRedemptions ? "used" : "active";
  entry.redeemedBy = userId;
  entry.redeemedAt = now;
  entry.updatedAt = now;
  saveFallback(codes);
  const pe = entry.durationDays > 0 ? new Date(Date.now() + entry.durationDays * 86400000).toISOString() : undefined;
  return { success: true, newPlan: entry.planGranted, planExpiresAt: pe };
}

export function validateCode(code: string): { valid: boolean; planGranted?: string; error?: string } {
  const codes = loadFallback();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());
  if (!entry) return { valid: false, error: "兑换码不存在" };
  if (entry.status !== "active") return { valid: false, error: "已失效" };
  if (entry.usedCount >= entry.maxRedemptions) return { valid: false, error: "已被使用" };
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return { valid: false, error: "已过期" };
  return { valid: true, planGranted: entry.planGranted };
}

// ═══════════════════════════════════════════════════════════════
// Seed demo codes
// ═══════════════════════════════════════════════════════════════

export function seedDemoCodes() {
  if (isSupabaseConfigured()) return;
  const codes = loadFallback();
  const existing = new Set(codes.map(c => c.code));
  const now = new Date().toISOString();
  if (!existing.has("MANGO-PRO-DEMO-2026")) {
    codes.push({ id: "demo-pro", code: "MANGO-PRO-DEMO-2026", planGranted: "pro", durationDays: 30, maxRedemptions: 50, usedCount: 0, status: "active", createdBy: "system", notes: "Demo Pro 30天", createdAt: now, updatedAt: now });
  }
  if (!existing.has("MANGO-ADMIN-2026")) {
    codes.push({ id: "demo-admin", code: "MANGO-ADMIN-2026", planGranted: "admin", durationDays: 0, maxRedemptions: 5, usedCount: 0, status: "active", createdBy: "system", notes: "Demo Admin 永久", createdAt: now, updatedAt: now });
  }
  saveFallback(codes);
}

// ═══════════════════════════════════════════════════════════════
// Server fallback storage (survives HMR in dev)
// ═══════════════════════════════════════════════════════════════

function loadFallback(): MangoCode[] {
  try {
    if (isServer) return (globalThis as any).__mango_codes_v3 || [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFallback(codes: MangoCode[]) {
  try {
    if (isServer) { (globalThis as any).__mango_codes_v3 = codes; }
    else { localStorage.setItem(STORAGE_KEY, JSON.stringify(codes.slice(0, 200))); }
  } catch {}
}

function mapRow(r: any): MangoCode {
  return {
    id: r.id, code: r.code, planGranted: r.plan_granted,
    durationDays: r.duration_value ?? 30, maxRedemptions: r.max_uses ?? 1,
    usedCount: r.used_count ?? 0, status: r.status,
    createdBy: r.created_by, redeemedBy: r.redeemed_by, redeemedAt: r.redeemed_at,
    expiresAt: r.expires_at, notes: r.note,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
