import { test as setup, expect } from '@playwright/test';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Authentication Setup for E2E Tests
 * Uses Supabase Auth directly to get session tokens for authenticated tests
 */

// Test fixtures from docs/regrestiontest/README.md
export const TEST_USER_EMAIL = 'claw.student+regression@example.com';
export const TEST_USER_PASSWORD = 'ClawStudent!2026';
export const REGRESSION_COURSE_SLUG = 'regression-smoke-course-20260321080343';
export const REGRESSION_COURSE_ID = '9e778ad8-500e-405a-b963-7ac87e563984';
export const REGRESSION_LESSON_ID = '6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96';
export const REGRESSION_QUIZ_ID = 'ae59ce08-7620-4bff-86a6-8b72e21b8bbc';

const API_URL = process.env.E2E_API_URL || 'http://192.168.1.131:3001';

setup('authenticate learner user', async ({ page }) => {
  // Sign in via the login page (frontend auth flow)
  await page.goto('/login');

  await page.fill('input[type="email"]', TEST_USER_EMAIL);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);

  // Click sign in button (adjust selector based on actual UI)
  await page.click('button[type="submit"]');

  // Wait for redirect after login (check for dashboard or home page)
  await page.waitForURL(/\/(dashboard|courses)?$/, { timeout: 10_000 }).catch(() => {
    // If not redirected to expected pages, at least wait for any navigation
  });

  // Verify we're logged in by checking for user-related content or absence of login form
  // This is a basic check - adjust based on actual UI
  const isLoggedIn = await page.url().then(url =>
    !url.includes('/login')
  );

  if (!isLoggedIn) {
    // Take screenshot for debugging
    await page.screenshot({ path: 'playwright-report/auth-failure.png' });
  }

  expect(isLoggedIn, 'User should be logged in after authentication').toBe(true);
});

setup('get auth tokens via API for backend testing', async ({ request }) => {
  // Get session tokens via Supabase Auth API for backend testing
  const response = await request.post(`${API_URL}/auth/login`, {
    data: {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    },
  });

  // Note: This endpoint may not exist in the current API
  // Alternative: Use Supabase client directly if we need tokens

  // Store any tokens we get for potential backend API testing
  // This is a placeholder for more sophisticated auth handling
});