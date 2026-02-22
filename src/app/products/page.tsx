"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import ProductSort from "@/components/product/ProductSort";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { subscribeToProducts } from "@/lib/firestore";

function ProductsPageContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";
    const categoryQuery = searchParams.get("category") || "";

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("featured");
    const [loading, setLoading] = useState(true);

    // Subscribe to real-time products
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
        let result = [...products];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(
                (product) =>
                    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.fabric?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (categoryQuery) {
            result = result.filter((product) => product.category?.toLowerCase() === categoryQuery.toLowerCase());
        }

        setFilteredProducts(result);
    }, [searchQuery, categoryQuery, products]);

    const handleFilterChange = (filters: any) => {
        let result = [...products];

        // Apply search
        if (searchQuery) {
            result = result.filter(
                (product) =>
                    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (filters.categories.length > 0) {
            result = result.filter((product) =>
                filters.categories.some((cat: string) => product.category?.toLowerCase().includes(cat))
            );
        }

        // Apply price filter
        result = result.filter(
            (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
        );

        // Apply size filter
        if (filters.sizes.length > 0) {
            result = result.filter((product) =>
                product.sizes?.some((size: any) => filters.sizes.includes(size.size))
            );
        }

        // Apply color filter
        if (filters.colors.length > 0) {
            result = result.filter((product) =>
                product.colors?.some((color: any) => filters.colors.includes(color.name))
            );
        }

        // Apply fabric filter
        if (filters.fabrics.length > 0) {
            result = result.filter((product) => filters.fabrics.includes(product.fabric));
        }

        // Apply rating filter
        if (filters.rating > 0) {
            result = result.filter((product) => product.rating >= filters.rating);
        }

        setFilteredProducts(applySortOrder(result, sortBy));
    };

    const applySortOrder = (products: any[], sortKey: string) => {
        const sorted = [...products];
        switch (sortKey) {
            case "price-asc":
                sorted.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                sorted.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case "newest":
                sorted.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
                break;
            case "popular":
                sorted.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
                break;
            default:
                break;
        }
        return sorted;
    };

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        setFilteredProducts(applySortOrder(filteredProducts, newSortBy));
    };

    return (
        <>
            <div className="min-h-screen bg-neutral-50">
                <div className="container-custom py-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                            {searchQuery ? `Search Results for "${searchQuery}"` : categoryQuery ? `${categoryQuery} Kurtas` : "All Products"}
                        </h1>
                        <p className="text-neutral-600">
                            {loading ? "Loading..." : `Showing ${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}`}
                        </p>
                    </div>

                    {/* Filters and Sort Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden"
                        >
                            <SlidersHorizontal size={20} className="mr-2" />
                            Filters
                        </Button>
                        <div className="ml-auto">
                            <ProductSort onSortChange={handleSortChange} />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Filters Sidebar */}
                        <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
                            {showFilters && (
                                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
                            )}
                            <div className={`${showFilters ? "fixed inset-y-0 left-0 w-80 z-50 overflow-y-auto lg:relative lg:w-auto" : ""}`}>
                                <ProductFilters
                                    onFilterChange={handleFilterChange}
                                    onClose={() => setShowFilters(false)}
                                />
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <div className="text-center py-16 bg-white rounded-xl">
                                    <p className="text-xl text-neutral-600">Loading products...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-xl">
                                    <p className="text-xl text-neutral-600 mb-4">No products found</p>
                                    <p className="text-neutral-500">
                                        {products.length === 0
                                            ? "Add products from the admin panel to get started!"
                                            : "Try adjusting your filters or search query"}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <WhatsAppButton />
        </>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>}>
            <ProductsPageContent />
        </Suspense>
    );
}
