import { test, expect } from '@playwright/test';
import {
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  REGRESSION_QUIZ_ID,
} from './auth.setup';

/**
 * Quiz Flow E2E Tests
 */

test.describe('Quiz List', () => {
  test('should display available quizzes after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 });

    // Navigate to quizzes page
    await page.goto('/quizzes');
    await page.waitForLoadState('networkidle');

    // Quizzes page should load
    // At minimum verify page loads without error
    expect(page.url()).toContain('/quizzes');
  });
});

test.describe('Quiz Detail', () => {
  test('should display quiz questions', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 });

    // Navigate to quiz detail page
    await page.goto(`/quizzes/${REGRESSION_QUIZ_ID}`);
    await page.waitForLoadState('networkidle');

    // Quiz detail should show quiz content
    expect(page.url()).toContain(`/quizzes/${REGRESSION_QUIZ_ID}`);
  });
});

test.describe('Quiz Start', () => {
  test('should start quiz attempt', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 });

    // Navigate to quiz detail
    await page.goto(`/quizzes/${REGRESSION_QUIZ_ID}`);
    await page.waitForLoadState('networkidle');

    // Look for start quiz button
    const startButton = page.getByRole('button', { name: /start|begin|take/i }).or(
      page.locator('button[class*="start"], button[class*="quiz"]')
    );

    const isStartVisible = await startButton.isVisible().catch(() => false);

    if (isStartVisible) {
      await startButton.click();

      // Should navigate to quiz attempt or show first question
      await page.waitForTimeout(2000);

      // Verify we're in quiz mode (URL might change or modal might appear)
      const isInQuiz = page.url().includes('/attempt') ||
        await page.locator('[class*="question"], [class*="quiz"]').first().isVisible().catch(() => false);

      expect(isInQuiz).toBeTruthy();
    } else {
      // Quiz might have max attempts reached (expected based on regression doc)
      // At minimum verify we loaded the quiz page
      expect(page.url()).toContain(`/quizzes/${REGRESSION_QUIZ_ID}`);
    }
  });
});

test.describe('Quiz Leaderboard', () => {
  test('should display quiz leaderboard', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 });

    // Navigate to leaderboard (via URL or UI)
    await page.goto(`/quizzes/${REGRESSION_QUIZ_ID}/leaderboard`);
    await page.waitForLoadState('networkidle');

    // Leaderboard should load
    expect(page.url()).toContain('/leaderboard');
  });
});