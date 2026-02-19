"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/lib/firestore";
import { MapPin, Plus, Edit, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddressForm from "@/components/account/AddressForm";
import type { Address } from "@/types";

function AddressesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect");
    const { user, loading: authLoading } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    // Auto-open the form when coming from checkout with no addresses
    const [showForm, setShowForm] = useState(redirectTo === "checkout");
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchAddresses();
    }, [user]);

    const fetchAddresses = async () => {
        if (!user) return;

        try {
            const userAddresses = await getUserAddresses(user.uid);
            setAddresses(userAddresses as Address[]);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setShowForm(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleSaveAddress = async (addressData: any) => {
        if (!user) return;

        try {
            if (editingAddress) {
                await updateAddress(user.uid, editingAddress.id, addressData);
            } else {
                await addAddress(user.uid, addressData);
            }
            await fetchAddresses();
            setShowForm(false);
            setEditingAddress(null);

            // Redirect to checkout if that's where they came from
            if (redirectTo === "checkout") {
                router.push("/checkout");
            }
        } catch (error) {
            console.error("Error saving address:", error);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user || !confirm("Are you sure you want to delete this address?")) return;

        try {
            await deleteAddress(user.uid, addressId);
            await fetchAddresses();
        } catch (error) {
            console.error("Error deleting address:", error);
        }
    };

    const handleSetDefault = async (addressId: string) => {
        if (!user) return;

        try {
            await setDefaultAddress(user.uid, addressId);
            await fetchAddresses();
        } catch (error) {
            console.error("Error setting default address:", error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (showForm) {
        return (
            <div className="container-custom py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-display font-bold mb-8">
                        {editingAddress ? "Edit Address" : "Add New Address"}
                    </h1>
                    <AddressForm
                        address={editingAddress}
                        onSave={handleSaveAddress}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingAddress(null);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">My Addresses</h1>
                    <p className="text-neutral-600">Manage your shipping addresses</p>
                </div>
                <Button onClick={handleAddAddress}>
                    <Plus size={18} className="mr-2" />
                    Add Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                    <MapPin size={64} className="mx-auto text-neutral-300 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No addresses yet</h2>
                    <p className="text-neutral-600 mb-6">
                        Add your first shipping address
                    </p>
                    <Button onClick={handleAddAddress}>
                        <Plus size={18} className="mr-2" />
                        Add Address
                    </Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`bg-white rounded-xl shadow-soft p-6 relative ${address.isDefault ? "ring-2 ring-primary-600" : ""
                                }`}
                        >
                            {address.isDefault && (
                                <div className="absolute top-4 right-4">
                                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Check size={14} />
                                        Default
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="font-semibold text-lg mb-1">{address.name}</h3>
                                <p className="text-sm text-neutral-600 capitalize">{address.type}</p>
                            </div>

                            <div className="text-neutral-700 text-sm space-y-1 mb-4">
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                <p>
                                    {address.city}, {address.state} {address.pincode}
                                </p>
                                {address.landmark && <p>Landmark: {address.landmark}</p>}
                                <p className="mt-2">Phone: {address.phone}</p>
                            </div>

                            <div className="flex gap-2">
                                {!address.isDefault && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetDefault(address.id)}
                                    >
                                        Set as Default
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditAddress(address)}
                                >
                                    <Edit size={14} className="mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 size={14} className="mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AddressesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>}>
            <AddressesPageContent />
        </Suspense>
    );
}
