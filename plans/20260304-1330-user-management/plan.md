# User Management Module — Implementation Plan
**Date:** 2026-03-04 | **Priority:** High | **Status:** Done

## Objective
Admin-only user management: list/search/filter users, CRUD operations, role assignment, password reset.

## What Already Exists
Backend `users.controller.ts` and `users.service.ts` already have:
- `GET /users/admin/all` — list with pagination + search (q param only)
- `GET /users/admin/:id` — get by ID
- `PUT /users/admin/:id` — update role/status/profile
- `DELETE /users/admin/:id` — deactivate (soft delete)
- `searchUsers()` — filters by name/email text + optional role param

Frontend `api.ts` already has `adminUsersApi` with `getAll`, `getById`, `updateUser`, `deactivateUser`.
`query-keys.ts` already has `adminUsers.all(params)` and `adminUsers.detail(id)`.
No `/admin/users` page exists yet.

## What Needs to Be Built

### Backend Gaps
- Enhanced filters: `isActive`, `sortBy`, `sortOrder` params on list endpoint
- `POST /users/admin` — create user (Supabase auth + profile, rollback on failure)
- `GET /users/admin/stats` — aggregate counts by role/status
- `PUT /users/admin/:id/reactivate` — reactivate deactivated user
- `PUT /users/admin/:id/reset-password` — admin password reset via Supabase

### Frontend Gaps
- `/admin/users` page with data table, filters, stats bar, pagination
- Create/edit user dialogs
- API client extensions: `createUser`, `reactivateUser`, `getStats`, `resetPassword`

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Backend API | ✅ Done | [phase-01-backend-api.md](./phase-01-backend-api.md) |
| 2 | Frontend Admin UI | ✅ Done | [phase-02-frontend-admin-ui.md](./phase-02-frontend-admin-ui.md) |

## Dependencies
- Phase 2 depends on Phase 1 (API must exist before frontend consumes it)

## Files Modified

### Backend (Phase 1)
- `backend/src/modules/users/users.controller.ts` — MODIFY (new endpoints + DTOs)
- `backend/src/modules/users/users.service.ts` — MODIFY (new methods + enhanced filters)

### Frontend (Phase 2)
- `frontend/lib/api.ts` — MODIFY (extend `adminUsersApi`)
- `frontend/app/admin/users/page.tsx` — CREATE
- `frontend/components/dashboard-header.tsx` — MODIFY (add Users nav link)

## Confirmed Decisions
| # | Decision |
|---|---------|
| 1 | `email_confirm: true` on admin-created users (no verification email) |
| 2 | Deactivation is app-level only (`isActive: false`), no Supabase auth ban |
| 3 | Inline DTOs in controller (matches existing pattern, no dto/ folder) |
| 4 | Single-file page component (all sub-components inline) |
| 5 | URL search params drive all filter/pagination state |

## Success Criteria
- Admin can list, search, filter (role + status), sort, paginate users
- Admin can create users (Supabase auth + profile row with rollback)
- Admin can edit role/name/status and reset password
- Admin can deactivate/reactivate users
- Non-admin users cannot access any admin endpoint or page
