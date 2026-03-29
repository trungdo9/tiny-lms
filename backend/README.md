# Tiny LMS Backend

NestJS backend for Tiny LMS.

## What this service does

- Auth via Supabase + JWT
- Course, lesson, quiz, enrollment, certificate, payment, SCORM, assignment, and reporting APIs
- Prisma 7 ORM against PostgreSQL (Supabase)
- Shared regression/bootstrap helpers for local and staging recovery

## Stack

- NestJS 11
- Prisma 7
- PostgreSQL / Supabase
- Jest for backend tests

## Prerequisites

- Node.js 18+
- A reachable PostgreSQL database
- Supabase project configured for auth

## Environment

Create `backend/.env` with at least:

```env
# Prefer DIRECT_URL for Prisma / backend database connectivity.
# On IPv4-only machines, do NOT use db.<project-ref>.supabase.co:5432 here.
# Use the Supabase Session pooler / Supavisor URL on port 5432 instead.
DIRECT_URL=postgresql://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres

# Optional: if app runtime should use the same pooler path, set DATABASE_URL too.
DATABASE_URL=postgresql://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:5432/postgres

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
PORT=3001
```

Optional integrations used by some modules:

```env
SEPAY_WEBHOOK_SECRET=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
RESEND_API_KEY=...
MAILCHIMP_API_KEY=...
MAILCHIMP_AUDIENCE_ID=...
BREVO_API_KEY=...
```

## Install

```bash
cd backend
npm install
```

## Database workflow

This project currently follows a **`prisma db push`** workflow rather than `prisma migrate dev` as the default local/staging path.

Common commands:

```bash
npm run prisma:generate
npm run db:push
npm run db:pull
npm run db:reset
npm run db:seed
```

### Important warning about `db:seed`

`npm run db:seed` runs `prisma/seed.ts`, which currently performs a broad cleanup before inserting demo data.

That means it is **destructive** to existing app data in the target database.

Use it only when you explicitly want to reset to the demo dataset.

It is **not** the same thing as restoring the shared regression fixture accounts/course described in `docs/testing/`.

## Run the backend

### Development

```bash
npm run start:dev
```

Default local port: `3001`

### Production build

```bash
npm run build
npm run start:prod
```

## Tests

```bash
npm run test
npm run test:e2e
npm run test:cov
```

Notes:
- The repo has backend Jest tests and frontend Vitest tests.
- Current stabilization work still relies heavily on manual regression flows documented under `docs/testing/`.

## Shared regression/bootstrap helper

The file `tmp-admin-login.js` is a practical recovery helper for the shared admin regression account.

It will:
- ensure the admin auth user exists in Supabase
- reset the admin password
- upsert the matching `profiles` row with `role = admin`
- verify login works

Run it from `backend/`:

```bash
node tmp-admin-login.js
```

It expects the normal Supabase env vars to be present and optionally honors:

```env
TEST_ADMIN_EMAIL=...
TEST_ADMIN_PASSWORD=...
```

For the broader recovery/bootstrap workflow, see:
- `../docs/testing/public-regression-checklist.md`
- `../docs/testing/backend-setup-and-recovery.md`

## Related files

- `prisma/schema.prisma` — source of truth for Prisma models
- `prisma/seed.ts` — destructive demo seed
- `tmp-admin-login.js` — shared admin recovery helper
- `test/` — e2e Jest config and tests

## Troubleshooting

### `prisma db push` fails

Check:
- `DIRECT_URL` or `DATABASE_URL` is correct
- the target Supabase/Postgres instance is reachable from your machine
- SSL/network restrictions are not blocking the connection
- if you use a Supabase direct host like `db.<project-ref>.supabase.co`, your machine has working IPv6; otherwise use the Supabase Session pooler / Supavisor URL on port `5432`

### Auth works in Supabase but app role routing is wrong

Check the `profiles` row for the user:
- matching `id`
- expected `role`
- active profile state

### Backend starts but frontend still cannot call it

Check:
- backend listening on `:3001`
- frontend `NEXT_PUBLIC_API_URL`
- CORS / `FRONTEND_URL` alignment
API_URL`
- CORS / `FRONTEND_URL` alignment
