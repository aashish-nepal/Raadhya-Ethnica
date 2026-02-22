import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    onSnapshot,
    increment,
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
export const COLLECTIONS = {
    PRODUCTS: "products",
    ORDERS: "orders",
    CUSTOMERS: "customers",
    REVIEWS: "reviews",
    NEWSLETTER: "newsletter",
    COUPONS: "coupons",
    SETTINGS: "settings",
};

// Settings Operations
const DEFAULT_HERO = {
    featuredProductId: "",
    promoText: "✨ New Collection 2024",
};

export async function getStoreSettings() {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "store-config");
    const snapshot = await getDoc(settingsRef);

    if (!snapshot.exists()) {
        await initializeDefaultSettings();
        const newSnapshot = await getDoc(settingsRef);
        return newSnapshot.exists() ? { id: newSnapshot.id, ...newSnapshot.data() } : null;
    }

    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        // Always ensure 'hero' exists by merging with defaults
        hero: { ...DEFAULT_HERO, ...(data?.hero ?? {}) },
    };
}

export async function updateStoreSettings(data: any) {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "store-config");
    return await updateDoc(settingsRef, {
        ...data,
        updatedAt: new Date().toISOString(),
    });
}

export function subscribeToHeroSettings(
    callback: (hero: { featuredProductId: string; promoText: string; bannerText: string; badgeLabel: string; badgeValue: string; announcementText: string }) => void
) {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "store-config");
    return onSnapshot(settingsRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : {};
        callback({
            featuredProductId: data?.hero?.featuredProductId ?? "",
            promoText: data?.hero?.promoText ?? "✨ New Collection 2024",
            bannerText: data?.hero?.bannerText ?? "⏰ Limited Time Offer: Flat 35% OFF on all kurtas | Ends in 2 days!",
            badgeLabel: data?.hero?.badgeLabel ?? "Special Offer",
            badgeValue: data?.hero?.badgeValue ?? "35% OFF",
            announcementText: data?.hero?.announcementText ?? "🎉 Limited Time Offer: Flat 35% OFF on all kurtas | Free Shipping above A$150",
        });
    });
}

export async function saveHeroSettings(heroData: { featuredProductId: string; promoText: string; bannerText: string; badgeLabel: string; badgeValue: string; announcementText: string }) {
    const { setDoc } = await import("firebase/firestore");
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "store-config");
    await setDoc(settingsRef, {
        hero: {
            featuredProductId: heroData.featuredProductId,
            promoText: heroData.promoText,
            bannerText: heroData.bannerText,
            badgeLabel: heroData.badgeLabel,
            badgeValue: heroData.badgeValue,
            announcementText: heroData.announcementText,
        },
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}

export interface CategoryGridItem {
    id: string;
    name: string;
    slug: string;
    description: string;
    emoji: string;
    imageUrl?: string;
    visible: boolean;
    order: number;
}

const DEFAULT_CATEGORIES: CategoryGridItem[] = [
    { id: "cat-1", name: "Cotton Kurtas", slug: "cotton", description: "Comfortable and breathable cotton kurtas", emoji: "👗", imageUrl: "", visible: true, order: 1 },
    { id: "cat-2", name: "Designer Kurtas", slug: "designer", description: "Premium designer kurtas with intricate embroidery", emoji: "🌸", imageUrl: "", visible: true, order: 2 },
    { id: "cat-3", name: "Festive Wear", slug: "festive", description: "Elegant kurtas for festivals and special occasions", emoji: "✨", imageUrl: "", visible: true, order: 3 },
    { id: "cat-4", name: "Office Wear", slug: "office", description: "Professional and stylish kurtas for the workplace", emoji: "💎", imageUrl: "", visible: true, order: 4 },
    { id: "cat-5", name: "Casual Wear", slug: "casual", description: "Relaxed and comfortable kurtas for everyday style", emoji: "🎀", imageUrl: "", visible: true, order: 5 },
];

export async function saveCategorySettings(categories: CategoryGridItem[]) {
    const { setDoc } = await import("firebase/firestore");
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "store-config");
    await setDoc(settingsRef, { categories, updatedAt: new Date().toISOString() }, { merge: true });
}

export function subscribeToCategorySettings(callback: (categories: CategoryGridItem[]) => void) {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "store-config");
    return onSnapshot(settingsRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : {};
        callback((data?.categories as CategoryGridItem[]) ?? DEFAULT_CATEGORIES);
    });
}

export function subscribeToReviews(
    callback: (reviews: any[]) => void,
    maxCount: number = 6
) {
    const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        orderBy("createdAt", "desc"),
        limit(maxCount)
    );
    return onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(reviews);
    });
}

export async function initializeDefaultSettings() {
    const { setDoc } = await import("firebase/firestore");
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "store-config");
    const defaultSettings = {
        id: "store-config",
        store: {
            name: "Raadhya Ethnica",
            tagline: "Authentic Indian Ethnic Wear",
            logo: "",
            favicon: "",
            email: "contact@raadhyaethnica.com",
            phone: "+61 3 1234 5678",
            address: "Craigieburn Central",
            city: "Craigieburn",
            state: "Victoria",
            pincode: "3064",
            country: "Australia",
            businessHours: "Mon-Sat: 10:00 AM - 8:00 PM",
            gstNumber: "",
            currency: "AUD",
            currencySymbol: "$",
            timezone: "Australia/Melbourne",
        },
        shipping: {
            freeShippingThreshold: 100,
            standardShippingRate: 10,
            expressShippingRate: 20,
            internationalShipping: false,
            estimatedDeliveryDays: 5,
            expressDeliveryDays: 2,
            codAvailable: true,
            codCharges: 5,
            shippingZones: [],
        },
        payment: {
            stripeEnabled: false,
            stripePublishableKey: "",
            stripeSecretKey: "",
            paypalEnabled: false,
            paypalClientId: "",
            codEnabled: true,
            upiEnabled: false,
            upiId: "",
        },
        notifications: {
            emailNotifications: true,
            smsNotifications: false,
            whatsappNotifications: false,
            whatsappNumber: "",
            orderConfirmationEmail: true,
            shippingUpdateEmail: true,
            deliveryEmail: true,
            adminOrderNotification: true,
            adminEmail: "admin@raadhyaethnica.com",
            lowStockAlert: true,
            lowStockThreshold: 10,
        },
        seo: {
            metaTitle: "Raadhya Ethnica - Authentic Indian Ethnic Wear",
            metaDescription: "Shop the finest collection of traditional Indian ethnic wear including sarees, lehengas, salwar kameez, and more.",
            metaKeywords: ["ethnic wear", "indian clothing", "sarees", "lehengas", "traditional wear"],
            googleAnalyticsId: "",
            facebookPixelId: "",
            twitterHandle: "",
            facebookUrl: "",
            instagramUrl: "",
            pinterestUrl: "",
            youtubeUrl: "",
        },
        inventory: {
            trackInventory: true,
            lowStockThreshold: 10,
            outOfStockBehavior: "show",
            allowBackorders: false,
            autoRestockNotification: true,
        },
        policies: {
            returnPeriodDays: 7,
            returnConditions: "Items must be unused with original tags attached.",
            refundProcessingDays: 7,
            exchangeAllowed: true,
            termsAndConditions: "Terms and conditions content goes here.",
            privacyPolicy: "Privacy policy content goes here.",
            shippingPolicy: "Shipping policy content goes here.",
            refundPolicy: "Refund policy content goes here.",
        },
        tax: {
            taxEnabled: true,
            taxRate: 10,
            taxLabel: "GST",
            pricesIncludeTax: true,
            taxNumber: "",
        },
        updatedAt: new Date().toISOString(),
    };

    // Create the document
    await setDoc(settingsRef, defaultSettings);
    return defaultSettings;
}



// Product Operations
export async function getProducts() {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getProduct(id: string) {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const snapshot = await getDoc(productRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// Alias for consistency
export const getProductById = getProduct;

export async function addProduct(data: any) {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    return await addDoc(productsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
}

export async function updateProduct(id: string, data: any) {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
    return await updateDoc(productRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

export async function deleteProduct(id: string) {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
    return await deleteDoc(productRef);
}

// Order Operations
export async function getOrders(userId?: string) {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    let q = query(ordersRef, orderBy("createdAt", "desc"));

    if (userId) {
        q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getOrder(id: string) {
    const orderRef = doc(db, COLLECTIONS.ORDERS, id);
    const snapshot = await getDoc(orderRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}


export async function updateOrder(id: string, data: any) {
    const orderRef = doc(db, COLLECTIONS.ORDERS, id);
    return await updateDoc(orderRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

// Customer Operations
export async function getCustomers() {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const snapshot = await getDocs(customersRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getCustomer(id: string) {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, id);
    const snapshot = await getDoc(customerRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function createCustomer(data: any) {
    try {
        const customerRef = doc(db, COLLECTIONS.CUSTOMERS, data.userId);
        const existingDoc = await getDoc(customerRef);

        // Never overwrite an existing document (preserves role, orders, totalSpent etc.)
        if (existingDoc.exists()) return customerRef;

        await setDoc(customerRef, {
            userId: data.userId,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || "user",
            status: data.status || "active",
            orders: 0,
            totalSpent: 0,
            wishlist: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return customerRef;
    } catch (error) {
        console.error('❌ Error in createCustomer:', error);
        throw error;
    }
}

export async function updateCustomer(id: string, data: any) {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, id);
    return await updateDoc(customerRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

// Review Operations
export async function getProductReviews(productId: string) {
    const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
    const q = query(
        reviewsRef,
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addReview(data: any) {
    const reviewsRef = collection(db, COLLECTIONS.REVIEWS);

    // Prevent duplicate reviews: one review per user per product
    const existingQuery = query(
        reviewsRef,
        where('productId', '==', data.productId),
        where('userId', '==', data.userId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
        return { alreadyReviewed: true };
    }

    await addDoc(reviewsRef, {
        ...data,
        createdAt: Timestamp.now(),
    });

    return { alreadyReviewed: false };
}

// Newsletter Operations
export async function subscribeToNewsletter(email: string, name?: string) {
    const newsletterRef = collection(db, COLLECTIONS.NEWSLETTER);

    // Prevent duplicate subscriptions
    const existingQuery = query(newsletterRef, where('email', '==', email));
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
        return { alreadySubscribed: true };
    }

    await addDoc(newsletterRef, {
        email,
        name: name || "",
        subscribedAt: Timestamp.now(),
        active: true,
    });

    return { alreadySubscribed: false };
}

// Coupon Operations
export async function getCoupon(code: string) {
    const couponsRef = collection(db, COLLECTIONS.COUPONS);
    const q = query(couponsRef, where("code", "==", code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    return coupon;
}

export async function validateCoupon(code: string) {
    const coupon = await getCoupon(code) as any;

    if (!coupon) return { valid: false, message: "Invalid coupon code" };

    const now = new Date();
    const expiryDate = coupon.expiryDate?.toDate();

    if (!coupon.active) {
        return { valid: false, message: "Coupon is no longer active" };
    }

    if (expiryDate && expiryDate < now) {
        return { valid: false, message: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit reached" };
    }

    return { valid: true, coupon };
}

// Real-time Listeners
export function subscribeToProducts(
    callback: (products: any[]) => void,
    onError?: (error: Error) => void
) {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(productsRef, orderBy("createdAt", "desc"));

    return onSnapshot(
        q,
        (snapshot) => {
            const products = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(products);
        },
        (error) => {
            console.error("Error subscribing to products:", error);
            onError?.(error);
        }
    );
}

/**
 * Subscribe to low stock products in real-time
 * @param threshold - Stock threshold to consider as "low stock"
 * @param callback - Function to call with low stock products
 * @param onError - Optional error handler
 * @returns Unsubscribe function
 */
export function subscribeToLowStockProducts(
    threshold: number,
    callback: (products: any[]) => void,
    onError?: (error: Error) => void
) {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(
        productsRef,
        where("stockCount", "<=", threshold),
        where("stockCount", ">", 0),
        orderBy("stockCount", "asc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const products = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(products);
        },
        (error) => {
            console.error("Error subscribing to low stock products:", error);
            onError?.(error);
        }
    );
}

export function subscribeToOrders(
    callback: (orders: any[]) => void,
    userId?: string,
    onError?: (error: Error) => void
) {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    let q = query(ordersRef, orderBy("createdAt", "desc"));

    if (userId) {
        q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    }

    return onSnapshot(
        q,
        (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(orders);
        },
        (error) => {
            console.error("Error subscribing to orders:", error);
            onError?.(error);
        }
    );
}

export function subscribeToCustomers(
    callback: (customers: any[]) => void,
    onError?: (error: Error) => void
) {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(customersRef, orderBy("createdAt", "desc"));

    return onSnapshot(
        q,
        (snapshot) => {
            const customers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(customers);
        },
        (error) => {
            console.error("Error subscribing to customers:", error);
            onError?.(error);
        }
    );
}

export function subscribeToRecentOrders(
    callback: (orders: any[]) => void,
    limitCount: number = 5,
    onError?: (error: Error) => void
) {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    // Fetch more than needed to account for mixed timestamp types
    const q = query(ordersRef, orderBy("createdAt", "desc"), limit(limitCount * 2));

    return onSnapshot(
        q,
        (snapshot) => {
            const orders: any[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort client-side to handle mixed Timestamp and ISO string types
            const sorted = orders.sort((a, b) => {
                const getTime = (val: any): number => {
                    if (!val) return 0;
                    if (typeof val.toMillis === 'function') return val.toMillis(); // Firestore Timestamp
                    if (typeof val === 'string') return new Date(val).getTime(); // ISO string
                    return 0;
                };
                return getTime(b.createdAt) - getTime(a.createdAt); // newest first
            });

            callback(sorted.slice(0, limitCount));
        },
        (error) => {
            console.error("Error subscribing to recent orders:", error);
            onError?.(error);
        }
    );
}

// Single Order Subscription
export function subscribeToOrder(
    orderId: string,
    callback: (order: any) => void,
    onError?: (error: Error) => void
) {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);

    return onSnapshot(
        orderRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() });
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error("Error subscribing to order:", error);
            onError?.(error);
        }
    );
}

// Single Product Subscription
export function subscribeToProduct(
    productId: string,
    callback: (product: any) => void,
    onError?: (error: Error) => void
) {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);

    return onSnapshot(
        productRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() });
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error("Error subscribing to product:", error);
            onError?.(error);
        }
    );
}

// User Addresses Subscription
export function subscribeToUserAddresses(
    userId: string,
    callback: (addresses: any[]) => void,
    onError?: (error: Error) => void
) {
    const addressesRef = collection(db, `${COLLECTIONS.CUSTOMERS}/${userId}/addresses`);

    return onSnapshot(
        addressesRef,
        (snapshot) => {
            const addresses = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(addresses);
        },
        (error) => {
            console.error("Error subscribing to addresses:", error);
            onError?.(error);
        }
    );
}


// Addresses Operations
export async function getUserAddresses(userId: string) {
    const addressesRef = collection(db, `${COLLECTIONS.CUSTOMERS}/${userId}/addresses`);
    const snapshot = await getDocs(addressesRef);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}

export async function addAddress(userId: string, addressData: any) {
    const addressesRef = collection(db, `${COLLECTIONS.CUSTOMERS}/${userId}/addresses`);

    // If this is the first address or marked as default, unset other defaults
    if (addressData.isDefault) {
        const addresses = await getUserAddresses(userId);
        for (const addr of addresses) {
            if ((addr as any).isDefault) {
                await updateAddress(userId, addr.id, { isDefault: false });
            }
        }
    }

    const docRef = await addDoc(addressesRef, addressData);
    return docRef.id;
}


// Wishlist Operations
export async function saveWishlist(userId: string, productIds: string[]) {
    const userRef = doc(db, COLLECTIONS.CUSTOMERS, userId);

    // Guard: only update wishlist if the customer document exists and is complete
    // This prevents creating skeleton documents missing email/name/role
    const existing = await getDoc(userRef);
    if (!existing.exists() || !existing.data().email) return;

    await updateDoc(userRef, {
        wishlist: productIds,
        updatedAt: Timestamp.now(),
    });
}

export async function getWishlist(userId: string): Promise<string[]> {
    const userRef = doc(db, COLLECTIONS.CUSTOMERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const data = userDoc.data();
        return data.wishlist || [];
    }

    return [];
}

export function subscribeToWishlist(
    userId: string,
    callback: (wishlist: string[]) => void,
    onError?: (error: Error) => void
) {
    const userRef = doc(db, COLLECTIONS.CUSTOMERS, userId);

    return onSnapshot(
        userRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                callback(data.wishlist || []);
            } else {
                callback([]);
            }
        },
        (error) => {
            console.error("Error subscribing to wishlist:", error);
            onError?.(error);
        }
    );
}

export async function updateAddress(userId: string, addressId: string, addressData: any) {
    const addressRef = doc(db, `${COLLECTIONS.CUSTOMERS}/${userId}/addresses`, addressId);

    // If setting as default, unset other defaults
    if (addressData.isDefault) {
        const addresses = await getUserAddresses(userId);
        for (const addr of addresses) {
            if (addr.id !== addressId && (addr as any).isDefault) {
                const otherAddressRef = doc(db, `${COLLECTIONS.CUSTOMERS}/${userId}/addresses`, addr.id);
                await updateDoc(otherAddressRef, { isDefault: false });
            }
        }
    }

    return await updateDoc(addressRef, addressData);
}

export async function deleteAddress(userId: string, addressId: string) {
    const addressRef = doc(db, `${COLLECTIONS.CUSTOMERS}/${userId}/addresses`, addressId);
    return await deleteDoc(addressRef);
}

export async function setDefaultAddress(userId: string, addressId: string) {
    // Unset all defaults first
    const addresses = await getUserAddresses(userId);
    for (const addr of addresses) {
        if ((addr as any).isDefault) {
            await updateAddress(userId, addr.id, { isDefault: false });
        }
    }

    // Set the new default
    return await updateAddress(userId, addressId, { isDefault: true });
}

// User Profile Operations
export async function updateUserProfile(userId: string, profileData: any) {
    const userRef = doc(db, COLLECTIONS.CUSTOMERS, userId);
    return await updateDoc(userRef, {
        ...profileData,
        updatedAt: Timestamp.now(),
    });
}

export async function getUserProfile(userId: string) {
    const userRef = doc(db, COLLECTIONS.CUSTOMERS, userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data(),
    };
}

// Order Management Functions

/**
 * Generate a unique order number
 */
function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order in Firestore
 */
export async function createOrder(orderData: {
    userId: string;
    userEmail: string;
    userName: string;
    items: any[];
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: 'stripe' | 'paypal';
    paymentId: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency?: string;
    couponCode?: string;
    discount?: number;
}) {
    try {
        const orderNumber = generateOrderNumber();
        const now = Timestamp.now();

        const order = {
            ...orderData,
            orderNumber,
            paymentStatus: 'paid' as const,
            orderStatus: 'confirmed' as const,
            currency: orderData.currency || 'USD',
            discount: orderData.discount || 0,
            createdAt: now,
            updatedAt: now,
            paidAt: now,
        };

        const orderRef = await addDoc(collection(db, COLLECTIONS.ORDERS), order);

        // Update customer's order count and total spent
        const customerRef = doc(db, COLLECTIONS.CUSTOMERS, orderData.userId);
        await updateDoc(customerRef, {
            orders: increment(1),
            totalSpent: increment(orderData.total),
            updatedAt: Timestamp.now(),
        });

        return {
            success: true,
            orderId: orderRef.id,
            orderNumber,
        };
    } catch (error: any) {
        console.error('❌ Error creating order:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string) {
    try {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        const snapshot = await getDoc(orderRef);

        if (!snapshot.exists()) {
            return null;
        }

        return {
            id: snapshot.id,
            ...snapshot.data(),
        };
    } catch (error) {
        console.error('Error getting order:', error);
        return null;
    }
}

/**
 * Get order by payment ID
 */
export async function getOrderByPaymentId(paymentId: string) {
    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(ordersRef, where('paymentId', '==', paymentId), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        };
    } catch (error) {
        console.error('Error getting order by payment ID:', error);
        return null;
    }
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string) {
    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(
            ordersRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting user orders:', error);
        return [];
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
) {
    try {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        const updateData: any = {
            orderStatus: status,
            updatedAt: new Date().toISOString(),
        };

        // Add timestamp for specific statuses
        if (status === 'shipped') {
            updateData.shippedAt = new Date().toISOString();
        } else if (status === 'delivered') {
            updateData.deliveredAt = new Date().toISOString();
        }

        await updateDoc(orderRef, updateData);

        return { success: true };
    } catch (error: any) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
) {
    try {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        const updateData: any = {
            paymentStatus,
            updatedAt: new Date().toISOString(),
        };

        if (paymentStatus === 'paid') {
            updateData.paidAt = new Date().toISOString();
        }

        await updateDoc(orderRef, updateData);

        return { success: true };
    } catch (error: any) {
        console.error('Error updating payment status:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Add tracking number to order
 */
export async function addTrackingNumber(orderId: string, trackingNumber: string) {
    try {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        await updateDoc(orderRef, {
            trackingNumber,
            orderStatus: 'shipped',
            shippedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error adding tracking number:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

// Real-time Order Listeners

/**
 * Subscribe to user's orders with real-time updates
 */
export function subscribeToUserOrders(
    userId: string,
    callback: (orders: any[]) => void,
    onError?: (error: any) => void
) {
    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);

        // Compound query (requires composite index in Firestore)
        const q = query(
            ordersRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(orders);
        }, (error) => {
            // Index not yet built — fall back to simple query + client-side sort
            console.warn('⚠️ Compound index missing, falling back to simple query:', error.message);
            const simpleQ = query(ordersRef, where('userId', '==', userId));
            onSnapshot(simpleQ, (snapshot) => {
                const orders = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a: any, b: any) => {
                        const getTime = (v: any) =>
                            typeof v?.toMillis === 'function' ? v.toMillis()
                                : typeof v === 'string' ? new Date(v).getTime() : 0;
                        return getTime(b.createdAt) - getTime(a.createdAt);
                    });
                callback(orders);
            }, () => callback([]));
        });

        return unsubscribe;
    } catch (error) {
        console.error('❌ Error setting up user orders listener:', error);
        return () => { };
    }
}

/**
 * Subscribe to all orders (admin) with real-time updates
 */
export function subscribeToAllOrders(
    callback: (orders: any[]) => void,
    limitCount: number = 50
) {
    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(
            ordersRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(orders);
        }, (error) => {
            console.error('Error in all orders listener:', error);
            callback([]);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up all orders listener:', error);
        return () => { }; // Return empty unsubscribe function
    }
}

/**
 * Subscribe to orders by status (admin)
 */
export function subscribeToOrdersByStatus(
    status: string,
    callback: (orders: any[]) => void
) {
    try {
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(
            ordersRef,
            where('orderStatus', '==', status),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(orders);
        }, (error) => {
            console.error('Error in orders by status listener:', error);
            callback([]);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up orders by status listener:', error);
        return () => { }; // Return empty unsubscribe function
    }
}
