import { test, expect } from '@playwright/test';
import { REGRESSION_COURSE_SLUG, BASE_URL } from './fixtures';

/**
 * Public Pages E2E Tests
 * Tests public-facing pages that don't require authentication
 */

test.describe('Public Catalog', () => {
  test('should display courses page', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses`);
    await page.waitForLoadState('domcontentloaded');

    // Page should have loaded (verify title or main content exists)
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });

  test('should navigate to course detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses/${REGRESSION_COURSE_SLUG}`);
    await page.waitForLoadState('domcontentloaded');

    // Verify page loaded
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });
});

test.describe('Login Page', () => {
  test('should display login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    // Check for login form elements
    const hasEmailField = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordField = await page.locator('input[type="password"]').count() > 0;

    // At least one should be present
    expect(hasEmailField || hasPasswordField).toBeTruthy();
  });
});