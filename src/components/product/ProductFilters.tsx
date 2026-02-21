"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { subscribeToCategorySettings, subscribeToProducts, CategoryGridItem } from "@/lib/firestore";

interface FilterOptions {
    priceRange: [number, number];
    categories: string[];
    sizes: string[];
    colors: string[];
    fabrics: string[];
    rating: number;
}

interface ProductFiltersProps {
    onFilterChange: (filters: FilterOptions) => void;
    onClose?: () => void;
}

export default function ProductFilters({ onFilterChange, onClose }: ProductFiltersProps) {
    const [filters, setFilters] = useState<FilterOptions>({
        priceRange: [0, 5000],
        categories: [],
        sizes: [],
        colors: [],
        fabrics: [],
        rating: 0,
    });
    const [categories, setCategories] = useState<CategoryGridItem[]>([]);
    const [sizes, setSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
    const [fabrics, setFabrics] = useState<string[]>([]);

    // Live categories from admin settings
    useEffect(() => {
        const unsub = subscribeToCategorySettings((cats) =>
            setCategories(cats.filter((c) => c.visible).sort((a, b) => a.order - b.order))
        );
        return () => unsub();
    }, []);

    // Derive sizes, colors, fabrics from actual product catalog
    useEffect(() => {
        const unsub = subscribeToProducts((products: any[]) => {
            // Unique sizes (preserving natural order: XS → XXL)
            const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE SIZE"];
            const sizeSet = new Set<string>();
            products.forEach((p) => (p.sizes || []).forEach((s: any) => s.size && sizeSet.add(s.size.toUpperCase())));
            setSizes(sizeOrder.filter((s) => sizeSet.has(s)).concat([...sizeSet].filter((s) => !sizeOrder.includes(s))));

            // Unique colors with hex (deduplicated by name)
            const colorMap = new Map<string, string>();
            products.forEach((p) =>
                (p.colors || []).forEach((c: any) => {
                    if (c.name && !colorMap.has(c.name.toLowerCase())) {
                        colorMap.set(c.name.toLowerCase(), c.hex || "#cccccc");
                    }
                })
            );
            setColors([...colorMap.entries()].map(([name, hex]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), hex })).sort((a, b) => a.name.localeCompare(b.name)));

            // Unique fabrics
            const fabricSet = new Set<string>();
            products.forEach((p) => p.fabric && fabricSet.add(p.fabric));
            setFabrics([...fabricSet].sort());
        });
        return () => unsub();
    }, []);


    const handleCategoryToggle = (categorySlug: string) => {
        const newCategories = filters.categories.includes(categorySlug)
            ? filters.categories.filter((c) => c !== categorySlug)
            : [...filters.categories, categorySlug];

        const newFilters = { ...filters, categories: newCategories };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSizeToggle = (size: string) => {
        const newSizes = filters.sizes.includes(size)
            ? filters.sizes.filter((s) => s !== size)
            : [...filters.sizes, size];

        const newFilters = { ...filters, sizes: newSizes };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleColorToggle = (color: string) => {
        const newColors = filters.colors.includes(color)
            ? filters.colors.filter((c) => c !== color)
            : [...filters.colors, color];

        const newFilters = { ...filters, colors: newColors };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleFabricToggle = (fabric: string) => {
        const newFabrics = filters.fabrics.includes(fabric)
            ? filters.fabrics.filter((f) => f !== fabric)
            : [...filters.fabrics, fabric];

        const newFilters = { ...filters, fabrics: newFabrics };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceChange = (min: number, max: number) => {
        const newFilters = { ...filters, priceRange: [min, max] as [number, number] };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleRatingChange = (rating: number) => {
        const newFilters = { ...filters, rating };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearAllFilters = () => {
        const resetFilters: FilterOptions = {
            priceRange: [0, 5000],
            categories: [],
            sizes: [],
            colors: [],
            fabrics: [],
            rating: 0,
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold">Filters</h3>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear All
                    </Button>
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="mb-6 pb-6 border-b border-neutral-200">
                <h4 className="font-semibold mb-3">Categories</h4>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label key={category.slug} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.categories.includes(category.slug)}
                                onChange={() => handleCategoryToggle(category.slug)}
                                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm">{category.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6 pb-6 border-b border-neutral-200">
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.priceRange[0]}
                            onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.priceRange[1]}
                            onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-6 pb-6 border-b border-neutral-200">
                <h4 className="font-semibold mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => handleSizeToggle(size)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${filters.sizes.includes(size)
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-neutral-300 hover:border-neutral-400"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="mb-6 pb-6 border-b border-neutral-200">
                <h4 className="font-semibold mb-3">Color</h4>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => handleColorToggle(color.name)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${filters.colors.includes(color.name)
                                ? "border-primary-500 scale-110"
                                : "border-neutral-300"
                                }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            {/* Fabric */}
            <div className="mb-6 pb-6 border-b border-neutral-200">
                <h4 className="font-semibold mb-3">Fabric</h4>
                <div className="space-y-2">
                    {fabrics.map((fabric) => (
                        <label key={fabric} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.fabrics.includes(fabric)}
                                onChange={() => handleFabricToggle(fabric)}
                                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm">{fabric}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div>
                <h4 className="font-semibold mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="rating"
                                checked={filters.rating === rating}
                                onChange={() => handleRatingChange(rating)}
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-1">
                                {[...Array(rating)].map((_, i) => (
                                    <span key={i} className="text-yellow-400">★</span>
                                ))}
                                <span className="text-sm text-neutral-600">& Up</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
