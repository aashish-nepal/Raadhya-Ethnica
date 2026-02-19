"use client";

import { useSettingsContext } from "@/contexts/SettingsContext";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";

export default function ReturnsPage() {
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

    const refundPolicy = settings?.policies.refundPolicy || "Refund policy content will be displayed here.";
    const returnPeriod = settings?.policies.returnPeriodDays || 7;
    const returnConditions = settings?.policies.returnConditions || "Items must be unused with original tags attached.";
    const refundProcessingDays = settings?.policies.refundProcessingDays || 7;
    const exchangeAllowed = settings?.policies.exchangeAllowed ?? true;

    return (
        <div className="container-custom py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <RotateCcw className="text-primary-600" size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold">
                            Returns & Refunds
                        </h1>
                    </div>
                    <p className="text-neutral-600">
                        We want you to be completely satisfied with your purchase
                    </p>
                </div>

                {/* Quick Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-soft p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
                            <RotateCcw className="text-primary-600" size={20} />
                        </div>
                        <h3 className="font-semibold mb-2">Return Period</h3>
                        <p className="text-2xl font-bold text-primary-600">{returnPeriod} Days</p>
                        <p className="text-sm text-neutral-600 mt-1">From delivery date</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-soft p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="text-primary-600" size={20} />
                        </div>
                        <h3 className="font-semibold mb-2">Refund Processing</h3>
                        <p className="text-2xl font-bold text-primary-600">{refundProcessingDays} Days</p>
                        <p className="text-sm text-neutral-600 mt-1">After approval</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-soft p-6 text-center">
                        <div className={`w-12 h-12 rounded-full ${exchangeAllowed ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mx-auto mb-3`}>
                            {exchangeAllowed ? (
                                <CheckCircle className="text-green-600" size={20} />
                            ) : (
                                <XCircle className="text-red-600" size={20} />
                            )}
                        </div>
                        <h3 className="font-semibold mb-2">Exchanges</h3>
                        <p className={`text-2xl font-bold ${exchangeAllowed ? 'text-green-600' : 'text-red-600'}`}>
                            {exchangeAllowed ? 'Available' : 'Not Available'}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">
                            {exchangeAllowed ? 'Size & color exchange' : 'Refunds only'}
                        </p>
                    </div>
                </div>

                {/* Return Conditions */}
                <div className="bg-white rounded-xl shadow-soft p-8 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Return Conditions</h2>
                    <div className="bg-neutral-50 rounded-lg p-4">
                        <p className="text-neutral-700">{returnConditions}</p>
                    </div>
                </div>

                {/* Refund Policy Content */}
                <div className="bg-white rounded-xl shadow-soft p-8">
                    <h2 className="text-xl font-semibold mb-4">Refund Policy</h2>
                    <div className="prose prose-neutral max-w-none">
                        <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
                            {refundPolicy}
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-8 bg-primary-50 rounded-xl p-6">
                    <h2 className="font-semibold text-lg mb-2">Need to Return Something?</h2>
                    <p className="text-neutral-600 mb-4">
                        Contact our customer service team to initiate a return or exchange.
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
