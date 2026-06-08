// ═══════════════════════════════════════════════════════════════
// Mango Code — Single-use Upgrade Code System
// Codes are single-use by default. Server-side validated.
// Anti-double-spend: atomic DB transaction with row-level lock.
// ═══════════════════════════════════════════════════════════════

import type { PlanTier } from "@/lib/plan/types";

export type MangoCodeStatus = "active" | "used" | "expired" | "disabled" | "revoked";

export interface MangoCode {
  id: string;
  code: string;
  planGranted: PlanTier;
  durationDays: number; // 0 = permanent
  maxRedemptions: number; // 1 = single-use
  usedCount: number;
  status: MangoCodeStatus;
  expiresAt?: string; // ISO date — code itself expires
  createdBy: string; // admin user ID
  redeemedBy?: string; // user ID who redeemed
  redeemedAt?: string; // ISO timestamp
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RedeemResult {
  success: boolean;
  error?: string;
  errorCode?: "INVALID_CODE" | "ALREADY_USED" | "EXPIRED" | "DISABLED" | "CONFLICT" | "SERVER_ERROR";
  newPlan?: PlanTier;
  planExpiresAt?: string;
  extendedFrom?: string; // previous expiration date (for stacking)
}

export interface RedeemRequest {
  code: string;
}

export interface GenerateCodeRequest {
  planGranted: string; // "free" | "standard" | "pro" | "admin"
  durationDays?: number;
  durationType?: string;  // "days" | "month" | "year" | "lifetime"
  maxRedemptions?: number;
  maxUses?: number;
  expiresAt?: string;
  notes?: string;
  count?: number; // batch generate
}

export interface GenerateCodeResult {
  codes: string[];
  planGranted: PlanTier;
  durationDays: number;
}
