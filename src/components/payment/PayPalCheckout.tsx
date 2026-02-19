"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalCheckoutProps {
    amount: number;
    currency: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    shippingAddress: any;
    onSuccess: (orderId: string) => void;
    onError: (error: string) => void;
}

export default function PayPalCheckout({
    amount,
    currency,
    items,
    shippingAddress,
    onSuccess,
    onError,
}: PayPalCheckoutProps) {
    const [loading, setLoading] = useState(false);

    const createOrder = async () => {
        try {
            const response = await fetch("/api/payment/paypal/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    currency,
                    items,
                    shippingAddress,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create PayPal order");
            }

            return data.orderId;
        } catch (error: any) {
            onError(error.message);
            throw error;
        }
    };

    const onApprove = async (data: any) => {
        try {
            setLoading(true);

            const response = await fetch("/api/payment/paypal/capture", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: data.orderID,
                }),
            });

            const captureData = await response.json();

            if (!response.ok) {
                throw new Error(captureData.error || "Failed to capture payment");
            }

            onSuccess(data.orderID);
        } catch (error: any) {
            onError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onErrorHandler = (err: any) => {
        console.error("PayPal error:", err);
        onError("PayPal payment failed. Please try again.");
    };

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                PayPal is not configured. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to your environment variables.
            </div>
        );
    }

    return (
        <PayPalScriptProvider
            options={{
                clientId,
                currency,
                intent: "capture",
            }}
        >
            <div className="space-y-4">
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onErrorHandler}
                    disabled={loading}
                    style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "paypal",
                    }}
                />

                <p className="text-xs text-neutral-500 text-center">
                    🔒 Secure payment powered by PayPal
                </p>
            </div>
        </PayPalScriptProvider>
    );
}
