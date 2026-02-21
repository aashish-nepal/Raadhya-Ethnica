// Product Types
export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice: number;
    discount: number;
    sku: string;
    category: string;
    subcategory?: string;
    images: string[];
    video?: string;
    colors: ProductColor[];
    sizes: ProductSize[];
    fabric: string;
    sleeveType: string;
    neckType: string;
    occasion: string[];
    careInstructions: string[];
    features: string[];
    inStock: boolean;
    stockCount: number;
    rating: number;
    reviewCount: number;
    isTrending: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    tags: string[];
    seo: SEOData;
    createdAt: string;
    updatedAt: string;
}

export interface ProductColor {
    name: string;
    hex: string;
    images: string[];
}

export interface ProductSize {
    size: string;
    inStock: boolean;
    measurements?: {
        bust?: string;
        waist?: string;
        hip?: string;
        length?: string;
    };
}

// Category Types
export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    icon?: string;
    productCount: number;
    featured: boolean;
    order: number;
}

// Review Types
export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    verified: boolean;
    helpful: number;
    createdAt: string;
}

// User Types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: 'customer' | 'admin';
    addresses: Address[];
    wishlist: string[];
    loyaltyPoints: number;
    createdAt: string;
}

export interface Address {
    id: string;
    type: 'home' | 'work' | 'other';
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
}

// Cart Types
export interface CartItem {
    productId: string;
    product: Product;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
    price: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    couponCode?: string;
}

// Order Types
export interface Order {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
    couponCode?: string;
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: 'stripe' | 'paypal';
    paymentId: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    trackingNumber?: string;
    notes?: string;
    giftMessage?: string;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    estimatedDelivery?: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    total: number;
}

// Coupon Types
export interface Coupon {
    id: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue: number;
    maxDiscount?: number;
    usageLimit: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    active: boolean;
}

// Blog Types
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    author: string;
    category: string;
    tags: string[];
    readTime: number;
    views: number;
    published: boolean;
    seo: SEOData;
    createdAt: string;
    updatedAt: string;
}

// SEO Types
export interface SEOData {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
}

// Filter Types
export interface ProductFilters {
    category?: string;
    priceRange?: [number, number];
    sizes?: string[];
    colors?: string[];
    fabrics?: string[];
    sleeveTypes?: string[];
    neckTypes?: string[];
    occasions?: string[];
    discount?: number;
    inStockOnly?: boolean;
    rating?: number;
}

export interface SortOption {
    value: string;
    label: string;
}

// Analytics Types
export interface Analytics {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    recentOrders: Order[];
    topProducts: Product[];
    salesByCategory: { category: string; sales: number }[];
    revenueByMonth: { month: string; revenue: number }[];
}

// Newsletter Types
export interface NewsletterSubscriber {
    id: string;
    email: string;
    name?: string;
    subscribed: boolean;
    createdAt: string;
}

// Contact Form Types
export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: string;
}

// Wishlist Types
export interface WishlistItem {
    productId: string;
    addedAt: string;
}

// Admin Dashboard Types
export interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueChange: number;
    ordersChange: number;
    productsChange: number;
    customersChange: number;
}

export interface DashboardData {
    stats: AdminStats;
    recentOrders: Order[];
    topProducts: Product[];
    salesByCategory: { category: string; sales: number; count: number }[];
}

// Firestore Document Types (with Firestore Timestamp)
export interface FirestoreProduct extends Omit<Product, 'createdAt' | 'updatedAt'> {
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface FirestoreOrder extends Omit<Order, 'createdAt' | 'updatedAt'> {
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface FirestoreCustomer extends Omit<User, 'createdAt'> {
    createdAt: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: any; // Firestore Timestamp
}

// Store Settings Types
export interface HeroSettings {
    featuredProductId: string;
    promoText: string;
    bannerText: string;
    badgeLabel: string;
    badgeValue: string;
    announcementText: string;
}

export interface StoreSettings {
    id: string;
    hero?: HeroSettings;
    store: {
        name: string;
        tagline: string;
        logo?: string;
        favicon?: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        businessHours: string;
        gstNumber?: string;
        currency: string;
        currencySymbol: string;
        timezone: string;
    };
    shipping: {
        freeShippingThreshold: number;
        standardShippingRate: number;
        expressShippingRate: number;
        internationalShipping: boolean;
        estimatedDeliveryDays: number;
        expressDeliveryDays: number;
        codAvailable: boolean;
        codCharges: number;
        shippingZones: ShippingZone[];
    };
    payment: {
        stripeEnabled: boolean;
        stripePublishableKey?: string;
        stripeSecretKey?: string;
        paypalEnabled: boolean;
        paypalClientId?: string;
        codEnabled: boolean;
        upiEnabled: boolean;
        upiId?: string;
    };
    notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        whatsappNotifications: boolean;
        whatsappNumber?: string;
        orderConfirmationEmail: boolean;
        shippingUpdateEmail: boolean;
        deliveryEmail: boolean;
        adminOrderNotification: boolean;
        adminEmail?: string;
        lowStockAlert: boolean;
        lowStockThreshold: number;
    };
    seo: {
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string[];
        googleAnalyticsId?: string;
        facebookPixelId?: string;
        twitterHandle?: string;
        facebookUrl?: string;
        instagramUrl?: string;
        pinterestUrl?: string;
        youtubeUrl?: string;
    };
    inventory: {
        trackInventory: boolean;
        lowStockThreshold: number;
        outOfStockBehavior: 'hide' | 'show' | 'preorder';
        allowBackorders: boolean;
        autoRestockNotification: boolean;
    };
    policies: {
        returnPeriodDays: number;
        returnConditions: string;
        refundProcessingDays: number;
        exchangeAllowed: boolean;
        termsAndConditions: string;
        privacyPolicy: string;
        shippingPolicy: string;
        refundPolicy: string;
    };
    tax: {
        taxEnabled: boolean;
        taxRate: number;
        taxLabel: string;
        pricesIncludeTax: boolean;
        taxNumber?: string;
    };
    updatedAt: string;
}

export interface ShippingZone {
    id: string;
    name: string;
    states: string[];
    shippingRate: number;
    estimatedDays: number;
}

// Real-time Listener Types
export type UnsubscribeFunction = () => void;

export interface RealtimeOptions {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}
