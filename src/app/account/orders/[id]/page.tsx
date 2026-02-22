"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToOrder } from "@/lib/firestore";
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user || !params.id) return;

        // Real-time subscription to order
        const unsubscribe = subscribeToOrder(
            params.id as string,
            (orderData) => {
                if (orderData && (orderData as any).userId === user.uid) {
                    setOrder(orderData as Order);
                    setLoading(false);
                } else if (orderData === null) {
                    router.push("/account/orders");
                } else {
                    router.push("/account/orders");
                }
            },
            (error) => {
                console.error("Error loading order:", error);
                router.push("/account/orders");
            }
        );

        return () => unsubscribe();
    }, [user, params.id, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user || !order) {
        return null;
    }

    return (
        <div className="container-custom py-12">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/account/orders")}
                    className="mb-4"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Orders
                </Button>
                <h1 className="text-3xl font-display font-bold mb-2">
                    Order #{order.orderNumber}
                </h1>
                <p className="text-neutral-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-AU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Package size={24} />
                            Order Items
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0"
                                >
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-100">
                                        <Image
                                            src={item.productImage}
                                            alt={item.productName}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">{item.productName}</h3>
                                        <p className="text-sm text-neutral-600">
                                            Size: {item.size} | Color: {item.color}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            Quantity: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatPrice(item.total)}</p>
                                        <p className="text-sm text-neutral-600">
                                            {formatPrice(item.price)} each
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <MapPin size={24} />
                            Shipping Address
                        </h2>
                        <div className="text-neutral-700">
                            <p className="font-semibold">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            {order.shippingAddress.addressLine2 && (
                                <p>{order.shippingAddress.addressLine2}</p>
                            )}
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                {order.shippingAddress.pincode}
                            </p>
                            <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-neutral-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-neutral-600">
                                <span>Shipping</span>
                                <span>{formatPrice(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                                <span>Tax</span>
                                <span>{formatPrice(order.tax)}</span>
                            </div>
                            <div className="pt-3 border-t border-neutral-200">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Status */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <CreditCard size={24} />
                            Payment & Status
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-neutral-600">Payment Method</p>
                                <p className="font-semibold capitalize">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Payment Status</p>
                                <p className="font-semibold capitalize">{order.paymentStatus}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Order Status</p>
                                <p className="font-semibold capitalize">{order.orderStatus}</p>
                            </div>
                            {order.trackingNumber && (
                                <div>
                                    <p className="text-sm text-neutral-600">Tracking Number</p>
                                    <p className="font-mono font-semibold">{order.trackingNumber}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
