# Plan: Course Category Feature

**Date:** 2026-03-15
**Status:** ✅ Completed
**Priority:** Medium

---

## Key Finding

The `Category` model and `Course.categoryId` FK **already exist** in `schema.prisma`. The DB schema needs NO changes. Backend already has `GET /courses/categories` and `POST /courses/categories` (no auth guard on POST — bug). The public course listing page does **not** yet use category filtering. No dedicated category admin UI exists.

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Backend: Complete category CRUD API | ✅ Done | [phase-01-backend-category-api.md](./phase-01-backend-category-api.md) |
| 2 | Frontend: Category admin management UI | ✅ Done | [phase-02-frontend-admin-category-ui.md](./phase-02-frontend-admin-category-ui.md) |
| 3 | Frontend: Category filter on course listing | ✅ Done | [phase-03-frontend-course-listing-filter.md](./phase-03-frontend-course-listing-filter.md) |

> Phase 1 (Prisma model) is skipped — model already exists. Backend API completion is Phase 1.

---

## Scope Summary

**Backend:**
- Add `UpdateCategoryDto`, `DeleteCategory`, `GetCategory` endpoints to `CoursesService`/`CoursesController`
- Add `@Roles('admin')` guard to mutating category routes
- Return `parentId`/`children` in category list for hierarchy support

**Frontend:**
- Admin UI at `/admin/settings/categories` (tab in settings layout)
- Add category filter (dropdown/pills) to `/courses` public listing
- Connect course create/edit forms to category picker (already partially wired via `categoryId`)

---

## Dependencies

- No Prisma migration needed
- Phase 2 and 3 can proceed in parallel after Phase 1
- Course create/edit forms already accept `categoryId` — minor wiring only

---

## Out of Scope

- Multi-category per course (schema has single `categoryId`)
- Category images/icons
- Category-specific pages (`/courses/category/[slug]`)
