"use client";

import { useEffect, useState } from "react";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductCarousel from "@/components/home/ProductCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import { subscribeToProducts } from "@/lib/firestore";

export default function HomePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time product updates from Firestore
        const unsubscribe = subscribeToProducts(
            (productsData) => {
                setProducts(productsData);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading products:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Filter products for different sections
    const trendingProducts = products.filter((p) => p.isTrending);
    const newArrivals = products.filter((p) => p.isNewArrival);
    const bestSellers = products.filter((p) => p.isBestSeller);

    return (
        <>
            <HeroSection />

            {/* Limited Time Offer Banner */}
            <section className="bg-gradient-to-r from-secondary-400 to-secondary-500 py-4">
                <div className="container-custom text-center">
                    <p className="text-white font-semibold text-lg">
                        ⏰ Limited Time Offer: Flat 35% OFF on all kurtas | Ends in 2 days!
                    </p>
                </div>
            </section>

            <CategoryGrid />

            {/* Trending Products */}
            {loading ? (
                <div className="container-custom py-16 text-center">
                    <p className="text-neutral-600">Loading products...</p>
                </div>
            ) : (
                <>
                    {trendingProducts.length > 0 && (
                        <ProductCarousel title="Trending Now" products={trendingProducts} />
                    )}

                    {/* New Arrivals */}
                    {newArrivals.length > 0 && (
                        <ProductCarousel title="New Arrivals" products={newArrivals} />
                    )}

                    {/* Best Sellers */}
                    {bestSellers.length > 0 && (
                        <ProductCarousel title="Best Sellers" products={bestSellers} />
                    )}

                    {/* Show message if no products */}
                    {products.length === 0 && (
                        <div className="container-custom py-16 text-center">
                            <p className="text-neutral-600 text-lg">
                                No products available yet. Add products from the admin panel!
                            </p>
                        </div>
                    )}
                </>
            )}

            <TrustBadges />

            <WhatsAppButton />
        </>
    );
}
