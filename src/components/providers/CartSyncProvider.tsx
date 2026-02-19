"use client";

import { useCartSync } from "@/hooks/useCartSync";

/**
 * Provider component that handles cart synchronization
 * Must be placed inside AuthProvider
 */
export default function CartSyncProvider() {
    useCartSync();
    return null;
}
