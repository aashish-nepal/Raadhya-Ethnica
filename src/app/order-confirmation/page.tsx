"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";

function OrderConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        // Clear cart after successful order
        if (orderId) {
            clearCart();
        }
    }, [orderId, clearCart]);

    if (!orderId) {
        router.push("/");
        return null;
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-neutral-600">Thank you for your purchase</p>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-xl shadow-soft p-8 mb-6">
                    <div className="border-b border-neutral-200 pb-6 mb-6">
                        <h2 className="text-xl font-semibold mb-2">Order Details</h2>
                        <p className="text-neutral-600">Order ID: <span className="font-mono text-primary-600">{orderId}</span></p>
                    </div>

                    {/* Order Status Steps */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Order Confirmed</h3>
                                <p className="text-sm text-neutral-600">Your order has been received and is being processed</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                <Package size={20} className="text-neutral-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-400">Preparing for Dispatch</h3>
                                <p className="text-sm text-neutral-400">We're getting your items ready</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                <Truck size={20} className="text-neutral-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-400">Shipped</h3>
                                <p className="text-sm text-neutral-400">Your order is on its way</p>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Email */}
                    <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                        <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Confirmation email sent</p>
                            <p className="text-xs text-blue-700">We've sent order details to your email address</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="flex-1">
                        <Link href="/account/orders">View Order Details</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </div>

                {/* What's Next */}
                <div className="mt-8 bg-white rounded-xl shadow-soft p-6">
                    <h3 className="font-semibold mb-4">What happens next?</h3>
                    <ul className="space-y-3 text-sm text-neutral-600">
                        <li className="flex items-start gap-2">
                            <span className="text-primary-600 mt-0.5">•</span>
                            <span>You'll receive an email confirmation with your order details</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-600 mt-0.5">•</span>
                            <span>We'll send you tracking information once your order ships</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-600 mt-0.5">•</span>
                            <span>Estimated delivery: 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-600 mt-0.5">•</span>
                            <span>Need help? Contact us via WhatsApp or email</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
