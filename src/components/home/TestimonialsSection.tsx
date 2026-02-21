"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { subscribeToReviews } from "@/lib/firestore";
import type { Review } from "@/types";

const AVATAR_COLORS = [
    "from-rose-400 to-pink-500",
    "from-violet-400 to-purple-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-blue-500",
    "from-emerald-400 to-teal-500",
    "from-fuchsia-400 to-pink-500",
];

export default function TestimonialsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToReviews((data) => {
            setReviews(data as Review[]);
            setLoading(false);
        }, 6);
        return () => unsub();
    }, []);

    // Hide section entirely if no real reviews yet
    if (!loading && reviews.length === 0) return null;

    return (
        <section className="py-24 bg-neutral-50">
            <div className="container-custom">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-xs text-primary-600 font-semibold uppercase tracking-[0.2em] mb-3">What Our Customers Say</p>
                    <h2 className="section-title mb-4">Loved by Thousands</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center justify-center gap-1 mt-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={18} className="fill-amber-400 text-amber-400" />
                            ))}
                            <span className="ml-2 text-sm font-semibold text-neutral-700">
                                {(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)} / 5
                            </span>
                            <span className="text-sm text-neutral-400 ml-1">from {reviews.length}+ reviews</span>
                        </div>
                    )}
                </motion.div>

                {/* Loading shimmer */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-7 border border-neutral-100 animate-pulse">
                                <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map(s => <div key={s} className="w-3 h-3 rounded-full bg-neutral-200" />)}</div>
                                <div className="space-y-2 mb-6">
                                    <div className="h-3 bg-neutral-200 rounded w-full" />
                                    <div className="h-3 bg-neutral-200 rounded w-4/5" />
                                    <div className="h-3 bg-neutral-200 rounded w-3/5" />
                                </div>
                                <div className="flex items-center gap-3 pt-5 border-t border-neutral-100">
                                    <div className="w-10 h-10 rounded-full bg-neutral-200" />
                                    <div className="space-y-1.5">
                                        <div className="h-3 bg-neutral-200 rounded w-24" />
                                        <div className="h-2.5 bg-neutral-200 rounded w-16" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reviews.map((r, index) => {
                            const initials = r.userName
                                ? r.userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                                : "?";
                            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.55, delay: (index % 3) * 0.1 }}
                                    className="bg-white rounded-2xl p-7 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
                                >
                                    {/* Stars */}
                                    <div className="flex gap-0.5 mb-4">
                                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                                            <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    {/* Title */}
                                    {r.title && (
                                        <p className="font-semibold text-sm text-neutral-900 mb-2">{r.title}</p>
                                    )}

                                    {/* Quote */}
                                    <p className="text-neutral-600 text-sm leading-relaxed flex-1 mb-6">"{r.comment}"</p>

                                    {/* Verified badge */}
                                    {r.verified && (
                                        <div className="inline-flex items-center mb-5">
                                            <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-medium">
                                                ✓ Verified Purchase
                                            </span>
                                        </div>
                                    )}

                                    {/* Author */}
                                    <div className="flex items-center gap-3 pt-5 border-t border-neutral-100">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-neutral-900">{r.userName}</p>
                                            <p className="text-xs text-neutral-400">
                                                {r.createdAt
                                                    ? new Date(
                                                        typeof r.createdAt === "string"
                                                            ? r.createdAt
                                                            : (r.createdAt as any)?.toDate?.() ?? r.createdAt
                                                    ).toLocaleDateString("en-AU", { month: "short", year: "numeric" })
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
