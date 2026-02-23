"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Search, Loader2, Download, X, Truck, Package,
    ChevronDown, Clock, CheckCircle2, XCircle, RotateCcw,
    ShoppingBag, DollarSign, TrendingUp, AlertCircle,
    Eye, Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeToAllOrders, updateOrder } from "@/lib/firestore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(timestamp: any, full = false) {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (full) return date.toLocaleString("en-AU", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" });
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "#b45309", bg: "#fef3c7", icon: <Clock size={11} /> },
    confirmed: { label: "Confirmed", color: "#1d4ed8", bg: "#dbeafe", icon: <CheckCircle2 size={11} /> },
    processing: { label: "Processing", color: "#7c3aed", bg: "#ede9fe", icon: <Package size={11} /> },
    shipped: { label: "Shipped", color: "#15803d", bg: "#dcfce7", icon: <Truck size={11} /> },
    delivered: { label: "Delivered", color: "#15803d", bg: "#dcfce7", icon: <CheckCircle2 size={11} /> },
    cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2", icon: <XCircle size={11} /> },
    returned: { label: "Returned", color: "#9f1239", bg: "#fce7f3", icon: <RotateCcw size={11} /> },
};

const PAYMENT_CONFIG: Record<string, { color: string; bg: string }> = {
    paid: { color: "#15803d", bg: "#dcfce7" },
    pending: { color: "#b45309", bg: "#fef3c7" },
    failed: { color: "#b91c1c", bg: "#fee2e2" },
    refunded: { color: "#7c3aed", bg: "#ede9fe" },
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg = ORDER_STATUS_CONFIG[status?.toLowerCase()] ?? { label: status, color: "#374151", bg: "#f3f4f6", icon: null };
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, gradient, sub }: { label: string; value: string | number; icon: React.ReactNode; gradient: string; sub?: string }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${gradient}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-neutral-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-neutral-900 leading-tight">{value}</p>
                {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDrawer({ order, onClose }: { order: any; onClose: () => void }) {
    if (!order) return null;
    const addr = order.shippingAddress || {};
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-black/40 backdrop-blur-sm" />
            <div
                className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-violet-200 text-xs font-medium uppercase tracking-wider">Order Details</p>
                        <h2 className="text-white font-bold text-lg">{order.orderNumber || order.id}</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                        <X size={16} className="text-white" />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Status + Payment */}
                    <div className="flex items-center gap-3">
                        <StatusBadge status={order.orderStatus || "pending"} />
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{ color: PAYMENT_CONFIG[order.paymentStatus]?.color ?? "#374151", backgroundColor: PAYMENT_CONFIG[order.paymentStatus]?.bg ?? "#f3f4f6" }}>
                            💳 {order.paymentStatus || "pending"}
                        </span>
                        {order.trackingNumber && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-[11px] font-mono">
                                {order.trackingNumber}
                            </span>
                        )}
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                            <ShoppingBag size={14} /> Ordered Items
                        </h3>
                        <div className="space-y-2">
                            {(order.items || []).map((item: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
                                    {/* Product thumbnail */}
                                    {(item.productImage) && (
                                        <div className="w-14 h-18 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100" style={{ height: "72px" }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.productImage}
                                                alt={item.productName || item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 leading-tight">{item.productName || item.name}</p>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {(item.selectedColor || item.color) && (
                                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                    <span
                                                        className="w-2 h-2 rounded-full border border-purple-300 flex-shrink-0"
                                                        style={{ backgroundColor: item.colorHex || (item.selectedColor || item.color).toLowerCase() }}
                                                    />
                                                    {item.selectedColor || item.color}
                                                </span>
                                            )}
                                            {(item.selectedSize || item.size) && (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                                    Size: {item.selectedSize || item.size}
                                                </span>
                                            )}
                                            <span className="bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                Qty: {item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Line total */}
                                    <p className="text-sm font-bold text-neutral-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-neutral-600">
                                <span>Subtotal</span>
                                <span>${order.subtotal?.toFixed(2) || "—"}</span>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                                <span>Shipping</span>
                                <span>{order.shipping === 0 ? "Free" : `$${order.shipping?.toFixed(2)}`}</span>
                            </div>
                            {order.tax > 0 && (
                                <div className="flex justify-between text-neutral-600">
                                    <span>Tax (GST)</span>
                                    <span>${order.tax?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200 text-base">
                                <span>Total</span>
                                <span>${order.total?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer + Shipping */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Customer</h3>
                            <div className="bg-neutral-50 rounded-xl p-3 space-y-1 text-sm">
                                <p className="font-medium text-neutral-900">{order.userName || addr.name || "Guest"}</p>
                                <p className="text-neutral-500">{order.userEmail || "—"}</p>
                                {addr.phone && <p className="text-neutral-500">{addr.phone}</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                            <div className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-700 leading-relaxed">
                                {addr.addressLine1 && <p>{addr.addressLine1}</p>}
                                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-neutral-400 space-y-1 border-t border-neutral-100 pt-4">
                        <p>Placed: {formatDate(order.createdAt, true)}</p>
                        {order.paidAt && <p>Paid: {formatDate(order.paidAt, true)}</p>}
                        {order.shippedAt && <p>Shipped: {formatDate(order.shippedAt, true)}</p>}
                        <p>Payment method: <span className="capitalize">{order.paymentMethod || "—"}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Shipping Modal ───────────────────────────────────────────────────────────
function ShippingModal({ order, onConfirm, onCancel }: {
    order: any;
    onConfirm: (trackingNumber: string, carrier: string, estimatedDelivery: string) => void;
    onCancel: () => void;
}) {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onConfirm(trackingNumber, carrier, estimatedDelivery);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Truck size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Mark as Shipped</h2>
                            <p className="text-blue-100 text-sm">Order #{order.orderNumber}</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-blue-800">
                        📧 Shipping notification will be sent to <strong>{order.userEmail || order.shippingAddress?.email || "customer"}</strong>
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Tracking Number <span className="text-red-500">*</span>
                        </label>
                        <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. 1Z999AA10123456784" required className="font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Carrier / Courier</label>
                        <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option value="">Select carrier (optional)</option>
                            <option>Australia Post</option>
                            <option>DHL</option>
                            <option>FedEx</option>
                            <option>UPS</option>
                            <option>StarTrack</option>
                            <option>Aramex</option>
                            <option>TNT</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Estimated Delivery Date</label>
                        <Input type="date" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                            {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />Sending…</> : <><Truck size={16} className="mr-2" />Mark Shipped & Notify</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────
export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [shippingModal, setShippingModal] = useState<{ order: any } | null>(null);
    const [drawerOrder, setDrawerOrder] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToAllOrders((data) => { setOrders(data); setLoading(false); }, 200);
        return () => unsubscribe();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchSearch = !searchQuery ||
                order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.shippingAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === "all" || order.orderStatus === statusFilter;
            const matchPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;
            return matchSearch && matchStatus && matchPayment;
        });
    }, [orders, searchQuery, statusFilter, paymentFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = orders.length;
        const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        const pending = orders.filter(o => o.orderStatus === "pending" || o.orderStatus === "confirmed").length;
        const shipped = orders.filter(o => o.orderStatus === "shipped").length;
        return { total, revenue, pending, shipped };
    }, [orders]);

    const handleStatusChange = async (orderId: string, newStatus: string, order?: any) => {
        if (newStatus === "shipped" && order) { setShippingModal({ order }); return; }
        try { await updateOrder(orderId, { orderStatus: newStatus }); }
        catch { alert("Failed to update order status"); }
    };

    const handleShippingConfirm = async (trackingNumber: string, carrier: string, estimatedDelivery: string) => {
        if (!shippingModal) return;
        const { order } = shippingModal;
        try {
            await updateOrder(order.id, {
                orderStatus: "shipped", trackingNumber, carrier, estimatedDelivery,
                shippedAt: new Date().toISOString(),
            });
            if (order.userEmail) {
                fetch("/api/email/shipping-notification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: order.userEmail,
                        details: {
                            customerName: order.shippingAddress?.name || order.userName || "Customer",
                            orderNumber: order.orderNumber || order.id,
                            trackingNumber, carrier: carrier || undefined,
                            estimatedDelivery: estimatedDelivery
                                ? new Date(estimatedDelivery).toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                                : undefined,
                        },
                    }),
                }).catch(console.error);
            }
            setShippingModal(null);
        } catch { alert("Failed to update order. Please try again."); }
    };

    const exportOrders = () => {
        const csv = [
            ["Order ID", "Customer", "Email", "Date", "Items", "Total", "Payment", "Status", "Tracking"],
            ...filteredOrders.map(o => [
                o.orderNumber || o.id,
                o.shippingAddress?.name || "Guest",
                o.userEmail || "",
                formatDate(o.createdAt),
                o.items?.map((i: any) => `${i.productName || i.name} (${i.selectedColor || i.color || "—"}, ${i.selectedSize || i.size || "—"}) x${i.quantity}`).join("; "),
                o.total?.toFixed(2) || "0.00",
                o.paymentStatus || "pending",
                o.orderStatus || "pending",
                o.trackingNumber || "",
            ])
        ].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `orders-${new Date().toISOString().split("T")[0]}.csv` });
        a.click();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                <p className="text-sm text-neutral-500">Loading orders…</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 bg-neutral-50 min-h-screen">
            {/* Modals / Drawers */}
            {shippingModal && <ShippingModal order={shippingModal.order} onConfirm={handleShippingConfirm} onCancel={() => setShippingModal(null)} />}
            {drawerOrder && <OrderDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} />}

            {/* Page Header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-1">Admin Panel</p>
                    <h1 className="text-3xl font-bold text-neutral-900">Orders</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage and track all customer orders in real-time</p>
                </div>
                <Button onClick={exportOrders} variant="outline" className="flex items-center gap-2 bg-white border-neutral-200 shadow-sm hover:shadow text-sm font-medium">
                    <Download size={16} />
                    Export CSV
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Orders" value={stats.total} icon={<ShoppingBag size={22} />} gradient="bg-gradient-to-br from-violet-500 to-purple-600" sub="All time" />
                <StatCard label="Revenue" value={`$${stats.revenue.toFixed(0)}`} icon={<DollarSign size={22} />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" sub="All orders" />
                <StatCard label="Awaiting Action" value={stats.pending} icon={<AlertCircle size={22} />} gradient="bg-gradient-to-br from-amber-400 to-orange-500" sub="Pending / Confirmed" />
                <StatCard label="In Transit" value={stats.shipped} icon={<TrendingUp size={22} />} gradient="bg-gradient-to-br from-blue-500 to-sky-600" sub="Shipped orders" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="search"
                            placeholder="Search by order ID, customer name or email…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="pl-8 pr-8 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50 appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={paymentFilter}
                                onChange={e => setPaymentFilter(e.target.value)}
                                className="pl-4 pr-8 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 bg-neutral-50 appearance-none cursor-pointer"
                            >
                                <option value="all">All Payment</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
                {(statusFilter !== "all" || paymentFilter !== "all" || searchQuery) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                        <span className="text-xs text-neutral-500">Showing {filteredOrders.length} of {orders.length} orders</span>
                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPaymentFilter("all"); }} className="text-xs text-violet-600 hover:underline ml-auto">Clear filters</button>
                    </div>
                )}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag size={28} className="text-neutral-400" />
                        </div>
                        <p className="text-neutral-600 font-medium">No orders found</p>
                        <p className="text-neutral-400 text-sm mt-1">
                            {orders.length === 0 ? "Orders will appear here once customers place them" : "Try adjusting your filters"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/70">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-violet-50/30 transition-colors group">

                                        {/* Order ID + Date */}
                                        <td className="px-6 py-5">
                                            <p className="font-mono font-semibold text-neutral-900 text-xs tracking-wide">
                                                {order.orderNumber || order.id}
                                            </p>
                                            <p className="text-neutral-400 text-xs mt-1">{formatDate(order.createdAt)}</p>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {(order.shippingAddress?.name || order.userName || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900">{order.shippingAddress?.name || order.userName || "Guest"}</p>
                                                    <p className="text-neutral-400 text-xs mt-0.5 truncate max-w-[160px]">{order.userEmail || ""}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Items — simple list, full details in drawer */}
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-semibold text-neutral-500 mb-1">
                                                {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                                            </p>
                                            <div className="space-y-0.5">
                                                {(order.items || []).slice(0, 2).map((item: any, idx: number) => (
                                                    <p key={idx} className="text-xs text-neutral-600 truncate max-w-[180px]">
                                                        {item.productName || item.name}
                                                    </p>
                                                ))}
                                                {order.items?.length > 2 && (
                                                    <p className="text-[11px] text-neutral-400">+{order.items.length - 2} more</p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Total */}
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-neutral-900 text-base">${order.total?.toFixed(2) || "0.00"}</p>
                                            <p className="text-[11px] text-neutral-400 mt-0.5 capitalize">{order.paymentMethod || ""}</p>
                                        </td>

                                        {/* Status Dropdown */}
                                        <td className="px-6 py-5">
                                            <div className="relative inline-block">
                                                <select
                                                    value={order.orderStatus || "pending"}
                                                    onChange={e => handleStatusChange(order.id, e.target.value, order)}
                                                    className="appearance-none pl-3 pr-7 py-1.5 text-[11px] font-semibold rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                                                    style={{
                                                        color: ORDER_STATUS_CONFIG[order.orderStatus]?.color ?? "#374151",
                                                        backgroundColor: ORDER_STATUS_CONFIG[order.orderStatus]?.bg ?? "#f3f4f6",
                                                    }}
                                                >
                                                    {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
                                                        <option key={k} value={k}>{v.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                                                    style={{ color: ORDER_STATUS_CONFIG[order.orderStatus]?.color ?? "#374151" }} />
                                            </div>
                                        </td>

                                        {/* View Details Eye */}
                                        <td className="px-6 py-5">
                                            <button
                                                onClick={() => setDrawerOrder(order)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
                                                title="View full order details"
                                            >
                                                <Eye size={13} /> Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer */}
                {filteredOrders.length > 0 && (
                    <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                        <span>{filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}</span>
                        <span>Click any row's 👁 eye icon to see full order details</span>
                    </div>
                )}
            </div>
        </div>
    );
}
