"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToUserOrders } from "@/lib/firestore";
import { Package, Eye, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";

export default function OrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        setLoading(true);

        // Real-time subscription to user's orders
        const unsubscribe = subscribeToUserOrders(
            user.uid,
            (updatedOrders) => {
                setOrders(updatedOrders as Order[]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "delivered":
                return <CheckCircle className="text-green-600" size={20} />;
            case "shipped":
                return <Truck className="text-blue-600" size={20} />;
            case "cancelled":
                return <XCircle className="text-red-600" size={20} />;
            default:
                return <Clock className="text-yellow-600" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-800";
            case "shipped":
                return "bg-blue-100 text-blue-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container-custom py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold mb-2">My Orders</h1>
                <p className="text-neutral-600">View and track your orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                    <Package size={64} className="mx-auto text-neutral-300 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                    <p className="text-neutral-600 mb-6">
                        Start shopping to see your orders here
                    </p>
                    <Button onClick={() => router.push("/products")}>
                        Browse Products
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl shadow-soft p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg">
                                            Order #{order.orderNumber}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                order.orderStatus
                                            )}`}
                                        >
                                            {order.orderStatus.charAt(0).toUpperCase() +
                                                order.orderStatus.slice(1)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-neutral-600 space-y-1">
                                        <p>
                                            Placed on:{" "}
                                            {(() => {
                                                const raw = (order as any).createdAt;
                                                const date = raw?.toDate ? raw.toDate() : raw ? new Date(raw) : null;
                                                return date && !isNaN(date.getTime())
                                                    ? date.toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })
                                                    : "—";
                                            })()}
                                        </p>
                                        <p>
                                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-neutral-600">Total</p>
                                        <p className="text-2xl font-bold text-neutral-900">
                                            ${order.total.toFixed(2)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/account/orders/${order.id}`)}
                                    >
                                        <Eye size={18} className="mr-2" />
                                        View Details
                                    </Button>
                                </div>
                            </div>

                            {order.trackingNumber && (
                                <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <p className="text-sm text-neutral-600">
                                        Tracking Number:{" "}
                                        <span className="font-mono font-semibold text-neutral-900">
                                            {order.trackingNumber}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
