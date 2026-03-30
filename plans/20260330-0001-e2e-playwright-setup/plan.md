# Plan: E2E Playwright Test Infrastructure

**Date:** 2026-03-30
**Status:** Complete
**Priority:** Medium

## Overview
Setup Playwright E2E test infrastructure for Tiny LMS frontend regression testing.

## Context
- Project uses Vitest for unit tests
- Playwright is already installed (`@playwright/test": "^1.58.2"`)
- Regression checklist exists in `docs/regrestiontest/` but no automated tests
- Need headless browser testing for public pages, auth flows, and quiz flows

## Goal / Definition of Done
After implementation:
- `playwright.config.ts` exists with proper configuration
- E2E test files in `frontend/e2e/` directory
- Authentication setup runs before authenticated tests
- Public pages, learner flows, and quiz flows are testable
- Scripts added to `package.json`

## Files Created

| File | Description |
|------|-------------|
| `frontend/playwright.config.ts` | Playwright configuration |
| `frontend/e2e/auth.setup.ts` | Authentication fixtures & setup |
| `frontend/e2e/public-pages.spec.ts` | Public page tests |
| `frontend/e2e/learner-flow.spec.ts` | Learner auth & dashboard tests |
| `frontend/e2e/quiz-flow.spec.ts` | Quiz flow tests |
| `frontend/e2e/README.md` | E2E test documentation |
| `frontend/e2e/.gitignore` | Git ignore for artifacts |

## Usage

```bash
# Install browsers
npm run test:e2e:install

# Run tests (headless)
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed
```

## Next Steps
1. Run `npm run test:e2e:install` to install browsers
2. Start frontend dev server (`npm run dev`)
3. Run `npm run test:e2e` to verify setup
4. Add more tests as needed

## Notes
- Tests use existing regression fixtures from `docs/regrestiontest/`
- Backend API URL: `http://192.168.1.131:3001`
- Frontend URL: `http://localhost:3000`
