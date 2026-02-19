import { NextRequest, NextResponse } from "next/server";
import { sendShippingNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, details } = body;

        if (!email || !details?.orderNumber || !details?.trackingNumber) {
            return NextResponse.json(
                { error: "Missing email, orderNumber, or trackingNumber" },
                { status: 400 }
            );
        }

        const result = await sendShippingNotificationEmail(email, details);

        if (!result.success) {
            return NextResponse.json({ error: "Failed to send shipping email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Shipping notification email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
