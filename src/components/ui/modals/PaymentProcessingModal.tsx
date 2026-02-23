"use client";

import { useEffect } from "react";
import { X, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type PaymentModalStatus = "processing" | "success" | "error";

interface Props {
    status: PaymentModalStatus;
    amount: number;            // in AUD dollars
    orderId?: string;
    errorMessage?: string;
    onClose: () => void;
}

export default function PaymentProcessingModal({
    status,
    amount,
    orderId,
    errorMessage,
    onClose,
}: Props) {
    // Auto-dismiss processing screen can't be closed manually
    const canClose = status !== "processing";

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget && canClose) onClose(); }}
        >
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "scaleIn 0.25s ease both" }}
            >
                {/* Close — only when result is known */}
                {canClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-neutral-700 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* ── PROCESSING ── */}
                {status === "processing" && (
                    <>
                        <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-8 pt-10 pb-8 text-white text-center relative overflow-hidden">
                            <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                            <div className="relative">
                                {/* Spinning ring */}
                                <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto mb-4" />
                                <h2 className="text-xl font-display font-bold">Processing Payment</h2>
                                <p className="text-primary-100 text-sm mt-1">Please don't close this window…</p>
                            </div>
                        </div>
                        <div className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
                                <ShieldCheck size={16} className="text-primary-500" />
                                Securely processing {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount)}
                            </div>
                            <p className="text-xs text-neutral-400 mt-2">Your payment is encrypted end-to-end</p>
                        </div>
                    </>
                )}

                {/* ── SUCCESS ── */}
                {status === "success" && (
                    <>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-8 pt-10 pb-8 text-white text-center relative overflow-hidden">
                            <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                            <div className="relative">
                                <div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
                                    style={{ animation: "scaleIn 0.4s ease both 0.1s" }}
                                >
                                    <CheckCircle size={36} className="text-white" />
                                </div>
                                <h2 className="text-xl font-display font-bold">Payment Successful! 🎉</h2>
                                <p className="text-emerald-100 text-sm mt-1">
                                    {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount)} charged
                                </p>
                            </div>
                        </div>
                        <div className="px-8 py-6">
                            {orderId && (
                                <div className="bg-neutral-50 rounded-xl px-4 py-3 mb-5 text-center">
                                    <p className="text-xs text-neutral-500">Order ID</p>
                                    <p className="font-mono text-primary-600 font-semibold text-sm">{orderId}</p>
                                </div>
                            )}
                            <p className="text-sm text-neutral-600 text-center mb-5 leading-relaxed">
                                Your order is confirmed! A confirmation email has been sent to your inbox.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button asChild className="w-full" onClick={onClose}>
                                    <Link href="/account/orders">View My Orders</Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full" onClick={onClose}>
                                    <Link href="/products">Continue Shopping</Link>
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* ── ERROR ── */}
                {status === "error" && (
                    <>
                        <div className="bg-gradient-to-br from-red-500 to-red-700 px-8 pt-10 pb-8 text-white text-center relative overflow-hidden">
                            <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                            <div className="relative">
                                <div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
                                    style={{ animation: "scaleIn 0.4s ease both 0.1s" }}
                                >
                                    <XCircle size={36} className="text-white" />
                                </div>
                                <h2 className="text-xl font-display font-bold">Payment Failed</h2>
                                <p className="text-red-100 text-sm mt-1">Your card was not charged</p>
                            </div>
                        </div>
                        <div className="px-8 py-6">
                            {errorMessage && (
                                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700 text-center">
                                    {errorMessage}
                                </div>
                            )}
                            <p className="text-sm text-neutral-600 text-center mb-5">
                                Please check your card details and try again, or use a different payment method.
                            </p>
                            <Button onClick={onClose} className="w-full">
                                Try Again
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
