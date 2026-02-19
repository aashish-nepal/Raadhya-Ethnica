import type { Metadata } from 'next';
import type { Product, BlogPost, SEOData } from '@/types';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Raadhya Ethnica';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://raadhyaethnica.com';

/**
 * Generate base metadata for pages
 */
export function generateBaseMetadata(seo: SEOData): Metadata {
    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: seo.canonicalUrl || APP_URL,
            siteName: APP_NAME,
            images: seo.ogImage ? [{ url: seo.ogImage }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: seo.title,
            description: seo.description,
            images: seo.ogImage ? [seo.ogImage] : [],
        },
        alternates: {
            canonical: seo.canonicalUrl,
        },
    };
}

/**
 * Generate product schema markup
 */
export function generateProductSchema(product: Product) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.sku,
        brand: {
            '@type': 'Brand',
            name: APP_NAME,
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `${APP_URL}/products/${product.slug}`,
        },
        aggregateRating: product.reviewCount > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
        } : undefined,
    };
}

/**
 * Generate blog post schema markup
 */
export function generateBlogSchema(post: BlogPost) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: APP_NAME,
            logo: {
                '@type': 'ImageObject',
                url: `${APP_URL}/logo.png`,
            },
        },
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
    };
}

/**
 * Generate breadcrumb schema markup
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${APP_URL}${item.url}`,
        })),
    };
}

/**
 * Generate organization schema markup
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: APP_NAME,
        url: APP_URL,
        logo: `${APP_URL}/logo.png`,
        sameAs: [
            'https://www.facebook.com/raadhyaethnica',
            'https://www.instagram.com/raadhyaethnica',
            'https://twitter.com/raadhyaethnica',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
            contactType: 'Customer Service',
        },
    };
}
