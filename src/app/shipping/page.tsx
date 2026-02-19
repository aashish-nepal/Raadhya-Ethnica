"use client";

import { useSettingsContext } from "@/contexts/SettingsContext";
import { Truck } from "lucide-react";

export default function ShippingPage() {
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

    const shippingPolicy = settings?.policies.shippingPolicy || "Shipping policy content will be displayed here.";
    const currencySymbol = settings?.store.currencySymbol || "$";

    return (
        <div className="container-custom py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <Truck className="text-primary-600" size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold">
                            Shipping Policy
                        </h1>
                    </div>
                    <p className="text-neutral-600">
                        Fast and reliable shipping to your doorstep
                    </p>
                </div>

                {/* Shipping Rates */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="font-semibold text-lg mb-4">Shipping Rates</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-600">Standard Shipping</span>
                                <span className="font-semibold">{currencySymbol}{settings?.shipping.standardShippingRate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-600">Express Shipping</span>
                                <span className="font-semibold">{currencySymbol}{settings?.shipping.expressShippingRate}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-primary-600 font-medium">Free Shipping</span>
                                <span className="font-semibold">Orders over {currencySymbol}{settings?.shipping.freeShippingThreshold}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="font-semibold text-lg mb-4">Delivery Time</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-600">Standard Delivery</span>
                                <span className="font-semibold">{settings?.shipping.estimatedDeliveryDays} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-600">Express Delivery</span>
                                <span className="font-semibold">{settings?.shipping.expressDeliveryDays} days</span>
                            </div>
                            {settings?.shipping.codAvailable && (
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="text-neutral-600">COD Charges</span>
                                    <span className="font-semibold">{currencySymbol}{settings?.shipping.codCharges}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Policy Content */}
                <div className="bg-white rounded-xl shadow-soft p-8">
                    <div className="prose prose-neutral max-w-none">
                        <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
                            {shippingPolicy}
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-8 bg-primary-50 rounded-xl p-6">
                    <h2 className="font-semibold text-lg mb-2">Shipping Questions?</h2>
                    <p className="text-neutral-600 mb-4">
                        Have questions about shipping? We're here to help!
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
