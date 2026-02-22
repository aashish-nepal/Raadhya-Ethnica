"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, User, Menu, X, Search, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState, useRef } from "react";
import SearchBar from "@/components/product/SearchBar";
import { subscribeToHeroSettings } from "@/lib/firestore";

const MARQUEE_TEXT = "🎉 Flat 35% OFF on all kurtas · Free Shipping above A$150 · New collection is LIVE · ";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [announcementText, setAnnouncementText] = useState(MARQUEE_TEXT);
    const { user } = useAuth();
    const cartItemsCount = useCartStore((state) => state.items.length);
    const wishlistItemsCount = useWishlistStore((state) => state.items.length);

    useEffect(() => {
        const unsubscribe = subscribeToHeroSettings(({ announcementText: at }) => {
            if (at) setAnnouncementText(at + " · " + at + " · ");
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
            localStorage.removeItem("cart-storage");
            window.location.href = "/";
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const marqueeContent = announcementText.repeat(4);

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white shadow-sm"}`}>
            {/* Announcement Marquee */}
            <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 text-white overflow-hidden py-2.5">
                <div className="flex whitespace-nowrap animate-marquee">
                    <span className="text-xs font-medium tracking-wide px-4">{marqueeContent}</span>
                    <span className="text-xs font-medium tracking-wide px-4" aria-hidden="true">{marqueeContent}</span>
                </div>
            </div>

            {/* Main Header */}
            <div className="container-custom">
                <div className="flex items-center justify-between py-3.5 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 group transition-transform duration-200 hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="Raadhya Ethnica"
                            width={260}
                            height={100}
                            className="h-16 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-xl">
                        <SearchBar />
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* User Account Dropdown */}
                        <div className="relative group hidden sm:block">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors cursor-pointer">
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-primary-100">
                                            {(user.displayName || user.email || "U")[0].toUpperCase()}
                                        </div>
                                        <div className="hidden lg:flex flex-col items-start leading-none">
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Hello</span>
                                            <span className="text-sm font-semibold text-neutral-900 flex items-center gap-1 mt-0.5">
                                                {(user.displayName || user.email?.split("@")[0] || "").slice(0, 12)}
                                                <ChevronDown size={12} className="text-neutral-400" />
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                                            <User size={17} className="text-neutral-600" />
                                        </div>
                                        <div className="hidden lg:flex flex-col items-start leading-none">
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Hello, Sign in</span>
                                            <span className="text-sm font-semibold text-neutral-900 mt-0.5">Account</span>
                                        </div>
                                    </div>
                                )}
                            </button>

                            {/* Dropdown */}
                            {user ? (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30">
                                                {(user.displayName || user.email || "U")[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{user.displayName || "My Account"}</p>
                                                <p className="text-xs text-white/70 truncate mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        {[
                                            { href: "/account", label: "My Account", icon: User },
                                            { href: "/account/orders", label: "My Orders", icon: ShoppingCart },
                                            { href: "/account/wishlist", label: "My Wishlist", icon: Heart, count: wishlistItemsCount },
                                        ].map(({ href, label, icon: Icon, count }) => (
                                            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group/item">
                                                <Icon size={17} className="text-neutral-400 group-hover/item:text-primary-600" />
                                                <span className="font-medium flex-1">{label}</span>
                                                {count && count > 0 ? (
                                                    <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold">{count}</span>
                                                ) : null}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="border-t border-neutral-100 p-2">
                                        <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                                            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="font-medium">Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                    <div className="p-5">
                                        <p className="text-sm font-semibold text-neutral-900 mb-1">Welcome to Raadhya Ethnica</p>
                                        <p className="text-xs text-neutral-500 mb-4">Discover premium women's kurtas</p>
                                        <Link href="/auth/login">
                                            <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all mb-2 shadow-md">
                                                Sign In
                                            </button>
                                        </Link>
                                        <p className="text-xs text-neutral-500 text-center">New customer? <Link href="/auth/register" className="text-primary-600 hover:underline font-semibold">Start here</Link></p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Wishlist */}
                        <Link href="/account/wishlist" className="relative p-2.5 rounded-xl hover:bg-primary-50 transition-colors group">
                            <Heart size={22} className="text-neutral-700 group-hover:text-primary-600 transition-colors" />
                            {wishlistItemsCount > 0 && (
                                <span className="absolute top-1 right-1 bg-primary-600 text-white text-[10px] w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-sm">
                                    {wishlistItemsCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2.5 rounded-xl hover:bg-primary-50 transition-colors group">
                            <ShoppingCart size={22} className="text-neutral-700 group-hover:text-primary-600 transition-colors" />
                            {cartItemsCount > 0 && (
                                <span className="absolute top-1 right-1 bg-primary-600 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-sm">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Search - Mobile */}
                <div className="md:hidden pb-3">
                    <SearchBar />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 py-2.5 border-t border-neutral-100">
                    <Link href="/products" className="px-4 py-2 rounded-lg text-sm font-semibold text-neutral-900 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        All Products
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.href}
                            href={category.href}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                            {category.name}
                        </Link>
                    ))}
                    <Link href="/about" className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        About Us
                    </Link>
                    <Link href="/contact" className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        Contact
                    </Link>
                </nav>
            </div>

            {/* Mobile Slide-in Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[100]" role="dialog">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl animate-slide-in-right flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
                            <span className="font-display font-bold text-lg text-neutral-900">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100">
                                <X size={20} />
                            </button>
                        </div>

                        {user ? (
                            <div className="p-4 bg-gradient-to-br from-primary-50 to-white border-b border-neutral-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                                        {(user.displayName || user.email || "U")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-neutral-900">{user.displayName || "My Account"}</p>
                                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border-b border-neutral-100 flex gap-2">
                                <Link href="/auth/login" className="flex-1">
                                    <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 rounded-xl text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/auth/register" className="flex-1">
                                    <button className="w-full border-2 border-primary-300 text-primary-700 py-2.5 rounded-xl text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>
                                        Register
                                    </button>
                                </Link>
                            </div>
                        )}

                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {(
                                [
                                    { name: "All Products", href: "/products", bold: true },
                                    ...categories.map((c) => ({ ...c, bold: false })),
                                    { name: "About Us", href: "/about", bold: false },
                                    { name: "Contact", href: "/contact", bold: false },
                                ] as { name: string; href: string; bold: boolean }[]
                            ).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block px-4 py-3 rounded-xl transition-colors ${item.bold ? "font-semibold text-neutral-900 hover:bg-primary-50 hover:text-primary-700" : "text-sm font-medium text-neutral-600 hover:bg-primary-50 hover:text-primary-700"}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {user && (
                            <div className="p-4 border-t border-neutral-100">
                                <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors">
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
