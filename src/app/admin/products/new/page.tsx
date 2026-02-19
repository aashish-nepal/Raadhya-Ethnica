"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { addProduct } from "@/lib/firestore";

const CATEGORIES = [
    "Cotton",
    "Designer",
    "Festive",
    "Office",
    "Casual",
    "Party",
    "Wedding",
];

const OCCASIONS = [
    "Casual",
    "Festive",
    "Party",
    "Wedding",
    "Office",
    "Daily Wear",
];

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        originalPrice: "",
        sku: "",
        category: "Cotton",
        fabric: "",
        sleeveType: "",
        neckType: "",
        stockCount: "",
        images: [""],
        occasion: [] as string[],
        careInstructions: [""],
        features: [""],
        colors: [] as Array<{ name: string; hex: string; images: string[] }>,
        sizes: [] as Array<{ size: string; inStock: boolean }>,
        isTrending: false,
        isNewArrival: false,
        isBestSeller: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            // Calculate discount
            const price = parseFloat(formData.price);
            const originalPrice = parseFloat(formData.originalPrice);
            const discount = originalPrice > price
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : 0;

            // Collect all images from colors for the main product images array
            const allColorImages: string[] = [];
            formData.colors.forEach(color => {
                if (color.images && color.images.length > 0) {
                    allColorImages.push(...color.images.filter(img => img.trim() !== ""));
                }
            });

            // Prepare product data
            const productData = {
                name: formData.name,
                slug,
                description: formData.description,
                shortDescription: formData.shortDescription,
                price,
                originalPrice,
                discount,
                sku: formData.sku,
                category: formData.category,
                images: allColorImages.length > 0 ? allColorImages : [],
                fabric: formData.fabric,
                sleeveType: formData.sleeveType,
                neckType: formData.neckType,
                occasion: formData.occasion,
                careInstructions: formData.careInstructions.filter(ci => ci.trim() !== ""),
                features: formData.features.filter(f => f.trim() !== ""),
                inStock: parseInt(formData.stockCount) > 0,
                stockCount: parseInt(formData.stockCount),
                rating: 0,
                reviewCount: 0,
                isTrending: formData.isTrending,
                isNewArrival: formData.isNewArrival,
                isBestSeller: formData.isBestSeller,
                tags: [],
                colors: formData.colors.filter(c => c.name.trim() !== ""),
                sizes: formData.sizes.filter(s => s.size.trim() !== ""),
                seo: {
                    title: formData.name,
                    description: formData.shortDescription,
                    keywords: [formData.category, formData.fabric],
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await addProduct(productData);
            router.push("/admin/products");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    const addArrayField = (field: "images" | "careInstructions" | "features") => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], ""],
        }));
    };

    const updateArrayField = (
        field: "images" | "careInstructions" | "features",
        index: number,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item)),
        }));
    };

    const removeArrayField = (field: "images" | "careInstructions" | "features", index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const toggleOccasion = (occasion: string) => {
        setFormData(prev => ({
            ...prev,
            occasion: prev.occasion.includes(occasion)
                ? prev.occasion.filter(o => o !== occasion)
                : [...prev.occasion, occasion],
        }));
    };

    // Color management
    const addColor = () => {
        setFormData(prev => ({
            ...prev,
            colors: [...prev.colors, { name: "", hex: "#000000", images: [] }],
        }));
    };

    const updateColor = (index: number, field: "name" | "hex", value: string) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.map((color, i) =>
                i === index ? { ...color, [field]: value } : color
            ),
        }));
    };

    const addColorImage = (colorIndex: number) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.map((color, i) =>
                i === colorIndex ? { ...color, images: [...color.images, ""] } : color
            ),
        }));
    };

    const updateColorImage = (colorIndex: number, imageIndex: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.map((color, i) =>
                i === colorIndex
                    ? { ...color, images: color.images.map((img, j) => (j === imageIndex ? value : img)) }
                    : color
            ),
        }));
    };

    const removeColorImage = (colorIndex: number, imageIndex: number) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.map((color, i) =>
                i === colorIndex
                    ? { ...color, images: color.images.filter((_, j) => j !== imageIndex) }
                    : color
            ),
        }));
    };

    const removeColor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index),
        }));
    };

    // Size management
    const addSize = () => {
        setFormData(prev => ({
            ...prev,
            sizes: [...prev.sizes, { size: "", inStock: true }],
        }));
    };

    const updateSize = (index: number, field: "size" | "inStock", value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === index ? { ...size, [field]: value } : size
            ),
        }));
    };

    const removeSize = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/admin/products")}
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-neutral-900">Add New Product</h1>
                    <p className="text-neutral-600 mt-1">Create a new product listing</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="bg-white rounded-xl shadow-soft p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">Product Name *</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Elegant Cotton Kurta"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">Short Description *</label>
                                <Input
                                    required
                                    value={formData.shortDescription}
                                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                    placeholder="Brief description for product cards"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">Full Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed product description"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Price ($) *</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="1299"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Original Price ($) *</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                    placeholder="1999"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">SKU *</label>
                                <Input
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="KRT-001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category & Details */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Category & Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Stock Count *</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.stockCount}
                                    onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                                    placeholder="50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Fabric</label>
                                <Input
                                    value={formData.fabric}
                                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                                    placeholder="e.g., Pure Cotton"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Sleeve Type</label>
                                <Input
                                    value={formData.sleeveType}
                                    onChange={(e) => setFormData({ ...formData, sleeveType: e.target.value })}
                                    placeholder="e.g., 3/4 Sleeve"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">Neck Type</label>
                                <Input
                                    value={formData.neckType}
                                    onChange={(e) => setFormData({ ...formData, neckType: e.target.value })}
                                    placeholder="e.g., Round Neck"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Special Tags */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Special Tags</h2>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isTrending}
                                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium">Trending Now</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isNewArrival}
                                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium">New Arrival</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isBestSeller}
                                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium">Best Seller</span>
                            </label>
                        </div>
                    </div>

                    {/* Occasions */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Occasions</h2>
                        <div className="flex flex-wrap gap-3">
                            {OCCASIONS.map(occasion => (
                                <label key={occasion} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.occasion.includes(occasion)}
                                        onChange={() => toggleOccasion(occasion)}
                                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm">{occasion}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Available Colors</h2>
                        <p className="text-sm text-neutral-600 mb-3">
                            Add color options and their specific images. When customers select a color, they'll see the images you add here.
                        </p>
                        <div className="space-y-4">
                            {formData.colors.map((color, colorIndex) => (
                                <div key={colorIndex} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                                    <div className="flex gap-3 items-start mb-3">
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Color Name</label>
                                                <Input
                                                    value={color.name}
                                                    onChange={(e) => updateColor(colorIndex, "name", e.target.value)}
                                                    placeholder="e.g., Royal Blue"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Color Code</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={color.hex}
                                                        onChange={(e) => updateColor(colorIndex, "hex", e.target.value)}
                                                        className="w-12 h-10 rounded border border-neutral-300 cursor-pointer"
                                                    />
                                                    <Input
                                                        value={color.hex}
                                                        onChange={(e) => updateColor(colorIndex, "hex", e.target.value)}
                                                        placeholder="#000000"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeColor(colorIndex)}
                                            className="mt-5"
                                        >
                                            Remove Color
                                        </Button>
                                    </div>

                                    {/* Color-specific images */}
                                    <div className="mt-3 pl-4 border-l-2 border-primary-200">
                                        <label className="block text-xs font-medium mb-2">
                                            Images for {color.name || "this color"} (optional)
                                        </label>
                                        <div className="space-y-2">
                                            {color.images.map((image, imageIndex) => (
                                                <div key={imageIndex} className="flex gap-2">
                                                    <Input
                                                        value={image}
                                                        onChange={(e) => updateColorImage(colorIndex, imageIndex, e.target.value)}
                                                        placeholder="Image URL for this color"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeColorImage(colorIndex, imageIndex)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addColorImage(colorIndex)}
                                                className="w-full"
                                            >
                                                + Add Image for {color.name || "this color"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addColor}
                                className="w-full"
                            >
                                + Add Color Option
                            </Button>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Available Sizes</h2>
                        <div className="space-y-2">
                            {formData.sizes.map((size, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <Input
                                        value={size.size}
                                        onChange={(e) => updateSize(index, "size", e.target.value)}
                                        placeholder="e.g., S, M, L, XL, XXL, or 38, 40, 42"
                                        className="flex-1"
                                    />
                                    <label className="flex items-center gap-2 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={size.inStock}
                                            onChange={(e) => updateSize(index, "inStock", e.target.checked)}
                                            className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm">In Stock</span>
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => removeSize(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addSize}
                                className="w-full"
                            >
                                + Add Size Option
                            </Button>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Features</h2>
                        <div className="space-y-2">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={feature}
                                        onChange={(e) => updateArrayField("features", index, e.target.value)}
                                        placeholder="e.g., Comfortable fit"
                                        className="flex-1"
                                    />
                                    {formData.features.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayField("features", index)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => addArrayField("features")}
                                className="w-full"
                            >
                                + Add Feature
                            </Button>
                        </div>
                    </div>

                    {/* Care Instructions */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Care Instructions</h2>
                        <div className="space-y-2">
                            {formData.careInstructions.map((instruction, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={instruction}
                                        onChange={(e) => updateArrayField("careInstructions", index, e.target.value)}
                                        placeholder="e.g., Machine wash cold"
                                        className="flex-1"
                                    />
                                    {formData.careInstructions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeArrayField("careInstructions", index)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => addArrayField("careInstructions")}
                                className="w-full"
                            >
                                + Add Care Instruction
                            </Button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding Product...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Add Product
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/admin/products")}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
