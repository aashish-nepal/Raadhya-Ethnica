"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SESSION_KEY = "raadhya_newsletter_dismissed";
const DELAY_MS = 3000;

interface Props {
    onClose: () => void;
}

export default function NewsletterModal({ onClose }: Props) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError("");
        try {
            // Simulate subscription (replace with your newsletter API)
            await new Promise((r) => setTimeout(r, 1200));
            setSubscribed(true);
            sessionStorage.setItem(SESSION_KEY, "true");
            setTimeout(onClose, 2500);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem(SESSION_KEY, "true");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "scaleIn 0.3s ease both" }}
            >
                {/* Close */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
                    aria-label="Close newsletter"
                >
                    <X size={22} />
                </button>

                {/* Top gradient banner */}
                <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-8 pt-10 pb-8 text-white text-center relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />

                    <div className="relative">
                        <div
                            className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3"
                            style={{ animation: "float 3s ease-in-out infinite" }}
                        >
                            <Gift size={28} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-display font-bold mb-1">
                            10% Off Your First Order
                        </h2>
                        <p className="text-primary-100 text-sm">
                            Subscribe to our newsletter for exclusive offers &amp; new arrivals
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <span className="text-xs bg-white/20 rounded-full px-3 py-1 flex items-center gap-1">
                                <Sparkles size={11} /> Early access to new collections
                            </span>
                            <span className="text-xs bg-white/20 rounded-full px-3 py-1 flex items-center gap-1">
                                <Sparkles size={11} /> Style tips
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-7">
                    {subscribed ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Sparkles size={26} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">You're in! 🎉</h3>
                            <p className="text-neutral-500 text-sm mt-1">
                                Check your inbox for your 10% discount code.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    Your email address
                                </label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-xs text-red-600 mt-1">{error}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Subscribing…" : "Get My 10% Off →"}
                            </Button>
                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="w-full text-xs text-neutral-400 hover:text-neutral-600 transition-colors py-1"
                            >
                                No thanks, I'll pay full price
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Auto-show wrapper (used by layout) ───────────────────────────────────────

export function useNewsletterAutoShow(
    openModal: (type: "newsletter") => void
) {
    useEffect(() => {
        const dismissed = sessionStorage.getItem(SESSION_KEY);
        if (dismissed) return;

        const timer = setTimeout(() => {
            openModal("newsletter");
        }, DELAY_MS);

        return () => clearTimeout(timer);
    }, [openModal]);
}
