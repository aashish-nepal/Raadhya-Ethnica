"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Package, ShoppingCart, Users, Settings,
    ChevronRight
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-neutral-950 text-white min-h-screen flex flex-col border-r border-neutral-800/60">
            {/* Logo / Brand */}
            <div className="px-5 py-4 border-b border-neutral-800/60">
                <Link href="/" className="block">
                    <Image
                        src="/logo.png"
                        alt="Raadhya Ethnica"
                        width={180}
                        height={70}
                        className="h-16 w-auto object-contain brightness-0 invert"
                        priority
                    />
                </Link>
            </div>

            {/* Navigation Label */}
            <div className="px-4 pt-6 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 px-2">Main Menu</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pb-4 space-y-0.5">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-900/30"
                                : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                                }`}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full -ml-px" />
                            )}

                            <Icon size={18} className={isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300 transition-colors"} />
                            <span className="font-medium text-sm flex-1">{item.name}</span>
                            {isActive && <ChevronRight size={14} className="text-white/60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: View Store link */}
            <div className="p-4 border-t border-neutral-800/60">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-all"
                    target="_blank"
                >
                    <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </div>
                    <span className="font-medium">View Store</span>
                </Link>
            </div>
        </div>
    );
}
