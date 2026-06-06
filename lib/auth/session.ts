// ═══════════════════════════════════════════════════════════════
// Server-side auth helpers — extract user/plan from request
// Used by API routes to resolve current user context.
// ═══════════════════════════════════════════════════════════════

import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import { isSupabaseConfigured, GUEST_COOKIE } from "@/lib/supabase/config";
import type { PlanTier } from "@/lib/plan/types";

export interface SessionContext {
  userId: string | null;
  email: string | null;
  plan: PlanTier;
  planExpiresAt: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

/**
 * Resolve the current user session and plan from a NextRequest.
 * Safe to call even when Supabase is not configured.
 */
export async function resolveSession(req: NextRequest): Promise<SessionContext> {
  // No Supabase configured → always guest
  if (!isSupabaseConfigured()) {
    return {
      userId: null, email: null, plan: "guest", planExpiresAt: null,
      isAuthenticated: false, isGuest: true,
    };
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: () => {}, // no-op for read-only session check
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Explicit guest cookie → guest mode
    const isGuest = req.cookies.get(GUEST_COOKIE)?.value === "1";

    if (!user || isGuest) {
      return {
        userId: null, email: null, plan: "guest", planExpiresAt: null,
        isAuthenticated: false, isGuest: true,
      };
    }

    // Fetch user plan from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_expires_at, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    let plan: PlanTier = "standard";
    let planExpiresAt: string | null = null;

    if (profile) {
      if (profile.is_admin) plan = "admin";
      else if (profile.plan === "pro") {
        // Check expiry
        if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) {
          plan = "standard"; // expired → downgrade
        } else {
          plan = "pro";
          planExpiresAt = profile.plan_expires_at ?? null;
        }
      }
      else plan = (profile.plan as PlanTier) ?? "standard";
    }

    return {
      userId: user.id,
      email: user.email ?? null,
      plan,
      planExpiresAt,
      isAuthenticated: true,
      isGuest: false,
    };
  } catch {
    // Fail open → guest (safe fallback)
    return {
      userId: null, email: null, plan: "guest", planExpiresAt: null,
      isAuthenticated: false, isGuest: true,
    };
  }
}

/**
 * Get plan from localStorage for client-side checks.
 * This is COSMETIC only — real enforcement is server-side.
 * Priority: localStorage > cookie session > guest
 */
export function getClientPlan(): PlanTier {
  try {
    // 1. Check localStorage (set by store.tsx after login)
    const stored = localStorage.getItem("mango-user-plan");
    if (stored) return stored as PlanTier;

    // 2. Check Supabase cookie-based session (@supabase/ssr stores in cookies)
    const cookies = document.cookie.split("; ");
    const hasSession = cookies.some(c =>
      c.startsWith("sb-") && c.includes("-auth-token")
    );
    if (hasSession) return "standard"; // Logged in but plan not yet synced

    return "guest";
  } catch {
    return "guest";
  }
}

/** Persist plan to localStorage for client-side UI gating. */
export function setClientPlan(plan: PlanTier, expiresAt?: string | null) {
  try {
    localStorage.setItem("mango-user-plan", plan);
    if (expiresAt) localStorage.setItem("mango-plan-expires", expiresAt);
  } catch {}
}
