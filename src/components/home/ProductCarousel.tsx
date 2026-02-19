"use client";

import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface ProductCarouselProps {
    title: string;
    products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-neutral-50">
            <div className="container-custom">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl md:text-4xl font-display font-bold">
                        {title}
                    </h2>

                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-2 rounded-full border border-neutral-300 hover:bg-white hover:shadow-md transition-all"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-2 rounded-full border border-neutral-300 hover:bg-white hover:shadow-md transition-all"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                >
                    {products.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-[280px]">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
