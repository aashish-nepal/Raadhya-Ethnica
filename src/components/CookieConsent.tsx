"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart3, Target } from "lucide-react";
import { getConsentStatus, setConsentStatus } from "@/lib/cookies";

interface CookieCategory {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    required: boolean;
    enabled: boolean;
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [categories, setCategories] = useState<CookieCategory[]>([
        {
            id: "necessary",
            icon: <Shield size={16} />,
            name: "Essential Cookies",
            description:
                "Required for the website to function. Includes authentication, cart, and security. Cannot be disabled.",
            required: true,
            enabled: true,
        },
        {
            id: "analytics",
            icon: <BarChart3 size={16} />,
            name: "Analytics Cookies",
            description:
                "Help us understand how visitors interact with the website to improve performance and user experience.",
            required: false,
            enabled: true,
        },
        {
            id: "marketing",
            icon: <Target size={16} />,
            name: "Marketing Cookies",
            description:
                "Used to show you relevant products and personalised ads based on your browsing behaviour.",
            required: false,
            enabled: false,
        },
    ]);

    useEffect(() => {
        const status = getConsentStatus();
        if (status === "pending") {
            // Small delay so the page loads first
            const t = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(t);
        }
    }, []);

    const handleAcceptAll = () => {
        setConsentStatus("accepted");
        setVisible(false);
    };

    const handleRejectAll = () => {
        setConsentStatus("rejected");
        setVisible(false);
    };

    const handleSavePreferences = () => {
        // Accept if at least essential are consented
        setConsentStatus("accepted");
        setVisible(false);
    };

    const toggleCategory = (id: string) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === id && !cat.required ? { ...cat, enabled: !cat.enabled } : cat
            )
        );
    };

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop overlay (subtle) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[998]"
                        aria-hidden="true"
                    />

                    {/* Banner */}
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 30 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Cookie consent"
                        className="fixed bottom-0 left-0 right-0 z-[999] p-4 md:p-6"
                    >
                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                                    <Cookie size={18} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-sm font-semibold text-neutral-900">
                                        We value your privacy
                                    </h2>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        We use cookies to enhance your browsing experience and analyse site traffic.
                                    </p>
                                </div>
                                <button
                                    onClick={handleRejectAll}
                                    className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 shrink-0"
                                    aria-label="Dismiss and reject non-essential cookies"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Details (expandable) */}
                            <AnimatePresence>
                                {showDetails && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 py-4 border-b border-neutral-100 space-y-3">
                                            {categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                                >
                                                    <div className="mt-0.5 text-neutral-500 shrink-0">
                                                        {cat.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-neutral-800">
                                                                {cat.name}
                                                            </span>
                                                            {cat.required && (
                                                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-neutral-500 mt-0.5">
                                                            {cat.description}
                                                        </p>
                                                    </div>
                                                    {/* Toggle */}
                                                    <button
                                                        role="switch"
                                                        aria-checked={cat.enabled}
                                                        disabled={cat.required}
                                                        onClick={() => toggleCategory(cat.id)}
                                                        className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${cat.enabled
                                                                ? "bg-amber-500"
                                                                : "bg-neutral-300"
                                                            } ${cat.required ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${cat.enabled ? "translate-x-4" : "translate-x-0.5"
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="px-6 py-4 flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setShowDetails((v) => !v)}
                                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors mr-auto"
                                >
                                    {showDetails ? (
                                        <>
                                            <ChevronUp size={14} /> Hide preferences
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown size={14} /> Manage preferences
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleRejectAll}
                                    className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                                >
                                    Reject All
                                </button>

                                {showDetails && (
                                    <button
                                        onClick={handleSavePreferences}
                                        className="px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                                    >
                                        Save Preferences
                                    </button>
                                )}

                                <button
                                    onClick={handleAcceptAll}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-700 rounded-lg transition-colors"
                                >
                                    Accept All
                                </button>
                            </div>

                            {/* Legal footer */}
                            <div className="px-6 pb-4 text-[10px] text-neutral-400">
                                By clicking &ldquo;Accept All&rdquo; you consent to our use of cookies as described in our{" "}
                                <a href="/privacy" className="underline hover:text-neutral-600">
                                    Privacy Policy
                                </a>
                                . You can change your preferences at any time.
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
