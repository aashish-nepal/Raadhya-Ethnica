import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const subscribeSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
    // Rate limit: 3 subscriptions per hour per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`newsletter:${ip}`, RATE_LIMITS.NEWSLETTER);
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
                },
            }
        );
    }

    try {
        const body = await request.json();
        const parsed = subscribeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email, name } = parsed.data;

        const result = await sendNewsletterWelcomeEmail(email, name);

        if (!result.success) {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Successfully subscribed to newsletter",
        });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
