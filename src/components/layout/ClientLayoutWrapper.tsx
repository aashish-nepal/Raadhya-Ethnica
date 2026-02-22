"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/CookieConsent";

/**
 * ClientLayoutWrapper
 *
 * Handles the client-side route detection for showing/hiding
 * the Header, Footer, and CookieConsent on admin routes.
 *
 * This keeps the root layout.tsx as a true Server Component,
 * which allows Next.js to export `metadata` properly for SEO.
 */
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");

    return (
        <>
            {!isAdminRoute && <Header />}
            <main className={isAdminRoute ? "" : "min-h-screen"}>
                {children}
            </main>
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <CookieConsent />}
        </>
    );
}
