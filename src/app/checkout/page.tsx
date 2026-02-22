"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAddresses, createOrder } from "@/lib/firestore";
import { clearCartFromFirestore } from "@/lib/cart-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { Address } from "@/types";
import StripeCheckoutForm from "@/components/payment/StripeCheckoutForm";
import PayPalCheckout from "@/components/payment/PayPalCheckout";
import { CreditCard, Wallet } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentMethod = "stripe" | "paypal";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { items, getTotals, clearCart } = useCartStore();
    const totals = getTotals();
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
    const [clientSecret, setClientSecret] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login?redirect=/checkout");
        }
    }, [user, authLoading, router]);

    // Redirect to cart if cart is empty (must be in useEffect, not render phase)
    useEffect(() => {
        if (!authLoading && user && items.length === 0) {
            router.push("/cart");
        }
    }, [items.length, user, authLoading, router]);

    // Load user addresses
    useEffect(() => {
        async function loadAddresses() {
            if (!user) return;

            try {
                const userAddresses = await getUserAddresses(user.uid);
                setAddresses(userAddresses as Address[]);

                // If user has no addresses, redirect to address management
                if (userAddresses.length === 0) {
                    router.push("/account/addresses?redirect=checkout");
                    return;
                }

                // Auto-select default address
                const defaultAddr = userAddresses.find((addr: any) => addr.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                } else if (userAddresses.length > 0) {
                    setSelectedAddressId(userAddresses[0].id);
                }

                // Pre-fill user info
                setFormData(prev => ({
                    ...prev,
                    name: user.displayName || "",
                    email: user.email || "",
                }));
            } catch (error) {
                console.error("Error loading addresses:", error);
            }
        }

        if (user) {
            loadAddresses();
        }
    }, [user, router]);

    const createStripePaymentIntent = async () => {
        try {
            setLoading(true);

            // Get a fresh Firebase ID token to authenticate this request
            // Regular users don't have the admin __session cookie — they use Bearer tokens
            const idToken = user ? await user.getIdToken() : null;
            if (!idToken) {
                throw new Error("You must be logged in to complete checkout.");
            }

            const response = await fetch("/api/payment/stripe/create-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    amount: totals.total,
                    currency: "AUD",
                    customerEmail: user?.email,
                    metadata: {
                        userId: user?.uid || "",
                        itemCount: items.length.toString(),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create payment intent");
            }

            setClientSecret(data.clientSecret);
        } catch (error: any) {
            console.error("Error creating payment intent:", error);
            alert(error.message || "Failed to initialize payment");
        } finally {
            setLoading(false);
        }
    };

    const getShippingAddress = () => {
        if (selectedAddressId && !useNewAddress) {
            const addr = addresses.find(a => a.id === selectedAddressId);
            if (addr) {
                return {
                    name: addr.name,
                    phone: addr.phone,
                    addressLine1: addr.addressLine1,
                    addressLine2: addr.addressLine2 || "",
                    city: addr.city,
                    state: addr.state,
                    pincode: addr.pincode,
                };
            }
        }

        return {
            name: formData.name,
            phone: formData.phone,
            addressLine1: formData.address,
            addressLine2: "",
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
        };
    };

    const handlePaymentSuccess = async (paymentId: string) => {
        try {
            if (!user) return;

            // Prepare order items
            const orderItems = items.map(item => ({
                productId: item.productId,
                productName: item.product.name,
                productImage: item.product.images[0],
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
            }));

            // Get shipping address
            const shippingAddr = getShippingAddress();

            // Create order in Firestore
            const orderResult = await createOrder({
                userId: user.uid,
                userEmail: user.email || '',
                userName: user.displayName || shippingAddr.name,
                items: orderItems,
                shippingAddress: shippingAddr,
                billingAddress: shippingAddr, // Using same address for billing
                paymentMethod,
                paymentId,
                subtotal: totals.subtotal,
                shipping: totals.shipping,
                tax: totals.tax,
                total: totals.total,
                currency: 'AUD',
                discount: 0,
            });

            if (orderResult.success) {
                console.log('✅ Order created:', orderResult.orderNumber);

                // Send order confirmation email (fire-and-forget — don't block redirect)
                user.getIdToken().then((idToken) => {
                    fetch('/api/email/order-confirmation', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({
                            email: user.email,
                            orderDetails: {
                                orderId: orderResult.orderNumber,
                                customerName: user.displayName || shippingAddr.name,
                                items: orderItems.map(i => ({
                                    name: i.productName,
                                    quantity: i.quantity,
                                    price: i.price,
                                    color: i.selectedColor || undefined,
                                    size: i.selectedSize || undefined,
                                })),
                                total: totals.total,
                                shippingAddress: `${shippingAddr.name}, ${shippingAddr.addressLine1}, ${shippingAddr.city}, ${shippingAddr.state} ${shippingAddr.pincode}`,
                                paymentMethod,
                            },
                        }),
                    }).catch(console.error);
                }).catch(console.error);

                // Clear cart from local storage
                clearCart();

                // Clear cart from Firestore
                await clearCartFromFirestore(user.uid);

                // Redirect to confirmation page
                router.push(`/order-confirmation?paymentId=${paymentId}&orderId=${orderResult.orderId}`);
            } else {
                console.error('Failed to create order:', orderResult.error);
                // Still redirect but show warning
                clearCart();
                await clearCartFromFirestore(user.uid);
                router.push(`/order-confirmation?paymentId=${paymentId}`);
            }
        } catch (error) {
            console.error("Error handling payment success:", error);
            // Still clear cart and redirect even if order creation fails
            clearCart();
            if (user) {
                await clearCartFromFirestore(user.uid);
            }
            router.push(`/order-confirmation?paymentId=${paymentId}`);
        }
    };


    const handlePaymentError = (error: string) => {
        alert(`Payment failed: ${error}`);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user || items.length === 0) {
        return null;
    }

    return (
        <>
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="container-custom max-w-6xl">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Checkout</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Shipping & Payment */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <div className="bg-white rounded-xl p-6 shadow-soft">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-display font-bold">Shipping Information</h2>
                                    {addresses.length > 0 && (
                                        <Link href="/account/addresses">
                                            <Button type="button" variant="outline" size="sm">
                                                Manage Addresses
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {/* Saved Addresses */}
                                {addresses.length > 0 && !useNewAddress && (
                                    <div className="space-y-3 mb-4">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id
                                                    ? "border-primary-600 bg-primary-50"
                                                    : "border-neutral-200 hover:border-primary-300"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold">{addr.name}</p>
                                                        <p className="text-sm text-neutral-600 mt-1">
                                                            {addr.addressLine1}
                                                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                        </p>
                                                        <p className="text-sm text-neutral-600">
                                                            {addr.city}, {addr.state} {addr.pincode}
                                                        </p>
                                                        <p className="text-sm text-neutral-600">Phone: {addr.phone}</p>
                                                    </div>
                                                    {addr.isDefault && (
                                                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setUseNewAddress(true)}
                                            className="w-full"
                                        >
                                            + Use New Address
                                        </Button>
                                    </div>
                                )}

                                {/* New Address Form */}
                                {(addresses.length === 0 || useNewAddress) && (
                                    <>
                                        {useNewAddress && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setUseNewAddress(false)}
                                                className="mb-4"
                                            >
                                                ← Use Saved Address
                                            </Button>
                                        )}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                label="Full Name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <Input
                                                label="Email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                            <Input
                                                label="Phone Number"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                            <Input
                                                label="Pincode"
                                                required
                                                value={formData.pincode}
                                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <Input
                                                label="Address"
                                                required
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                                            <Input
                                                label="City"
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                            <Input
                                                label="State"
                                                required
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Payment Method Selection */}
                            <div className="bg-white rounded-xl p-6 shadow-soft">
                                <h2 className="text-xl font-display font-bold mb-4">Payment Method</h2>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        onClick={() => {
                                            setPaymentMethod("stripe");
                                            if (!clientSecret) {
                                                createStripePaymentIntent();
                                            }
                                        }}
                                        className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === "stripe"
                                            ? "border-primary-600 bg-primary-50"
                                            : "border-neutral-200 hover:border-primary-300"
                                            }`}
                                    >
                                        <CreditCard className="mx-auto mb-2" size={32} />
                                        <p className="font-semibold">Credit/Debit Card</p>
                                        <p className="text-xs text-neutral-600 mt-1">Powered by Stripe</p>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod("paypal")}
                                        className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === "paypal"
                                            ? "border-primary-600 bg-primary-50"
                                            : "border-neutral-200 hover:border-primary-300"
                                            }`}
                                    >
                                        <Wallet className="mx-auto mb-2" size={32} />
                                        <p className="font-semibold">PayPal</p>
                                        <p className="text-xs text-neutral-600 mt-1">Pay with PayPal</p>
                                    </button>
                                </div>

                                {/* Payment Forms */}
                                {paymentMethod === "stripe" && (
                                    <>
                                        {loading && !clientSecret && (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                                <span className="ml-3 text-neutral-600">Initializing payment...</span>
                                            </div>
                                        )}

                                        {clientSecret && (
                                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                <StripeCheckoutForm
                                                    amount={Math.round(totals.total * 100)}
                                                    onSuccess={handlePaymentSuccess}
                                                    onError={handlePaymentError}
                                                />
                                            </Elements>
                                        )}
                                    </>
                                )}

                                {paymentMethod === "paypal" && (
                                    <PayPalCheckout
                                        amount={totals.total}
                                        currency="USD"
                                        items={items.map(item => ({
                                            name: item.product.name,
                                            quantity: item.quantity,
                                            price: item.price,
                                        }))}
                                        shippingAddress={getShippingAddress()}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 shadow-soft sticky top-24">
                                <h2 className="text-xl font-display font-bold mb-4">Order Summary</h2>

                                {/* Items */}
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm">
                                            <span className="text-neutral-600">
                                                {item.product.name} x {item.quantity}
                                            </span>
                                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-neutral-200 pt-4 space-y-3">
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(totals.subtotal)}</span>
                                    </div>

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
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <WhatsAppButton />
        </>
    );
}
