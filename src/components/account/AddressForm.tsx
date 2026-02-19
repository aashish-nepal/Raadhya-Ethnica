"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Address } from "@/types";

interface AddressFormProps {
    address?: Address | null;
    onSave: (address: any) => void;
    onCancel: () => void;
}

export default function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        type: "home" as "home" | "work" | "other",
        isDefault: false,
    });

    useEffect(() => {
        if (address) {
            setFormData({
                name: address.name,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || "",
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                landmark: address.landmark || "",
                type: address.type,
                isDefault: address.isDefault,
            });
        }
    }, [address]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-soft p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+61 XXX XXX XXX"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                <Input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    placeholder="Street address, P.O. box"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <Input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Melbourne"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        placeholder="Victoria"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Postcode *</label>
                    <Input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        placeholder="3064"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Landmark (Optional)</label>
                <Input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near shopping center, etc."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Address Type *</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-600"
                />
                <label htmlFor="isDefault" className="text-sm font-medium">
                    Set as default address
                </label>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                    Save Address
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
            </div>
        </form>
    );
}
