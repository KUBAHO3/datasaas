import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "./lib/constants";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE);
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/verify-email",
    "/auth/google-callback",
    "/auth/reset-password",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const protectedRoutes = [
    "/admin",
    "/org",
    "/onboarding",
    "/pending-approval",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isHomepage = pathname === "/";

  if (!session && !isPublicRoute && !isHomepage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
