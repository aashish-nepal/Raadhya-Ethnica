"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Loader2, Package, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToProducts, deleteProduct } from "@/lib/firestore";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        // Subscribe to products for real-time updates
        const unsubscribe = subscribeToProducts(
            (productsData) => {
                setProducts(productsData);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading products:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Filter products based on search and category
    useEffect(() => {
        let filtered = products;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((product) =>
                product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter((product) => product.category === categoryFilter);
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, categoryFilter]);

    const handleDelete = async (productId: string) => {
        if (deleteConfirm !== productId) {
            setDeleteConfirm(productId);
            setTimeout(() => setDeleteConfirm(null), 3000);
            return;
        }

        try {
            await deleteProduct(productId);
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    const formatPrice = (price: number) => {
        return `$${price?.toFixed(2) || "0.00"}`;
    };

    const getStockStatus = (stock: number, inStock: boolean) => {
        if (!inStock || stock === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-700" };
        if (stock < 10) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-700" };
        return { text: "In Stock", color: "bg-green-100 text-green-700" };
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
                    <h1 className="text-3xl font-display font-bold text-neutral-900">Products</h1>
                    <p className="text-neutral-600 mt-1">Manage your product catalog</p>
                </div>
                <Button
                    onClick={() => window.location.href = "/admin/products/new"}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Product
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <Input
                            type="search"
                            placeholder="Search products by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Designer">Designer</option>
                        <option value="Festive">Festive</option>
                        <option value="Office">Office</option>
                        <option value="Casual">Casual</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredProducts.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500">
                            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm mt-1">
                                {products.length === 0 ? "Add your first product to get started" : "Try adjusting your filters"}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product.stockCount, product.inStock);
                                    return (
                                        <tr key={product.id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={product.images?.[0] || "/placeholder.jpg"}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                                                        <div className="text-xs text-neutral-500">SKU: {product.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                                {product.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                                {formatPrice(product.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                                {product.stockCount || 0} units
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                                    {stockStatus.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => window.location.href = `/admin/products/edit/${product.id}`}
                                                        className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <a
                                                        href={`/products/${product.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="View on Website"
                                                    >
                                                        <Eye size={18} />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className={`p-2 rounded-lg transition-colors ${deleteConfirm === product.id
                                                            ? "text-white bg-red-600 hover:bg-red-700"
                                                            : "text-neutral-600 hover:text-red-600 hover:bg-red-50"
                                                            }`}
                                                        title={deleteConfirm === product.id ? "Click again to confirm" : "Delete Product"}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div >
    );
}
