import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import Analytics from "@/components/analytics/Analytics";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import WishlistSyncProvider from "@/components/providers/WishlistSyncProvider";
import CartSyncProvider from "@/components/providers/CartSyncProvider";
import NotificationProvider from "@/components/providers/NotificationProvider";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/CookieConsent";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

export const metadata: Metadata = {
    title: "Raadhya Ethnica - Authentic Indian Ethnic Wear",
    description: "Shop the finest collection of traditional Indian ethnic wear including kurtas, salwar kameez, and more. Free shipping on orders over $150.",
};

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
                        <ClientLayoutWrapper>
                            {children}
                        </ClientLayoutWrapper>
                        <Toaster />
                        <CookieConsent />
                    </AuthProvider>
                </SettingsProvider>
            </body>
        </html>
    );
}
