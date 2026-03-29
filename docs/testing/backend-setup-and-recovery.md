# Tiny LMS Backend Setup and Recovery

Last updated: 2026-03-22
Owner: Docs / QA / Backend stabilization
Status: Draft stabilization runbook for local or staging setup, regression bootstrap, and recovery

> Draft status: hold final documentation sign-off until backend connectivity verification and the authenticated regression rerun are complete.
> This document captures the currently verified workflow and recovery steps uncovered during the sprint.

---

## 1. Purpose

This document is the practical runbook for getting the Tiny LMS backend into a usable state during the current stabilization sprint.

Use it when you need to:
- bring up a local or staging-like backend environment
- reconnect Prisma to the database
- restore shared regression users after an environment reset
- understand the difference between demo seed data and durable regression fixtures
- recover from partial backend/auth/profile drift

This document complements, not replaces:
- `README.md`
- `backend/README.md`
- `docs/testing/public-regression-checklist.md`

---

## 2. Current reality of the project

### Database workflow

This repo currently uses a **Prisma `db push` workflow** for schema sync in local/staging-style environments.

Common commands live in `backend/package.json`:

```bash
npm run db:push
npm run db:pull
npm run db:reset
npm run db:seed
```

### Important distinction: demo seed vs regression fixture

These are **not the same thing**.

#### A. Demo seed (`backend/prisma/seed.ts`)
- Intended to repopulate the app with sample LMS data
- Deletes a large amount of existing app data first
- Creates sample instructor/student profiles and example courses/quizzes/flash cards
- Useful for a disposable demo DB
- Dangerous for shared regression environments

#### B. Durable regression fixture
- Shared instructor/student/admin accounts used repeatedly across regression runs
- Shared regression course and quiz asset intended to stay stable between runs
- Documented in `docs/testing/public-regression-checklist.md`
- Preferred for stabilization and comparable regression history

If you only need the regression environment back, **do not blindly run `npm run db:seed`**.

---

## 3. Required environment variables

Backend expects at least:

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
PORT=3001
```

Frontend should point to the backend with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 4. Normal local bring-up

From repo root:

```bash
cd backend
npm install
npm run prisma:generate
npm run db:push
npm run start:dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Expected defaults:
- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`

Recommended quick smoke after boot:
- open `/`
- open `/courses`
- try `/login`
- verify backend responds and protected routes do not immediately 500

---

## 5. Shared regression identities

The current shared regression docs define these durable identities:

| Account | Purpose |
|---|---|
| `admin_1` | shared admin login + bootstrap/recovery checks |
| `instructor_regression_1` | durable instructor for regression fixture authoring/verification |
| `student_regression_1` | durable learner for enrollment and learner-flow checks |

The canonical credentials and fixture IDs live in:
- `docs/testing/public-regression-checklist.md`

Treat that file as the source of truth.

---

## 6. Fast recovery recipes

### Recipe A — Backend code starts, but schema is out of sync

Symptoms:
- Prisma runtime errors
- missing columns/tables
- recently added module endpoints crash immediately

Steps:

```bash
cd backend
npm run prisma:generate
npm run db:push
npm run start:dev
```

Then re-check the failing route.

If `db:push` fails, verify:
- `DATABASE_URL`
- network reachability to Supabase/Postgres
- SSL requirements on the target DB

---

### Recipe B — Shared admin can no longer log in

Symptoms:
- admin credential no longer exists in Supabase auth
- password stopped working
- profile row missing or role drifted away from `admin`

Use the helper:

```bash
cd backend
node tmp-admin-login.js
```

What it does:
- lists Supabase auth users
- creates or updates the admin user
- confirms the email
- upserts the `profiles` row as active admin
- verifies password sign-in

Optional overrides:

```env
TEST_ADMIN_EMAIL=...
TEST_ADMIN_PASSWORD=...
```

After running it, verify:
- `/login` works with the shared admin identity
- admin/instructor role routing behaves as expected
- `/dashboard` no longer misroutes because of missing profile metadata

---

### Recipe C — Auth user exists but app behavior is broken after login

Symptoms:
- sign-in succeeds in Supabase
- app immediately misroutes
- `/users/me` or role-gated pages fail
- UI behaves like the user has the wrong role

Check the corresponding `profiles` row:
- `id` matches the auth user id
- `email` is correct
- role is what the environment expects
- active state is correct

Current regression expectation for the shared admin:
- auth user exists
- password login works
- profile row exists
- role is `admin`
- profile is active

If this drift only affects the admin bootstrap account, `tmp-admin-login.js` is the first recovery step.

---

### Recipe D — You need a disposable demo dataset

Only use this when you intentionally want to wipe the current app data and repopulate with sample content.

```bash
cd backend
npm run db:seed
```

What to expect from the current seed:
- broad deletion of existing app tables before insertion
- sample categories, courses, lessons, quizzes, flash cards, enrollments, settings, and email templates
- sample profile records such as `instructor@example.com` and `student1@example.com`

Do **not** assume this preserves the shared regression fixture.
Do **not** use it as the default recovery path for a shared regression environment unless you intentionally want to replace that environment with disposable demo data.

---

## 7. Regression fixture guidance

Current stabilization work depends on a shared regression course and durable learner/instructor identities.

Use the public regression checklist when you need:
- the current durable account list
- the shared fixture course slug/id
- the shared lesson/quiz ids
- known backend blockers and route failures

If the environment is rebuilt and the durable fixture disappears:
1. restore shared admin access first
2. verify instructor/student durable identities still exist
3. restore the regression fixture asset using the documented IDs/slugs where possible
4. update the docs if the canonical fixture changed

Avoid creating a brand-new mystery fixture every run, or regression history becomes mush.

---

## 8. Known stabilization notes

### 8.1 Register response-shape mismatch risk is real

Current frontend register flow expects:
- `requiresVerification`
- optional `session.access_token`

Current backend controller returns:
- `user`
- `access_token`
- `refresh_token`

That means registration success/verification UX remains a hotspot and should be regression-tested after auth changes.

### 8.2 Some older docs mention a broken `/signup` header link

That appears stale relative to the current frontend code, which links the public header sign-up CTA to `/register`.

### 8.3 Frontend local API URL can drift

If local frontend is pointed at a LAN IP or stale backend host, pages may look broken even when backend code is fine.

Double-check `frontend/.env.local` before blaming the app.

---

## 9. Suggested verification order after recovery

After any meaningful recovery action:

1. backend boots with no immediate Prisma crash
2. frontend reaches backend successfully
3. `/login` works for the shared admin account
4. `/courses` and one known public course route load
5. shared student login works
6. learner dashboard or profile route loads
7. shared regression course/lesson/quiz paths still resolve

Then run the broader checklist in:
- `docs/testing/public-regression-checklist.md`

---

## 10. When to update this document

Update this runbook whenever one of these changes:
- setup commands
- Prisma workflow
- destructive seed behavior
- shared regression bootstrap approach
- canonical helper scripts
- durable regression identities or restoration steps
