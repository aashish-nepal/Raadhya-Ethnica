"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToAllOrders } from "@/lib/firestore";

export interface AdminNotification {
    id: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    itemCount: number;
    createdAt: any;
    isRead: boolean;
}

const LS_KEY = "adminNotificationsLastSeen";

function getLastSeen(): number {
    if (typeof window === "undefined") return 0;
    const val = localStorage.getItem(LS_KEY);
    return val ? parseInt(val, 10) : 0;
}

function toMs(timestamp: any): number {
    if (!timestamp) return 0;
    if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
    if (typeof timestamp === "string") return new Date(timestamp).getTime();
    if (typeof timestamp === "number") return timestamp;
    return 0;
}

export function useAdminNotifications() {
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [lastSeen, setLastSeen] = useState<number>(0);

    // Load lastSeen from localStorage on mount (client only)
    useEffect(() => {
        setLastSeen(getLastSeen());
    }, []);

    // Subscribe to all orders in real-time
    useEffect(() => {
        const unsubscribe = subscribeToAllOrders((orders) => {
            setAllOrders(orders);
        }, 100);
        return () => unsubscribe();
    }, []);

    // Compute notifications — only orders newer than lastSeen
    const notifications: AdminNotification[] = allOrders.map((order) => ({
        id: order.id,
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        customerName:
            order.shippingAddress?.name || order.userName || "Guest",
        customerEmail: order.userEmail || "",
        total: order.total || 0,
        itemCount: order.items?.length || 0,
        createdAt: order.createdAt,
        isRead: toMs(order.createdAt) <= lastSeen,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const markAllRead = useCallback(() => {
        const now = Date.now();
        localStorage.setItem(LS_KEY, String(now));
        setLastSeen(now);
    }, []);

    return { notifications, unreadCount, markAllRead };
}
