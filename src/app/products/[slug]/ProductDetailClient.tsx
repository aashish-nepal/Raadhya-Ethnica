"use client";

import { Product } from "@/types";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Share2, Truck, RotateCcw, AlertCircle, Package, Check, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { subscribeToProduct } from "@/lib/firestore";

interface ProductDetailClientProps {
    product: Product;
}

export default function ProductDetailClient({ product: initialProduct }: ProductDetailClientProps) {
    const [product, setProduct] = useState<Product>(initialProduct);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(product.sizes.find(s => s.inStock)?.size || "");
    const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");
    const [quantity, setQuantity] = useState(1);
    const [cartState, setCartState] = useState<"idle" | "adding" | "added">("idle");
    const [toast, setToast] = useState<{ visible: boolean; leaving: boolean }>({
        visible: false,
        leaving: false,
    });
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const btnRef = useRef<HTMLButtonElement>(null);
    const rippleId = useRef(0);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const addToCart = useCartStore((state) => state.addItem);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
    const toggleWishlist = useWishlistStore((state) => state.toggleItem);
    const { settings } = useSettingsContext();

    const lowStockThreshold = settings?.inventory.lowStockThreshold || 10;

    // Subscribe to real-time product updates
    useEffect(() => {
        const unsubscribe = subscribeToProduct(
            product.id,
            (updatedProduct) => {
                if (updatedProduct) {
                    setProduct(updatedProduct as Product);
                }
            },
            (error) => {
                console.error("Error subscribing to product:", error);
            }
        );

        return () => unsubscribe();
    }, [product.id]);

    // Get images for the selected color, or fall back to main product images
    const getCurrentImages = () => {
        if (selectedColor) {
            const colorData = product.colors.find(c => c.name === selectedColor);
            if (colorData && colorData.images && colorData.images.length > 0) {
                return colorData.images;
            }
        }
        return product.images;
    };

    const currentImages = getCurrentImages();

    // Use product's stockCount for inventory tracking
    const totalStock = product.stockCount || 0;
    const isOutOfStock = totalStock === 0 || !product.inStock;
    const isLowStock = totalStock > 0 && totalStock <= lowStockThreshold && product.inStock;

    // Handle color selection and reset image index
    const handleColorSelect = (colorName: string) => {
        setSelectedColor(colorName);
        setSelectedImage(0); // Reset to first image when color changes
    };

    const showToast = () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ visible: true, leaving: false });
        toastTimer.current = setTimeout(() => {
            setToast(prev => ({ ...prev, leaving: true }));
            setTimeout(() => setToast({ visible: false, leaving: false }), 350);
        }, 3000);
    };

    const dismissToast = () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(prev => ({ ...prev, leaving: true }));
        setTimeout(() => setToast({ visible: false, leaving: false }), 350);
    };

    const handleAddToCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (isOutOfStock || cartState !== "idle") return;

        if (!selectedSize || !selectedColor) {
            // Shake the button briefly instead of alert
            setCartState("adding");
            setTimeout(() => setCartState("idle"), 400);
            return;
        }

        const selectedSizeData = product.sizes.find(s => s.size === selectedSize);
        if (selectedSizeData && !selectedSizeData.inStock) {
            setCartState("adding");
            setTimeout(() => setCartState("idle"), 400);
            return;
        }

        // Ripple effect
        if (e && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = ++rippleId.current;
            setRipples(prev => [...prev, { id, x, y }]);
            setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
        }

        addToCart(product, selectedSize, selectedColor, quantity);
        setCartState("added");
        showToast();
        setTimeout(() => setCartState("idle"), 2500);
    };

    return (
        <>
            <div className="container-custom py-8">
                {/* Breadcrumb */}
                <div className="text-sm text-neutral-600 mb-6">
                    <span>Home</span> / <span>Products</span> / <span>{product.category}</span> / <span className="text-neutral-900">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-4">
                            <img
                                src={currentImages[selectedImage] || currentImages[0]}
                                alt={`${product.name} - ${selectedColor}`}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                            {product.discount > 0 && (
                                <Badge variant="danger" className="absolute top-4 left-4">
                                    {product.discount}% OFF
                                </Badge>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-3">
                            {currentImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? "border-primary-500" : "border-neutral-200"
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="eager"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-neutral-300"}>
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm text-neutral-600">
                                {product.rating} ({product.reviewCount} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl font-bold text-neutral-900">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice > product.price && (
                                <>
                                    <span className="text-xl text-neutral-500 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                    <Badge variant="success">{product.discount}% OFF</Badge>
                                </>
                            )}
                        </div>

                        {/* Stock Status Indicators */}
                        {isOutOfStock && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                <AlertCircle className="text-red-600" size={20} />
                                <div>
                                    <p className="font-semibold text-red-900">Out of Stock</p>
                                    <p className="text-sm text-red-700">This product is currently unavailable</p>
                                </div>
                            </div>
                        )}

                        {isLowStock && !isOutOfStock && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                                <Package className="text-amber-600" size={20} />
                                <div>
                                    <p className="font-semibold text-amber-900">Low Stock Alert</p>
                                    <p className="text-sm text-amber-700">Only {totalStock} items left in stock!</p>
                                </div>
                            </div>
                        )}

                        <p className="text-neutral-600 mb-6">{product.shortDescription}</p>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-3">
                                Color: <span className="text-primary-600">{selectedColor}</span>
                            </label>
                            <div className="flex gap-2">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleColorSelect(color.name)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.name ? "border-primary-500 scale-110" : "border-neutral-300"
                                            }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-3">
                                Size: <span className="text-primary-600">{selectedSize}</span>
                            </label>
                            <div className="flex gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size.size}
                                        onClick={() => setSelectedSize(size.size)}
                                        disabled={!size.inStock}
                                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedSize === size.size
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : size.inStock
                                                ? "border-neutral-300 hover:border-neutral-400"
                                                : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                            }`}
                                    >
                                        {size.size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-3">Quantity</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg border border-neutral-300 hover:bg-neutral-100"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-semibold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-lg border border-neutral-300 hover:bg-neutral-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-6">
                            <button
                                ref={btnRef}
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`relative flex-1 overflow-hidden flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold transition-all duration-400 ${isOutOfStock
                                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                    : cartState === "added"
                                        ? "bg-emerald-500 text-white animate-success-glow shadow-lg shadow-emerald-200"
                                        : cartState === "adding"
                                            ? "bg-primary-500 text-white animate-cart-bounce"
                                            : "bg-primary-600 hover:bg-primary-700 text-white active:scale-95 shadow-md hover:shadow-lg hover:shadow-primary-200"
                                    }`}
                            >
                                {/* Ripple elements */}
                                {ripples.map(r => (
                                    <span
                                        key={r.id}
                                        className="absolute rounded-full bg-white/30 pointer-events-none"
                                        style={{
                                            width: 10,
                                            height: 10,
                                            left: r.x - 5,
                                            top: r.y - 5,
                                            animation: 'cart-ripple 0.7s ease-out forwards',
                                        }}
                                    />
                                ))}

                                {/* Icon */}
                                <span className={`transition-all duration-300 ${cartState === "added" ? "rotate-0 scale-110" : ""}`}>
                                    {cartState === "added" ? (
                                        <Check size={20} strokeWidth={2.5} />
                                    ) : (
                                        <ShoppingCart size={20} className={cartState === "adding" ? "animate-bounce" : ""} />
                                    )}
                                </span>

                                {/* Label */}
                                <span>
                                    {isOutOfStock
                                        ? "Out of Stock"
                                        : cartState === "added"
                                            ? "Added to Cart!"
                                            : "Add to Cart"}
                                </span>
                            </button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => toggleWishlist(product.id)}
                            >
                                <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
                            </Button>
                            <Button size="lg" variant="outline">
                                <Share2 size={20} />
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="border-t border-neutral-200 pt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Truck size={20} className="text-primary-600" />
                                <span>Free shipping on orders above {formatPrice(settings?.shipping.freeShippingThreshold || 100)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <RotateCcw size={20} className="text-primary-600" />
                                <span>{settings?.policies.returnPeriodDays || 7}-day easy return policy</span>
                            </div>
                            {settings?.policies.exchangeAllowed && (
                                <div className="flex items-center gap-3 text-sm">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    <span>Exchange available</span>
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="mt-8 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Product Details</h3>
                                <ul className="text-sm text-neutral-600 space-y-1">
                                    <li>• Fabric: {product.fabric}</li>
                                    <li>• Sleeve Type: {product.sleeveType}</li>
                                    <li>• Neck Type: {product.neckType}</li>
                                    <li>• SKU: {product.sku}</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Care Instructions</h3>
                                <ul className="text-sm text-neutral-600 space-y-1">
                                    {product.careInstructions.map((instruction, index) => (
                                        <li key={index}>• {instruction}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-12 border-t border-neutral-200 pt-8">
                    <h2 className="text-2xl font-display font-bold mb-4">Description</h2>
                    <p className="text-neutral-600 leading-relaxed">{product.description}</p>
                </div>
            </div>

            {/* ===== Add to Cart Toast ===== */}
            {
                toast.visible && (
                    <div
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${toast.leaving ? "animate-toast-out" : "animate-toast-in"
                            }`}
                    >
                        <div className="flex items-center gap-4 bg-white rounded-2xl shadow-2xl border border-emerald-100 px-5 py-4 min-w-[300px] max-w-sm">
                            {/* Green checkmark circle */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                                <svg
                                    width="18" height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline
                                        points="20 6 9 17 4 12"
                                        style={{
                                            strokeDasharray: 50,
                                            strokeDashoffset: 0,
                                            animation: 'checkmark-draw 0.4s ease-out 0.1s both',
                                        }}
                                    />
                                </svg>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-900 text-sm">Added to cart!</p>
                                <p className="text-xs text-neutral-500 truncate mt-0.5">
                                    {product.name} · {selectedColor} · {selectedSize}
                                </p>
                            </div>

                            {/* Dismiss */}
                            <button
                                onClick={dismissToast}
                                className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                            >
                                <X size={14} className="text-neutral-400" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="h-0.5 bg-emerald-100 rounded-full mt-1 mx-1 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ animation: 'shimmer 3s linear forwards', width: '100%', transformOrigin: 'left' }}
                            />
                        </div>
                    </div>
                )
            }
        </>
    );
}
