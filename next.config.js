/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const nextConfig = {
    images: {
        remotePatterns: [
            // Firebase Storage — product images
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
            // Google user avatars (Google OAuth profile photos)
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
            },
            // Google APIs (occasionally used for image hosting)
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            // External product image CDNs (Shopify stores, etc.)
            // Wildcard allows any HTTPS source — safe since images are admin-uploaded
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // Prevent DNS prefetch leakage
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    // Prevent clickjacking
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    // Prevent MIME type sniffing
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Legacy XSS filter for old browsers
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    // Control referrer info
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    // Force HTTPS for 1 year (enable in production only)
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    // Restrict powerful browser features
                    {
                        key: 'Permissions-Policy',
                        value: [
                            'camera=()',
                            'microphone=()',
                            'geolocation=()',
                            'payment=(self)',
                            'usb=()',
                            'magnetometer=()',
                            'gyroscope=()',
                            'interest-cohort=()',
                        ].join(', '),
                    },
                    // Content Security Policy
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // Scripts: self + Next.js inline scripts + Stripe + PayPal + Firebase
                            `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com https://apis.google.com`,
                            // Styles: self + inline styles (Tailwind/framer)
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            // Fonts
                            "font-src 'self' https://fonts.gstatic.com data:",
                            // Images: self + data URIs + remote (Firebase Storage, etc.)
                            "img-src 'self' data: blob: https:",
                            // Frames: Stripe + PayPal embedded iframes
                            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
                            // API/fetch connections
                            "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://api.stripe.com https://www.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com",
                            // Object embeds
                            "object-src 'none'",
                            // Base URI restriction
                            "base-uri 'self'",
                            // Form submissions
                            "form-action 'self'",
                            // Upgrade insecure requests
                            'upgrade-insecure-requests',
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
