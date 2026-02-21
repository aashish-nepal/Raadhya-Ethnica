"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign,
    Loader2, AlertTriangle, ArrowRight, Plus, Eye, RefreshCw
} from "lucide-react";
import { subscribeToRecentOrders, subscribeToLowStockProducts } from "@/lib/firestore";
import { calculateDashboardStats } from "@/lib/admin";
import type { AdminStats, Product } from "@/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

const STAT_ICONS = {
    revenue: DollarSign,
    orders: ShoppingCart,
    products: Package,
    customers: Users,
};

const STAT_GRADIENTS = [
    "from-rose-500 to-pink-600",
    "from-violet-500 to-purple-600",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-600",
];

const quickActions = [
    { label: "Add Product", href: "/admin/products/new", icon: Plus, color: "bg-primary-50 text-primary-600 hover:bg-primary-100" },
    { label: "View Orders", href: "/admin/orders", icon: Eye, color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
    { label: "Customers", href: "/admin/customers", icon: Users, color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
    { label: "Settings", href: "/admin/settings", icon: RefreshCw, color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats>({
        totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0,
        revenueChange: 0, ordersChange: 0, productsChange: 0, customersChange: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            const dashboardStats = await calculateDashboardStats();
            setStats(dashboardStats);
            setLoading(false);
        };
        loadStats();

        const refresh = async () => {
            const dashboardStats = await calculateDashboardStats();
            setStats(dashboardStats);
        };

        const unsubs = [
            onSnapshot(collection(db, "customers"), refresh),
            onSnapshot(collection(db, "orders"), refresh),
            onSnapshot(collection(db, "products"), refresh),
        ];

        const unsubOrders = subscribeToRecentOrders((orders) => setRecentOrders(orders), 5, console.error);
        const unsubLow = subscribeToLowStockProducts(10, (p) => setLowStockProducts(p as Product[]), console.error);

        return () => {
            unsubs.forEach((u) => u());
            unsubOrders();
            unsubLow();
        };
    }, []);

    const statsData = [
        { name: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, change: stats.revenueChange, icon: STAT_ICONS.revenue, gradient: STAT_GRADIENTS[0] },
        { name: "Total Orders", value: stats.totalOrders.toLocaleString(), change: stats.ordersChange, icon: STAT_ICONS.orders, gradient: STAT_GRADIENTS[1] },
        { name: "Products", value: stats.totalProducts.toLocaleString(), change: stats.productsChange, icon: STAT_ICONS.products, gradient: STAT_GRADIENTS[2] },
        { name: "Customers", value: stats.totalCustomers.toLocaleString(), change: stats.customersChange, icon: STAT_ICONS.customers, gradient: STAT_GRADIENTS[3] },
    ];

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed": case "delivered": return "badge-success";
            case "processing": case "confirmed": return "badge-primary";
            case "shipped": return "bg-violet-100 text-violet-700 border border-violet-200 badge";
            case "pending": return "badge-warning";
            case "cancelled": case "returned": return "badge-danger";
            default: return "badge-neutral";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    <p className="text-sm text-neutral-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Page Title Row */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-neutral-900">Dashboard Overview</h2>
                    <p className="text-sm text-neutral-500 mt-1">Real-time store performance metrics</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-neutral-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-neutral-600">Live Data</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statsData.map((stat) => {
                    const Icon = stat.icon;
                    const isUp = stat.change >= 0;
                    return (
                        <div key={stat.name} className="admin-stat-card group">
                            <div className="flex items-start justify-between mb-5">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                                    <Icon size={22} className="text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {isUp ? "+" : ""}{typeof stat.change === "number" ? stat.change.toFixed(1) : stat.change}%
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                            <p className="text-xs text-neutral-500 font-medium">{stat.name}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map(({ label, href, icon: Icon, color }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${color} group`}
                        >
                            <Icon size={18} />
                            <span className="text-sm font-semibold">{label}</span>
                            <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                            <AlertTriangle size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
                            <p className="text-xs text-amber-600 mt-0.5">{lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} running low</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lowStockProducts.slice(0, 6).map((product) => (
                            <Link key={product.id} href={`/admin/products/${product.id}`}
                                className="bg-white rounded-xl p-4 border border-amber-100 hover:border-amber-300 transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-neutral-900 text-sm line-clamp-1 flex-1">{product.name}</h4>
                                    <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0">
                                        {product.stockCount} left
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-500">{product.category}</p>
                                <p className="text-[10px] text-amber-600 mt-1.5 font-medium">SKU: {product.sku}</p>
                            </Link>
                        ))}
                    </div>
                    {lowStockProducts.length > 6 && (
                        <Link href="/admin/products" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors">
                            View all {lowStockProducts.length} low stock products <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-neutral-900">Recent Orders</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">Live order updates</p>
                    </div>
                    <Link href="/admin/orders" className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1 group transition-colors">
                        View All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="py-16 text-center">
                        <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-neutral-200" />
                        <p className="text-sm text-neutral-400 font-medium">No orders yet</p>
                        <p className="text-xs text-neutral-300 mt-1">Orders will appear here in real-time</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    {["Order ID", "Customer", "Date", "Amount", "Status"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono font-medium text-neutral-700">
                                                {(order.orderNumber || order.id).slice(0, 10)}…
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-neutral-800">
                                                {order.shippingAddress?.name || "Guest"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-neutral-500">{formatDate(order.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-neutral-900">
                                                ${order.total?.toFixed(2) || "0.00"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`${getStatusStyle(order.orderStatus)} capitalize`}>
                                                {order.orderStatus || "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
