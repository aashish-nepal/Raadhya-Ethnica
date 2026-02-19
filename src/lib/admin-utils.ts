/**
 * Shared utility functions for admin panel
 */

/**
 * Format a Firestore timestamp for display in admin panel
 * @param timestamp - Firestore timestamp or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatAdminDate(timestamp: any): string {
    if (!timestamp) return "N/A";

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", {
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
 * Format a Firestore timestamp with time for display
 * @param timestamp - Firestore timestamp or Date object
 * @returns Formatted date and time string (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export function formatAdminDateTime(timestamp: any): string {
    if (!timestamp) return "N/A";

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", {
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
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Format currency for display
 * @param amount - Amount in dollars
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}

/**
 * Get status color class for badges
 * @param status - Status string
 * @returns Tailwind CSS class string
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
