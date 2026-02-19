"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ReviewFormProps {
    productId: string;
    onSubmit: (review: ReviewData) => void;
}

export interface ReviewData {
    rating: number;
    title: string;
    comment: string;
    name: string;
    email: string;
    recommend: boolean;
}

export default function ReviewForm({ productId, onSubmit }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({
        title: "",
        comment: "",
        name: "",
        email: "",
        recommend: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        onSubmit({
            rating,
            ...formData,
        });

        // Reset form
        setRating(0);
        setFormData({
            title: "",
            comment: "",
            name: "",
            email: "",
            recommend: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="text-xl font-display font-bold mb-6">Write a Review</h3>

            {/* Rating */}
            <div className="mb-6">
                <label className="block font-semibold mb-2">Your Rating *</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                size={32}
                                className={
                                    star <= (hoverRating || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-neutral-300"
                                }
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Review Title */}
            <div className="mb-4">
                <label className="block font-semibold mb-2">Review Title *</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Sum up your experience in one line"
                    className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Review Comment */}
            <div className="mb-4">
                <label className="block font-semibold mb-2">Your Review *</label>
                <textarea
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Tell us what you think about this product..."
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Name */}
            <div className="mb-4">
                <label className="block font-semibold mb-2">Your Name *</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Email */}
            <div className="mb-4">
                <label className="block font-semibold mb-2">Your Email *</label>
                <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full h-11 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                    Your email will not be published
                </p>
            </div>

            {/* Recommend */}
            <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.recommend}
                        onChange={(e) => setFormData({ ...formData, recommend: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">I would recommend this product to a friend</span>
                </label>
            </div>

            <Button type="submit" size="lg">
                Submit Review
            </Button>
        </form>
    );
}
