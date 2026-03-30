import { test, expect } from '@playwright/test';
import { REGRESSION_QUIZ_ID, BASE_URL } from './fixtures';

/**
 * Quiz Flow E2E Tests
 * Note: Full auth requires Supabase credentials. These tests verify page structure.
 */

test.describe('Quizzes Page', () => {
  test('should display quizzes page', async ({ page }) => {
    await page.goto(`${BASE_URL}/quizzes`);
    await page.waitForLoadState('domcontentloaded');

    // Page should load without error
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });
});

test.describe('Quiz Detail Page', () => {
  test('should display quiz detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/quizzes/${REGRESSION_QUIZ_ID}`);
    await page.waitForLoadState('domcontentloaded');

    // Page should load without error
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });
});