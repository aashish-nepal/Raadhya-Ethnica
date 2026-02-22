import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { createPaymentIntent } from "@/lib/stripe";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const intentSchema = z.object({
    amount: z.number().positive().max(999999), // max ~$9,999.99
    currency: z.string().length(3).default("AUD"),
    metadata: z.record(z.string()).optional(),
    customerEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rl = rateLimit(`stripe:${ip}`, RATE_LIMITS.PAYMENT);
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

    // Authenticate the regular customer via Firebase ID token in Authorization header
    // Regular users don't have an admin __session cookie — they send their Firebase ID token
    const authHeader = request.headers.get("Authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = intentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { amount, currency, metadata, customerEmail } = parsed.data;
        const amountInCents = Math.round(amount * 100);

        const result = await createPaymentIntent({
            amount: amountInCents,
            currency,
            metadata: {
                ...metadata,
                userId: decodedToken.uid,
            },
            customerEmail: customerEmail || decodedToken.email || undefined,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to create payment intent" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntent?.id,
        });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
