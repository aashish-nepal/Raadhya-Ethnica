"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Users, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { subscribeToCustomers, subscribeToOrders } from "@/lib/firestore";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [enrichedCustomers, setEnrichedCustomers] = useState<any[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to customers for real-time updates
        const unsubscribeCustomers = subscribeToCustomers(
            (customersData) => {
                setCustomers(customersData);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading customers:", error);
                setLoading(false);
            }
        );

        // Subscribe to orders for real-time statistics
        const unsubscribeOrders = subscribeToOrders(
            (ordersData) => {
                setOrders(ordersData);
            },
            undefined,
            (error) => {
                console.error("Error loading orders:", error);
            }
        );

        return () => {
            unsubscribeCustomers();
            unsubscribeOrders();
        };
    }, []);

    // Enrich customers with order statistics
    useEffect(() => {
        const enriched = customers.map(customer => {
            // Find all orders for this customer
            const customerOrders = orders.filter(order => order.userId === customer.userId);

            // Calculate total orders
            const totalOrders = customerOrders.length;

            // Calculate total spent (only from paid orders)
            const totalSpent = customerOrders.reduce((sum, order) => {
                if (order.paymentStatus === 'paid') {
                    return sum + (order.total || 0);
                }
                return sum;
            }, 0);

            return {
                ...customer,
                totalOrders,
                totalSpent
            };
        });

        setEnrichedCustomers(enriched);
    }, [customers, orders]);

    // Filter customers based on search
    useEffect(() => {
        let filtered = enrichedCustomers;

        if (searchQuery) {
            filtered = filtered.filter(
                (customer) =>
                    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    customer.phone?.includes(searchQuery)
            );
        }

        setFilteredCustomers(filtered);
    }, [enrichedCustomers, searchQuery]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-neutral-900">Customers</h1>
                    <p className="text-neutral-600 mt-1">
                        Manage customer accounts ({filteredCustomers.length} customers)
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <Input
                        type="search"
                        placeholder="Search customers by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredCustomers.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No customers found</p>
                            <p className="text-sm mt-1">
                                {customers.length === 0
                                    ? "Customers will appear here once they register"
                                    : "Try adjusting your search"}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Total Orders
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Total Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Joined Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                                                    {customer.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-neutral-900">
                                                        {customer.name || "Unknown"}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">ID: {customer.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                    <Mail size={14} />
                                                    {customer.email || "No email"}
                                                </div>
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                        <Phone size={14} />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {customer.totalOrders || 0} orders
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ${customer.totalSpent?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {formatDate(customer.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${customer.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {customer.role === "admin" ? "Admin" : "Active"}
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
