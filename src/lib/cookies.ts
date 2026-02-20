/**
 * Client-side cookie utilities.
 *
 * These helpers only work in the browser (document.cookie).
 * For the HttpOnly admin session cookie, see src/lib/session.ts.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CookieOptions {
    /** Seconds until expiry (default: 1 year) */
    maxAge?: number;
    sameSite?: "strict" | "lax" | "none";
    /** Only send over HTTPS (default: auto-detected from location.protocol) */
    secure?: boolean;
    path?: string;
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

/** Set a client-accessible cookie with secure defaults. */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
    const {
        maxAge = 365 * 24 * 60 * 60,
        sameSite = "lax",
        secure = typeof window !== "undefined" && window.location.protocol === "https:",
        path = "/",
    } = options;

    const parts = [
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        `max-age=${maxAge}`,
        `path=${path}`,
        `SameSite=${sameSite}`,
    ];

    if (secure) parts.push("Secure");

    document.cookie = parts.join("; ");
}

/** Read a cookie value by name. Returns null when not found or in SSR. */
export function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const key = `${encodeURIComponent(name)}=`;
    const match = document.cookie.split("; ").find((row) => row.startsWith(key));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/** Delete a cookie by name. */
export function deleteCookie(name: string, path = "/"): void {
    document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=${path}; SameSite=lax`;
}

// ─── Cookie consent ───────────────────────────────────────────────────────────

export const CONSENT_COOKIE = "cookie_consent";
export type ConsentStatus = "accepted" | "rejected" | "pending";

/** Read the current cookie-consent preference. Returns "pending" if not yet set. */
export function getConsentStatus(): ConsentStatus {
    const val = getCookie(CONSENT_COOKIE);
    if (val === "accepted" || val === "rejected") return val;
    return "pending";
}

/** Persist the user's cookie-consent choice for 1 year. */
export function setConsentStatus(status: "accepted" | "rejected"): void {
    setCookie(CONSENT_COOKIE, status, {
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
        path: "/",
    });
}
