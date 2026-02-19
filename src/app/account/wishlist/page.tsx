"use client";

import { useEffect, useState } from "react";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { useWishlistStore } from "@/store/wishlistStore";
import ProductCard from "@/components/product/ProductCard";
import { subscribeToProduct } from "@/lib/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export default function WishlistPage() {
    const wishlistItems = useWishlistStore((state) => state.items);
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (wishlistItems.length === 0) {
            setWishlistProducts([]);
            setLoading(false);
            return;
        }

        // Real-time subscriptions for all wishlist products
        const unsubscribers: (() => void)[] = [];
        const productsMap = new Map<string, Product>();

        wishlistItems.forEach((productId) => {
            const unsubscribe = subscribeToProduct(
                productId,
                (product) => {
                    if (product) {
                        productsMap.set(productId, product as Product);
                    } else {
                        productsMap.delete(productId);
                    }
                    // Update state with current products
                    setWishlistProducts(Array.from(productsMap.values()));
                    setLoading(false);
                },
                (error) => {
                    console.error(`Error loading product ${productId}:`, error);
                    setLoading(false);
                }
            );
            unsubscribers.push(unsubscribe);
        });

        // Cleanup all subscriptions
        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    }, [wishlistItems]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">
                        My Wishlist ({wishlistItems.length})
                    </h1>

                    {wishlistProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">💝</div>
                            <h2 className="text-2xl font-display font-bold mb-2">Your wishlist is empty</h2>
                            <p className="text-neutral-600 mb-6">Save your favorite items here!</p>
                            <Link href="/products">
                                <Button size="lg">Browse Products</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {wishlistProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <WhatsAppButton />
        </>
    );
}
