import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Browser-side Supabase client (Client Components).
// Safe to call repeatedly — createBrowserClient memoizes internally.
// IMPORTANT: Only call this when isSupabaseConfigured() is true.
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "createClient() called but Supabase is not configured. Check isSupabaseConfigured() first."
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
