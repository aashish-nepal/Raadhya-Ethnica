"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsContext } from "@/contexts/SettingsContext";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { settings } = useSettingsContext();

    // Use settings or fallback to defaults
    const storeName = settings?.store.name || "Raadhya Ethnica";
    const tagline = settings?.store.tagline || "Authentic Indian Ethnic Wear";
    const email = settings?.store.email || "hello@raadhyaethnica.com";
    const phone = settings?.store.phone || "+91 98765 43210";
    const address = settings?.store.address || "123 Fashion Street";
    const city = settings?.store.city || "Mumbai";
    const state = settings?.store.state || "Maharashtra";
    const pincode = settings?.store.pincode || "400001";
    const country = settings?.store.country || "India";
    const businessHours = settings?.store.businessHours || "Mon-Sat: 10:00 AM - 8:00 PM";

    const facebookUrl = settings?.seo.facebookUrl;
    const instagramUrl = settings?.seo.instagramUrl;
    const twitterHandle = settings?.seo.twitterHandle;

    return (
        <footer className="bg-neutral-900 text-neutral-300">
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-12">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-2xl font-display font-bold text-white mb-2">
                            Subscribe to Our Newsletter
                        </h3>
                        <p className="text-white/90 mb-6">
                            Get 10% off on your first order and stay updated with latest collections
                        </p>
                        <div className="flex gap-2 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white"
                            />
                            <Button variant="secondary" size="lg">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div>
                        <h2 className="font-display text-2xl font-bold text-white mb-4">
                            {storeName}
                        </h2>
                        <p className="text-sm mb-4">
                            {tagline}. Experience elegance, comfort, and style with our curated collection.
                        </p>
                        <div className="flex gap-3">
                            {facebookUrl && (
                                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {instagramUrl && (
                                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {twitterHandle && (
                                <a href={`https://twitter.com/${twitterHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                                    <Twitter size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="hover:text-primary-400 transition-colors">Shop All</Link></li>
                            <li><Link href="/products?category=cotton" className="hover:text-primary-400 transition-colors">Cotton Kurtas</Link></li>
                            <li><Link href="/products?category=designer" className="hover:text-primary-400 transition-colors">Designer Collection</Link></li>
                            <li><Link href="/products?category=festive" className="hover:text-primary-400 transition-colors">Festive Wear</Link></li>
                            <li><Link href="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
                            <li><Link href="/shipping" className="hover:text-primary-400 transition-colors">Shipping Policy</Link></li>
                            <li><Link href="/returns" className="hover:text-primary-400 transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/account" className="hover:text-primary-400 transition-colors">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                                <span>{address}, {city}, {state} {pincode}, {country}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={18} />
                                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary-400 transition-colors">
                                    {phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={18} />
                                <a href={`mailto:${email}`} className="hover:text-primary-400 transition-colors">
                                    {email}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Clock size={18} />
                                <span>{businessHours}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-neutral-800">
                <div className="container-custom py-6">
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                🔒
                            </div>
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                🚚
                            </div>
                            <span>Free Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                ↩️
                            </div>
                            <span>Easy Returns</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                ✓
                            </div>
                            <span>100% Authentic</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-800">
                <div className="container-custom py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <p>© {currentYear} {storeName}. All rights reserved.</p>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms & Conditions</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
