# E2E Tests - Playwright

## Setup

1. **Install Playwright browsers** (first time only):
   ```bash
   npm run test:e2e:install
   ```

2. **Run tests**:
   ```bash
   # All tests (headless)
   npm run test:e2e

   # With UI
   npm run test:e2e:ui

   # With browser visible
   npm run test:e2e:headed
   ```

## Test Fixtures

From `docs/regrestiontest/README.md`:

| Fixture | Value |
|---------|-------|
| Learner Email | `claw.student+regression@example.com` |
| Learner Password | `ClawStudent!2026` |
| Regression Course Slug | `regression-smoke-course-20260321080343` |
| Regression Course ID | `9e778ad8-500e-405a-b963-7ac87e563984` |
| Regression Lesson ID | `6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96` |
| Regression Quiz ID | `ae59ce08-7620-4bff-86a6-8b72e21b8bbc` |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `http://localhost:3000` | Frontend URL |
| `E2E_API_URL` | `http://192.168.1.131:3001` | Backend API URL |

## Test Structure

```
e2e/
├── auth.setup.ts       # Authentication setup (runs before tests)
├── public-pages.spec.ts    # Public page tests
├── learner-flow.spec.ts    # Learner authentication & dashboard
├── quiz-flow.spec.ts       # Quiz-related tests
└── README.md
```

## Notes

- Tests use the **setup project** to authenticate before running
- Chromium browser is used for all tests
- Mobile Safari tests are also configured
- Reports are generated in `playwright-report/`
- Screenshots/videos are captured on failure

## Troubleshooting

**Login tests failing?**
- Check if the frontend dev server is running (`npm run dev`)
- Check if the backend API is accessible
- Verify credentials in `auth.setup.ts`

**Tests timing out?**
- Increase timeout in `playwright.config.ts`
- Check network connectivity to backend
