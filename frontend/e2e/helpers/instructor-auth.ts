import { Page } from '@playwright/test';
import { BASE_URL, INSTRUCTOR_EMAIL, INSTRUCTOR_PASSWORD } from '../fixtures';

export async function loginAsInstructor(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('domcontentloaded');
  await page.fill('input[type="email"]', INSTRUCTOR_EMAIL);
  await page.fill('input[type="password"]', INSTRUCTOR_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15_000 });
}

export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const sessionKey = keys.find(k => k.includes('supabase') && k.includes('auth-token'));
    if (!sessionKey) return null;
    try {
      const session = JSON.parse(localStorage.getItem(sessionKey) || '{}');
      return session?.access_token || null;
    } catch {
      return null;
    }
  });
}
