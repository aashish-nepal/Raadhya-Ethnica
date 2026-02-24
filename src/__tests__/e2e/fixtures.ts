import { test as base, expect } from '@playwright/test';

/**
 * Extended Playwright test fixture.
 *
 * Injects two things before any page navigation in every test:
 * 1. `cookie_consent=accepted` cookie  → prevents cookie consent overlay (z-[998])
 * 2. `raadhya_newsletter_dismissed` in sessionStorage → prevents newsletter
 *    auto-show modal (z-[60]) that fires after 3 s on every page
 */
export const test = base.extend({
    page: async ({ page }, use) => {
        await page.addInitScript(() => {
            // 1. Bypass cookie consent backdrop
            document.cookie = 'cookie_consent=accepted; path=/; max-age=31536000; SameSite=lax';
            // 2. Suppress the newsletter popup that auto-opens after 3 seconds
            sessionStorage.setItem('raadhya_newsletter_dismissed', 'true');
        });
        await use(page);
    },
});

export { expect };
