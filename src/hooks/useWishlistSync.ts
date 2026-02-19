import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlistStore } from '@/store/wishlistStore';
import { saveWishlist, subscribeToWishlist } from '@/lib/firestore';

/**
 * Hook to sync wishlist with Firestore
 * - Loads wishlist from Firestore when user logs in
 * - Saves wishlist to Firestore when it changes
 * - Subscribes to real-time wishlist updates
 */
export function useWishlistSync() {
    const { user } = useAuth();
    const wishlistItems = useWishlistStore((state) => state.items);

    // Subscribe to Firestore wishlist when user logs in
    useEffect(() => {
        if (!user) return;

        let isInitialLoad = true;

        const unsubscribe = subscribeToWishlist(
            user.uid,
            (firestoreWishlist) => {
                if (isInitialLoad) {
                    // On first load, merge Firestore wishlist with local wishlist
                    const localWishlist = useWishlistStore.getState().items;
                    const mergedWishlist = Array.from(new Set([...firestoreWishlist, ...localWishlist]));

                    // Update local store
                    useWishlistStore.setState({ items: mergedWishlist });

                    // Save merged wishlist back to Firestore if different
                    if (JSON.stringify(mergedWishlist.sort()) !== JSON.stringify(firestoreWishlist.sort())) {
                        saveWishlist(user.uid, mergedWishlist);
                    }

                    isInitialLoad = false;
                } else {
                    // Subsequent updates from Firestore (e.g., from another device)
                    useWishlistStore.setState({ items: firestoreWishlist });
                }
            },
            (error) => {
                console.error('Error syncing wishlist:', error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Save wishlist to Firestore whenever it changes
    useEffect(() => {
        if (!user) return;

        // Debounce to avoid too many writes
        const timeoutId = setTimeout(() => {
            saveWishlist(user.uid, wishlistItems).catch((error) => {
                console.error('Error saving wishlist:', error);
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [user, wishlistItems]);
}
