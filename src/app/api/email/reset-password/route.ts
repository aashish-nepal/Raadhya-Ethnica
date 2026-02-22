import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Missing email" }, { status: 400 });
        }

        // Generate the Firebase password reset link server-side using Admin SDK.
        // This gives us a real Firebase reset link but lets us send it
        // via our own email domain (Gmail SMTP) instead of Firebase's noreply@firebaseapp.com.
        let resetLink: string;
        try {
            resetLink = await adminAuth.generatePasswordResetLink(email);
        } catch (err: any) {
            // User not found — return a generic 200 to avoid email enumeration
            if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
                return NextResponse.json({ success: true });
            }
            throw err;
        }

        const result = await sendPasswordResetEmail(email, resetLink);

        if (!result.success) {
            console.error("Failed to send password reset email:", result.error);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Password reset email route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
