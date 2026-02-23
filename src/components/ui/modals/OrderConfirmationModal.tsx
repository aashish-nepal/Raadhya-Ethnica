"use client";

import { X, CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { OrderConfirmationData } from "@/contexts/ModalContext";

interface Props {
    data: OrderConfirmationData;
    onClose: () => void;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
    }).format(amount);
}

export default function OrderConfirmationModal({ data, onClose }: Props) {
    const { orderId, total, itemCount } = data ?? {};

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "scaleIn 0.25s ease both" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-neutral-700 transition-colors"
                    aria-label="Close"
                >
                    <X size={22} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-8 pt-10 pb-8 text-white text-center relative overflow-hidden">
                    <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-white/10 rounded-full" />
                    <div className="relative">
                        {/* Animated checkmark ring */}
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
                            style={{ animation: "scaleIn 0.4s ease both 0.1s" }}
                        >
                            <CheckCircle size={36} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-display font-bold">Order Confirmed! 🎉</h2>
                        <p className="text-emerald-100 text-sm mt-1">
                            Thank you for shopping with Raadhya Ethnica
                        </p>
                    </div>
                </div>

                {/* Order summary */}
                <div className="px-8 py-6">
                    <div className="bg-neutral-50 rounded-xl divide-y divide-neutral-200 mb-5 overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-3 text-sm">
                            <span className="text-neutral-500">Order ID</span>
                            <span className="font-mono text-primary-600 font-medium text-xs truncate max-w-[160px]">
                                #{orderId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center px-5 py-3 text-sm">
                            <span className="text-neutral-500">Items</span>
                            <span className="font-semibold text-neutral-900">
                                {itemCount} {itemCount === 1 ? "item" : "items"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center px-5 py-3">
                            <span className="text-sm text-neutral-500">Total Paid</span>
                            <span className="font-bold text-lg text-neutral-900">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-800 flex items-start gap-2">
                        <ShoppingBag size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                        <span>
                            A confirmation email has been sent to your inbox with full order details &amp; tracking info.
                        </span>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full" onClick={onClose}>
                            <Link href="/account/orders">
                                View My Orders <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full" onClick={onClose}>
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
