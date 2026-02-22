import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from "@/lib/email";

export async function POST(request: NextRequest) {
    // Require a valid Firebase ID token — only authenticated users can trigger emails
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
        const { email, orderDetails } = body;

        if (!email || !orderDetails) {
            return NextResponse.json({ error: "Missing email or orderDetails" }, { status: 400 });
        }

        // Send confirmation to customer
        const customerResult = await sendOrderConfirmationEmail(email, orderDetails);

        // Send alert to admin (fire-and-forget, don't fail if admin email missing)
        sendAdminOrderAlert({
            orderId: orderDetails.orderId,
            orderNumber: orderDetails.orderId,
            customerName: orderDetails.customerName,
            customerEmail: email,
            items: orderDetails.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                color: item.color || item.selectedColor || undefined,
                size: item.size || item.selectedSize || undefined,
            })),
            total: orderDetails.total,
            shippingAddress: orderDetails.shippingAddress,
            paymentMethod: orderDetails.paymentMethod || "stripe",
        }).catch(console.error);

        if (!customerResult.success) {
            return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Order confirmation email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
