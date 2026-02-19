"use client";

import { ThumbsUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Review {
    id: string;
    rating: number;
    title: string;
    comment: string;
    author: string;
    date: string;
    verified: boolean;
    helpful: number;
    recommend: boolean;
}

interface ReviewListProps {
    reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-neutral-50 rounded-xl">
                <p className="text-neutral-600">No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-6 shadow-soft">
                    {/* Rating and Date */}
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={i < review.rating ? "text-yellow-400" : "text-neutral-300"}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <h4 className="font-semibold text-lg">{review.title}</h4>
                        </div>
                        <span className="text-sm text-neutral-500">{formatDate(review.date)}</span>
                    </div>

                    {/* Review Text */}
                    <p className="text-neutral-700 mb-4">{review.comment}</p>

                    {/* Recommend Badge */}
                    {review.recommend && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm mb-4">
                            <ThumbsUp size={14} />
                            <span>Recommends this product</span>
                        </div>
                    )}

                    {/* Author and Helpful */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                                {review.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{review.author}</p>
                                {review.verified && (
                                    <p className="text-xs text-green-600">✓ Verified Purchase</p>
                                )}
                            </div>
                        </div>

                        <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                            <ThumbsUp size={16} />
                            <span>Helpful ({review.helpful})</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
