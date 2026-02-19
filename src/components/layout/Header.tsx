"use client";

import Link from "next/link";
import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import SearchBar from "@/components/product/SearchBar";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const cartItemsCount = useCartStore((state) => state.items.length);
    const wishlistItemsCount = useWishlistStore((state) => state.items.length);

    const categories = [
        { name: "Cotton Kurtas", href: "/products?category=cotton" },
        { name: "Designer Kurtas", href: "/products?category=designer" },
        { name: "Festive Kurtas", href: "/products?category=festive" },
        { name: "Office Wear", href: "/products?category=office" },
        { name: "Casual Kurtas", href: "/products?category=casual" },
    ];

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Only clear cart - wishlist is now synced with Firestore
            localStorage.removeItem('cart-storage');
            window.location.href = "/";
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Announcement Bar */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center py-2 px-4 text-sm">
                <p className="font-medium">
                    🎉 Limited Time Offer: Flat 35% OFF on all kurtas | Free Shipping above $150
                </p>
            </div>

            {/* Main Header */}
            <div className="container-custom">
                <div className="flex items-center justify-between py-4 gap-4">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-display font-bold text-primary-600 flex-shrink-0">
                        Raadhya Ethnica
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-2xl">
                        <SearchBar />
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-4">
                        {/* Advanced User Account Dropdown */}
                        <div className="relative group hidden sm:block">
                            <button className="flex items-center gap-2 hover:text-primary-600 transition-colors py-2 cursor-pointer">
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                        </div>
                                        <div className="hidden lg:flex flex-col items-start">
                                            <span className="text-xs text-neutral-600">Hello</span>
                                            <span className="text-sm font-semibold -mt-0.5 flex items-center gap-1">
                                                {user.displayName || user.email?.split('@')[0]}
                                                <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <User size={20} />
                                        <div className="hidden lg:flex flex-col items-start">
                                            <span className="text-xs text-neutral-600">Hello, Sign in</span>
                                            <span className="text-sm font-semibold -mt-0.5">Account</span>
                                        </div>
                                    </div>
                                )}
                            </button>

                            {/* Advanced Dropdown Menu */}
                            {user ? (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30">
                                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{user.displayName || "My Account"}</p>
                                                <p className="text-xs text-white/80 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group/item">
                                            <User size={18} className="text-neutral-400 group-hover/item:text-primary-600" />
                                            <span className="font-medium">My Account</span>
                                        </Link>
                                        <Link href="/account/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group/item">
                                            <ShoppingCart size={18} className="text-neutral-400 group-hover/item:text-primary-600" />
                                            <span className="font-medium">My Orders</span>
                                        </Link>
                                        <Link href="/account/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group/item">
                                            <Heart size={18} className="text-neutral-400 group-hover/item:text-primary-600" />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className="font-medium">My Wishlist</span>
                                                {wishlistItemsCount > 0 && (
                                                    <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full font-semibold">{wishlistItemsCount}</span>
                                                )}
                                            </div>
                                        </Link>
                                        <Link href="/account/addresses" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group/item">
                                            <svg className="w-[18px] h-[18px] text-neutral-400 group-hover/item:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-medium">Addresses</span>
                                        </Link>
                                        <Link href="/account/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group/item">
                                            <svg className="w-[18px] h-[18px] text-neutral-400 group-hover/item:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-medium">Settings</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-neutral-200 p-2">
                                        <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors group/item w-full">
                                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="font-medium">Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                    <div className="p-4">
                                        <p className="text-sm font-semibold mb-3">Welcome to Raadhya Ethnica</p>
                                        <Link href="/auth/login">
                                            <button className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors mb-2">Sign In</button>
                                        </Link>
                                        <p className="text-xs text-neutral-600 text-center">New customer? <Link href="/auth/register" className="text-primary-600 hover:underline font-medium">Start here</Link></p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/account/wishlist" className="relative hover:text-primary-600 transition-colors">
                            <Heart size={24} />
                            {wishlistItemsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {wishlistItemsCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/cart" className="relative hover:text-primary-600 transition-colors">
                            <ShoppingCart size={24} />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Search Bar - Mobile */}
                <div className="md:hidden pb-4">
                    <SearchBar />
                </div>

                {/* Navigation - Desktop */}
                <nav className="hidden lg:flex items-center gap-8 py-3 border-t border-neutral-200">
                    <Link href="/products" className="font-medium hover:text-primary-600 transition-colors">
                        All Products
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.href}
                            href={category.href}
                            className="text-sm hover:text-primary-600 transition-colors"
                        >
                            {category.name}
                        </Link>
                    ))}
                    <Link href="/about" className="text-sm hover:text-primary-600 transition-colors">
                        About Us
                    </Link>
                    <Link href="/contact" className="text-sm hover:text-primary-600 transition-colors">
                        Contact
                    </Link>
                </nav>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-neutral-200">
                    <nav className="container-custom py-4 flex flex-col gap-3">
                        <Link
                            href="/products"
                            className="font-medium hover:text-primary-600 py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            All Products
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.href}
                                href={category.href}
                                className="text-sm hover:text-primary-600 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {category.name}
                            </Link>
                        ))}
                        <Link
                            href="/about"
                            className="text-sm hover:text-primary-600 py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm hover:text-primary-600 py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Contact
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
