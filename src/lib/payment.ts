import type { StoreSettings } from "@/types";

/**
 * Get available payment methods based on settings
 */
export function getAvailablePaymentMethods(settings: StoreSettings | null) {
    if (!settings) {
        return {
            stripe: false,
            paypal: false,
            cod: true,
            upi: false,
        };
    }

    return {
        stripe: settings.payment.stripeEnabled,
        paypal: settings.payment.paypalEnabled,
        cod: settings.payment.codEnabled,
        upi: settings.payment.upiEnabled,
    };
}

/**
 * Initialize Stripe
 */
export function initializeStripe(settings: StoreSettings | null) {
    if (!settings?.payment.stripeEnabled || !settings.payment.stripePublishableKey) {
        return null;
    }

    return {
        publishableKey: settings.payment.stripePublishableKey,
        secretKey: settings.payment.stripeSecretKey,
    };
}

/**
 * Initialize PayPal
 */
export function initializePayPal(settings: StoreSettings | null) {
    if (!settings?.payment.paypalEnabled || !settings.payment.paypalClientId) {
        return null;
    }

    // Load PayPal script if not already loaded
    if (typeof window !== "undefined" && !(window as any).paypal) {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${settings.payment.paypalClientId}`;
        script.async = true;
        document.body.appendChild(script);
    }

    return {
        clientId: settings.payment.paypalClientId,
    };
}

/**
 * Get COD configuration
 */
export function getCODConfig(settings: StoreSettings | null) {
    if (!settings) {
        return {
            enabled: true,
            charges: 5,
        };
    }

    return {
        enabled: settings.payment.codEnabled,
        charges: settings.shipping.codCharges,
    };
}

/**
 * Get UPI configuration
 */
export function getUPIConfig(settings: StoreSettings | null) {
    if (!settings) {
        return {
            enabled: false,
            upiId: "",
        };
    }

    return {
        enabled: settings.payment.upiEnabled,
        upiId: settings.payment.upiId,
    };
}
