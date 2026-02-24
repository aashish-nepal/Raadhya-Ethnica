import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

/**
 * E2E tests — Cart page
 * Cookie consent is automatically bypassed via fixtures.ts
 */

/** Helper: navigate to products, click first product, add to cart */
async function addFirstProductToCart(page: Page) {
    await page.goto('/products');
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await firstProduct.click();
    await page.waitForURL(/\/products\/.+/);
    const addToCart = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCart).toBeVisible({ timeout: 8000 });
    await addToCart.click();
    await page.waitForTimeout(500); // brief pause for cart state update
}

test.describe('Cart Flow', () => {
    test('cart page shows empty state when no items are added', async ({ page }) => {
        await page.goto('/cart');
        const emptyMsg = page.getByText(/empty|no items|nothing/i);
        await expect(emptyMsg.first()).toBeVisible({ timeout: 8000 });
    });

    test('cart icon link shows a badge after adding a product', async ({ page }) => {
        await addFirstProductToCart(page);
        // Cart badge: a span inside the header cart link
        const cartBadge = page.locator('header a[href="/cart"] span');
        await expect(cartBadge).toBeVisible({ timeout: 5000 });
    });

    test('item appears on the cart page after being added', async ({ page }) => {
        await addFirstProductToCart(page);
        await page.goto('/cart');
        const emptyMsg = page.getByText(/your cart is empty/i);
        await expect(emptyMsg).not.toBeVisible({ timeout: 5000 });
    });

    test('remove confirmation modal appears when clicking remove', async ({ page }) => {
        await addFirstProductToCart(page);
        await page.goto('/cart');
        // Remove button – may be icon-only; target by role or aria-label
        const removeButton = page
            .getByRole('button', { name: /remove/i })
            .or(page.locator('button[aria-label*="remove" i]'))
            .first();
        await expect(removeButton).toBeVisible({ timeout: 8000 });
        await removeButton.click();
        const confirmModal = page.getByText(/are you sure|confirm|remove this item|remove item/i);
        await expect(confirmModal.first()).toBeVisible({ timeout: 5000 });
    });

    test('item is removed after confirming deletion', async ({ page }) => {
        await addFirstProductToCart(page);
        await page.goto('/cart');
        const removeButton = page
            .getByRole('button', { name: /remove/i })
            .or(page.locator('button[aria-label*="remove" i]'))
            .first();
        await expect(removeButton).toBeVisible({ timeout: 8000 });
        await removeButton.click();
        const confirmBtn = page.getByRole('button', { name: /^remove$|^yes$|^confirm$/i }).last();
        await confirmBtn.click();
        const emptyMsg = page.getByText(/your cart is empty/i);
        await expect(emptyMsg).toBeVisible({ timeout: 8000 });
    });
});

/**
 * E2E tests — Newsletter subscription
 */
test.describe('Newsletter Subscription', () => {
    test('subscribing with a valid email shows success message', async ({ page }) => {
        await page.goto('/');
        const emailInput = page.getByPlaceholder(/your email address/i);
        await emailInput.fill('e2etest@raadhya.com.au');
        await page.getByRole('button', { name: /subscribe/i }).click();
        await expect(page.getByText(/You're on the list!/i)).toBeVisible({ timeout: 5000 });
    });
});
