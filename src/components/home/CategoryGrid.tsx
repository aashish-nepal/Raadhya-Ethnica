"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToCategorySettings, subscribeToProducts, CategoryGridItem } from "@/lib/firestore";

const CATEGORY_COLORS = [
    "from-rose-200 to-pink-300",
    "from-amber-200 to-yellow-300",
    "from-violet-200 to-purple-300",
    "from-sky-200 to-blue-300",
    "from-emerald-200 to-teal-300",
    "from-orange-200 to-red-300",
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function CategoryGrid() {
    const [categories, setCategories] = useState<CategoryGridItem[]>([]);
    const [productCounts, setProductCounts] = useState<Record<string, number>>({});

    // ── Subscribe to admin-controlled categories ──────────────────────────────
    useEffect(() => {
        const unsub = subscribeToCategorySettings((cats) => {
            setCategories(cats.filter((c) => c.visible).sort((a, b) => a.order - b.order));
        });
        return () => unsub();
    }, []);

    // ── Get live product counts per category slug ─────────────────────────────
    useEffect(() => {
        const unsub = subscribeToProducts((products) => {
            const counts: Record<string, number> = {};
            (products as any[]).forEach((p) => {
                if (p.category) {
                    const slug = p.category.toLowerCase().replace(/\s+/g, "-");
                    counts[slug] = (counts[slug] || 0) + 1;
                }
            });
            setProductCounts(counts);
        });
        return () => unsub();
    }, []);

    if (categories.length === 0) return null;

    return (
        <section className="py-24 bg-neutral-50">
            <div className="container-custom">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-xs text-primary-600 font-semibold uppercase tracking-[0.2em] mb-3">Curated Collections</p>
                    <h2 className="section-title mb-4">Shop by Category</h2>
                    <p className="text-neutral-500 max-w-xl mx-auto text-base leading-relaxed">
                        Explore our diverse collection — from everyday casuals to festive masterpieces.
                    </p>
                </motion.div>

                {/* Category Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5"
                >
                    {categories.map((category, index) => {
                        const liveCount = productCounts[category.slug] ?? productCounts[category.slug.toLowerCase()] ?? 0;

                        return (
                            <motion.div key={category.id} variants={itemVariants}>
                                <Link href={`/products?category=${category.slug}`} className="group block">
                                    {/* Image Card */}
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-400">

                                        {category.imageUrl ? (
                                            /* Real product image */
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {/* Subtle dark overlay for contrast */}
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                                            </>
                                        ) : (
                                            /* Gradient + emoji fallback */
                                            <>
                                                <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_COLORS[categories.indexOf(category) % CATEGORY_COLORS.length]} transition-transform duration-500 group-hover:scale-110`} />
                                                <div className="absolute inset-0 opacity-10"
                                                    style={{
                                                        backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
                                                        backgroundSize: "24px 24px",
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{category.emoji}</span>
                                                </div>
                                            </>
                                        )}

                                        {/* Live Product Count Badge */}
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-neutral-700 shadow-sm z-10">
                                            {liveCount > 0 ? `${liveCount}` : "—"}
                                        </div>

                                        {/* Hover overlay with Shop Now */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-700">
                                                Shop Now <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <div className="text-center px-1">
                                        <h3 className="font-semibold text-neutral-800 text-sm group-hover:text-primary-600 transition-colors leading-snug">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{category.description}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors group">
                        View All Products
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
