"use client";

import { useWishlistSync } from "@/hooks/useWishlistSync";

/**
 * Component that handles wishlist synchronization with Firestore
 * Should be included in the app layout to run on every page
 */
export default function WishlistSyncProvider() {
    useWishlistSync();
    return null;
}
