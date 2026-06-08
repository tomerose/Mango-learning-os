/**
 * MangoOS — Admin Utilities
 *
 * Single source of truth for admin detection.
 * Used by: middleware, API routes, navigation UI, page guards.
 *
 * Configuration:
 *   ADMIN_EMAILS=admin@gmail.com,another@example.com  (in .env.local)
 *   Or: user has plan === "admin" in profiles table.
 */

export const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Check if an email belongs to an admin (via env var). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Check if a user session qualifies as admin. */
export function isAdmin(plan?: string | null, email?: string | null): boolean {
  if (plan === "admin") return true;
  if (isAdminEmail(email)) return true;
  return false;
}
