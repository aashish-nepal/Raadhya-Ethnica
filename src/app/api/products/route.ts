import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

// ── Auth helper ────────────────────────────────────────────────────────────────

async function requireAdmin(request: NextRequest) {
    const session = await getSessionFromCookies();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use UID as document ID — O(1) lookup, more robust than email query
    const doc = await adminDb.collection("customers").doc(session.uid).get();
    if (!doc.exists || doc.data()?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return null; // No error — user is admin
}

// ── Input schemas ──────────────────────────────────────────────────────────────

const productSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0).optional(),
    category: z.string().max(100).optional(),
    images: z.array(z.string().url()).optional(),
    sku: z.string().max(100).optional(),
});

// ── GET – public ───────────────────────────────────────────────────────────────

export async function GET() {
    try {
        const { getProducts } = await import("@/lib/firestore");
        const products = await getProducts();
        return NextResponse.json(products);
    } catch {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

// ── POST – admin only ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const parsed = productSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid product data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { addProduct } = await import("@/lib/firestore");
        const docRef = await addProduct(parsed.data);
        return NextResponse.json({ id: docRef.id, ...parsed.data }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

// ── PUT – admin only ──────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const parsed = productSchema.partial().safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid product data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { updateProduct } = await import("@/lib/firestore");
        await updateProduct(id, parsed.data);
        return NextResponse.json({ id, ...parsed.data });
    } catch {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

// ── DELETE – admin only ───────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const { deleteProduct } = await import("@/lib/firestore");
        await deleteProduct(id);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
