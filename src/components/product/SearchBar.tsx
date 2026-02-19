"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import products from "@/data/products.json";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<typeof products>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load search history from localStorage
        const history = localStorage.getItem("searchHistory");
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length > 1) {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase()) ||
                product.fabric.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setIsOpen(true);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query]);

    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            // Add to search history
            const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
            setSearchHistory(newHistory);
            localStorage.setItem("searchHistory", JSON.stringify(newHistory));

            // Navigate to search results
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setQuery("");
            setIsOpen(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleSuggestionClick = (productSlug: string) => {
        router.push(`/products/${productSlug}`);
        setQuery("");
        setIsOpen(false);
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem("searchHistory");
    };

    return (
        <div ref={searchRef} className="relative flex-1 max-w-xl">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search for kurtas, fabrics, colors..."
                    className="w-full h-11 pl-11 pr-10 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                        <X size={20} />
                    </button>
                )}
            </form>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-neutral-200 max-h-96 overflow-y-auto z-50">
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="p-2">
                            <p className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase">Products</p>
                            {suggestions.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSuggestionClick(product.slug)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-lg text-left"
                                >
                                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-neutral-500">{product.category}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-primary-600">
                                        AUD ${product.price.toFixed(2)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Search History */}
                    {query.length === 0 && searchHistory.length > 0 && (
                        <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2">
                                <p className="text-xs font-semibold text-neutral-500 uppercase">Recent Searches</p>
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-primary-600 hover:text-primary-700"
                                >
                                    Clear
                                </button>
                            </div>
                            {searchHistory.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearch(item)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 rounded-lg text-left"
                                >
                                    <Clock size={16} className="text-neutral-400" />
                                    <span className="text-sm">{item}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {query.length > 1 && suggestions.length === 0 && (
                        <div className="p-6 text-center text-neutral-500">
                            <p>No products found for "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
