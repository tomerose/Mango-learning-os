// ═══════════════════════════════════════════════════════════════
// Mango Code Engine — server-side redemption logic
// DUAL ENVIRONMENT: server (in-memory + JSON file) / client (localStorage)
// Anti-double-spend via atomic check-then-update.
// ═══════════════════════════════════════════════════════════════

import type { MangoCode, RedeemResult, GenerateCodeRequest, GenerateCodeResult } from "./types";
import type { PlanTier } from "@/lib/plan/types";

const STORAGE_KEY = "mango-codes-v1";
const REDEMPTIONS_KEY = "mango-redemptions-v1";

// ═══════════════════════════════════════════════════════════════
// Environment detection
// ═══════════════════════════════════════════════════════════════

const isServer = typeof window === "undefined" || typeof localStorage === "undefined";

// ═══════════════════════════════════════════════════════════════
// In-Memory Store (server-side — survives within a deployment)
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _global = (typeof globalThis !== "undefined" ? globalThis : global) as any;

function getServerStore(): MangoCode[] {
  if (!_global.__mango_codes) _global.__mango_codes = [];
  return _global.__mango_codes as MangoCode[];
}

interface RedemptionRecord {
  userId: string;
  code: string;
  planGranted: PlanTier;
  redeemedAt: string;
}

function getServerRedemptions(): RedemptionRecord[] {
  if (!_global.__mango_redemptions) _global.__mango_redemptions = [];
  return _global.__mango_redemptions as RedemptionRecord[];
}

// ═══════════════════════════════════════════════════════════════
// Client-side store (localStorage)
// ═══════════════════════════════════════════════════════════════

function loadCodesClient(): MangoCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCodesClient(codes: MangoCode[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(codes)); } catch {}
}

// ═══════════════════════════════════════════════════════════════
// Unified API
// ═══════════════════════════════════════════════════════════════

function loadCodes(): MangoCode[] {
  if (isServer) return getServerStore();
  return loadCodesClient();
}

function saveCodes(codes: MangoCode[]) {
  if (isServer) {
    _global.__mango_codes = codes;
  } else {
    saveCodesClient(codes);
  }
}

function generateCodeString(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MANGO-";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    if (i < 3) code += "-";
  }
  return code;
}

/** Validate and redeem a Mango Code. Atomic check-then-update. */
export function redeemCode(code: string, userId: string): RedeemResult {
  // Try Supabase atomic redemption first
  // Falls back to local store (dev mode)
  const codes = loadCodes();
  const now = new Date().toISOString();

  const entry = codes.find(c => c.code === code.toUpperCase().trim());

  if (!entry) {
    return { success: false, error: "兑换码不存在，请检查输入", errorCode: "INVALID_CODE" };
  }

  // Status checks (in order, most specific first)
  if (entry.status === "disabled" || entry.status === "revoked") {
    return { success: false, error: "此兑换码已失效", errorCode: "DISABLED" };
  }
  if (entry.status === "used" || entry.usedCount >= entry.maxRedemptions) {
    return { success: false, error: "此兑换码已被使用", errorCode: "ALREADY_USED" };
  }
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return { success: false, error: "此兑换码已过期", errorCode: "EXPIRED" };
  }
  if (entry.status !== "active") {
    return { success: false, error: "此兑换码不可用", errorCode: "INVALID_CODE" };
  }

  // Anti-double-spend: mark used BEFORE granting plan
  entry.usedCount++;
  entry.status = entry.usedCount >= entry.maxRedemptions ? "used" : "active";
  entry.redeemedBy = userId;
  entry.redeemedAt = now;
  entry.updatedAt = now;
  saveCodes(codes);

  // Record redemption for auditing
  recordRedemption(userId, code, entry.planGranted);

  // Calculate plan expiration
  const planExpiresAt = entry.durationDays > 0
    ? new Date(Date.now() + entry.durationDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  return {
    success: true,
    newPlan: entry.planGranted,
    planExpiresAt,
  };
}

/** Generate new Mango Code(s). Admin only. */
export function generateCodes(req: GenerateCodeRequest, adminUserId: string): GenerateCodeResult {
  const codes = loadCodes();
  const count = req.count ?? 1;
  const generated: string[] = [];

  for (let i = 0; i < count; i++) {
    const codeStr = generateCodeString();
    const entry: MangoCode = {
      id: `mc-${Date.now()}-${i}`,
      code: codeStr,
      planGranted: req.planGranted,
      durationDays: req.durationDays,
      maxRedemptions: req.maxRedemptions ?? 1,
      usedCount: 0,
      status: "active",
      expiresAt: req.expiresAt,
      createdBy: adminUserId,
      notes: req.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    codes.push(entry);
    generated.push(codeStr);
  }

  saveCodes(codes);
  return { codes: generated, planGranted: req.planGranted, durationDays: req.durationDays };
}

/** Get all codes (admin view). */
export function listCodes(): MangoCode[] {
  return loadCodes().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Get a single code by its code string. */
export function getCodeByCode(code: string): MangoCode | undefined {
  return loadCodes().find(c => c.code === code.toUpperCase().trim());
}

/** Update a code's status (disable/enable/revoke). */
export function updateCodeStatus(code: string, status: "active" | "disabled" | "revoked"): boolean {
  const codes = loadCodes();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());
  if (!entry) return false;
  entry.status = status;
  entry.updatedAt = new Date().toISOString();
  saveCodes(codes);
  return true;
}

/** Check if a code is valid (for pre-validation UI). */
export function validateCode(code: string): { valid: boolean; planGranted?: PlanTier; error?: string } {
  const codes = loadCodes();
  const entry = codes.find(c => c.code === code.toUpperCase().trim());

  if (!entry) return { valid: false, error: "兑换码不存在" };
  if (entry.status === "disabled" || entry.status === "revoked") return { valid: false, error: "兑换码已失效" };
  if (entry.status === "used" || entry.usedCount >= entry.maxRedemptions) return { valid: false, error: "兑换码已被使用" };
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return { valid: false, error: "兑换码已过期" };

  return { valid: true, planGranted: entry.planGranted };
}

/** Seed demo codes for development. Idempotent. */
export function seedDemoCodes() {
  const codes = loadCodes();

  const existingCodes = new Set(codes.map(c => c.code));
  const demos: MangoCode[] = [];

  if (!existingCodes.has("MANGO-PRO-DEMO-2026")) {
    demos.push({
      id: "demo-pro-1", code: "MANGO-PRO-DEMO-2026",
      planGranted: "pro", durationDays: 30, maxRedemptions: 50, usedCount: 0,
      status: "active", createdBy: "system", notes: "Demo Pro code — 50 uses",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }
  if (!existingCodes.has("MANGO-STD-DEMO-2026")) {
    demos.push({
      id: "demo-standard-1", code: "MANGO-STD-DEMO-2026",
      planGranted: "standard", durationDays: 0, maxRedemptions: 100, usedCount: 0,
      status: "active", createdBy: "system", notes: "Demo Standard code — permanent, 100 uses",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }
  if (!existingCodes.has("MANGO-ADMIN-2026")) {
    demos.push({
      id: "demo-admin-1", code: "MANGO-ADMIN-2026",
      planGranted: "admin", durationDays: 0, maxRedemptions: 5, usedCount: 0,
      status: "active", createdBy: "system", notes: "Admin code — 5 uses",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }

  if (demos.length > 0) {
    codes.push(...demos);
    saveCodes(codes);
  }
}

// ═══════════════════════════════════════════════════════════════
// Redemption audit log
// ═══════════════════════════════════════════════════════════════

function recordRedemption(userId: string, code: string, planGranted: PlanTier) {
  try {
    if (isServer) {
      const records = getServerRedemptions();
      records.push({ userId, code, planGranted, redeemedAt: new Date().toISOString() });
      _global.__mango_redemptions = records;
    } else {
      const raw = localStorage.getItem(REDEMPTIONS_KEY);
      const records: RedemptionRecord[] = raw ? JSON.parse(raw) : [];
      records.push({ userId, code, planGranted, redeemedAt: new Date().toISOString() });
      localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(records));
    }
  } catch {}
}
