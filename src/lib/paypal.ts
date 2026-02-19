const PAYPAL_API_BASE =
    process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string | null> {
    try {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error("❌ PayPal credentials not configured");
            return null;
        }

        if (clientId === "paypal_client_id_mock" || clientSecret === "paypal_secret_mock") {
            console.error("❌ PayPal is using mock credentials. Please add real PayPal API keys to .env.local");
            return null;
        }

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            console.error("❌ PayPal token request failed:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error: any) {
        console.error("❌ Failed to get PayPal access token:", error.message);
        return null;
    }
}

export interface CreateOrderOptions {
    amount: number;
    currency: string;
    items: Array<{
        name: string;
        quantity: number;
        unit_amount: number;
    }>;
    shippingAddress?: {
        name: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        countryCode: string;
    };
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(options: CreateOrderOptions) {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            return {
                success: false,
                error: new Error("Failed to authenticate with PayPal"),
            };
        }

        const orderData = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: options.currency,
                        value: (options.amount / 100).toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: options.currency,
                                value: (options.amount / 100).toFixed(2),
                            },
                        },
                    },
                    items: options.items.map((item) => ({
                        name: item.name,
                        quantity: item.quantity.toString(),
                        unit_amount: {
                            currency_code: options.currency,
                            value: (item.unit_amount / 100).toFixed(2),
                        },
                    })),
                    shipping: options.shippingAddress
                        ? {
                            name: {
                                full_name: options.shippingAddress.name,
                            },
                            address: {
                                address_line_1: options.shippingAddress.addressLine1,
                                address_line_2: options.shippingAddress.addressLine2 || "",
                                admin_area_2: options.shippingAddress.city,
                                admin_area_1: options.shippingAddress.state,
                                postal_code: options.shippingAddress.postalCode,
                                country_code: options.shippingAddress.countryCode,
                            },
                        }
                        : undefined,
                },
            ],
        };

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("❌ PayPal order creation failed:", errData);
            return { success: false, error: new Error("PayPal order creation failed") };
        }

        const data = await response.json();
        return {
            success: true,
            order: data,
            orderId: data.id,
        };
    } catch (error: any) {
        console.error("❌ PayPal order creation failed:", error.message);
        return {
            success: false,
            error,
        };
    }
}

/**
 * Capture a PayPal order payment
 */
export async function capturePayPalOrder(orderId: string) {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            return {
                success: false,
                error: new Error("Failed to authenticate with PayPal"),
            };
        }

        const response = await fetch(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("❌ PayPal order capture failed:", errData);
            return { success: false, error: new Error("PayPal capture failed") };
        }

        const data = await response.json();
        return {
            success: true,
            capture: data,
        };
    } catch (error: any) {
        console.error("❌ PayPal order capture failed:", error.message);
        return {
            success: false,
            error,
        };
    }
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(
    headers: Record<string, string>,
    body: any
): Promise<boolean> {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            return false;
        }

        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (!webhookId) {
            console.error("❌ PayPal webhook ID not configured");
            return false;
        }

        const verificationData = {
            auth_algo: headers["paypal-auth-algo"],
            cert_url: headers["paypal-cert-url"],
            transmission_id: headers["paypal-transmission-id"],
            transmission_sig: headers["paypal-transmission-sig"],
            transmission_time: headers["paypal-transmission-time"],
            webhook_id: webhookId,
            webhook_event: body,
        };

        const response = await fetch(
            `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(verificationData),
            }
        );

        if (!response.ok) return false;

        const data = await response.json();
        return data.verification_status === "SUCCESS";
    } catch (error: any) {
        console.error("❌ PayPal webhook verification failed:", error.message);
        return false;
    }
}
