/**
 * Test Fixtures - Shared test data for E2E tests
 * These constants are imported by test files
 */

// Learner (student) regression account
export const TEST_USER_EMAIL = 'claw.student+regression@example.com';
export const TEST_USER_PASSWORD = 'ClawStudent!2026';

// Instructor regression account
export const INSTRUCTOR_EMAIL = 'claw.instructor+regression@example.com';
export const INSTRUCTOR_PASSWORD = 'ClawInstr!2026';

// Primary regression course (instructor owns, has 1 lesson with quiz)
export const REGRESSION_COURSE_SLUG = 'regression-smoke-course-20260321080343';
export const REGRESSION_COURSE_ID = '9e778ad8-500e-405a-b963-7ac87e563984';
export const REGRESSION_SECTION_ID = '3b13e4a5-f974-448a-892e-5b14f97c6337';
export const REGRESSION_LESSON_ID = '6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96';
export const REGRESSION_QUIZ_ID = 'ae59ce08-7620-4bff-86a6-8b72e21b8bbc'; // fixed: was 4f86a6, correct is 4bff

// Secondary regression course (instructor owns, lesson has activity slot but no quiz yet)
export const REGRESSION_COURSE_2_ID = '30ac7be3-4faf-4de7-976a-35bd877e1b41';
export const REGRESSION_LESSON_2_ID = '796e7a45-3fe2-4364-a62b-46ea98c412e6';

export const API_URL = process.env.E2E_API_URL || 'http://localhost:3001';
export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
