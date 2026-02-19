import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Send welcome email
        const result = await sendNewsletterWelcomeEmail(email, name);

        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to send email" },
                { status: 500 }
            );
        }

        // TODO: Add email to newsletter database/service

        return NextResponse.json({
            success: true,
            message: "Successfully subscribed to newsletter",
        });
    } catch (error) {
        console.error("Newsletter subscription error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
