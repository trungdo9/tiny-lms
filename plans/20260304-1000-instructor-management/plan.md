# Instructor Management — Implementation Plan

**Date:** 2026-03-04
**Status:** Done
**Priority:** High

## Description

Extend Tiny LMS from single-instructor to multi-instructor per course. Adds a `CourseInstructor` join table, new backend API, updated ownership checks, and frontend UI for managing and displaying co-instructors.

## Phases

| # | Phase | File | Status |
|---|-------|------|--------|
| 1 | Database Schema | [phase-01-database-schema.md](./phase-01-database-schema.md) | ✅ Completed |
| 2 | Backend API | [phase-02-backend-api.md](./phase-02-backend-api.md) | ✅ Completed |
| 3 | Frontend UI | [phase-03-frontend-ui.md](./phase-03-frontend-ui.md) | ✅ Completed |

## Key Decisions

**Explicit join model (`CourseInstructor`)** — not implicit Prisma many-to-many.
Reason: need `role` field per record and cleaner migration path.

**Keep `instructorId` on `Course` during transition** — backward compatibility with
all existing Supabase queries that use `courses_instructor_id_fkey`. Drop it only
after all reads migrate to the join table.

**Role values: `"primary"` | `"co_instructor"`** — no custom roles for now (YAGNI).
Primary instructor can edit/delete the course; co-instructor can edit only.

**No invite flow** — direct assignment by primary instructor or admin only.
Simplest approach that satisfies the requirements.

**Centralized `canManageCourse()` helper** in `CoursesService` (not a new service)
— avoids over-engineering for two call sites (sections + lessons).

**`GET /users/search`** — new endpoint in users module (not admin-only),
requires auth but allows any instructor/admin to search by name/email/role.

**`InstructorManager` component** — self-contained client component inside
`frontend/components/` directory per existing component conventions.

## Dependencies Between Phases

Phase 2 depends on Phase 1 (Prisma model must exist first).
Phase 3 depends on Phase 2 (API endpoints must exist).
