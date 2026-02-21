"use client";

import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProductCarouselProps {
    title: string;
    products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -320 : 320,
                behavior: "smooth",
            });
        }
    };

    if (products.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-xs text-primary-600 font-semibold uppercase tracking-[0.2em] mb-2">Our Collection</p>
                        <h2 className="section-title">{title}</h2>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        <Link href="/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors group mr-2">
                            View All
                            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <button
                            onClick={() => scroll("left")}
                            className="p-2.5 rounded-full border-2 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-all"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} className="text-neutral-700" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-2.5 rounded-full border-2 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-all"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} className="text-neutral-700" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Row */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                >
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            className="flex-shrink-0 w-[260px] sm:w-[280px]"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
