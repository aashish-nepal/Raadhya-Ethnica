import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        const result = await capturePayPalOrder(orderId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error?.message || "Failed to capture PayPal payment" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            capture: result.capture,
        });
    } catch (error: any) {
        console.error("PayPal capture error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
