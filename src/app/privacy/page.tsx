"use client";

import { useSettingsContext } from "@/contexts/SettingsContext";
import { FileText } from "lucide-react";

export default function PrivacyPage() {
    const { settings, loading } = useSettingsContext();

    if (loading) {
        return (
            <div className="container-custom py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    const privacyPolicy = settings?.policies.privacyPolicy || "Privacy policy content will be displayed here.";

    return (
        <div className="container-custom py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <FileText className="text-primary-600" size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold">
                            Privacy Policy
                        </h1>
                    </div>
                    <p className="text-neutral-600">
                        Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-soft p-8">
                    <div className="prose prose-neutral max-w-none">
                        <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
                            {privacyPolicy}
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-8 bg-primary-50 rounded-xl p-6">
                    <h2 className="font-semibold text-lg mb-2">Questions about our Privacy Policy?</h2>
                    <p className="text-neutral-600 mb-4">
                        If you have any questions or concerns about our privacy policy, please contact us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href={`mailto:${settings?.store.email}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            {settings?.store.email}
                        </a>
                        <span className="hidden sm:inline text-neutral-400">|</span>
                        <a
                            href={`tel:${settings?.store.phone?.replace(/\s/g, '')}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            {settings?.store.phone}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
