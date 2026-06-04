import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client (Client Components).
// Safe to call repeatedly — createBrowserClient memoizes internally.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
