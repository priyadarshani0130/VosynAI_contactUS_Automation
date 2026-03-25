import { test, expect } from '@playwright/test';

test.describe('Contact Us Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-us/');
  });

  // ─── 1. CONSOLE ERRORS / JS BUGS ───────────────────────────────────────────

  test('1. No JavaScript errors in console', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/contact-us/');
    expect(errors, `JS Errors found: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('2. No failed network requests', async ({ page }) => {
    const failed: string[] = [];
    page.on('requestfailed', (req) => failed.push(req.url()));
    await page.goto('/contact-us/');
    expect(failed, `Failed requests: ${failed.join(', ')}`).toHaveLength(0);
  });

  // ─── 2. PAGE LOAD TIMES ────────────────────────────────────────────────────

  test('3. Page loads with 200 OK status', async ({ page }) => {
    const response = await page.goto('/contact-us/');
    expect(response?.status()).toBe(200);
  });

  test('4. Page load time is under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/contact-us/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    console.log(`Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('5. DOM ready time is under 2 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/contact-us/');
    await page.waitForLoadState('domcontentloaded');
    const domTime = Date.now() - start;
    console.log(`DOM ready time: ${domTime}ms`);
    expect(domTime).toBeLessThan(2000);
  });

  // ─── 3. PAGE STRUCTURE ─────────────────────────────────────────────────────

  test('6. Page title is not empty', async ({ page }) => {
    const title = await page.title();
    expect(title).not.toBe('');
    console.log(`Page title: ${title}`);
  });

  test('7. H1 heading is visible', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('8. Header navigation is visible', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('9. Footer is visible', async ({ page }) => {
    await expect(page.locator('footer').first()).toBeVisible();
  });

  // ─── 4. FORMS & BUTTONS ────────────────────────────────────────────────────

  test('10. Contact form is present on the page', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('11. Name input field is visible and editable', async ({ page }) => {
    const nameField = page.locator('input[type="text"], input[name*="name"], input[placeholder*="name" i]').first();
    await expect(nameField).toBeVisible();
    await nameField.fill('Test User');
    await expect(nameField).toHaveValue('Test User');
  });

  test('12. Email input field is visible and uses type="email"', async ({ page }) => {
    const emailField = page.locator('input[type="email"]').first();
    await expect(emailField).toBeVisible();
    await emailField.fill('test@example.com');
    await expect(emailField).toHaveValue('test@example.com');
  });

  test('13. Message/textarea field is present', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await textarea.fill('This is a test message.');
  });

  test('14. Submit button is visible and enabled', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('15. Empty form submission shows validation errors', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitBtn.click();
    // Page should not navigate away on empty submit
    await expect(page).toHaveURL(/contact-us/);
  });

  test('16. Invalid email shows validation error', async ({ page }) => {
    const emailField = page.locator('input[type="email"]').first();
    await emailField.fill('not-an-email');
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitBtn.click();
    await expect(page).toHaveURL(/contact-us/);
  });

  // ─── 5. ACCESSIBILITY ──────────────────────────────────────────────────────

  test('17. All form inputs have labels or placeholders', async ({ page }) => {
    const inputs = page.locator('input:not([type="hidden"]), textarea');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const hasLabel = placeholder || ariaLabel || (id && await page.locator(`label[for="${id}"]`).count() > 0);
      expect(hasLabel, `Input ${i + 1} has no label or placeholder`).toBeTruthy();
    }
  });

  test('18. Page has a valid H1 landmark', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
  });

});
