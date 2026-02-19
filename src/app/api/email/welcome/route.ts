import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
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
