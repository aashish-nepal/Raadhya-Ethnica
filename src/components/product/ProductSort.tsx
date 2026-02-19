"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SortOption {
    label: string;
    value: string;
}

interface ProductSortProps {
    onSortChange: (sortBy: string) => void;
}

export default function ProductSort({ onSortChange }: ProductSortProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("featured");

    const sortOptions: SortOption[] = [
        { label: "Featured", value: "featured" },
        { label: "Price: Low to High", value: "price-asc" },
        { label: "Price: High to Low", value: "price-desc" },
        { label: "Newest First", value: "newest" },
        { label: "Best Rating", value: "rating" },
        { label: "Most Popular", value: "popular" },
    ];

    const handleSelect = (value: string) => {
        setSelected(value);
        onSortChange(value);
        setIsOpen(false);
    };

    const selectedLabel = sortOptions.find((opt) => opt.value === selected)?.label;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 hover:border-neutral-400 bg-white transition-colors"
            >
                <span className="text-sm font-medium">Sort by: {selectedLabel}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${selected === option.value ? "bg-primary-50 text-primary-700 font-medium" : ""
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
