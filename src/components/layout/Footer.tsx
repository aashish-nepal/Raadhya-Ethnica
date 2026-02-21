"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin, Heart, Clock } from "lucide-react";
import { useSettingsContext } from "@/contexts/SettingsContext";

const shopLinks = [
    { label: "All Products", href: "/products" },
    { label: "Cotton Kurtas", href: "/products?category=cotton" },
    { label: "Designer Kurtas", href: "/products?category=designer" },
    { label: "Festive Kurtas", href: "/products?category=festive" },
    { label: "Office Wear", href: "/products?category=office" },
];

const helpLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
];

const paymentMethods = ["Visa", "MC", "PayPal", "Stripe"];

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { settings } = useSettingsContext();

    const storeName = settings?.store.name || "Raadhya Ethnica";
    const tagline = settings?.store.tagline || "Authentic Indian Ethnic Wear";
    const email = settings?.store.email || "hello@raadhyaethnica.com";
    const phone = settings?.store.phone || "+977 9800-XXXXX";
    const address = `${settings?.store.address || ""} ${settings?.store.city || "Kathmandu"}, ${settings?.store.country || "Nepal"}`.trim();
    const businessHours = settings?.store.businessHours || "";
    const facebookUrl = settings?.seo.facebookUrl;
    const instagramUrl = settings?.seo.instagramUrl;
    const twitterHandle = settings?.seo.twitterHandle;

    return (
        <footer className="bg-neutral-900 text-neutral-300">
            {/* Main Footer Grid */}
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 items-start">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <Image
                                src="/logo.png"
                                alt={storeName}
                                width={200}
                                height={75}
                                className="h-12 w-auto object-contain brightness-0 invert"
                            />
                        </Link>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                            {tagline}. Crafted with passion and elegance — celebrating every woman, every occasion.
                        </p>

                        {/* Contact */}
                        <div className="space-y-3">
                            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-sm text-neutral-400 hover:text-white transition-colors">
                                <Phone size={14} className="text-primary-400 flex-shrink-0" />
                                {phone}
                            </a>
                            <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-sm text-neutral-400 hover:text-white transition-colors">
                                <Mail size={14} className="text-primary-400 flex-shrink-0" />
                                {email}
                            </a>
                            <div className="flex items-start gap-2.5 text-sm text-neutral-400">
                                <MapPin size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                                {address}
                            </div>
                            {businessHours && (
                                <div className="flex items-start gap-2.5 text-sm text-neutral-400">
                                    <Clock size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                                    {businessHours}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Shop</h3>
                        <ul className="space-y-2.5">
                            {shopLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-neutral-400 hover:text-white hover:pl-1 transition-all duration-200 block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Help</h3>
                        <ul className="space-y-2.5">
                            {helpLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-neutral-400 hover:text-white hover:pl-1 transition-all duration-200 block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social & Newsletter Mini CTA */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Follow Us</h3>
                        <div className="flex gap-2.5 mb-8">
                            <a href={instagramUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-primary-600 flex items-center justify-center transition-all hover:-translate-y-0.5">
                                <Instagram size={17} />
                            </a>
                            <a href={facebookUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                                className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-primary-600 flex items-center justify-center transition-all hover:-translate-y-0.5">
                                <Facebook size={17} />
                            </a>
                        </div>

                        <div className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700/50">
                            <p className="text-xs font-semibold text-white mb-1">Get 10% Off Your First Order</p>
                            <p className="text-xs text-neutral-400 mb-3">Subscribe to our newsletter</p>
                            <Link href="/products" className="block w-full text-center py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md">
                                Shop Now & Save
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-800">
                <div className="container-custom py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                            © {currentYear} {storeName}. Made with{" "}
                            <Heart size={10} className="text-primary-500 fill-primary-500 mx-0.5" />
                            All rights reserved.
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-600 mr-1">We accept:</span>
                            {paymentMethods.map((method) => (
                                <span key={method} className="text-[10px] font-bold bg-neutral-800 text-neutral-300 px-2 py-1 rounded border border-neutral-700">
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
