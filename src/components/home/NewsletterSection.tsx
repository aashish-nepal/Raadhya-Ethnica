"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubmitted(true);
        }
    };

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            {/* Bokeh */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" style={{ animationDelay: "3s" }} />

            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
                        <Sparkles size={12} />
                        Members Get Early Access
                    </div>

                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                        Stay Ahead of Every Trend
                    </h2>
                    <p className="text-white/70 text-base mb-10 leading-relaxed">
                        Subscribe to get exclusive offers, new arrivals, and curated style guides delivered straight to your inbox.
                    </p>

                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-md"
                        >
                            <div className="text-4xl mb-3">🎉</div>
                            <p className="text-white font-semibold text-lg">You're on the list!</p>
                            <p className="text-white/60 text-sm mt-1">Expect magic in your inbox soon.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                            <div className="relative flex-1">
                                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-md"
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 px-7 py-4 bg-white text-primary-700 font-semibold rounded-2xl text-sm hover:bg-primary-50 transition-colors whitespace-nowrap shadow-lg"
                            >
                                Subscribe <ArrowRight size={15} />
                            </button>
                        </form>
                    )}

                    <p className="text-white/40 text-xs mt-5">No spam, ever. Unsubscribe anytime.</p>
                </motion.div>
            </div>
        </section>
    );
}
