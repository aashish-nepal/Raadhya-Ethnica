"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToUserOrders } from "@/lib/firestore";
import { useToast } from "@/hooks/useToast";
import { Order } from "@/types";

/**
 * Provider component that handles real-time order status notifications
 * Must be placed inside AuthProvider
 */
export default function NotificationProvider() {
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!user) return;

        // Track previous order statuses to detect changes
        const orderStatusMap = new Map<string, string>();

        const unsubscribe = subscribeToUserOrders(
            user.uid,
            (orders: Order[]) => {
                orders.forEach((order) => {
                    const previousStatus = orderStatusMap.get(order.id);
                    const currentStatus = order.orderStatus;

                    // Only show notification if status has changed
                    if (previousStatus && previousStatus !== currentStatus) {
                        showOrderStatusNotification(order, previousStatus, currentStatus);
                    }

                    // Update the status map
                    orderStatusMap.set(order.id, currentStatus);
                });
            },
            (error) => {
                console.error("Error subscribing to order updates:", error);
            }
        );

        return () => {
            unsubscribe();
            orderStatusMap.clear();
        };
    }, [user, toast]);

    const showOrderStatusNotification = (
        order: Order,
        previousStatus: string,
        newStatus: string
    ) => {
        const statusConfig = getStatusConfig(newStatus);

        toast({
            title: statusConfig.title,
            description: `Order #${order.orderNumber} - ${statusConfig.message}`,
            variant: statusConfig.variant as any,
        });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "confirmed":
                return {
                    title: "✓ Order Confirmed",
                    message: "Your order has been confirmed and is being prepared.",
                    variant: "success",
                };
            case "processing":
                return {
                    title: "📦 Order Processing",
                    message: "Your order is being processed and will ship soon.",
                    variant: "info",
                };
            case "shipped":
                return {
                    title: "🚚 Order Shipped",
                    message: "Your order has been shipped and is on its way!",
                    variant: "success",
                };
            case "delivered":
                return {
                    title: "✓ Order Delivered",
                    message: "Your order has been delivered. Enjoy your purchase!",
                    variant: "success",
                };
            case "cancelled":
                return {
                    title: "✗ Order Cancelled",
                    message: "Your order has been cancelled.",
                    variant: "error",
                };
            case "returned":
                return {
                    title: "↩ Order Returned",
                    message: "Your return has been processed.",
                    variant: "warning",
                };
            default:
                return {
                    title: "📋 Order Updated",
                    message: "Your order status has been updated.",
                    variant: "default",
                };
        }
    };

    return null;
}
