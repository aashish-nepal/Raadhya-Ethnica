import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "__session";

/**
 * Middleware — runs on the Edge runtime (no Node.js APIs).
 *
 * Strategy:
 *  1. Let /admin/login and /api/auth/* pass through unconditionally.
 *  2. For all other /admin/* paths, require the __session cookie to be present.
 *     If missing → redirect to /admin/login with a returnTo param.
 *
 * Full token verification (Firebase Admin SDK) happens server-side in
 * AdminLayout and the API route handlers — not here, because the Edge
 * runtime cannot execute Firebase Admin SDK code.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public paths — always allow
    if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
        return NextResponse.next();
    }

    // Require session cookie for all other /admin/* paths
    if (!request.cookies.get(SESSION_COOKIE)?.value) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
