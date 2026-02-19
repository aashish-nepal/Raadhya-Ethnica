"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, ShoppingCart, Download, X, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeToAllOrders, updateOrder } from "@/lib/firestore";

// ─── Shipping Modal ────────────────────────────────────────────────────────────
function ShippingModal({
    order,
    onConfirm,
    onCancel,
}: {
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
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

                {/* Customer info */}
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-blue-800">
                        📧 Shipping notification will be sent to{" "}
                        <strong>{order.userEmail || order.shippingAddress?.email || "customer"}</strong>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Tracking Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="e.g. 1Z999AA10123456784"
                            required
                            className="font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Carrier / Courier
                        </label>
                        <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">Select carrier (optional)</option>
                            <option value="Australia Post">Australia Post</option>
                            <option value="DHL">DHL</option>
                            <option value="FedEx">FedEx</option>
                            <option value="UPS">UPS</option>
                            <option value="StarTrack">StarTrack</option>
                            <option value="Aramex">Aramex</option>
                            <option value="TNT">TNT</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Estimated Delivery Date
                        </label>
                        <Input
                            type="date"
                            value={estimatedDelivery}
                            onChange={(e) => setEstimatedDelivery(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 size={16} className="mr-2 animate-spin" />Sending…</>
                            ) : (
                                <><Truck size={16} className="mr-2" />Mark Shipped & Notify</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Orders Page ──────────────────────────────────────────────────────────
export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    // Shipping modal state
    const [shippingModal, setShippingModal] = useState<{ order: any } | null>(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToAllOrders(
            (ordersData) => {
                setOrders(ordersData);
                setLoading(false);
            },
            100
        );
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let filtered = orders;
        if (searchQuery) {
            filtered = filtered.filter(
                (order) =>
                    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.shippingAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.orderStatus === statusFilter);
        }
        if (paymentFilter !== "all") {
            filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
        }
        setFilteredOrders(filtered);
    }, [orders, searchQuery, statusFilter, paymentFilter]);

    const handleStatusChange = async (orderId: string, newStatus: string, order?: any) => {
        // If changing to "shipped", show the tracking modal first
        if (newStatus === "shipped" && order) {
            setShippingModal({ order });
            return;
        }

        try {
            await updateOrder(orderId, { orderStatus: newStatus });
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update order status");
        }
    };

    const handleShippingConfirm = async (
        trackingNumber: string,
        carrier: string,
        estimatedDelivery: string
    ) => {
        if (!shippingModal) return;
        const { order } = shippingModal;

        try {
            // Update Firestore with status + tracking info
            await updateOrder(order.id, {
                orderStatus: "shipped",
                trackingNumber,
                carrier,
                estimatedDelivery,
                shippedAt: new Date().toISOString(),
            });

            // Send shipping notification email to customer
            if (order.userEmail) {
                fetch("/api/email/shipping-notification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: order.userEmail,
                        details: {
                            customerName: order.shippingAddress?.name || order.userName || "Customer",
                            orderNumber: order.orderNumber || order.id,
                            trackingNumber,
                            carrier: carrier || undefined,
                            estimatedDelivery: estimatedDelivery
                                ? new Date(estimatedDelivery).toLocaleDateString("en-AU", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })
                                : undefined,
                        },
                    }),
                }).catch(console.error);
            }

            setShippingModal(null);
        } catch (error) {
            console.error("Error marking order as shipped:", error);
            alert("Failed to update order. Please try again.");
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getPaymentColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "paid": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "failed": return "bg-red-100 text-red-700";
            case "refunded": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "delivered": return "bg-green-100 text-green-700";
            case "processing":
            case "confirmed": return "bg-blue-100 text-blue-700";
            case "shipped": return "bg-purple-100 text-purple-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "cancelled":
            case "returned": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const exportOrders = () => {
        const csv = [
            ["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status", "Tracking"],
            ...filteredOrders.map((order) => [
                order.orderNumber || order.id,
                order.shippingAddress?.name || "Guest",
                formatDate(order.createdAt),
                order.items?.length || 0,
                order.total?.toFixed(2) || "0.00",
                order.paymentStatus || "pending",
                order.orderStatus || "pending",
                order.trackingNumber || "",
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
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
            {/* Shipping Modal */}
            {shippingModal && (
                <ShippingModal
                    order={shippingModal.order}
                    onConfirm={handleShippingConfirm}
                    onCancel={() => setShippingModal(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-neutral-900">Orders</h1>
                    <p className="text-neutral-600 mt-1">
                        Manage and track customer orders ({filteredOrders.length} orders)
                    </p>
                </div>
                <Button variant="outline" onClick={exportOrders}>
                    <Download size={20} className="mr-2" />
                    Export Orders
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <Input
                            type="search"
                            placeholder="Search orders by ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Payment</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredOrders.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500">
                            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No orders found</p>
                            <p className="text-sm mt-1">
                                {orders.length === 0
                                    ? "Orders will appear here once customers place them"
                                    : "Try adjusting your filters"}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tracking</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-neutral-900">
                                                {order.orderNumber || order.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-neutral-900">
                                                {order.shippingAddress?.name || "Guest"}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {order.userEmail || order.shippingAddress?.phone || ""}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ${order.total?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentColor(order.paymentStatus)}`}>
                                                {order.paymentStatus || "pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.trackingNumber ? (
                                                <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                                    {order.trackingNumber}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.orderStatus || "pending"}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                                                className={`px-3 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${getStatusColor(order.orderStatus)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="returned">Returned</option>
                                            </select>
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
