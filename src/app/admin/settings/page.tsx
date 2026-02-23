"use client";

import { useEffect, useState } from "react";
import { Save, Store, Truck, CreditCard, Bell, Search, Package, FileText, Receipt, Loader2, LayoutTemplate, Grid3X3, Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoreSettings, updateStoreSettings, getProducts, saveHeroSettings, subscribeToCategorySettings, saveCategorySettings, CategoryGridItem } from "@/lib/firestore";
import type { StoreSettings, Product } from "@/types";

export default function SettingsPage() {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [heroSaving, setHeroSaving] = useState(false);
    const [categorySaving, setCategorySaving] = useState(false);
    const [activeTab, setActiveTab] = useState("hero");
    const [successMessage, setSuccessMessage] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryGridItem[]>([]);

    useEffect(() => {
        loadSettings();
        const unsub = subscribeToCategorySettings((cats) => setCategories(cats));
        return () => unsub();
    }, []);

    const loadSettings = async () => {
        try {
            const [data, productsData] = await Promise.all([
                getStoreSettings(),
                getProducts(),
            ]);
            setSettings(data as StoreSettings);
            setProducts(productsData as Product[]);
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySave = async () => {
        setCategorySaving(true);
        try {
            await saveCategorySettings(categories);
            setSuccessMessage("Category grid saved!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (e) {
            console.error(e);
            alert("Failed to save categories.");
        } finally {
            setCategorySaving(false);
        }
    };

    const addCategory = () => {
        const newCat: CategoryGridItem = {
            id: `cat-${Date.now()}`,
            name: "New Category",
            slug: "new-category",
            description: "",
            emoji: "🛍️",
            visible: true,
            order: categories.length + 1,
        };
        setCategories([...categories, newCat]);
    };

    const updateCategory = (id: string, field: keyof CategoryGridItem, value: any) => {
        setCategories(categories.map((c) => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeCategory = (id: string) => {
        setCategories(categories.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i + 1 })));
    };

    const toggleVisible = (id: string) => {
        setCategories(categories.map((c) => c.id === id ? { ...c, visible: !c.visible } : c));
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setSuccessMessage("");
        try {
            await updateStoreSettings(settings);
            setSuccessMessage("Settings saved successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleHeroSave = async () => {
        if (!settings) return;
        setHeroSaving(true);
        setSuccessMessage("");
        try {
            await saveHeroSettings({
                featuredProductId: settings.hero?.featuredProductId ?? "",
                promoText: settings.hero?.promoText ?? "",
                bannerText: settings.hero?.bannerText ?? "",
                badgeLabel: settings.hero?.badgeLabel ?? "",
                badgeValue: settings.hero?.badgeValue ?? "",
                announcementText: settings.hero?.announcementText ?? "",
            });
            setSuccessMessage("Hero settings saved!");
            setTimeout(() => setSuccessMessage(""), 3000);

            // ── Send hero-update email to subscribers & previous customers ────────
            const featuredProductId = settings.hero?.featuredProductId ?? "";
            const badgeLabel = settings.hero?.badgeLabel ?? "Special Offer";
            const badgeValue = settings.hero?.badgeValue ?? "";

            // Only send if a featured product and a badge value are set
            if (featuredProductId && badgeValue) {
                const featuredProduct = products.find((p) => p.id === featuredProductId) as any;
                if (featuredProduct) {
                    try {
                        const res = await fetch("/api/email/hero-update", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                productName: featuredProduct.name,
                                badgeLabel,
                                badgeValue,
                                promoText: settings.hero?.promoText ?? "",
                                imageUrl: featuredProduct.images?.[0] ?? "",
                                productSlug: featuredProduct.slug ?? "",
                            }),
                        });
                        const data = await res.json();
                        if (res.ok && data.sent > 0) {
                            setSuccessMessage(`Hero settings saved! ✅ Special offer email sent to ${data.sent} subscribers.`);
                            setTimeout(() => setSuccessMessage(""), 5000);
                        }
                    } catch (emailErr) {
                        console.error("Hero update email failed (non-blocking):", emailErr);
                    }
                }
            }
        } catch (error) {
            console.error("Error saving hero settings:", error);
            alert("Failed to save hero settings. Please try again.");
        } finally {
            setHeroSaving(false);
        }
    };

    const updateField = (section: keyof StoreSettings, field: string, value: any) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [section]: {
                ...(settings[section] as any),
                [field]: value,
            },
        });
    };

    const tabs = [
        { id: "hero", label: "Hero Section", icon: LayoutTemplate },
        { id: "categories", label: "Category Grid", icon: Grid3X3 },
        { id: "store", label: "Store", icon: Store },
        { id: "shipping", label: "Shipping", icon: Truck },
        { id: "payment", label: "Payment", icon: CreditCard },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "seo", label: "SEO", icon: Search },
        { id: "inventory", label: "Inventory", icon: Package },
        { id: "tax", label: "Tax", icon: Receipt },
        { id: "policies", label: "Policies", icon: FileText },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Failed to load settings</h1>
                    <p className="text-neutral-600">Please refresh the page to try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-neutral-900">Settings</h1>
                    <p className="text-neutral-600 mt-1">Manage your store configuration</p>
                </div>
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Settings
                        </>
                    )}
                </Button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {successMessage}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="border-b border-neutral-200 overflow-x-auto">
                    <div className="flex">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? "text-primary-600 border-b-2 border-primary-600"
                                        : "text-neutral-600 hover:text-neutral-900"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {/* Hero Section Settings */}
                    {activeTab === "hero" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-1">Hero Section</h2>
                            <p className="text-sm text-neutral-500 mb-6">Control the featured product and promotional text shown on the home page hero.</p>

                            {/* Featured Product */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Featured Product</label>
                                <select
                                    value={settings.hero?.featuredProductId ?? ""}
                                    onChange={(e) => updateField("hero" as any, "featuredProductId", e.target.value)}
                                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                >
                                    <option value="">— No featured product (use default placeholder) —</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-neutral-400 mt-1">The selected product&apos;s first image will display in the hero section.</p>
                            </div>

                            {/* Promotional Text — shared by badge AND banner */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Promotional Text</label>
                                <input
                                    type="text"
                                    value={settings.hero?.promoText ?? ""}
                                    onChange={(e) => updateField("hero" as any, "promoText", e.target.value)}
                                    placeholder="e.g., ⏰ Limited Time Offer: Flat 35% OFF on all kurtas | Ends in 3 days!"
                                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="text-xs text-neutral-400 mt-1">This updates both the badge above the hero heading and the coloured banner strip below the hero.</p>
                            </div>

                            {/* Floating Badge */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Badge Label <span className="text-neutral-400 text-xs">(e.g. Special Offer)</span></label>
                                    <input
                                        type="text"
                                        value={settings.hero?.badgeLabel ?? ""}
                                        onChange={(e) => updateField("hero" as any, "badgeLabel", e.target.value)}
                                        placeholder="e.g., Special Offer"
                                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Badge Value <span className="text-neutral-400 text-xs">(e.g. 35% OFF)</span></label>
                                    <input
                                        type="text"
                                        value={settings.hero?.badgeValue ?? ""}
                                        onChange={(e) => updateField("hero" as any, "badgeValue", e.target.value)}
                                        placeholder="e.g., 35% OFF"
                                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Header Announcement Bar */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Header Announcement Bar <span className="text-neutral-400 text-xs">(pink strip at very top of every page)</span></label>
                                <input
                                    type="text"
                                    value={settings.hero?.announcementText ?? ""}
                                    onChange={(e) => updateField("hero" as any, "announcementText", e.target.value)}
                                    placeholder="e.g., 🎉 Limited Time Offer: Flat 35% OFF on all kurtas | Free Shipping above $150"
                                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="text-xs text-neutral-400 mt-1">This appears in the header announcement bar on every page of the website.</p>
                            </div>

                            {/* Dedicated Save */}
                            <div className="pt-4">
                                <Button onClick={handleHeroSave} disabled={heroSaving}>
                                    {heroSaving ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                    ) : (
                                        <><Save className="w-4 h-4 mr-2" />Save Hero Settings</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Category Grid Settings */}
                    {activeTab === "categories" && (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Category Grid</h2>
                                    <p className="text-sm text-neutral-500">Configure which categories appear on the homepage. Changes update in real-time.</p>
                                </div>
                                <Button onClick={addCategory} size="sm" variant="outline" className="flex items-center gap-2">
                                    <Plus size={15} /> Add Category
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {categories.sort((a, b) => a.order - b.order).map((cat) => {
                                    // Get all images from products in this category
                                    const categoryProducts = products.filter((p: any) =>
                                        p.category?.toLowerCase().replace(/\s+/g, "-") === cat.slug ||
                                        p.category?.toLowerCase() === cat.slug.replace(/-/g, " ")
                                    );
                                    const allImages: { url: string; productName: string }[] = [];
                                    categoryProducts.forEach((p: any) => {
                                        (p.images || []).forEach((img: string) => {
                                            if (img) allImages.push({ url: img, productName: p.name });
                                        });
                                    });

                                    return (
                                        <div key={cat.id} className={`border rounded-xl overflow-hidden transition-all ${cat.visible ? "border-neutral-200 bg-white" : "border-neutral-100 bg-neutral-50 opacity-60"}`}>
                                            {/* Card Header */}
                                            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
                                                <GripVertical size={16} className="text-neutral-300 flex-shrink-0" />
                                                {cat.imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover border border-neutral-200 flex-shrink-0" />
                                                ) : (
                                                    <span className="text-xl flex-shrink-0">{cat.emoji}</span>
                                                )}
                                                <span className="font-semibold text-neutral-900 flex-1 text-sm">{cat.name}</span>
                                                <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">/{cat.slug}</span>
                                                <button onClick={() => toggleVisible(cat.id)} className={`p-1.5 rounded-lg transition-colors ${cat.visible ? "text-emerald-600 hover:bg-emerald-50" : "text-neutral-400 hover:bg-neutral-100"}`} title={cat.visible ? "Hide" : "Show"}>
                                                    {cat.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                                <button onClick={() => removeCategory(cat.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {/* Text fields */}
                                                <div className="grid sm:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-600 mb-1">Name</label>
                                                        <input type="text" value={cat.name} onChange={(e) => updateCategory(cat.id, "name", e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-600 mb-1">Slug (URL filter)</label>
                                                        <input type="text" value={cat.slug} onChange={(e) => updateCategory(cat.id, "slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-neutral-600 mb-1">Order</label>
                                                        <input type="number" value={cat.order} min={1} onChange={(e) => updateCategory(cat.id, "order", Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
                                                        <input type="text" value={cat.description} onChange={(e) => updateCategory(cat.id, "description", e.target.value)}
                                                            placeholder="Short description shown under the category name"
                                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                                    </div>
                                                </div>

                                                {/* Image Picker */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs font-medium text-neutral-600">
                                                            Category Image <span className="text-neutral-400 font-normal">— pick from {cat.name} products</span>
                                                        </label>
                                                        {cat.imageUrl && (
                                                            <button onClick={() => updateCategory(cat.id, "imageUrl", "")} className="text-xs text-red-500 hover:text-red-700 font-medium">
                                                                ✕ Clear image
                                                            </button>
                                                        )}
                                                    </div>

                                                    {allImages.length === 0 ? (
                                                        <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center">
                                                            <p className="text-sm text-neutral-400 font-medium">No products found in this category</p>
                                                            <p className="text-xs text-neutral-300 mt-1">Add products with category "{cat.slug}" to see images here</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                                            {allImages.map((img, i) => {
                                                                const isSelected = cat.imageUrl === img.url;
                                                                return (
                                                                    <button
                                                                        key={`${img.url}-${i}`}
                                                                        onClick={() => updateCategory(cat.id, "imageUrl", isSelected ? "" : img.url)}
                                                                        title={img.productName}
                                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${isSelected
                                                                            ? "border-primary-500 ring-2 ring-primary-200 scale-105"
                                                                            : "border-transparent hover:border-primary-300 hover:scale-105"
                                                                            }`}
                                                                    >
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={img.url} alt={img.productName} className="w-full h-full object-cover" />
                                                                        {isSelected && (
                                                                            <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                                                                <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow">
                                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-2 flex items-center gap-3">
                                <Button onClick={handleCategorySave} disabled={categorySaving}>
                                    {categorySaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Category Grid</>}
                                </Button>
                                <p className="text-xs text-neutral-400">Changes will appear on the homepage in real-time after saving.</p>
                            </div>
                        </div>
                    )}



                    {/* Store Settings */}
                    {activeTab === "store" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Store Information</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Store Name</label>
                                    <input
                                        type="text"
                                        value={settings.store.name}
                                        onChange={(e) => updateField("store", "name", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Tagline</label>
                                    <input
                                        type="text"
                                        value={settings.store.tagline}
                                        onChange={(e) => updateField("store", "tagline", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={settings.store.email}
                                        onChange={(e) => updateField("store", "email", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={settings.store.phone}
                                        onChange={(e) => updateField("store", "phone", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Address</label>
                                    <input
                                        type="text"
                                        value={settings.store.address}
                                        onChange={(e) => updateField("store", "address", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <input
                                        type="text"
                                        value={settings.store.city}
                                        onChange={(e) => updateField("store", "city", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">State</label>
                                    <input
                                        type="text"
                                        value={settings.store.state}
                                        onChange={(e) => updateField("store", "state", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        value={settings.store.pincode}
                                        onChange={(e) => updateField("store", "pincode", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Country</label>
                                    <input
                                        type="text"
                                        value={settings.store.country}
                                        onChange={(e) => updateField("store", "country", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Business Hours</label>
                                    <input
                                        type="text"
                                        value={settings.store.businessHours}
                                        onChange={(e) => updateField("store", "businessHours", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Mon-Sat: 10:00 AM - 8:00 PM"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">GST Number</label>
                                    <input
                                        type="text"
                                        value={settings.store.gstNumber}
                                        onChange={(e) => updateField("store", "gstNumber", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Currency</label>
                                    <input
                                        type="text"
                                        value={settings.store.currency}
                                        onChange={(e) => updateField("store", "currency", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Currency Symbol</label>
                                    <input
                                        type="text"
                                        value={settings.store.currencySymbol}
                                        onChange={(e) => updateField("store", "currencySymbol", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Timezone</label>
                                    <input
                                        type="text"
                                        value={settings.store.timezone}
                                        onChange={(e) => updateField("store", "timezone", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Settings */}
                    {activeTab === "shipping" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Configuration</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Free Shipping Threshold ({settings.store.currencySymbol})</label>
                                    <input
                                        type="number"
                                        value={settings.shipping.freeShippingThreshold}
                                        onChange={(e) => updateField("shipping", "freeShippingThreshold", Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Standard Shipping Rate ({settings.store.currencySymbol})</label>
                                    <input
                                        type="number"
                                        value={settings.shipping.standardShippingRate}
                                        onChange={(e) => updateField("shipping", "standardShippingRate", Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Express Shipping Rate ({settings.store.currencySymbol})</label>
                                    <input
                                        type="number"
                                        value={settings.shipping.expressShippingRate}
                                        onChange={(e) => updateField("shipping", "expressShippingRate", Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Estimated Delivery (Days)</label>
                                    <input
                                        type="number"
                                        value={settings.shipping.estimatedDeliveryDays}
                                        onChange={(e) => updateField("shipping", "estimatedDeliveryDays", Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Express Delivery (Days)</label>
                                    <input
                                        type="number"
                                        value={settings.shipping.expressDeliveryDays}
                                        onChange={(e) => updateField("shipping", "expressDeliveryDays", Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">COD Charges ({settings.store.currencySymbol})</label>
                                    <input
                                        type="number"
                                        value={settings.shipping.codCharges}
                                        onChange={(e) => updateField("shipping", "codCharges", Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="codAvailable"
                                        checked={settings.shipping.codAvailable}
                                        onChange={(e) => updateField("shipping", "codAvailable", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                    <label htmlFor="codAvailable" className="text-sm font-medium">Enable Cash on Delivery</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="internationalShipping"
                                        checked={settings.shipping.internationalShipping}
                                        onChange={(e) => updateField("shipping", "internationalShipping", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                    <label htmlFor="internationalShipping" className="text-sm font-medium">Enable International Shipping</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Settings */}
                    {activeTab === "payment" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Gateway Configuration</h2>

                            {/* Stripe */}
                            <div className="border border-neutral-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Stripe</h3>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={settings.payment.stripeEnabled}
                                            onChange={(e) => updateField("payment", "stripeEnabled", e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium">Enable</span>
                                    </label>
                                </div>
                                {settings.payment.stripeEnabled && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Publishable Key</label>
                                            <input
                                                type="text"
                                                value={settings.payment.stripePublishableKey}
                                                onChange={(e) => updateField("payment", "stripePublishableKey", e.target.value)}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Secret Key</label>
                                            <input
                                                type="password"
                                                value={settings.payment.stripeSecretKey}
                                                onChange={(e) => updateField("payment", "stripeSecretKey", e.target.value)}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Other Payment Methods */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="codEnabled"
                                        checked={settings.payment.codEnabled}
                                        onChange={(e) => updateField("payment", "codEnabled", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                    <label htmlFor="codEnabled" className="text-sm font-medium">Enable Cash on Delivery</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="upiEnabled"
                                        checked={settings.payment.upiEnabled}
                                        onChange={(e) => updateField("payment", "upiEnabled", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                    <label htmlFor="upiEnabled" className="text-sm font-medium">Enable UPI Payment</label>
                                </div>
                            </div>

                            {settings.payment.upiEnabled && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">UPI ID</label>
                                    <input
                                        type="text"
                                        value={settings.payment.upiId}
                                        onChange={(e) => updateField("payment", "upiId", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="yourstore@upi"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-neutral-600">Send email notifications to customers</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.emailNotifications}
                                        onChange={(e) => updateField("notifications", "emailNotifications", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Order Confirmation Email</p>
                                        <p className="text-sm text-neutral-600">Send confirmation when order is placed</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.orderConfirmationEmail}
                                        onChange={(e) => updateField("notifications", "orderConfirmationEmail", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Shipping Update Email</p>
                                        <p className="text-sm text-neutral-600">Notify when order is shipped</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.shippingUpdateEmail}
                                        onChange={(e) => updateField("notifications", "shippingUpdateEmail", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">WhatsApp Notifications</p>
                                        <p className="text-sm text-neutral-600">Send order updates via WhatsApp</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.whatsappNotifications}
                                        onChange={(e) => updateField("notifications", "whatsappNotifications", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {settings.notifications.whatsappNotifications && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            value={settings.notifications.whatsappNumber}
                                            onChange={(e) => updateField("notifications", "whatsappNumber", e.target.value)}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Admin Order Notifications</p>
                                        <p className="text-sm text-neutral-600">Get notified when new orders arrive</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.adminOrderNotification}
                                        onChange={(e) => updateField("notifications", "adminOrderNotification", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {settings.notifications.adminOrderNotification && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Admin Email</label>
                                        <input
                                            type="email"
                                            value={settings.notifications.adminEmail}
                                            onChange={(e) => updateField("notifications", "adminEmail", e.target.value)}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Low Stock Alerts</p>
                                        <p className="text-sm text-neutral-600">Alert when product stock is low</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.lowStockAlert}
                                        onChange={(e) => updateField("notifications", "lowStockAlert", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {settings.notifications.lowStockAlert && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Low Stock Threshold</label>
                                        <input
                                            type="number"
                                            value={settings.notifications.lowStockThreshold}
                                            onChange={(e) => updateField("notifications", "lowStockThreshold", Number(e.target.value))}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SEO Settings */}
                    {activeTab === "seo" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">SEO & Analytics</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Meta Title</label>
                                    <input
                                        type="text"
                                        value={settings.seo.metaTitle}
                                        onChange={(e) => updateField("seo", "metaTitle", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        value={settings.seo.metaDescription}
                                        onChange={(e) => updateField("seo", "metaDescription", e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                                    <input
                                        type="text"
                                        value={settings.seo.googleAnalyticsId}
                                        onChange={(e) => updateField("seo", "googleAnalyticsId", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="G-XXXXXXXXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
                                    <input
                                        type="text"
                                        value={settings.seo.facebookPixelId}
                                        onChange={(e) => updateField("seo", "facebookPixelId", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <h3 className="text-lg font-semibold mt-6 mb-3">Social Media Links</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Facebook URL</label>
                                        <input
                                            type="url"
                                            value={settings.seo.facebookUrl}
                                            onChange={(e) => updateField("seo", "facebookUrl", e.target.value)}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Instagram URL</label>
                                        <input
                                            type="url"
                                            value={settings.seo.instagramUrl}
                                            onChange={(e) => updateField("seo", "instagramUrl", e.target.value)}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Twitter Handle</label>
                                        <input
                                            type="text"
                                            value={settings.seo.twitterHandle}
                                            onChange={(e) => updateField("seo", "twitterHandle", e.target.value)}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="@yourstore"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Pinterest URL</label>
                                        <input
                                            type="url"
                                            value={settings.seo.pinterestUrl}
                                            onChange={(e) => updateField("seo", "pinterestUrl", e.target.value)}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inventory Settings */}
                    {activeTab === "inventory" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Track Inventory</p>
                                        <p className="text-sm text-neutral-600">Enable stock tracking for products</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.inventory.trackInventory}
                                        onChange={(e) => updateField("inventory", "trackInventory", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        value={settings.inventory.lowStockThreshold}
                                        onChange={(e) => updateField("inventory", "lowStockThreshold", Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <p className="text-sm text-neutral-500 mt-1">Alert when stock falls below this number</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Out of Stock Behavior</label>
                                    <select
                                        value={settings.inventory.outOfStockBehavior}
                                        onChange={(e) => updateField("inventory", "outOfStockBehavior", e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="hide">Hide Product</option>
                                        <option value="show">Show as Out of Stock</option>
                                        <option value="preorder">Allow Pre-orders</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Allow Backorders</p>
                                        <p className="text-sm text-neutral-600">Allow customers to order out-of-stock items</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.inventory.allowBackorders}
                                        onChange={(e) => updateField("inventory", "allowBackorders", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Auto Restock Notification</p>
                                        <p className="text-sm text-neutral-600">Notify customers when items are back in stock</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.inventory.autoRestockNotification}
                                        onChange={(e) => updateField("inventory", "autoRestockNotification", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tax Settings */}
                    {activeTab === "tax" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Tax Configuration</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                    <div>
                                        <p className="font-medium">Enable Tax</p>
                                        <p className="text-sm text-neutral-600">Apply tax to product prices</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.tax.taxEnabled}
                                        onChange={(e) => updateField("tax", "taxEnabled", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {settings.tax.taxEnabled && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={settings.tax.taxRate}
                                                onChange={(e) => updateField("tax", "taxRate", Number(e.target.value))}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Tax Label</label>
                                            <input
                                                type="text"
                                                value={settings.tax.taxLabel}
                                                onChange={(e) => updateField("tax", "taxLabel", e.target.value)}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="GST, VAT, Sales Tax"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Tax Number</label>
                                            <input
                                                type="text"
                                                value={settings.tax.taxNumber}
                                                onChange={(e) => updateField("tax", "taxNumber", e.target.value)}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="GSTIN or Tax ID"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                            <div>
                                                <p className="font-medium">Prices Include Tax</p>
                                                <p className="text-sm text-neutral-600">Display prices with tax included</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.tax.pricesIncludeTax}
                                                onChange={(e) => updateField("tax", "pricesIncludeTax", e.target.checked)}
                                                className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Policies Settings */}
                    {activeTab === "policies" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Store Policies</h2>

                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Return Period (Days)</label>
                                        <input
                                            type="number"
                                            value={settings.policies.returnPeriodDays}
                                            onChange={(e) => updateField("policies", "returnPeriodDays", Number(e.target.value))}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Refund Processing (Days)</label>
                                        <input
                                            type="number"
                                            value={settings.policies.refundProcessingDays}
                                            onChange={(e) => updateField("policies", "refundProcessingDays", Number(e.target.value))}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Return Conditions</label>
                                    <textarea
                                        value={settings.policies.returnConditions}
                                        onChange={(e) => updateField("policies", "returnConditions", e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="exchangeAllowed"
                                        checked={settings.policies.exchangeAllowed}
                                        onChange={(e) => updateField("policies", "exchangeAllowed", e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                    <label htmlFor="exchangeAllowed" className="text-sm font-medium">Allow Product Exchange</label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Terms and Conditions</label>
                                    <textarea
                                        value={settings.policies.termsAndConditions}
                                        onChange={(e) => updateField("policies", "termsAndConditions", e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Privacy Policy</label>
                                    <textarea
                                        value={settings.policies.privacyPolicy}
                                        onChange={(e) => updateField("policies", "privacyPolicy", e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Shipping Policy</label>
                                    <textarea
                                        value={settings.policies.shippingPolicy}
                                        onChange={(e) => updateField("policies", "shippingPolicy", e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Refund Policy</label>
                                    <textarea
                                        value={settings.policies.refundPolicy}
                                        onChange={(e) => updateField("policies", "refundPolicy", e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
