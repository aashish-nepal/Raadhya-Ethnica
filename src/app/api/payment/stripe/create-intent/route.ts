import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = "USD", metadata, customerEmail } = body;

        if (!amount) {
            return NextResponse.json(
                { error: "Amount is required" },
                { status: 400 }
            );
        }

        // Convert amount to cents
        const amountInCents = Math.round(amount * 100);

        console.log('Creating payment intent:', { amountInCents, currency, customerEmail });

        const result = await createPaymentIntent({
            amount: amountInCents,
            currency,
            metadata,
            customerEmail,
        });

        if (!result.success) {
            console.error('Payment intent creation failed:', result.error);
            return NextResponse.json(
                { error: result.error?.message || "Failed to create payment intent" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntent?.id,
        });
    } catch (error: any) {
        console.error("Payment intent creation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
