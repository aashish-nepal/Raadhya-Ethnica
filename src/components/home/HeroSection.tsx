"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { subscribeToHeroSettings, getProductById } from "@/lib/firestore";
import { ArrowRight, Star, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/types";

export default function HeroSection() {
    const [promoText, setPromoText] = useState("✨ New Collection 2024");
    const [badgeLabel, setBadgeLabel] = useState("Special Offer");
    const [badgeValue, setBadgeValue] = useState("35% OFF");
    const [featuredProductId, setFeaturedProductId] = useState<string | null>(null);
    const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToHeroSettings(({ featuredProductId: pid, promoText: text, badgeLabel: bl, badgeValue: bv }) => {
            setPromoText(text || "✨ New Collection 2024");
            setBadgeLabel(bl || "Special Offer");
            setBadgeValue(bv || "35% OFF");
            setFeaturedProductId(pid || null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!featuredProductId) { setFeaturedProduct(null); return; }
        getProductById(featuredProductId)
            .then((p) => setFeaturedProduct((p as Product) ?? null))
            .catch(() => setFeaturedProduct(null));
    }, [featuredProductId]);

    const heroImage = featuredProduct?.images?.[0] ?? "";

    const stats = [
        { value: "500+", label: "Unique Designs" },
        { value: "10K+", label: "Happy Customers" },
        { value: "4.8★", label: "Avg Rating" },
    ];

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf2f8] via-white to-[#fef9c3] min-h-[90vh] flex items-center">
            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" style={{ animationDelay: "2s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: "4s" }} />
            </div>

            <div className="container-custom relative py-16 md:py-20 lg:py-24 w-full">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* ── TEXT CONTENT ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center lg:text-left"
                    >
                        {/* Promo badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center gap-2 mb-6"
                        >
                            <span className="badge-primary text-xs font-semibold tracking-widest uppercase">
                                <Star size={10} className="fill-primary-500 text-primary-500" />
                                {promoText}
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-[2.75rem] sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.05] mb-5 text-neutral-900">
                            Discover
                            <span className="block gradient-text">Premium Women's</span>
                            <span className="block text-neutral-800">Kurtas</span>
                        </h1>

                        <p className="text-base md:text-lg text-neutral-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Experience elegance and comfort with our curated collection of designer kurtas—crafted for every occasion.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                            <Link href={featuredProduct ? `/products/${featuredProduct.slug || featuredProduct.id}` : "/products"}>
                                <button className="btn-primary shadow-lg">
                                    {featuredProduct ? "View Featured" : "Shop Now"}
                                    <ArrowRight size={16} />
                                </button>
                            </Link>
                            <Link href="/products">
                                <button className="btn-outline">
                                    View All Products
                                </button>
                            </Link>
                        </div>

                        {/* Trust mini-strip */}
                        <div className="flex items-center gap-6 justify-center lg:justify-start text-xs text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-primary-500" />
                                <span>Secure Checkout</span>
                            </div>
                            <div className="w-px h-4 bg-neutral-200" />
                            <div className="flex items-center gap-1.5">
                                <Truck size={14} className="text-primary-500" />
                                <span>Free Shipping $150+</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-neutral-200">
                            {stats.map(({ value, label }) => (
                                <div key={label} className="text-center lg:text-left">
                                    <p className="text-2xl lg:text-3xl font-bold text-primary-600 font-display">{value}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── HERO IMAGE ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative flex justify-center lg:justify-end"
                    >
                        {/* Image frame */}
                        <div className="relative w-full max-w-sm lg:max-w-md xl:max-w-lg">
                            {/* Decorative frame accent */}
                            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary-200 via-primary-100 to-secondary-100 opacity-60 blur-sm" />

                            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                                {/* Background gradient placeholder */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-50 to-primary-200" />

                                {heroImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={heroImage}
                                        alt={featuredProduct?.name ?? "Featured Product"}
                                        className="absolute inset-0 w-full h-full object-cover z-10"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-primary-400">
                                        <div className="text-6xl mb-4">👗</div>
                                        <p className="text-sm font-medium text-primary-500">Featured Product</p>
                                        <p className="text-xs text-primary-400 mt-1">Set in Admin Panel</p>
                                    </div>
                                )}


                            </div>

                            {/* Floating Discount Badge */}
                            <div className="absolute -bottom-5 -left-5 lg:-left-8 bg-white rounded-2xl shadow-xl px-5 py-4 animate-float z-20 border border-primary-100">
                                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">{badgeLabel}</p>
                                <p className="text-2xl font-display font-bold text-primary-600">{badgeValue}</p>
                            </div>

                            {/* Floating "new arrival" tag */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="absolute -top-4 -right-4 lg:-right-6 bg-neutral-900 text-white rounded-2xl px-4 py-3 shadow-xl z-20"
                            >
                                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">Just Arrived</p>
                                <p className="text-sm font-bold">New Season ✨</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
