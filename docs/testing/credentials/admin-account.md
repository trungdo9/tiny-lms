# Admin Account Credentials

**Last updated:** 2026-03-31
**Status:** Active

---

## Admin User

| Field | Value |
|-------|-------|
| Email | `admin.1774999620341.h54b25@example.com` |
| Password | `AdminPass123!` |
| Role | `admin` |

---

## Usage Notes

- This account was created via `backend/scripts/create-admin.ts`
- Email is auto-generated with timestamp to ensure uniqueness
- To create a new admin, run: `npx ts-node scripts/create-admin.ts`
- Credentials are for **testing only** - do not use in production

---

## Related Files

- Script: `backend/scripts/create-admin.ts`
- E2E Tests: `frontend/e2e/learner-flow.spec.ts`
- Test Docs: `docs/testing/e2e-playwright-tests.md`