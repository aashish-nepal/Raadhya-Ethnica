import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";

// ── Auth helpers ───────────────────────────────────────────────────────────────

async function getAuthenticatedSession() {
    return getSessionFromCookies();
}

async function requireAdmin() {
    const session = await getSessionFromCookies();
    if (!session) return null;

    // Use UID as document ID — O(1) lookup, more robust than email query
    const doc = await adminDb.collection("customers").doc(session.uid).get();
    if (!doc.exists || doc.data()?.role !== "admin") return null;
    return session;
}

// ── GET – users see own orders, admins see all ────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        const session = await getAuthenticatedSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const requestedUserId = searchParams.get("userId");

        // Admins can query any userId (or all); regular users can only see their own
        const adminSession = await requireAdmin();
        const isAdmin = !!adminSession;

        let userId: string | undefined;
        if (isAdmin) {
            userId = requestedUserId || undefined; // Admin: respect filter or return all
        } else {
            userId = session.uid; // Non-admin: always own orders only
        }

        const { getOrders } = await import("@/lib/firestore");
        const orders = await getOrders(userId);
        return NextResponse.json(orders);
    } catch {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

// ── POST – any authenticated user can create an order ────────────────────────

export async function POST(request: NextRequest) {
    try {
        const session = await getAuthenticatedSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Ensure the order is linked to the authenticated user (prevent spoofing)
        const safeData = { ...data, userId: session.uid };

        const { createOrder } = await import("@/lib/firestore");
        const result = await createOrder(safeData);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to create order" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { id: result.orderId, orderNumber: result.orderNumber, ...safeData },
            { status: 201 }
        );
    } catch {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

// ── PUT – admin only: update order status ─────────────────────────────────────

export async function PUT(request: NextRequest) {
    const adminSession = await requireAdmin();
    if (!adminSession) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id, ...data } = await request.json();

        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // Strip any attempt to change userId or sensitive fields
        const { userId: _u, createdAt: _c, ...safeData } = data;

        const { updateOrder } = await import("@/lib/firestore");
        await updateOrder(id, safeData);
        return NextResponse.json({ id, ...safeData });
    } catch {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
