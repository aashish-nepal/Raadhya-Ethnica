"use client";

import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { useState, useRef } from "react";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [imageError, setImageError] = useState(false);
    const [cartState, setCartState] = useState<"idle" | "added">("idle");
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const btnRef = useRef<HTMLButtonElement>(null);
    const rippleId = useRef(0);

    const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
    const toggleWishlist = useWishlistStore((state) => state.toggleItem);
    const addToCart = useCartStore((state) => state.addItem);
    const { settings } = useSettingsContext();

    const lowStockThreshold = settings?.inventory.lowStockThreshold || 10;
    const isLowStock = product.inStock && product.stockCount > 0 && product.stockCount <= lowStockThreshold;

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!product.inStock || cartState === "added") return;

        // Ripple effect
        const btn = btnRef.current;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = ++rippleId.current;
            setRipples(prev => [...prev, { id, x, y }]);
            setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
        }

        // Add to cart
        const defaultSize = product.sizes.find(s => s.inStock)?.size || product.sizes[0]?.size;
        const defaultColor = product.colors[0]?.name;
        if (defaultSize && defaultColor) {
            addToCart(product, defaultSize, defaultColor, 1);
        }

        // Animate success state
        setCartState("added");
        setTimeout(() => setCartState("idle"), 2000);
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleWishlist(product.id);
    };


    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 product-card-hover">
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                    {!imageError && product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                            <span className="text-6xl">👗</span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.discount > 0 && (
                            <Badge variant="danger" className="shadow-sm">
                                {product.discount}% OFF
                            </Badge>
                        )}
                        {product.isNewArrival && (
                            <Badge variant="success" className="shadow-sm">
                                New
                            </Badge>
                        )}
                        {product.isBestSeller && (
                            <Badge variant="warning" className="shadow-sm">
                                Bestseller
                            </Badge>
                        )}
                        {isLowStock && (
                            <Badge variant="warning" className="shadow-sm">
                                Only {product.stockCount} left
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                        aria-label="Add to wishlist"
                    >
                        <Heart
                            size={18}
                            className={isInWishlist ? "fill-red-500 text-red-500" : "text-neutral-700"}
                        />
                    </button>

                    {/* Quick Actions - Show on Hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                            ref={btnRef}
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className={`relative flex-1 overflow-hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${!product.inStock
                                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                    : cartState === "added"
                                        ? "bg-emerald-500 text-white scale-95 animate-success-glow"
                                        : "bg-primary-600 hover:bg-primary-700 text-white active:scale-95"
                                }`}
                        >
                            {/* Ripple elements */}
                            {ripples.map(r => (
                                <span
                                    key={r.id}
                                    className="absolute rounded-full bg-white/30 pointer-events-none"
                                    style={{
                                        width: 8,
                                        height: 8,
                                        left: r.x - 4,
                                        top: r.y - 4,
                                        animation: 'cart-ripple 0.6s ease-out forwards',
                                    }}
                                />
                            ))}

                            {/* Icon */}
                            <span className={`transition-all duration-300 ${cartState === "added" ? "scale-110" : ""}`}>
                                {cartState === "added" ? (
                                    <Check size={15} strokeWidth={2.5} />
                                ) : (
                                    <ShoppingCart size={15} />
                                )}
                            </span>

                            {/* Text */}
                            <span className="transition-all duration-300">
                                {!product.inStock ? "Out of Stock" : cartState === "added" ? "Added!" : "Add to Cart"}
                            </span>
                        </button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-white"
                        >
                            <Eye size={16} />
                        </Button>
                    </div>

                    {/* Stock Status */}
                    {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white px-4 py-2 rounded-lg font-semibold text-neutral-900">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-sm text-neutral-500">
                            ({product.reviewCount})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-neutral-900">
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                            <span className="text-sm text-neutral-500 line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Colors */}
                    {product.colors.length > 0 && (
                        <div className="flex gap-1 mt-3">
                            {product.colors.slice(0, 4).map((color, index) => (
                                <div
                                    key={index}
                                    className="w-6 h-6 rounded-full border-2 border-neutral-200"
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                            {product.colors.length > 4 && (
                                <div className="w-6 h-6 rounded-full border-2 border-neutral-200 bg-neutral-100 flex items-center justify-center text-xs">
                                    +{product.colors.length - 4}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
