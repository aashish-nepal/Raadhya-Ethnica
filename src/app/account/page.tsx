"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToUserOrders } from "@/lib/firestore";
import { Package, Heart, MapPin, Settings, LogOut, Eye, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";

export default function AccountPage() {
    const router = useRouter();
    const { user, loading, signOut } = useAuth();
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToUserOrders(user.uid, (orders) => {
            // Show only the 5 most recent orders
            setRecentOrders((orders as Order[]).slice(0, 5));
            setOrdersLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "delivered": return <CheckCircle className="text-green-600" size={16} />;
            case "shipped": return <Truck className="text-blue-600" size={16} />;
            case "cancelled": return <XCircle className="text-red-600" size={16} />;
            default: return <Clock className="text-yellow-600" size={16} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "bg-green-100 text-green-800";
            case "shipped": return "bg-blue-100 text-blue-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-yellow-100 text-yellow-800";
        }
    };

    if (loading) {
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
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-neutral-900">My Account</h1>
                <p className="text-neutral-600 mt-1">Welcome back, {user.displayName || user.email}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-200">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-600 font-semibold text-lg">
                                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900">{user.displayName || "User"}</p>
                                <p className="text-sm text-neutral-600">{user.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <Link href="/account/orders" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-600 font-medium">
                                <Package size={20} />
                                Orders
                            </Link>
                            <Link href="/account/wishlist" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50">
                                <Heart size={20} />
                                Wishlist
                            </Link>
                            <Link href="/account/addresses" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50">
                                <MapPin size={20} />
                                Addresses
                            </Link>
                            <Link href="/account/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50">
                                <Settings size={20} />
                                Settings
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-soft p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">Recent Orders</h2>
                            {recentOrders.length > 0 && (
                                <Link href="/account/orders">
                                    <Button variant="outline" size="sm">View All Orders</Button>
                                </Link>
                            )}
                        </div>

                        {ordersLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package size={48} className="mx-auto text-neutral-300 mb-4" />
                                <p className="text-neutral-600 mb-4">No orders yet</p>
                                <Button onClick={() => router.push("/products")}>
                                    Start Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="border border-neutral-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getStatusIcon(order.orderStatus)}
                                                    <span className="font-semibold text-neutral-900">
                                                        Order #{order.orderNumber}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-500">
                                                    {new Date(
                                                        typeof (order as any).createdAt?.toMillis === "function"
                                                            ? (order as any).createdAt.toMillis()
                                                            : (order as any).createdAt
                                                    ).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                    {" · "}{order.items.length} item{order.items.length > 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-bold text-neutral-900">
                                                    ${order.total.toFixed(2)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/account/orders/${order.id}`)}
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-2 text-center">
                                    <Link href="/account/orders">
                                        <Button variant="ghost" className="text-primary-600">
                                            View all orders →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
