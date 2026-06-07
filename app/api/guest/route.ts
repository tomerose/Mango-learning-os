import { NextResponse } from "next/server";
import { GUEST_COOKIE } from "@/lib/supabase/config";

// Server-side guest-mode opt-in. Uses relative redirect so it works on
// any domain (Vercel, tunnel, custom domain) without hardcoding URLs.
export async function GET() {
  const response = new NextResponse(null, { status: 307 });
  response.headers.set("Location", "/hub");
  response.cookies.set(GUEST_COOKIE, "1", {
    path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: false,
  });
  response.cookies.set("mango_visited", "1", {
    path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: false,
  });
  return response;
}
