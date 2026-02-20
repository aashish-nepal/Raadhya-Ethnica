import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, revokeUserSession } from "@/lib/session";

const SESSION_COOKIE = "__session";

/**
 * POST /api/auth/logout
 *
 * Revokes the user's Firebase refresh tokens (all devices) and clears
 * the __session HttpOnly cookie.
 *
 * Always returns 200 — a missing or invalid session is treated as
 * already-logged-out.
 */
export async function POST(request: NextRequest) {
    const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;

    if (cookieValue) {
        const decoded = await verifySessionCookie(cookieValue);
        if (decoded) {
            await revokeUserSession(decoded.uid);
        }
    }

    const response = NextResponse.json({ success: true });

    // Clear the session cookie
    response.cookies.set({
        name: SESSION_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
    });

    return response;
}
