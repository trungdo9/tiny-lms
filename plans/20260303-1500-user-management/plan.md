# User Management — Implementation Plan
**Date:** 2026-03-03 | **Priority:** High | **Status:** Superseded by 20260304-1330-user-management

## Objective
Full admin user management: backend API enhancements + `/admin/users` frontend page.

## Research Reports
- [Backend Patterns](./research/researcher-01-backend-patterns.md) — Supabase createUser, DTO validation, transaction safety, soft-delete
- [Frontend Patterns](./research/researcher-02-frontend-patterns.md) — React Query filters, optimistic updates, debounced search, modal patterns

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Backend API Enhancements | Pending | [phase-01-backend-api.md](./phase-01-backend-api.md) |
| 2 | Frontend Users Page | Pending | [phase-02-frontend-page.md](./phase-02-frontend-page.md) |
| 3 | Create & Edit Modals | Pending | [phase-03-create-edit-modals.md](./phase-03-create-edit-modals.md) |
| 4 | Nav Integration | Pending | [phase-04-nav-integration.md](./phase-04-nav-integration.md) |

## Key Dependencies
- Phase 2 depends on Phase 1 (API endpoints must exist before frontend)
- Phase 3 depends on Phase 2 (modals are child components of the page)
- Phase 4 is independent (can be done in parallel with 2–3)

## Files Modified (total)

### Backend
- `backend/src/modules/users/users.service.ts` — MODIFY
- `backend/src/modules/users/users.controller.ts` — MODIFY

### Frontend
- `frontend/lib/api.ts` — MODIFY (add createUser, reactivateUser, stats)
- `frontend/lib/query-keys.ts` — already has `adminUsers` — no change needed
- `frontend/app/admin/users/page.tsx` — CREATE
- `frontend/components/dashboard-header.tsx` — MODIFY (add Users nav link for admin)

## Confirmed Decisions
| # | Decision |
|---|---------|
| 1 | `email_confirm: true` — admin-created users active immediately, no verification email |
| 2 | Deactivation is app-level only (`isActive: false`) — no Supabase auth-level ban |
| 3 | Edit modal includes Reset Password section (no old password needed) |
| 4 | Cache invalidation: broad `['admin', 'users']` on all mutations |

## Success Criteria
- Admin can list, search, filter, sort, paginate users
- Admin can create users (Supabase auth + profile row)
- Admin can edit role/name/bio/phone and toggle active status
- Admin can deactivate and reactivate users
- Stats bar shows correct totals
- All mutations optimistic with rollback
- URL params drive all filter/pagination state
