import { test, expect } from './fixtures';

/**
 * E2E tests — Products page
 * Cookie consent is automatically bypassed via fixtures.ts
 */
test.describe('Products Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/products');
    });

    test('page title contains Raadhya Ethnica', async ({ page }) => {
        await expect(page).toHaveTitle(/Raadhya Ethnica/i);
    });

    test('renders at least one product card', async ({ page }) => {
        const productLinks = page.locator('a[href^="/products/"]');
        await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
    });

    test('search bar is present', async ({ page }) => {
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await expect(searchInput).toBeVisible();
    });

    test('clicking a product card navigates to detail page', async ({ page }) => {
        const productLink = page.locator('a[href^="/products/"]').first();
        await productLink.click();
        await expect(page).toHaveURL(/\/products\/.+/);
    });
});

/**
 * E2E tests — Product Detail Page
 */
test.describe('Product Detail Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/products');
        const firstProduct = page.locator('a[href^="/products/"]').first();
        await firstProduct.click();
        await page.waitForURL(/\/products\/.+/);
    });

    test('shows a product name heading', async ({ page }) => {
        const heading = page.getByRole('heading').first();
        await expect(heading).toBeVisible();
    });

    test('shows a price with $ symbol', async ({ page }) => {
        const price = page.getByText(/A?\$[\d,]+/).first();
        await expect(price).toBeVisible({ timeout: 8000 });
    });

    test('has an Add to Cart button', async ({ page }) => {
        const addToCart = page.getByRole('button', { name: /add to cart/i });
        await expect(addToCart).toBeVisible({ timeout: 8000 });
    });
});
