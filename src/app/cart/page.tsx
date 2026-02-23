"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/ui/AuthModal";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, AlertTriangle, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { validateCoupon } from "@/lib/firestore";

// ── Confirmation modal types ─────────────────────────────────────
interface RemoveTarget {
    productId: string;
    selectedSize: string;
    selectedColor: string;
    productName: string;
}

export default function CartPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items, updateQuantity, removeItem, getTotals, applyCoupon, removeCoupon, couponCode } = useCartStore();
    const totals = getTotals();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [couponInput, setCouponInput] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ── Remove confirmation ──────────────────────────────────────
    const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
    const [modalLeaving, setModalLeaving] = useState(false);

    const openRemoveModal = (target: RemoveTarget) => {
        setModalLeaving(false);
        setRemoveTarget(target);
    };

    const closeRemoveModal = () => {
        setModalLeaving(true);
        setTimeout(() => {
            setRemoveTarget(null);
            setModalLeaving(false);
        }, 280);
    };

    const confirmRemove = () => {
        if (!removeTarget) return;
        removeItem(removeTarget.productId, removeTarget.selectedSize, removeTarget.selectedColor);
        closeRemoveModal();
    };

    const handleApplyCoupon = async () => {
        const code = couponInput.trim();
        if (!code) return;
        setCouponLoading(true);
        setCouponMsg(null);
        try {
            const result = await validateCoupon(code);
            if (!result.valid) {
                setCouponMsg({ type: "error", text: (result as any).message || "Invalid coupon code" });
            } else {
                const coupon = (result as any).coupon;
                const discountAmount =
                    coupon.discountType === "percentage"
                        ? (totals.subtotal * coupon.discountValue) / 100
                        : coupon.discountValue;
                applyCoupon(code, discountAmount);
                setCouponMsg({ type: "success", text: `Coupon applied! You saved ${formatPrice(discountAmount)}.` });
                setCouponInput("");
            }
        } catch {
            setCouponMsg({ type: "error", text: "Failed to validate coupon. Please try again." });
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponMsg(null);
        setCouponInput("");
    };

    const handleProceedToCheckout = () => {
        if (user) {
            router.push("/checkout");
        } else {
            setShowAuthModal(true);
        }
    };

    if (items.length === 0) {
        return (
            <>
                <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h1 className="text-2xl font-display font-bold mb-2">Your cart is empty</h1>
                        <p className="text-neutral-600 mb-6">Add some beautiful kurtas to get started!</p>
                        <Link href="/products">
                            <Button size="lg">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
                <WhatsAppButton />
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Shopping Cart</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => {
                                const colorData = item.product.colors?.find(
                                    (c) => c.name === item.selectedColor
                                );
                                const itemImage =
                                    colorData?.images?.[0] || item.product.images[0];
                                const colorHex = colorData?.hex;
                                return (
                                    <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="bg-white rounded-xl p-6 shadow-soft">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="relative w-24 h-32 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
                                                <Image
                                                    src={itemImage}
                                                    alt={`${item.product.name} - ${item.selectedColor}`}
                                                    fill
                                                    sizes="96px"
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1">
                                                <Link href={`/products/${item.product.slug}`} className="font-semibold text-lg hover:text-primary-600 transition-colors">
                                                    {item.product.name}
                                                </Link>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {item.selectedColor && (
                                                        <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                                                            <span
                                                                className="w-3 h-3 rounded-full border border-neutral-300 flex-shrink-0"
                                                                style={{ backgroundColor: colorHex || item.selectedColor.toLowerCase() }}
                                                            />
                                                            {item.selectedColor}
                                                        </span>
                                                    )}
                                                    {item.selectedColor && item.selectedSize && <span className="text-neutral-300">|</span>}
                                                    {item.selectedSize && (
                                                        <span className="text-sm text-neutral-600">Size: {item.selectedSize}</span>
                                                    )}
                                                </div>
                                                <p className="text-lg font-bold text-primary-600 mt-2">
                                                    {formatPrice(item.price)}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                                            className="w-8 h-8 rounded-lg border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                                            className="w-8 h-8 rounded-lg border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Remove — opens confirmation modal */}
                                                    <button
                                                        onClick={() => openRemoveModal({
                                                            productId: item.productId,
                                                            selectedSize: item.selectedSize,
                                                            selectedColor: item.selectedColor,
                                                            productName: item.product.name,
                                                        })}
                                                        className="group flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={15} className="transition-transform group-hover:scale-110" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Item Total */}
                                            <div className="text-right">
                                                <p className="font-bold text-xl">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 shadow-soft sticky top-24">
                                <h2 className="text-xl font-display font-bold mb-4">Order Summary</h2>

                                {/* Item Breakdown */}
                                <div className="mb-5 space-y-3">
                                    {items.map((item) => {
                                        const summaryColorData = item.product.colors?.find(
                                            (c) => c.name === item.selectedColor
                                        );
                                        const summaryImage =
                                            summaryColorData?.images?.[0] || item.product.images[0];
                                        const summaryHex = summaryColorData?.hex;
                                        return (
                                            <div
                                                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                                                className="flex gap-3 items-start"
                                            >
                                                <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                                                    <Image
                                                        src={summaryImage}
                                                        alt={`${item.product.name} - ${item.selectedColor}`}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-neutral-800 truncate leading-tight">
                                                        {item.product.name}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.selectedColor && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5">
                                                                <span
                                                                    className="w-2 h-2 rounded-full border border-neutral-300 flex-shrink-0"
                                                                    style={{ backgroundColor: summaryHex || item.selectedColor.toLowerCase() }}
                                                                />
                                                                {item.selectedColor}
                                                            </span>
                                                        )}
                                                        {item.selectedSize && (
                                                            <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5">
                                                                Size: {item.selectedSize}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] font-bold bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">
                                                            Qty: {item.quantity}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm font-bold text-neutral-900 flex-shrink-0">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-neutral-200 pt-4 mb-4" />

                                {/* Coupon Code */}
                                <div className="mb-4">
                                    {couponCode ? (
                                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                            <span className="text-sm text-green-700 font-medium">🏷️ <strong>{couponCode}</strong> applied</span>
                                            <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 ml-2">Remove</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Enter coupon code"
                                                    value={couponInput}
                                                    onChange={(e) => setCouponInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading || !couponInput.trim()}
                                                >
                                                    {couponLoading ? "..." : "Apply"}
                                                </Button>
                                            </div>
                                            {couponMsg && (
                                                <p className={`text-xs mt-1 ${couponMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                                                    {couponMsg.text}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="border-t border-neutral-200 pt-4 space-y-3">
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(totals.subtotal)}</span>
                                    </div>

                                    {totals.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-{formatPrice(totals.discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-neutral-600">
                                        <span>Shipping</span>
                                        <span>{totals.shipping === 0 ? "FREE" : formatPrice(totals.shipping)}</span>
                                    </div>

                                    <div className="flex justify-between text-neutral-600">
                                        <span>Tax (GST 5%)</span>
                                        <span>{formatPrice(totals.tax)}</span>
                                    </div>

                                    <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-xl">
                                        <span>Total</span>
                                        <span className="text-primary-600">{formatPrice(totals.total)}</span>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full mt-6"
                                    onClick={handleProceedToCheckout}
                                >
                                    Proceed to Checkout
                                </Button>

                                <Link href="/products" className="block mt-3">
                                    <Button size="lg" variant="outline" className="w-full">
                                        Continue Shopping
                                    </Button>
                                </Link>

                                {/* Free Shipping Notice */}
                                {totals.subtotal < 150 && (
                                    <div className="mt-4 p-3 bg-primary-50 rounded-lg text-sm text-primary-700">
                                        Add {formatPrice(150 - totals.subtotal)} more to get FREE shipping!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <WhatsAppButton />

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    redirectAfterLogin="/checkout"
                    redirectAfterRegister="/account/addresses?redirect=checkout"
                />
            )}

            {/* ══════════════════════════════════════════════════
                Remove Confirmation Modal
            ══════════════════════════════════════════════════ */}
            {removeTarget && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        style={{
                            animation: modalLeaving
                                ? 'fadeOut 0.28s ease forwards'
                                : 'fadeIn 0.22s ease forwards',
                        }}
                        onClick={closeRemoveModal}
                    />

                    {/* Modal */}
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                            style={{
                                animation: modalLeaving
                                    ? 'scaleOut 0.28s cubic-bezier(0.4, 0, 1, 1) forwards'
                                    : 'scaleIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                            }}
                        >
                            {/* Top accent bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle size={18} className="text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 text-base leading-tight">
                                                Remove item?
                                            </h3>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                This can&apos;t be undone
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeRemoveModal}
                                        className="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                                    >
                                        <X size={14} className="text-neutral-400" />
                                    </button>
                                </div>

                                {/* Product preview */}
                                <div className="bg-neutral-50 rounded-xl px-4 py-3 mb-5 border border-neutral-100">
                                    <p className="font-semibold text-neutral-800 text-sm leading-snug line-clamp-2">
                                        {removeTarget.productName}
                                    </p>
                                    <div className="flex gap-2 mt-1.5">
                                        {removeTarget.selectedColor && (
                                            <span className="text-[11px] text-neutral-500 bg-white border border-neutral-200 rounded-full px-2 py-0.5">
                                                {removeTarget.selectedColor}
                                            </span>
                                        )}
                                        {removeTarget.selectedSize && (
                                            <span className="text-[11px] text-neutral-500 bg-white border border-neutral-200 rounded-full px-2 py-0.5">
                                                Size: {removeTarget.selectedSize}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={closeRemoveModal}
                                        className="flex-1 py-2.5 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                                    >
                                        Keep it
                                    </button>
                                    <button
                                        onClick={confirmRemove}
                                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm shadow-red-200"
                                    >
                                        <Trash2 size={14} />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

