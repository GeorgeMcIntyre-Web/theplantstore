import { test, expect } from '@playwright/test';

test.describe('Checkout Payment Flow', () => {
  test('user can go to checkout and see payment form', async ({ page }) => {
    // Go to the home page
    await page.goto('/');
    await page.screenshot({ path: 'step1-home.png', fullPage: true });

    // Add a product to the cart (assume first product on homepage)
    const firstAddToCart = page.getByRole('button', { name: /add to cart/i }).first();
    if (await firstAddToCart.count() > 0) {
      await firstAddToCart.click();
    }
    await page.screenshot({ path: 'step2-after-add-to-cart.png', fullPage: true });

    // Open cart sheet from header (button with aria-label 'Shopping cart')
    const cartButton = page.getByRole('button', { name: /shopping cart/i });
    await cartButton.click();
    await page.screenshot({ path: 'step3-cart-open.png', fullPage: true });

    // Click the checkout button in the cart sheet
    const checkoutButton = page.getByRole('link', { name: /^checkout$/i });
    await checkoutButton.click();
    await page.screenshot({ path: 'step4-after-checkout-click.png', fullPage: true });

    // Fill in customer details
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.screenshot({ path: 'step5-customer-details.png', fullPage: true });

    // Fill in shipping details
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Testville');
    await page.fill('input[name="province"]', 'GAUTENG');
    await page.fill('input[name="postalCode"]', '0001');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.screenshot({ path: 'step6-shipping-details.png', fullPage: true });

    // Payment step: check for payment form
    await expect(page.getByText(/Payment Details/)).toBeVisible();
    await expect(page.getByText(/Order Summary/)).toBeVisible();
    await expect(page.getByText(/Customer Details/)).toBeVisible();
    await expect(page.getByText(/Shipping Address/)).toBeVisible();
    await page.screenshot({ path: 'step7-payment-form.png', fullPage: true });
  });
}); 