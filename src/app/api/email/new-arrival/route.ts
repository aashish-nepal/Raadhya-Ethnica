import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";
import { sendNewArrivalEmail } from "@/lib/email";

/**
 * POST /api/email/new-arrival
 *
 * Called by the admin panel after a product with isNewArrival=true is saved.
 * Sends a "New Arrival" promotional email to:
 *   1. All active newsletter subscribers
 *   2. All customers who have previously placed at least one order
 *
 * Auth: Requires a valid __session admin cookie.
 */
export async function POST(request: NextRequest) {
    // ── Auth guard (admin session cookie) ──────────────────────────────────
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifySessionCookie(sessionCookie);
    if (!decoded) {
        return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { productName, price, originalPrice, discount, imageUrl, slug, shortDescription } = body;

    if (!productName || price == null || !slug) {
        return NextResponse.json({ error: "Missing required fields: productName, price, slug" }, { status: 400 });
    }

    try {
        // ── 1. Fetch newsletter subscriber emails ───────────────────────────
        const newsletterSnap = await adminDb
            .collection("newsletter")
            .where("active", "==", true)
            .get();

        const newsletterEmails = newsletterSnap.docs
            .map((d) => d.data().email as string)
            .filter(Boolean);

        // ── 2. Fetch ALL registered customers (incl. those with 0 orders) ──────
        const customersSnap = await adminDb
            .collection("customers")
            .where("role", "==", "user")
            .get();

        const customerEmails = customersSnap.docs
            .map((d) => d.data().email as string)
            .filter(Boolean);

        // ── 3. Merge & deduplicate ─────────────────────────────────────────
        const allEmails = [...new Set([...newsletterEmails, ...customerEmails])];

        if (allEmails.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: "No recipients found" });
        }

        // ── 4. Send the email ──────────────────────────────────────────────
        const result = await sendNewArrivalEmail(allEmails, {
            name: productName,
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            discount: discount ? Number(discount) : undefined,
            imageUrl: imageUrl || undefined,
            slug,
            shortDescription: shortDescription || undefined,
        });

        console.log(`✅ New arrival email sent to ${allEmails.length} recipients`);
        return NextResponse.json({ success: result.success, sent: allEmails.length });
    } catch (error: any) {
        console.error("❌ New arrival email error:", error);
        return NextResponse.json({ error: "Failed to send new arrival email", detail: error.message }, { status: 500 });
    }
}
