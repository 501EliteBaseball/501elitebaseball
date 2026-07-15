import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];
const PROTECTED_PAGES = ["/dashboard"];

function buildSupabaseClient(req: NextRequest, res: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
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

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = buildSupabaseClient(req, response);
  const { data } = await supabase.auth.getSession();
  const isAuthenticated = Boolean(data?.session);

  if (PROTECTED_PAGES.some((path) => pathname === path)) {
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
  matcher: ["/dashboard", "/login", "/register", "/forgot-password"],
};
