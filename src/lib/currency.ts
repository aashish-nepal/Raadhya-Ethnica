/**
 * Format a price with the appropriate currency symbol
 */
export function formatPrice(amount: number, currencySymbol: string = "$"): string {
    return `${currencySymbol}${amount.toFixed(2)}`;
}

/**
 * Calculate tax amount based on settings
 */
export function calculateTax(
    amount: number,
    taxRate: number,
    pricesIncludeTax: boolean
): number {
    if (pricesIncludeTax) {
        // Tax is already included, extract it
        return amount - (amount / (1 + taxRate / 100));
    } else {
        // Tax needs to be added
        return amount * (taxRate / 100);
    }
}

/**
 * Calculate the final price including or excluding tax
 */
export function calculateFinalPrice(
    basePrice: number,
    taxRate: number,
    pricesIncludeTax: boolean
): number {
    if (pricesIncludeTax) {
        return basePrice;
    } else {
        return basePrice + calculateTax(basePrice, taxRate, pricesIncludeTax);
    }
}

/**
 * Calculate shipping cost based on cart total and settings
 */
export function calculateShipping(
    cartTotal: number,
    freeShippingThreshold: number,
    standardShippingRate: number,
    expressShippingRate: number = 0,
    isExpress: boolean = false
): number {
    // Free shipping if threshold is met
    if (cartTotal >= freeShippingThreshold) {
        return 0;
    }

    // Return appropriate shipping rate
    return isExpress ? expressShippingRate : standardShippingRate;
}

/**
 * Format currency for display with proper locale
 */
export function formatCurrency(
    amount: number,
    currency: string = "AUD",
    locale: string = "en-AU"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(amount);
}
