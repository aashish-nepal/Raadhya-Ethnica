/**
 * In-memory sliding-window rate limiter.
 *
 * Suitable for single-instance Next.js deployments.
 * For multi-instance / serverless production, replace the Map with
 * a Redis adapter (e.g., Upstash @upstash/ratelimit).
 */

interface Entry {
    count: number;
    resetAt: number;
}

const store = new Map<string, Entry>();

// Remove expired entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key);
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /** Maximum requests allowed within the window */
    limit: number;
    /** Window length in milliseconds */
    windowMs: number;
}

export interface RateLimitResult {
    /** Whether the request is allowed */
    success: boolean;
    limit: number;
    remaining: number;
    /** Unix ms timestamp when the window resets */
    resetAt: number;
}

/**
 * Check whether a given key (typically an IP address) is within limits.
 * Returns immediately — no async, no external calls.
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const entry = store.get(key);

    // Fresh window — first request or previous window expired
    if (!entry || entry.resetAt < now) {
        const next: Entry = { count: 1, resetAt: now + config.windowMs };
        store.set(key, next);
        return { success: true, limit: config.limit, remaining: config.limit - 1, resetAt: next.resetAt };
    }

    if (entry.count >= config.limit) {
        return { success: false, limit: config.limit, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Extract the real client IP address from Next.js request headers.
 * Respects X-Forwarded-For (set by proxies/CDNs) and X-Real-IP.
 */
export function getClientIp(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}

/** Preset rate-limit configurations for common routes */
export const RATE_LIMITS = {
    /** 5 login attempts per 15 min per IP — brute-force protection */
    AUTH: { limit: 5, windowMs: 15 * 60 * 1000 },
    /** 30 session refreshes per 15 min per IP */
    SESSION: { limit: 30, windowMs: 15 * 60 * 1000 },
    /** 10 payment requests per minute per IP */
    PAYMENT: { limit: 10, windowMs: 60 * 1000 },
    /** 3 newsletter subscriptions per hour per IP */
    NEWSLETTER: { limit: 3, windowMs: 60 * 60 * 1000 },
    /** 30 general API calls per minute per IP */
    GENERAL: { limit: 30, windowMs: 60 * 1000 },
} as const;
