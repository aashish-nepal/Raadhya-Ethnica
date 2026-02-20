"use client";

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import Analytics from "@/components/analytics/Analytics";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import WishlistSyncProvider from "@/components/providers/WishlistSyncProvider";
import CartSyncProvider from "@/components/providers/CartSyncProvider";
import NotificationProvider from "@/components/providers/NotificationProvider";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");

    return (
        <html lang="en">
            <body className={`${inter.variable} ${playfair.variable} font-sans`}>
                <GoogleAnalytics />
                <SettingsProvider>
                    <Analytics />
                    <AuthProvider>
                        <WishlistSyncProvider />
                        <CartSyncProvider />
                        <NotificationProvider />
                        {!isAdminRoute && <Header />}
                        <main className={isAdminRoute ? "" : "min-h-screen"}>
                            {children}
                        </main>
                        {!isAdminRoute && <Footer />}
                        <Toaster />
                        {!isAdminRoute && <CookieConsent />}
                    </AuthProvider>
                </SettingsProvider>
            </body>
        </html>
    );
}
