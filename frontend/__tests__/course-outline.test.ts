import { test, expect } from '@playwright/test';

const COURSE_ID = 'de095694-a902-495e-a2f3-094dca9908e5';

test.describe('Course Outline Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the course outline page
    await page.goto(`http://localhost:3000/instructor/courses/${COURSE_ID}/outline`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display course outline page with correct title', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Course Outline');
    
    // Check breadcrumb
    await expect(page.locator('text=Course Outline').last()).toBeVisible();
  });

  test('should display sections instead of modules', async ({ page }) => {
    // Check stats bar uses "sections" instead of "modules"
    await expect(page.locator('text=sections')).toBeVisible();
    
    // Check the section header uses SECTION instead of MODULE
    const sectionHeader = page.locator('text=/^SECTION \\d{2}:/');
    await expect(sectionHeader.first()).toBeVisible();
  });

  test('should display empty state when no sections exist', async ({ page }) => {
    // Check empty state text uses "section" instead of "module"
    await expect(page.locator('text=Chưa có section nào')).toBeVisible();
    await expect(page.locator('text=Thêm section đầu tiên')).toBeVisible();
  });

  test('should have add section form with correct placeholder', async ({ page }) => {
    // Check add section form uses correct terminology
    await expect(page.locator('text=Thêm section mới')).toBeVisible();
    
    // Check placeholder text
    const input = page.locator('input[placeholder*="Tên section mới"]');
    await expect(input).toBeVisible();
    
    // Check button text
    await expect(page.locator('button:has-text("+ Thêm section")')).toBeVisible();
  });

  test('should display stats with correct terminology', async ({ page }) => {
    // Check stats bar shows sections count
    await expect(page.locator('text=/\\d+ sections/')).toBeVisible();
    
    // Check lesson count
    await expect(page.locator('text=bài học')).toBeVisible();
    
    // Check quiz count  
    await expect(page.locator('text=quiz')).toBeVisible();
  });

  test('should show expand/collapse all buttons', async ({ page }) => {
    await expect(page.locator('text=Mở tất cả')).toBeVisible();
    await expect(page.locator('text=Thu gọn')).toBeVisible();
  });
});
