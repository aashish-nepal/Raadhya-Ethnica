import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/auth/session
 *
 * Exchanges a Firebase ID token (obtained after client-side login) for a
 * server-side HttpOnly session cookie valid for 5 days.
 *
 * Body: { idToken: string }
 */
export async function POST(request: NextRequest) {
    // Rate limit — 30 session requests per 15 min per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`session:${ip}`, RATE_LIMITS.SESSION);

    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
                    "X-RateLimit-Limit": String(rl.limit),
                    "X-RateLimit-Remaining": "0",
                },
            }
        );
    }

    try {
        const { idToken } = await request.json();

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json({ error: "idToken is required." }, { status: 400 });
        }

        const sessionCookie = await createSessionCookie(idToken);

        const response = NextResponse.json({ success: true });
        response.cookies.set({
            name: SESSION_COOKIE_OPTIONS.name,
            value: sessionCookie,
            httpOnly: SESSION_COOKIE_OPTIONS.httpOnly,
            secure: SESSION_COOKIE_OPTIONS.secure,
            sameSite: SESSION_COOKIE_OPTIONS.sameSite,
            maxAge: SESSION_COOKIE_OPTIONS.maxAge,
            path: SESSION_COOKIE_OPTIONS.path,
        });

        return response;
    } catch (err: any) {
        console.error("[POST /api/auth/session]", err?.message ?? err);
        return NextResponse.json({ error: "Failed to create session." }, { status: 401 });
    }
}
