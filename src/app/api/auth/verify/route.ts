import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/session";

const SESSION_COOKIE = "__session";

/**
 * GET /api/auth/verify
 *
 * Reads and verifies the __session HttpOnly cookie.
 *
 * Returns:
 *   200  { uid, email, admin }  — valid session
 *   401  { error }              — missing, invalid, expired, or revoked session
 */
export async function GET(request: NextRequest) {
    const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;

    if (!cookieValue) {
        return NextResponse.json({ error: "No session cookie." }, { status: 401 });
    }

    const decoded = await verifySessionCookie(cookieValue);

    if (!decoded) {
        return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    return NextResponse.json({
        uid: decoded.uid,
        email: decoded.email ?? null,
        admin: decoded.admin === true,
    });
}
