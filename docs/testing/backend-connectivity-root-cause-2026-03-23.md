# Tiny LMS — Prisma / Supabase backend connectivity root cause

Date: 2026-03-23
Owner: backend stabilization
Status: root cause confirmed

## Summary

The remaining backend/database connectivity failure is caused by the backend environment still using Supabase's **direct database host**:

- `db.sctabjfygddoydlpoqzd.supabase.co:5432`

On the current machine, that hostname resolves only to an **IPv6** address. The host does not currently have usable IPv6 database reachability, so Prisma / `pg` connections fail before the application can talk to Postgres.

This is not primarily a Prisma ORM bug. Prisma is failing because the configured database endpoint is unreachable from this network path.

## Evidence

### 1. Current backend env still points at the direct DB host

`backend/.env` currently contains:

```env
DATABASE_URL=postgresql://postgres:***@db.sctabjfygddoydlpoqzd.supabase.co:5432/postgres
```

### 2. DNS for the direct host resolves to IPv6 only from this machine

Observed lookup:

```text
db.sctabjfygddoydlpoqzd.supabase.co -> 2406:da1c:f42:ae04:caa3:f5b5:b2e4:e8f9
```

### 3. Direct `pg` connection fails with network unreachable

Observed runtime result:

```text
ENETUNREACH connect ENETUNREACH 2406:da1c:f42:ae04:caa3:f5b5:b2e4:e8f9:5432 - Local (:::0)
```

### 4. Repo code/docs already point to the correct mitigation

The repo already contains:

- `backend/src/common/database-url.ts`
- `backend/.env.pooler.example`
- `backend/README.md`
- `docs/testing/backend-setup-and-recovery.md`

These all describe the intended fix: use the **Supabase Session pooler / Supavisor** connection string over IPv4 for persistent backend traffic.

## Root cause

The effective root cause is **configuration drift**:

- code/docs were updated to support the Supabase Session pooler path
- but the active backend environment was left on the old direct `db.<project-ref>.supabase.co:5432` connection string

That leaves the app broken on IPv4-only / no-IPv6-reachability hosts.

## Correct fix

Update backend DB connectivity to use the **exact Session pooler connection string from the Supabase dashboard**:

Supabase Dashboard → **Connect** → **ORM / Session pooler / Supavisor**

Expected pattern:

```env
DIRECT_URL=postgresql://postgres.<project-ref>:<db-password>@<actual-pooler-host>:5432/postgres
```

Optional if app runtime should use the same route:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<db-password>@<actual-pooler-host>:5432/postgres
```

Important notes:

- do **not** keep Prisma pointed at `db.<project-ref>.supabase.co:5432` on this machine
- use the **actual pooler hostname shown by Supabase**; it is not always the guessed `aws-0-<region>.pooler.supabase.com`
- the username format for Session pooler is `postgres.<project-ref>`

## What was verified

- direct DB host path is broken from this machine (`ENETUNREACH`)
- pooler hostnames resolve over IPv4
- guessed pooler combinations without the exact dashboard-provided tenant/host fail with `Tenant or user not found`, which is consistent with using the wrong pooler hostname and/or tenant mapping

## Regression risk

### High if left unfixed

If env is not updated:

- backend startup or DB-backed routes will fail intermittently or immediately
- login can appear broken because `/users/me` and role/profile lookups depend on database connectivity
- Prisma `db push`, bootstrap scripts, and regression setup remain unreliable

### Low once fixed correctly

Switching to the correct Session pooler DSN is low-risk because:

- repo code already supports `DIRECT_URL`
- SSL is already configured in backend pg adapter setup
- documentation/examples already align with this architecture

### Follow-up verification after env change

After setting the real Session pooler DSN:

1. `cd backend && npm run prisma:generate`
2. `npm run db:push` (only if schema sync is intended)
3. `npm run start:dev`
4. verify public `/courses`
5. verify `/login`
6. verify authenticated `GET /users/me`
7. rerun shared regression login/course/quiz smoke

## Bottom line

The unresolved backend connectivity issue is an **env-level Supabase endpoint mistake**:

- **broken path:** direct DB host over IPv6
- **required path:** exact Supabase Session pooler / Supavisor DSN over IPv4
