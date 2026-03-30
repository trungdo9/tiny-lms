/**
 * Test Fixtures - Shared test data for E2E tests
 * These constants are imported by test files
 */

export const TEST_USER_EMAIL = 'claw.student+regression@example.com';
export const TEST_USER_PASSWORD = 'ClawStudent!2026';
export const REGRESSION_COURSE_SLUG = 'regression-smoke-course-20260321080343';
export const REGRESSION_COURSE_ID = '9e778ad8-500e-405a-b963-7ac87e563984';
export const REGRESSION_LESSON_ID = '6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96';
export const REGRESSION_QUIZ_ID = 'ae59ce08-7620-4f86a6-8b72e21b8bbc';

export const API_URL = process.env.E2E_API_URL || 'http://localhost:3001';
export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';