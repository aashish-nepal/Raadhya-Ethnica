import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
    items: string[]; // Product IDs

    // Actions
    addItem: (productId: string) => void;
    removeItem: (productId: string) => void;
    toggleItem: (productId: string) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (productId) => {
                set((state) => {
                    if (!state.items.includes(productId)) {
                        return { items: [...state.items, productId] };
                    }
                    return state;
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((id) => id !== productId),
                }));
            },

            toggleItem: (productId) => {
                const isInWishlist = get().isInWishlist(productId);
                if (isInWishlist) {
                    get().removeItem(productId);
                } else {
                    get().addItem(productId);
                }
            },

            clearWishlist: () => {
                set({ items: [] });
            },

            isInWishlist: (productId) => {
                return get().items.includes(productId);
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
