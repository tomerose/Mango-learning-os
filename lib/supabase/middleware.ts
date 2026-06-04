import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, GUEST_COOKIE } from "@/lib/supabase/config";

// Refreshes the Supabase auth session on every request and (optionally)
// gates protected routes. Wire this up from the root middleware.ts.
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  // No Supabase env configured yet → no-op, app runs in guest mode.
  if (!isSupabaseConfigured()) {
    return response;
  }

  try {
    let res = response;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            res = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: do not run code between createServerClient and getUser().
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    // If Supabase is unreachable (DNS, network, wrong URL), getUser()
    // returns an error rather than throwing. Degrade to guest mode so the
    // app stays up while the operator fixes credentials.
    if (getUserError) {
      console.error("[middleware] getUser error:", getUserError.message);
      return response; // let the request through, store runs in guest mode
    }

    // Route protection — only active when Supabase is configured, so guest
    // mode (no creds) never locks anyone out. Unauthenticated users hitting
    // an app route are redirected to /login; auth pages stay public.
    const path = request.nextUrl.pathname;
    const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
    const isAuthApi = path.startsWith("/auth");

    // A visitor who explicitly chose "继续以游客身份" carries this cookie —
    // wave them through so the guest button isn't a redirect loop. They run
    // on localStorage; signing up later switches them to cloud + RLS.
    const isGuest = request.cookies.get(GUEST_COOKIE)?.value === "1";

    if (!user && !isGuest && !isAuthPage && !isAuthApi) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", path);
      return NextResponse.redirect(url);
    }

    // Already signed in but sitting on an auth page → send to dashboard.
    if (user && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return res;
  } catch (err) {
    // Middleware must never crash — a single throw takes down every request.
    // Log the error so the operator can diagnose, then serve in guest mode.
    console.error(
      "[middleware] unexpected error (falling back to guest mode):",
      err instanceof Error ? err.message : err
    );
    return response;
  }
}
