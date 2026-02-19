"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ProductDetailClient from "./ProductDetailClient";
import { subscribeToProducts } from "@/lib/firestore";

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        // Real-time subscription to products
        const unsubscribe = subscribeToProducts(
            (products) => {
                const foundProduct = products.find((p: any) => p.slug === slug);

                if (foundProduct) {
                    setProduct(foundProduct);
                    setNotFound(false);
                } else {
                    setNotFound(true);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error loading product:", error);
                setNotFound(true);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-4">Product Not Found</h1>
                    <p className="text-neutral-600 mb-8">The product you're looking for doesn't exist.</p>
                    <a
                        href="/products"
                        className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Browse All Products
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-white">
                <ProductDetailClient product={product} />
            </div>

            <WhatsAppButton />
        </>
    );
}
