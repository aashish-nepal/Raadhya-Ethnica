import Stripe from "stripe";

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
});

export interface CreatePaymentIntentOptions {
    amount: number; // in smallest currency unit (cents)
    currency: string;
    metadata?: Record<string, string>;
    customerEmail?: string;
}

/**
 * Create a Stripe PaymentIntent
 */
export async function createPaymentIntent(options: CreatePaymentIntentOptions) {
    try {
        // Validate credentials
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("❌ Stripe secret key not configured");
            return {
                success: false,
                error: new Error("Stripe not configured"),
            };
        }

        // Check for mock credentials (exact match only)
        if (process.env.STRIPE_SECRET_KEY === "sk_test_mock" ||
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === "pk_test_mock") {
            console.error("❌ Stripe is using mock credentials. Please add real Stripe API keys to .env.local");
            return {
                success: false,
                error: new Error("Stripe mock credentials detected. Please configure real API keys."),
            };
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: options.amount,
            currency: options.currency,
            metadata: options.metadata || {},
            receipt_email: options.customerEmail,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            success: true,
            paymentIntent,
            clientSecret: paymentIntent.client_secret,
        };
    } catch (error: any) {
        console.error("❌ Stripe payment intent creation failed:", error.message || error);
        return {
            success: false,
            error,
        };
    }
}

/**
 * Retrieve a PaymentIntent by ID
 */
export async function getPaymentIntent(paymentIntentId: string) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return {
            success: true,
            paymentIntent,
        };
    } catch (error: any) {
        console.error("❌ Failed to retrieve payment intent:", error.message);
        return {
            success: false,
            error,
        };
    }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
): Stripe.Event | null {
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("❌ Stripe webhook secret not configured");
            return null;
        }

        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
        );

        return event;
    } catch (error: any) {
        console.error("❌ Webhook signature verification failed:", error.message);
        return null;
    }
}
