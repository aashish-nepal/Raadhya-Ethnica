"use client";

import { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

interface StripeCheckoutFormProps {
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
}

export default function StripeCheckoutForm({
    amount,
    onSuccess,
    onError,
}: StripeCheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
                redirect: "if_required",
            });

            if (error) {
                setErrorMessage(error.message || "Payment failed");
                onError(error.message || "Payment failed");
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                // Payment succeeded
                onSuccess(paymentIntent.id);
            } else {
                setErrorMessage("Payment processing failed");
                onError("Payment processing failed");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "An unexpected error occurred");
            onError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-neutral-50 p-4 rounded-lg">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!stripe || loading}
            >
                {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
            </Button>

            <p className="text-xs text-neutral-500 text-center">
                🔒 Secure payment powered by Stripe
            </p>
        </form>
    );
}
