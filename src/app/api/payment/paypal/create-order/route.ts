import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = "USD", items, shippingAddress } = body;

        if (!amount || !items || items.length === 0) {
            return NextResponse.json(
                { error: "Amount and items are required" },
                { status: 400 }
            );
        }

        // Convert amount to cents
        const amountInCents = Math.round(amount * 100);

        const result = await createPayPalOrder({
            amount: amountInCents,
            currency,
            items: items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                unit_amount: Math.round(item.price * 100),
            })),
            shippingAddress: shippingAddress
                ? {
                    name: shippingAddress.name,
                    addressLine1: shippingAddress.addressLine1,
                    addressLine2: shippingAddress.addressLine2,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postalCode: shippingAddress.pincode,
                    countryCode: "AU", // Australia
                }
                : undefined,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error?.message || "Failed to create PayPal order" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            orderId: result.orderId,
            order: result.order,
        });
    } catch (error: any) {
        console.error("PayPal order creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
