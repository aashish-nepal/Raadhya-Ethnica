import { collection, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./firestore";
import type { AdminStats, DashboardData } from "@/types";

/**
 * Calculate dashboard statistics from Firestore data
 */
export async function calculateDashboardStats(): Promise<AdminStats> {
    try {
        // Get all orders
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const ordersSnapshot = await getDocs(ordersRef);
        const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Get all products
        const productsRef = collection(db, COLLECTIONS.PRODUCTS);
        const productsSnapshot = await getDocs(productsRef);

        // Get customers excluding admins using Firestore query (more efficient)
        const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
        const nonAdminCustomersQuery = query(
            customersRef,
            where('role', '!=', 'admin')
        );
        const actualCustomersSnapshot = await getDocs(nonAdminCustomersQuery);

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum: number, order: any) => {
            if (order.paymentStatus === "paid") {
                return sum + (order.total || 0);
            }
            return sum;
        }, 0);

        // Get date 30 days ago for comparison
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Calculate previous period stats for comparison
        const recentOrders = orders.filter((order: any) => {
            const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
            return orderDate >= thirtyDaysAgo;
        });

        const previousOrders = orders.filter((order: any) => {
            const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
        });

        // Calculate changes
        const recentRevenue = recentOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const previousRevenue = previousOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const revenueChange = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        const ordersChange = previousOrders.length > 0
            ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100
            : 0;

        return {
            totalRevenue,
            totalOrders: orders.length,
            totalProducts: productsSnapshot.size,
            totalCustomers: actualCustomersSnapshot.size, // Count from optimized query
            revenueChange: Math.round(revenueChange * 10) / 10,
            ordersChange: Math.round(ordersChange * 10) / 10,
            productsChange: 0, // Can be calculated if tracking historical data
            customersChange: 0, // Can be calculated if tracking historical data
        };
    } catch (error) {
        console.error("Error calculating dashboard stats:", error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalCustomers: 0,
            revenueChange: 0,
            ordersChange: 0,
            productsChange: 0,
            customersChange: 0,
        };
    }
}

/**
 * Get complete dashboard data including stats and recent activity
 */
export async function getDashboardData(): Promise<DashboardData> {
    try {
        const stats = await calculateDashboardStats();

        // Get recent orders
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const recentOrdersQuery = query(ordersRef, orderBy("createdAt", "desc"));
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrders = recentOrdersSnapshot.docs.slice(0, 5).map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as any[];

        // Get top products (by order count)
        const productsRef = collection(db, COLLECTIONS.PRODUCTS);
        const productsSnapshot = await getDocs(productsRef);
        const topProducts = productsSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0))
            .slice(0, 5) as any[];

        // Calculate sales by category
        const salesByCategory: { [key: string]: { sales: number; count: number } } = {};
        recentOrdersSnapshot.docs.forEach((doc) => {
            const order = doc.data();
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const category = item.category || "Uncategorized";
                    if (!salesByCategory[category]) {
                        salesByCategory[category] = { sales: 0, count: 0 };
                    }
                    salesByCategory[category].sales += item.total || 0;
                    salesByCategory[category].count += item.quantity || 0;
                });
            }
        });

        const salesByCategoryArray = Object.entries(salesByCategory).map(([category, data]) => ({
            category,
            sales: data.sales,
            count: data.count,
        }));

        return {
            stats,
            recentOrders,
            topProducts,
            salesByCategory: salesByCategoryArray,
        };
    } catch (error) {
        console.error("Error getting dashboard data:", error);
        return {
            stats: {
                totalRevenue: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalCustomers: 0,
                revenueChange: 0,
                ordersChange: 0,
                productsChange: 0,
                customersChange: 0,
            },
            recentOrders: [],
            topProducts: [],
            salesByCategory: [],
        };
    }
}

/**
 * Check if user has admin role
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
    try {
        const customerRef = collection(db, COLLECTIONS.CUSTOMERS);
        const q = query(customerRef, where("id", "==", userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return false;

        const userData = snapshot.docs[0].data();
        return userData.role === "admin";
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}
