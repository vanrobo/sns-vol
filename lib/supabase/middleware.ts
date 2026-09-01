import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

function redirectTo(request: NextRequest, pathname: string, keepSearch = false) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (!keepSearch) url.search = "";
  return NextResponse.redirect(url);
}

const EVENT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabaseEnv();
  const path = request.nextUrl.pathname;
  const eventId = request.nextUrl.searchParams.get("id");

  // Legacy share links: /login?id=uuid → public event page
  if (
    eventId &&
    EVENT_ID_RE.test(eventId) &&
    (path === "/login" || path === "/signup")
  ) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/event";
    return NextResponse.redirect(dest);
  }

  const isEventPage = path === "/event" || path.startsWith("/event/");
  const isAuthPage = path === "/login" || path === "/signup";
  const isCronRoute = path.startsWith("/api/cron");
  const isPublicPage =
    isEventPage ||
    path.startsWith("/verify/") ||
    path.startsWith("/_next") ||
    path.includes(".");

  if (!url || !key || url.includes("YOUR_PROJECT")) {
    if (!isAuthPage && path !== "/" && !isEventPage && !isPublicPage) {
      return redirectTo(request, "/login");
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isPublic =
      isAuthPage ||
      isPublicPage ||
      isCronRoute ||
      path.startsWith("/favicon");

    if (!user && !isPublic) {
      return redirectTo(request, "/login");
    }

    let profile: { role: string; status: string } | null = null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();
      profile = data;
    }

    if (user && isAuthPage) {
      if (profile?.role === "admin") return redirectTo(request, "/admin");
      if (profile?.role === "organiser") return redirectTo(request, "/");
      if (profile?.role === "volunteer" && profile.status === "pending") {
        return redirectTo(request, "/pending");
      }
      return redirectTo(request, "/");
    }

    if (user && path.startsWith("/admin")) {
      if (profile?.role !== "admin") {
        return redirectTo(request, "/");
      }
    }

    if (user && path.startsWith("/organiser")) {
      if (profile?.role !== "admin" && profile?.role !== "organiser") {
        return redirectTo(request, "/");
      }
    }

    const pendingAllowed =
      path === "/pending" ||
      path === "/profile" ||
      path === "/settings" ||
      path === "/notifications" ||
      path === "/applications" ||
      path === "/login" ||
      path === "/signup" ||
      isPublicPage;

    if (
      user &&
      profile?.role === "volunteer" &&
      profile.status === "pending" &&
      !pendingAllowed
    ) {
      return redirectTo(request, "/pending");
    }

    if (
      user &&
      profile?.status === "active" &&
      path === "/pending"
    ) {
      return redirectTo(request, "/");
    }

    return supabaseResponse;
  } catch (err) {
    console.error("Supabase middleware error:", err);
    if (!isAuthPage && path !== "/" && !isEventPage) {
      return redirectTo(request, "/login");
    }
    return NextResponse.next({ request });
  }
}
