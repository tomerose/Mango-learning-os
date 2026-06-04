import { NextResponse } from "next/server";
import { GUEST_COOKIE } from "@/lib/supabase/config";

// Server-side guest-mode opt-in. Sets the mango_guest cookie then redirects
// to the dashboard. This is more reliable than document.cookie + router.push()
// because the cookie is set by the server, guaranteeing the middleware sees it
// on the very next request.
export async function GET() {
  const res = NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_SITE_URL ?? "https://mango-learning-os.vercel.app"));
  res.cookies.set(GUEST_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false, // the middleware reads this cookie
  });
  return res;
}
