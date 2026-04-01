# Tiny LMS E2E Playwright Tests

**Last updated:** 2026-03-31
**Status:** Active
**Tool:** Playwright + Chromium (headless)

---

## 1. Overview

Automated E2E tests using Playwright for regression testing of key user flows.

### Test Infrastructure

| Component | Value |
|-----------|-------|
| Test runner | `@playwright/test` v1.58.2 |
| Browser | Chromium (headless) |
| Test location | `frontend/e2e/` |
| Config | `frontend/playwright.config.ts` |

### Running Tests

```bash
cd frontend

# Install browsers (one-time)
npm run test:e2e:install

# Run all tests (headless)
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run headed (visible browser)
npm run test:e2e:headed
```

---

## 2. Test Fixtures

### Test Accounts

| Account | Email | Password | Purpose |
|---------|-------|---------|---------|
| Student | Generated dynamically | `TestPass123!` | Registration/login tests |

Dynamic user: `test.user.{timestamp}@example.com`

### Regression Fixtures (from `docs/regrestiontest/`)

| Fixture | Value |
|---------|-------|
| Learner Email | `claw.student+regression@example.com` |
| Learner Password | `ClawStudent!2026` |
| Course Slug | `regression-smoke-course-20260321080343` |
| Course ID | `9e778ad8-500e-405a-b963-7ac87e563984` |
| Lesson ID | `6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96` |
| Quiz ID | `ae59ce08-7620-4f86a6-8b72e21b8bbc` |

---

## 3. Test Files

### `e2e/auth.setup.ts`
Setup file for test configuration.

### `e2e/fixtures.ts`
Shared test data constants:
- `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_USER_NAME`
- `REGRESSION_COURSE_SLUG`, `REGRESSION_COURSE_ID`
- `REGRESSION_LESSON_ID`, `REGRESSION_QUIZ_ID`
- `BASE_URL`, `API_URL`

### `e2e/public-pages.spec.ts`
Public page tests:
- `/courses` - course catalog
- `/courses/[slug]` - course detail
- `/login` - login page structure

### `e2e/learner-flow.spec.ts`
Authentication flow tests:
- Registration page display
- New user registration
- Duplicate email error
- Login page display
- Login with valid credentials
- Login with invalid credentials
- Logout flow

### `e2e/quiz-flow.spec.ts`
Quiz page tests:
- `/quizzes` - quiz list
- `/quizzes/[id]` - quiz detail

---

## 4. Test Results (2026-03-31)

```
Running 11 tests using 1 worker

✓  Registration › should display registration page     (1.3s)
✓  Registration › should register new user             (4.1s)
✓  Login › should display login page                   (1.1s)
✓  Login › should login with valid credentials          (4.3s)
✓  Login › should show error with invalid credentials   (3.2s)
✓  Logout › should logout user                          (4.2s)
✓  Public Catalog › should display courses page         (1.4s)
✓  Public Catalog › should navigate to course detail     (1.5s)
✓  Login Page › should display login page              (989ms)
✓  Quizzes Page › should display quizzes page           (1.0s)
✓  Quiz Detail Page › should display quiz detail       (1.7s)

11 passed (27.0s)
```

---

## 5. Environment

### URLs

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:3001` |

### Prerequisites

1. Frontend dev server running (`npm run dev`)
2. Backend dev server running (`npm run start:dev`)
3. Database accessible

---

## 6. Known Limitations

### Auth Testing
- Full auth tests require Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in `.env.local`
- Current tests focus on page structure and basic flows
- Registration tests verify "Check your email" success state (email confirmation required)

### Quiz Attempts
- Quiz start may be blocked if regression learner has max attempts
- Full quiz flow tests require fresh attempt state

### Dynamic Test Users
- Registration creates new users each run
- Tests use timestamp-based unique emails

---

## 7. Adding New Tests

### File Structure
```
e2e/
├── auth.setup.ts       # Setup hooks (runs before tests)
├── fixtures.ts         # Shared constants
├── *.spec.ts          # Test specs
└── README.md
```

### Example Test
```typescript
import { test, expect } from '@playwright/test';
import { BASE_URL, REGRESSION_COURSE_SLUG } from './fixtures';

test('should load course detail', async ({ page }) => {
  await page.goto(`${BASE_URL}/courses/${REGRESSION_COURSE_SLUG}`);
  await page.waitForLoadState('domcontentloaded');

  // Verify page loaded
  expect(page.url()).toContain('/courses/');
});
```

### Best Practices
1. Use `BASE_URL` from fixtures for consistent URLs
2. Use `page.waitForLoadState('domcontentloaded')` before assertions
3. Add meaningful labels to `test()` descriptions
4. Handle async operations with `waitForTimeout()` when needed
5. Use `expect().toBeTruthy()` for conditional checks with fallback

---

## 8. Troubleshooting

### Tests failing with "Failed to fetch"
- Check backend is running on correct port
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Tests failing with "Storage state not found"
- Ensure no `storageState` in `playwright.config.ts` projects
- Or run setup first to create storage state

### Browser not installed
```bash
npm run test:e2e:install
```

---

## 9. Related Documents

- [Public Regression Checklist](./public-regression-checklist.md) - Full route-by-route test cases
- [Regression Test Evidence](../regrestiontest/evidence.md) - Test run evidence
- [Regression Issues](../regrestiontest/issues.md) - Known issues
