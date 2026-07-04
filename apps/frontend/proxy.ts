import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require auth
const PUBLIC_ROUTES = ["/login", "/register"];

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ["/login", "/register"];

/**
 * Next.js 16 proxy (formerly middleware).
 *
 * Responsibility: OPTIMISTIC cookie check only — fast redirect before render.
 * This is NOT a security boundary. Real auth is enforced by the backend AuthGuard
 * on every API call. Never trust this layer alone.
 *
 * Cookie: devforge_session=1 (set on login, cleared on logout)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("devforge_session")?.value;
  const isAuthenticated = session === "1";

  // Let static assets, api routes, and Next internals pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Unauthenticated user trying to access protected route → redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/register → redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon, icons
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
