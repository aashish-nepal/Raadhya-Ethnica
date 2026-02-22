import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    // Require a valid Firebase ID token — only newly registered users can trigger this
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
        const { email, name } = body;

        if (!email || !name) {
            return NextResponse.json({ error: "Missing email or name" }, { status: 400 });
        }

        const result = await sendWelcomeEmail(email, name);

        if (!result.success) {
            return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Welcome email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
