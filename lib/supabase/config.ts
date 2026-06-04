// ─────────────────────────────────────────────────────────────
// Single source of truth for "is Supabase wired up yet?".
// Both NEXT_PUBLIC_* vars are inlined at build time, so this check
// works in client, server, and middleware contexts alike.
//
// When false, the whole product degrades to guest mode:
//   • middleware skips session refresh + route protection
//   • the app runs entirely on lib/store.tsx (localStorage)
// Filling .env.local flips this to true with zero code changes.
// ─────────────────────────────────────────────────────────────
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ─────────────────────────────────────────────────────────────
// Guest-mode cookie. When Supabase IS configured, middleware gates
// every app route behind a session — which would otherwise make the
// "以游客身份继续" button a dead link (redirect loop back to /login).
// Setting this cookie lets a visitor opt into guest mode: middleware
// waves them through, and the store falls back to localStorage. Users
// who want cloud sync + privacy still sign up (RLS isolation unchanged).
// ─────────────────────────────────────────────────────────────
export const GUEST_COOKIE = "mango_guest";

