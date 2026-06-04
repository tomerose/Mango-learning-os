import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// OAuth / email-confirmation callback. Supabase redirects here with a
// `code` query param; we exchange it for a session cookie, then send the
// user on to their original destination (or the dashboard).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, not configured, or exchange failed → back to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
