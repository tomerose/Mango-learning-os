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

  const res = NextResponse.redirect(`${origin}/hub`, { status: 303 });
  // Set guest + visited cookies so user seamlessly enters guest mode after logout
  const cookieOpts = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const, httpOnly: false };
  res.cookies.set(GUEST_COOKIE, "1", cookieOpts);
  res.cookies.set("mango_visited", "1", cookieOpts);
  return res;
}

