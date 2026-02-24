import { test, expect } from './fixtures';

/**
 * E2E tests — Home page
 * Cookie consent is automatically bypassed via fixtures.ts
 */
test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('has correct page title', async ({ page }) => {
        await expect(page).toHaveTitle(/Raadhya Ethnica/i);
    });

    test('renders the hero section', async ({ page }) => {
        const hero = page.locator('section').first();
        await expect(hero).toBeVisible();
    });

    test('header is visible', async ({ page }) => {
        await expect(page.locator('header')).toBeVisible();
    });

    test('clicking the logo navigates back to home', async ({ page }) => {
        await page.goto('/products');
        const logoLink = page.locator('header a[href="/"]').first();
        await logoLink.click();
        await expect(page).toHaveURL('/');
    });

    test('newsletter section is present', async ({ page }) => {
        await expect(page.getByText(/Stay Ahead of Every Trend/i)).toBeVisible();
    });

    test('All Products nav link goes to /products', async ({ page }) => {
        const link = page.locator('nav a[href="/products"]').first();
        await link.click();
        await expect(page).toHaveURL(/\/products/);
    });

    test('Cart icon link is visible in the header', async ({ page }) => {
        const cartLink = page.locator('header a[href="/cart"]');
        await expect(cartLink).toBeVisible();
    });
});
