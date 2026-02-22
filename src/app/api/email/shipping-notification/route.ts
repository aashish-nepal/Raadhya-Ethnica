import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";
import { sendShippingNotificationEmail } from "@/lib/email";

async function requireAdmin(): Promise<boolean> {
    const session = await getSessionFromCookies();
    if (!session) return false;
    // Use UID-based lookup — admin-only action (triggered from admin panel)
    const doc = await adminDb.collection("customers").doc(session.uid).get();
    return doc.exists && doc.data()?.role === "admin";
}

export async function POST(request: NextRequest) {
    // Shipping notifications are dispatched by admins only
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
