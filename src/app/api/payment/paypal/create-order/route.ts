import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { createPayPalOrder } from "@/lib/paypal";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const itemSchema = z.object({
    name: z.string().min(1).max(200),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
});

const addressSchema = z.object({
    name: z.string().max(100).optional(),
    addressLine1: z.string().max(200).optional(),
    addressLine2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string().max(20).optional(),
});

const orderSchema = z.object({
    amount: z.number().positive().max(999999),
    currency: z.string().length(3).default("USD"),
    items: z.array(itemSchema).min(1).max(100),
    shippingAddress: addressSchema.optional(),
});

export async function POST(request: NextRequest) {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rl = rateLimit(`paypal:${ip}`, RATE_LIMITS.PAYMENT);
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

    // Authenticate regular customer via Firebase ID token in Authorization header
    const authHeader = request.headers.get("Authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await adminAuth.verifyIdToken(idToken);
    } catch {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = orderSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { amount, currency, items, shippingAddress } = parsed.data;
        const amountInCents = Math.round(amount * 100);

        const result = await createPayPalOrder({
            amount: amountInCents,
            currency,
            items: items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unit_amount: Math.round(item.price * 100),
            })),
            shippingAddress: shippingAddress
                ? {
                    name: shippingAddress.name ?? "",
                    addressLine1: shippingAddress.addressLine1 ?? "",
                    addressLine2: shippingAddress.addressLine2,
                    city: shippingAddress.city ?? "",
                    state: shippingAddress.state ?? "",
                    postalCode: shippingAddress.pincode ?? "",
                    countryCode: "AU",
                }
                : undefined,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to create PayPal order" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            orderId: result.orderId,
            order: result.order,
        });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
