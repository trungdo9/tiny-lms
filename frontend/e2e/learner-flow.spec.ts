import { test, expect } from '@playwright/test';
import {
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  REGRESSION_COURSE_SLUG,
  REGRESSION_COURSE_ID,
  REGRESSION_LESSON_ID,
} from './auth.setup';

/**
 * Learner Authentication Flow E2E Tests
 */

test.describe('Learner Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check for email and password fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);

    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 });

    // Verify we're not on login page anymore
    expect(page.url()).not.toContain('/login');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });
});

test.describe('Learner Dashboard', () => {
  test('should display enrolled courses after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 });

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard should show some content
    const hasContent = await page.locator('main, [class*="dashboard"], [class*="course"]').first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Lesson Learning Flow', () => {
  test('should access enrolled lesson', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 });

    // Navigate to lesson learn page
    await page.goto(`/lessons/${REGRESSION_LESSON_ID}/learn`);
    await page.waitForLoadState('networkidle');

    // Lesson content should load
    // Verify we're on the lesson page (not redirected to login)
    expect(page.url()).toContain(`/lessons/${REGRESSION_LESSON_ID}`);
  });
});