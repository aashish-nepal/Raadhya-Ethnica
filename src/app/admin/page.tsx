"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { subscribeToRecentOrders, subscribeToLowStockProducts } from "@/lib/firestore";
import { calculateDashboardStats } from "@/lib/admin";
import type { AdminStats, Product } from "@/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats>({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        revenueChange: 0,
        ordersChange: 0,
        productsChange: 0,
        customersChange: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load dashboard stats
        const loadStats = async () => {
            const dashboardStats = await calculateDashboardStats();
            setStats(dashboardStats);
            setLoading(false);
        };

        loadStats();

        // Subscribe to customers collection for real-time count updates
        const customersRef = collection(db, 'customers');
        const unsubscribeCustomers = onSnapshot(customersRef, async () => {
            const dashboardStats = await calculateDashboardStats();
            setStats(dashboardStats);
        });

        // Subscribe to orders collection for real-time revenue/order updates
        const ordersRef = collection(db, 'orders');
        const unsubscribeOrders = onSnapshot(ordersRef, async () => {
            const dashboardStats = await calculateDashboardStats();
            setStats(dashboardStats);
        });

        // Subscribe to products collection for real-time product count
        const productsRef = collection(db, 'products');
        const unsubscribeProducts = onSnapshot(productsRef, async () => {
            const dashboardStats = await calculateDashboardStats();
            setStats(dashboardStats);
        });

        // Subscribe to recent orders for real-time updates
        const unsubscribe = subscribeToRecentOrders(
            (orders) => {
                setRecentOrders(orders);
            },
            5,
            (error) => {
                console.error("Error loading recent orders:", error);
            }
        );

        // Subscribe to low stock products (threshold: 10)
        const unsubscribeLowStock = subscribeToLowStockProducts(
            10,
            (products) => {
                setLowStockProducts(products as Product[]);
            },
            (error) => {
                console.error("Error loading low stock products:", error);
            }
        );

        // Cleanup subscriptions on unmount
        return () => {
            unsubscribe();
            unsubscribeCustomers();
            unsubscribeOrders();
            unsubscribeProducts();
            unsubscribeLowStock();
        };
    }, []);

    const statsData = [
        {
            name: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            change: `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange.toFixed(1)}%`,
            trend: stats.revenueChange >= 0 ? "up" : "down",
            icon: DollarSign,
        },
        {
            name: "Total Orders",
            value: stats.totalOrders.toLocaleString(),
            change: `${stats.ordersChange >= 0 ? "+" : ""}${stats.ordersChange.toFixed(1)}%`,
            trend: stats.ordersChange >= 0 ? "up" : "down",
            icon: ShoppingCart,
        },
        {
            name: "Total Products",
            value: stats.totalProducts.toLocaleString(),
            change: `${stats.productsChange >= 0 ? "+" : ""}${stats.productsChange}`,
            trend: stats.productsChange >= 0 ? "up" : "down",
            icon: Package,
        },
        {
            name: "Total Customers",
            value: stats.totalCustomers.toLocaleString(),
            change: `${stats.customersChange >= 0 ? "+" : ""}${stats.customersChange.toFixed(1)}%`,
            trend: stats.customersChange >= 0 ? "up" : "down",
            icon: Users,
        },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "delivered":
                return "bg-green-100 text-green-700";
            case "processing":
            case "confirmed":
                return "bg-blue-100 text-blue-700";
            case "shipped":
                return "bg-purple-100 text-purple-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "cancelled":
            case "returned":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header with Live Indicator */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-neutral-900">Dashboard</h1>
                    <p className="text-neutral-600 mt-1">Welcome back! Here's what's happening today.</p>
                </div>

                {/* Live Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-neutral-200">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-neutral-700">Live</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsData.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white rounded-xl p-6 shadow-soft">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-primary-50 rounded-lg">
                                    <Icon size={24} className="text-primary-600" />
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {stat.trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900">{stat.value}</h3>
                            <p className="text-sm text-neutral-600 mt-1">{stat.name}</p>
                        </div>
                    );
                })}
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-amber-600" size={24} />
                        <div>
                            <h2 className="text-xl font-semibold text-amber-900">Low Stock Alert</h2>
                            <p className="text-sm text-amber-700 mt-1">
                                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low on stock
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockProducts.slice(0, 6).map((product) => (
                            <Link
                                key={product.id}
                                href={`/admin/products/${product.id}`}
                                className="bg-white rounded-lg p-4 border border-amber-200 hover:border-amber-400 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium text-neutral-900 line-clamp-1">{product.name}</h3>
                                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                                        {product.stockCount}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-600 line-clamp-1">{product.category}</p>
                                <p className="text-xs text-amber-700 mt-2">SKU: {product.sku}</p>
                            </Link>
                        ))}
                    </div>
                    {lowStockProducts.length > 6 && (
                        <Link
                            href="/admin/products"
                            className="inline-block mt-4 text-sm font-medium text-amber-700 hover:text-amber-900"
                        >
                            View all {lowStockProducts.length} low stock products →
                        </Link>
                    )}
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-soft">
                <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold">Recent Orders</h2>
                    <p className="text-sm text-neutral-500 mt-1">Real-time order updates</p>
                </div>
                <div className="overflow-x-auto">
                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            {order.orderNumber || order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.shippingAddress?.name || "Guest"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            ${order.total?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus || "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
