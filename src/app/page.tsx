"use client";

import { useEffect, useState } from "react";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductCarousel from "@/components/home/ProductCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import NewsletterSection from "@/components/home/NewsletterSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { subscribeToProducts, subscribeToHeroSettings } from "@/lib/firestore";

export default function HomePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bannerText, setBannerText] = useState("⏰ Limited Time Offer: Flat 35% OFF on all kurtas | Ends in 2 days!");

    useEffect(() => {
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

    useEffect(() => {
        const unsubscribe = subscribeToHeroSettings(({ promoText }) => {
            if (promoText) setBannerText(promoText);
        });
        return () => unsubscribe();
    }, []);

    const trendingProducts = products.filter((p) => p.isTrending);
    const newArrivals = products.filter((p) => p.isNewArrival);
    const bestSellers = products.filter((p) => p.isBestSeller);

    return (
        <>
            <HeroSection />

            {/* Trust Badges strip right below hero */}
            <TrustBadges />

            {/* Category Section */}
            <CategoryGrid />

            {/* Product Collections */}
            {loading ? (
                <div className="py-24 flex items-center justify-center bg-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
                        <p className="text-neutral-400 text-sm">Loading products...</p>
                    </div>
                </div>
            ) : (
                <>
                    {trendingProducts.length > 0 && (
                        <ProductCarousel title="Trending Now 🔥" products={trendingProducts} />
                    )}

                    {newArrivals.length > 0 && (
                        <div className="bg-neutral-50">
                            <ProductCarousel title="New Arrivals ✨" products={newArrivals} />
                        </div>
                    )}

                    {bestSellers.length > 0 && (
                        <ProductCarousel title="Best Sellers ⭐" products={bestSellers} />
                    )}

                    {products.length === 0 && (
                        <div className="py-24 text-center bg-white">
                            <div className="text-5xl mb-4">🛍️</div>
                            <p className="text-neutral-500 text-lg font-medium">
                                No products available yet.
                            </p>
                            <p className="text-neutral-400 text-sm mt-2">
                                Add products from the admin panel to get started!
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Newsletter */}
            <NewsletterSection />

            <WhatsAppButton />
        </>
    );
}
