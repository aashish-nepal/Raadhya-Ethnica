"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-300 rounded-full blur-3xl" />
            </div>

            <div className="container-custom relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        <div className="inline-block mb-4">
                            <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                                ✨ New Collection 2024
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                            Discover Premium
                            <span className="gradient-text block">Women's Kurtas</span>
                        </h1>

                        <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-xl">
                            Experience elegance and comfort with our curated collection of designer kurtas.
                            Perfect for every occasion.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/products">
                                <Button size="xl" className="w-full sm:w-auto">
                                    Shop Now
                                </Button>
                            </Link>
                            <Link href="/products?category=designer">
                                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                                    Designer Collection
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-neutral-200">
                            <div>
                                <p className="text-3xl font-bold text-primary-600">500+</p>
                                <p className="text-sm text-neutral-600">Designs</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary-600">10K+</p>
                                <p className="text-sm text-neutral-600">Happy Customers</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary-600">4.8★</p>
                                <p className="text-sm text-neutral-600">Rating</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-hard">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200" />
                            {/* Placeholder for hero image */}
                            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-display">
                                Hero Image
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-6 animate-float">
                            <p className="text-sm text-neutral-600 mb-1">Special Offer</p>
                            <p className="text-2xl font-bold text-primary-600">35% OFF</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
