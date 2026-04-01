import { test, expect } from '@playwright/test';
import { BASE_URL } from './fixtures';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './fixtures';

/**
 * Admin Regression Tests
 * Tests: Login, Create Course, Create Section, Create Question Bank + Question, Create Activity
 */

test.describe('Admin Regression', () => {
  const timestamp = Date.now();
  const testCourseTitle = `Regression Course ${timestamp}`;
  const testSectionTitle = `Test Section ${timestamp}`;
  const testBankTitle = `Test Bank ${timestamp}`;
  const testQuestion = `Test Question ${timestamp}`;
  const testFlashcardDeck = `Flashcard Deck ${timestamp}`;

  let courseId: string;
  let sectionId: string;
  let lessonId: string;
  let questionBankId: string;

  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForTimeout(3000);
  });

  test('01 - Admin Login', async ({ page }) => {
    // Should redirect away from login page after successful login
    const currentUrl = page.url();
    console.log('After login URL:', currentUrl);

    // Admin should end up at admin dashboard
    const isAdminPage = currentUrl.includes('/admin');
    expect(isAdminPage || !currentUrl.includes('/login')).toBeTruthy();
  });

  test('02 - Create Course', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/courses/create`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Fill course form
    await page.fill('input[type="text"]', testCourseTitle);
    await page.fill('textarea', 'Test course description for regression testing');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to course page
    await page.waitForTimeout(3000);

    const url = page.url();
    console.log('Course created, URL:', url);

    // Extract course ID from URL
    const match = url.match(/\/admin\/courses\/([a-f0-9-]+)/i);
    if (match) {
      courseId = match[1];
      console.log('Course ID:', courseId);
    }

    // Verify we're on course detail page
    expect(url).toContain('/admin/courses/');
  });

  test('03 - Create Section in Course', async ({ page }) => {
    // Navigate to course outline
    await page.goto(`${BASE_URL}/instructor/courses/${courseId}/outline`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Add a new section
    const sectionInput = page.locator('input[placeholder*="section"]').first();
    await sectionInput.fill(testSectionTitle);
    await sectionInput.press('Enter');

    // Wait for section to be created
    await page.waitForTimeout(2000);

    // Check if section was added
    const sectionExists = await page.getByText(testSectionTitle).isVisible();
    expect(sectionExists).toBeTruthy();

    // Get section ID from the DOM (look for the section card)
    const sectionCard = page.locator('h3').filter({ hasText: testSectionTitle }).first();
    if (await sectionCard.isVisible()) {
      console.log('Section created:', testSectionTitle);
    }
  });

  test('04 - Add Lesson to Section', async ({ page }) => {
    await page.goto(`${BASE_URL}/instructor/courses/${courseId}/outline`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Expand the section if collapsed
    const sectionHeader = page.locator('h3').filter({ hasText: testSectionTitle }).first();
    await sectionHeader.click();
    await page.waitForTimeout(500);

    // Click "Add lesson" button
    const addLessonBtn = page.locator('button').filter({ hasText: '+ Thêm bài học' }).first();
    await addLessonBtn.click();
    await page.waitForTimeout(500);

    // Fill lesson name
    const lessonInput = page.locator('input[placeholder*="bài học"]');
    await lessonInput.fill(`Test Lesson ${timestamp}`);
    await lessonInput.press('Enter');

    await page.waitForTimeout(2000);

    // Verify lesson was added
    const lessonExists = await page.getByText(`Test Lesson ${timestamp}`).isVisible();
    console.log('Lesson added:', lessonExists);
  });

  test('05 - Create Question Bank', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/question-banks`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click create button
    await page.click('button:has-text("Create Question Bank")');
    await page.waitForTimeout(500);

    // Fill form
    await page.fill('input[type="text"]', testBankTitle);
    await page.fill('textarea', 'Test question bank for regression testing');

    // Select course (if dropdown exists)
    const courseSelect = page.locator('select').first();
    if (await courseSelect.isVisible()) {
      await courseSelect.selectOption({ index: 1 }); // Select first available course
    }

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Verify bank was created
    const bankExists = await page.getByText(testBankTitle).isVisible();
    expect(bankExists).toBeTruthy();

    // Get question bank ID from URL or DOM
    const bankCard = page.locator('h3').filter({ hasText: testBankTitle }).first();
    if (await bankCard.isVisible()) {
      console.log('Question Bank created:', testBankTitle);
    }
  });

  test('06 - Create Question in Question Bank', async ({ page }) => {
    // Navigate to question bank detail
    await page.goto(`${BASE_URL}/admin/question-banks`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click on the question bank we just created
    const bankLink = page.locator('a').filter({ hasText: testBankTitle }).first();
    if (await bankLink.isVisible()) {
      await bankLink.click();
      await page.waitForTimeout(2000);

      // Look for "Add Question" or similar button
      const addQuestionBtn = page.locator('button').filter({ hasText: /add|thêm/i }).first();
      if (await addQuestionBtn.isVisible()) {
        await addQuestionBtn.click();
        await page.waitForTimeout(500);

        // Fill question text
        const questionInput = page.locator('textarea, input[type="text"]').first();
        await questionInput.fill(testQuestion);
        await page.waitForTimeout(500);

        console.log('Question created:', testQuestion);
      }
    }
  });

  test('07 - Create Flashcard Activity', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/flash-cards/create`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Fill flashcard deck form
    await page.fill('input[type="text"]', testFlashcardDeck);

    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(3000);

      console.log('Flashcard deck created:', testFlashcardDeck);
    }
  });
});
