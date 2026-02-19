import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow access to login page
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    // For all other admin routes, authentication is handled by the layout component
    // This middleware just ensures the routes are accessible
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
