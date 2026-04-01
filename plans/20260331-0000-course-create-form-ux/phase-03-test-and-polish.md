# Phase 03: Testing & Polish

## Context
- Phases 01-02 have implemented the new form
- This phase validates everything works and updates automated tests

## Overview
- **Date**: 2026-03-31
- **Priority**: High
- **Status**: Pending

## Credentials Source
Credentials are stored in `docs/testing/credentials/admin-account.md`:
- **Email**: `admin.1774970106284.ctpf1f@example.com`
- **Password**: `AdminPass123!`

E2E tests import from `frontend/e2e/fixtures.ts` which re-exports these values. **Do not hardcode credentials in test files** — always use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from fixtures.

## Requirements
- Existing e2e test "02 - Create Course" must still pass
- All form fields must be accessible and fillable
- Error states must display correctly

## Related Code Files

### Files to MODIFY:
- `frontend/e2e/admin-regression.spec.ts`

### Files to REFERENCE:
- `frontend/e2e/admin-regression.spec.ts` — current test for course creation
- `frontend/e2e/fixtures.ts` — imports credentials from `docs/testing/credentials/admin-account.md`
- `docs/testing/credentials/admin-account.md` — source of truth for admin credentials

## Implementation Steps

### 1. Review existing e2e test
Read `admin-regression.spec.ts` and identify which lines fill:
- Title field: `page.fill('input[type="text"]', testCourseTitle)` — first text input (title)
- Description field: `page.fill('textarea', '...')` — still works
- Submit: `page.click('button[type="submit"]')` — should still work

Current test does NOT interact with:
- Level dropdown (never selected in test)
- Free checkbox (never toggled)
- Clone fields (never used)

### 2. Potential breaking changes to verify
- **Title input** remains first `input[type="text"]` — test should still work
- **Submit button** remains `button[type="submit"]` — test should still work
- **Redirect URL** still matches `/admin/courses/` pattern — test checks URL
- No new required fields added that block submission

### 3. Run e2e tests
```bash
cd frontend && npx playwright test admin-regression.spec.ts
```

Credentials are automatically used from `fixtures.ts` via `ADMIN_EMAIL` and `ADMIN_PASSWORD` imports in the test file. No hardcoding needed.

### 4. Manual testing checklist
- [ ] Create blank course → redirects to course outline page
- [ ] Create course with thumbnail URL → preview shows image
- [ ] Select each level → visual feedback on card selection
- [ ] Toggle "Free Course" → toggle state changes
- [ ] Switch to "Clone" tab → clone options appear
- [ ] Enter invalid URL → no broken image shown (placeholder)
- [ ] Submit empty title → validation error shown
- [ ] Clone a course → cloned course appears with correct title

## Todo List
- [ ] Review existing e2e test for course creation
- [ ] Update any changed selectors (level dropdown → level cards)
- [ ] Run e2e test suite
- [ ] Complete manual testing checklist
- [ ] Fix any failures

## Success Criteria
- `02 - Create Course` e2e test passes using credentials from fixtures
- Manual testing all checklist items pass
- No console errors during form interaction
- Credentials sourced from `docs/testing/credentials/admin-account.md` via `fixtures.ts`

## Risks
- Level selector change from dropdown to cards may break e2e test selectors
- Thumbnail preview adds img element that may affect test

## Next Steps
- Final review and cleanup
