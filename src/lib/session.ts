import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME = "__session";
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;
const FIVE_DAYS_SECONDS = FIVE_DAYS_MS / 1000;

/** Shared cookie options — used when setting and clearing the session cookie */
export const SESSION_COOKIE_OPTIONS = {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: FIVE_DAYS_SECONDS,
} as const;

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Exchange a Firebase ID token for a server-side session cookie (5-day expiry).
 * Call this from the POST /api/auth/session route after client-side login.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
    return adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });
}

/**
 * Verify a session cookie value and return the decoded token.
 * Returns null if the cookie is missing, invalid, expired, or revoked.
 */
export async function verifySessionCookie(value: string): Promise<DecodedIdToken | null> {
    try {
        // checkRevoked: true — rejects sessions whose refresh tokens were revoked via revokeUserSession()
        return await adminAuth.verifySessionCookie(value, true);
    } catch {
        return null;
    }
}

/**
 * Read the __session cookie from the current request and verify it.
 * Use inside Server Components and API Route Handlers (not middleware).
 * Returns the decoded token, or null if unauthenticated.
 */
export async function getSessionFromCookies(): Promise<DecodedIdToken | null> {
    const store = await cookies();
    const value = store.get(COOKIE_NAME)?.value;
    if (!value) return null;
    return verifySessionCookie(value);
}

/**
 * Revoke all active refresh tokens for a user (signs them out of every device).
 * Call this on logout before clearing the session cookie.
 */
export async function revokeUserSession(uid: string): Promise<void> {
    await adminAuth.revokeRefreshTokens(uid);
}
