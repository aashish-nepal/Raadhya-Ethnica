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
import { Trash2, Plus, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { validateCoupon } from "@/lib/firestore";

export default function CartPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items, updateQuantity, removeItem, getTotals, applyCoupon, removeCoupon, couponCode } = useCartStore();
    const totals = getTotals();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [couponInput, setCouponInput] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
                            {items.map((item) => (
                                <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="bg-white rounded-xl p-6 shadow-soft">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="relative w-24 h-32 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
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
                                            <p className="text-sm text-neutral-600 mt-1">
                                                Size: {item.selectedSize} | Color: {item.selectedColor}
                                            </p>
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

                                                <button
                                                    onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                                                    className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                                                >
                                                    <Trash2 size={16} />
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
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 shadow-soft sticky top-24">
                                <h2 className="text-xl font-display font-bold mb-4">Order Summary</h2>

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

            {/* Auth Modal for unauthenticated users */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    redirectAfterLogin="/checkout"
                    redirectAfterRegister="/account/addresses?redirect=checkout"
                />
            )}
        </>
    );
}
