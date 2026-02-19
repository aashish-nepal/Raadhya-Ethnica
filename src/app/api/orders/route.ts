import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, updateOrder } from "@/lib/firestore";

// GET all orders or user-specific orders
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        const orders = await getOrders(userId || undefined);
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

// POST create new order
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const result = await createOrder(data);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to create order" },
                { status: 500 }
            );
        }
        return NextResponse.json({ id: result.orderId, orderNumber: result.orderNumber, ...data });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}

// PUT update order
export async function PUT(request: NextRequest) {
    try {
        const { id, ...data } = await request.json();
        await updateOrder(id, data);
        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
