import { NextResponse } from "next/server";
import { GUEST_COOKIE } from "@/lib/supabase/config";

// Server-side guest-mode opt-in. Uses relative redirect so it works on
// any domain (Vercel, tunnel, custom domain) without hardcoding URLs.
export async function GET() {
  const res = NextResponse.redirect(new URL("/dashboard", "http://localhost"));
  // Strip the origin so the redirect is relative to the current domain
  const location = res.headers.get("location") ?? "/dashboard";
  const path = new URL(location).pathname + new URL(location).search;
  const final = NextResponse.redirect(new URL(path, "http://localhost"), { status: 307 });
  // Use raw header manipulation for a proper relative redirect
  const response = new NextResponse(null, { status: 307 });
  response.headers.set("Location", path);
  response.cookies.set(GUEST_COOKIE, "1", {
    path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: false,
  });
  return response;
}
