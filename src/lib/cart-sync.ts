import {
    collection,
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CartItem } from "@/types";

const CARTS_COLLECTION = "carts";

/**
 * Save user's cart to Firestore
 */
export async function saveCartToFirestore(userId: string, cartItems: CartItem[], couponCode?: string, discount?: number) {
    try {
        const cartRef = doc(db, CARTS_COLLECTION, userId);
        
        await setDoc(cartRef, {
            items: cartItems,
            couponCode: couponCode || null,
            discount: discount || 0,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ Cart saved to Firestore:', { userId, itemCount: cartItems.length });
        return { success: true };
    } catch (error: any) {
        console.error('❌ Error saving cart to Firestore:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's cart from Firestore
 */
export async function getCartFromFirestore(userId: string) {
    try {
        const cartRef = doc(db, CARTS_COLLECTION, userId);
        const snapshot = await getDoc(cartRef);

        if (!snapshot.exists()) {
            return null;
        }

        const data = snapshot.data();
        return {
            items: data.items || [],
            couponCode: data.couponCode || undefined,
            discount: data.discount || 0,
            updatedAt: data.updatedAt,
        };
    } catch (error) {
        console.error('❌ Error getting cart from Firestore:', error);
        return null;
    }
}

/**
 * Subscribe to real-time cart updates
 */
export function subscribeToUserCart(
    userId: string,
    callback: (cart: { items: CartItem[]; couponCode?: string; discount: number } | null) => void,
    onError?: (error: Error) => void
) {
    try {
        const cartRef = doc(db, CARTS_COLLECTION, userId);

        const unsubscribe = onSnapshot(
            cartRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    callback({
                        items: data.items || [],
                        couponCode: data.couponCode || undefined,
                        discount: data.discount || 0,
                    });
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error('❌ Error in cart subscription:', error);
                onError?.(error);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error('❌ Error setting up cart subscription:', error);
        return () => { }; // Return empty unsubscribe function
    }
}

/**
 * Merge local cart with remote cart
 * Strategy: Keep items from both, but prefer remote quantities for duplicates
 */
export function mergeCartItems(localCart: CartItem[], remoteCart: CartItem[]): CartItem[] {
    const merged = new Map<string, CartItem>();

    // Add all local items
    localCart.forEach(item => {
        const key = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;
        merged.set(key, item);
    });

    // Add or update with remote items (remote takes precedence)
    remoteCart.forEach(item => {
        const key = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;
        merged.set(key, item);
    });

    return Array.from(merged.values());
}

/**
 * Clear user's cart from Firestore
 */
export async function clearCartFromFirestore(userId: string) {
    try {
        const cartRef = doc(db, CARTS_COLLECTION, userId);
        
        await setDoc(cartRef, {
            items: [],
            couponCode: null,
            discount: 0,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ Cart cleared from Firestore:', userId);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Error clearing cart from Firestore:', error);
        return { success: false, error: error.message };
    }
}
