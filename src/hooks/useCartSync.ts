"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { subscribeToUserCart, getCartFromFirestore } from "@/lib/cart-sync";

/**
 * Hook to sync cart with Firestore when user is authenticated
 * Automatically subscribes to real-time cart updates
 */
export function useCartSync() {
    const { user } = useAuth();
    const {
        items,
        couponCode,
        discount,
        syncToFirestore,
        loadFromRemote,
        lastSyncedUserId,
        setLastSyncedUserId,
    } = useCartStore();

    const unsubscribeRef = useRef<(() => void) | null>(null);
    const isInitialSyncRef = useRef(false);

    // Sync to Firestore whenever cart changes (for authenticated users)
    useEffect(() => {
        if (!user) return;

        // Debounce sync to avoid too many writes
        const timeoutId = setTimeout(() => {
            syncToFirestore(user.uid);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [items, couponCode, discount, user, syncToFirestore]);

    // Subscribe to real-time cart updates
    useEffect(() => {
        if (!user) {
            // Clean up subscription when user logs out
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            setLastSyncedUserId(undefined);
            isInitialSyncRef.current = false;
            return;
        }

        // Initial sync: Load cart from Firestore when user logs in
        const performInitialSync = async () => {
            if (isInitialSyncRef.current && lastSyncedUserId === user.uid) {
                return; // Already synced for this user
            }

            try {
                const remoteCart = await getCartFromFirestore(user.uid);

                if (remoteCart && remoteCart.items.length > 0) {
                    console.log('📥 Loading cart from Firestore:', {
                        userId: user.uid,
                        itemCount: remoteCart.items.length
                    });
                    loadFromRemote(remoteCart);
                } else if (items.length > 0) {
                    // User has local cart but no remote cart - sync local to remote
                    console.log('📤 Syncing local cart to Firestore:', {
                        userId: user.uid,
                        itemCount: items.length
                    });
                    await syncToFirestore(user.uid);
                }

                isInitialSyncRef.current = true;
            } catch (error) {
                console.error('❌ Error during initial cart sync:', error);
            }
        };

        performInitialSync();

        // Subscribe to real-time updates
        console.log('🔔 Setting up real-time cart sync for user:', user.uid);

        const unsubscribe = subscribeToUserCart(
            user.uid,
            (remoteCart) => {
                if (!remoteCart) return;

                // Only update if this is a remote change (not from this client)
                // We can detect this by checking if we're currently syncing
                const currentState = useCartStore.getState();
                if (!currentState.isSyncing) {
                    console.log('📬 Received remote cart update:', {
                        userId: user.uid,
                        itemCount: remoteCart.items.length
                    });
                    loadFromRemote(remoteCart);
                }
            },
            (error) => {
                console.error('❌ Error in cart sync subscription:', error);
            }
        );

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                console.log('🔕 Cleaning up cart sync subscription');
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [user, loadFromRemote, syncToFirestore, lastSyncedUserId, setLastSyncedUserId]);

    return {
        isSyncing: useCartStore((state) => state.isSyncing),
        isAuthenticated: !!user,
    };
}
