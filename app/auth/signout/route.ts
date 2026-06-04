import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, GUEST_COOKIE } from "@/lib/supabase/config";

// Sign the user out and return to the login page. POST so it can't be
// triggered by a stray GET / link prefetch.
export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const res = NextResponse.redirect(`${origin}/login`, { status: 303 });
  // Clear any guest opt-in too, so logging out lands on a clean /login
  // instead of silently re-entering guest mode via a stale cookie.
  res.cookies.set(GUEST_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

