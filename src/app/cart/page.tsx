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

export default function CartPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items, updateQuantity, removeItem, getTotals } = useCartStore();
    const totals = getTotals();
    const [showAuthModal, setShowAuthModal] = useState(false);

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
                                    <Input placeholder="Enter coupon code" />
                                    <Button variant="outline" className="w-full mt-2">Apply Coupon</Button>
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
