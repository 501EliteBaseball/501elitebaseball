import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];
const PROTECTED_PAGES = ["/dashboard"];

function buildSupabaseClient(req: NextRequest, res: NextResponse) {
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: async () => {
        const cookiePairs: { name: string; value: string }[] = [];
        const cookies = await req.cookies.getAll();
        cookies.forEach(({ name, value }) => cookiePairs.push({ name, value }));
        return cookiePairs;
      },
      setAll: async (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          res.headers.set(name, value);
        });
      },
    },
  });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = buildSupabaseClient(req, response);
  const { data } = await supabase.auth.getSession();
  const isAuthenticated = Boolean(data?.session);

  if (PROTECTED_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (AUTH_PAGES.some((path) => pathname === path)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password"],
};
