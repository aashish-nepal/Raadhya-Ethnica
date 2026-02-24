/**
 * Shared utility functions for the admin panel.
 *
 * NOTE: Generic helpers (truncateText, isValidEmail / validateEmail, formatPrice)
 * live in @/lib/utils to avoid duplication.  Re-export the ones admin code
 * needs so import paths don't have to change.
 */

export { truncateText, isValidEmail as validateEmail, formatPrice as formatCurrency } from "@/lib/utils";

// ── Admin-specific helpers ────────────────────────────────────────────────────

/**
 * Format a Firestore timestamp for display in the admin panel.
 * e.g. "Jan 15, 2024"
 */
export function formatAdminDate(timestamp: any): string {
    if (!timestamp) return "N/A";

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-AU", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
}

/**
 * Format a Firestore timestamp with time for display in the admin panel.
 * e.g. "Jan 15, 2024 at 3:45 PM"
 */
export function formatAdminDateTime(timestamp: any): string {
    if (!timestamp) return "N/A";

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-AU", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    } catch (error) {
        console.error("Error formatting date/time:", error);
        return "Invalid Date";
    }
}

/**
 * Get status colour class for admin badge chips.
 */
export function getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
        case "completed":
        case "delivered":
        case "paid":
        case "active":
            return "bg-green-100 text-green-700";
        case "processing":
        case "confirmed":
        case "shipped":
            return "bg-blue-100 text-blue-700";
        case "pending":
            return "bg-yellow-100 text-yellow-700";
        case "cancelled":
        case "returned":
        case "failed":
            return "bg-red-100 text-red-700";
        case "refunded":
            return "bg-purple-100 text-purple-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}
