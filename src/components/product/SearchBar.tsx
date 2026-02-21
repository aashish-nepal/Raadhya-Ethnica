"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { subscribeToProducts } from "@/lib/firestore";

interface Product {
    id: string;
    name: string;
    slug?: string;
    category?: string;
    price?: number;
    images?: string[];
    fabric?: string;
}

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Load search history from localStorage ───────────────────────────────
    useEffect(() => {
        const history = localStorage.getItem("searchHistory");
        if (history) setSearchHistory(JSON.parse(history));
    }, []);

    // ─── Subscribe to Firestore products in real-time ─────────────────────────
    useEffect(() => {
        const unsubscribe = subscribeToProducts(
            (products) => setAllProducts(products as Product[]),
            (err) => console.error("Search product load error:", err)
        );
        return () => unsubscribe();
    }, []);

    // ─── Close dropdown on outside click ─────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ─── Debounced client-side search against Firestore data ──────────────────
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length > 1) {
            setLoading(true);
            debounceRef.current = setTimeout(() => {
                const q = query.toLowerCase();
                const filtered = allProducts
                    .filter((p) =>
                        (p.name?.toLowerCase().includes(q)) ||
                        (p.category?.toLowerCase().includes(q)) ||
                        (p.fabric?.toLowerCase().includes(q))
                    )
                    .slice(0, 6);
                setSuggestions(filtered);
                setIsOpen(true);
                setLoading(false);
            }, 200);
        } else {
            setSuggestions([]);
            setLoading(false);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, allProducts]);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return;
        const newHistory = [searchQuery, ...searchHistory.filter((h) => h !== searchQuery)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        setQuery("");
        setIsOpen(false);
    }, [searchHistory, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleProductClick = (product: Product) => {
        const href = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
        router.push(href);
        setQuery("");
        setIsOpen(false);
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem("searchHistory");
    };

    const showDropdown = isOpen && (query.length > 1 || searchHistory.length > 0);

    return (
        <div ref={searchRef} className="relative flex-1 max-w-xl">
            <form onSubmit={handleSubmit} className="relative">
                {/* Search icon / loader */}
                {loading ? (
                    <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 animate-spin" size={18} />
                ) : (
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                )}

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search for kurtas, fabrics, colors..."
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm transition-all"
                />

                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(""); setSuggestions([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                        <X size={17} />
                    </button>
                )}
            </form>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-neutral-100 max-h-[420px] overflow-y-auto z-[200] animate-scale-in">

                    {/* Live Product Results */}
                    {suggestions.length > 0 && (
                        <div className="p-2">
                            <p className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Products</p>
                            {suggestions.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductClick(product)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 rounded-xl text-left transition-colors group"
                                >
                                    {/* Product image thumbnail */}
                                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 border border-neutral-100">
                                        {product.images && product.images[0] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg">👗</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-neutral-900 truncate group-hover:text-primary-700">{product.name}</p>
                                        <p className="text-xs text-neutral-400 truncate">{product.category}</p>
                                    </div>

                                    {product.price !== undefined && (
                                        <p className="text-sm font-bold text-primary-600 flex-shrink-0">
                                            ${product.price.toFixed(2)}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {query.length > 1 && suggestions.length === 0 && !loading && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-neutral-400 font-medium">No products found for <span className="font-semibold text-neutral-600">"{query}"</span></p>
                            <button
                                onClick={() => handleSearch(query)}
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800"
                            >
                                Search all products <ArrowRight size={12} />
                            </button>
                        </div>
                    )}

                    {/* Search History */}
                    {query.length === 0 && searchHistory.length > 0 && (
                        <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2">
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Recent Searches</p>
                                <button onClick={clearHistory} className="text-xs font-semibold text-primary-500 hover:text-primary-700">
                                    Clear
                                </button>
                            </div>
                            {searchHistory.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSearch(item)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 rounded-xl text-left transition-colors"
                                >
                                    <Clock size={14} className="text-neutral-300 flex-shrink-0" />
                                    <span className="text-sm text-neutral-600">{item}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Footer search hint */}
                    {query.length > 1 && suggestions.length > 0 && (
                        <div className="border-t border-neutral-100 px-4 py-3">
                            <button
                                onClick={() => handleSearch(query)}
                                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                            >
                                <Search size={12} />
                                See all results for "{query}"
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
