import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, StoreSettings } from '@/types';
import { saveCartToFirestore, clearCartFromFirestore, mergeCartItems } from '@/lib/cart-sync';

interface CartStore {
    items: CartItem[];
    couponCode?: string;
    discount: number;
    isSyncing: boolean;
    lastSyncedUserId?: string;

    // Actions
    addItem: (product: Product, size: string, color: string, quantity?: number) => void;
    removeItem: (productId: string, size: string, color: string) => void;
    updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    applyCoupon: (code: string, discountAmount: number) => void;
    removeCoupon: () => void;

    // Sync methods
    syncToFirestore: (userId: string) => Promise<void>;
    loadFromRemote: (remoteCart: { items: CartItem[]; couponCode?: string; discount: number }) => void;
    setItems: (items: CartItem[]) => void;
    setSyncing: (syncing: boolean) => void;
    setLastSyncedUserId: (userId?: string) => void;

    // Computed
    getItemCount: () => number;
    getSubtotal: () => number;
    getTotals: (settings?: StoreSettings | null) => {
        subtotal: number;
        discount: number;
        shipping: number;
        tax: number;
        total: number;
        currencySymbol: string;
    };
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            couponCode: undefined,
            discount: 0,
            isSyncing: false,
            lastSyncedUserId: undefined,

            addItem: (product, size, color, quantity = 1) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (item) =>
                            item.productId === product.id &&
                            item.selectedSize === size &&
                            item.selectedColor === color
                    );

                    if (existingItemIndex > -1) {
                        // Update quantity of existing item
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += quantity;
                        return { items: newItems };
                    } else {
                        // Add new item
                        const newItem: CartItem = {
                            productId: product.id,
                            product,
                            quantity,
                            selectedSize: size,
                            selectedColor: color,
                            price: product.price,
                        };
                        return { items: [...state.items, newItem] };
                    }
                });
            },

            removeItem: (productId, size, color) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) =>
                            !(
                                item.productId === productId &&
                                item.selectedSize === size &&
                                item.selectedColor === color
                            )
                    ),
                }));
            },

            updateQuantity: (productId, size, color, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId, size, color);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId &&
                            item.selectedSize === size &&
                            item.selectedColor === color
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [], couponCode: undefined, discount: 0 });
            },

            applyCoupon: (code, discountAmount) => {
                set({ couponCode: code, discount: discountAmount });
            },

            removeCoupon: () => {
                set({ couponCode: undefined, discount: 0 });
            },

            // Sync cart to Firestore
            syncToFirestore: async (userId: string) => {
                const state = get();
                if (state.isSyncing) return; // Prevent concurrent syncs

                set({ isSyncing: true });

                try {
                    await saveCartToFirestore(
                        userId,
                        state.items,
                        state.couponCode,
                        state.discount
                    );
                    set({ lastSyncedUserId: userId });
                } catch (error) {
                    console.error('Failed to sync cart to Firestore:', error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            // Load cart from remote (Firestore)
            loadFromRemote: (remoteCart) => {
                const state = get();

                // Merge local and remote carts
                const mergedItems = mergeCartItems(state.items, remoteCart.items);

                set({
                    items: mergedItems,
                    couponCode: remoteCart.couponCode || state.couponCode,
                    discount: remoteCart.discount || state.discount,
                });
            },

            // Set items directly (used by sync)
            setItems: (items) => {
                set({ items });
            },

            // Set syncing state
            setSyncing: (syncing) => {
                set({ isSyncing: syncing });
            },

            // Set last synced user ID
            setLastSyncedUserId: (userId) => {
                set({ lastSyncedUserId: userId });
            },

            getItemCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getTotals: (settings) => {
                const subtotal = get().getSubtotal();
                const discount = get().discount;

                // Use settings or fallback to defaults
                const currencySymbol = settings?.store.currencySymbol || "$";
                const freeShippingThreshold = settings?.shipping.freeShippingThreshold || 100;
                const standardShippingRate = settings?.shipping.standardShippingRate || 10;
                const taxEnabled = settings?.tax.taxEnabled ?? true;
                const taxRate = settings?.tax.taxRate || 10;
                const pricesIncludeTax = settings?.tax.pricesIncludeTax ?? false;

                // Calculate shipping
                const shipping = subtotal >= freeShippingThreshold ? 0 : standardShippingRate;

                // Calculate tax
                let tax = 0;
                if (taxEnabled && !pricesIncludeTax) {
                    // Tax needs to be added
                    tax = (subtotal - discount + shipping) * (taxRate / 100);
                }

                // Calculate total
                const total = subtotal - discount + shipping + tax;

                return {
                    subtotal,
                    discount,
                    shipping,
                    tax,
                    total,
                    currencySymbol,
                };
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
