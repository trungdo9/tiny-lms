# Plan: Đánh Giá Khóa Học (Course Reviews & Ratings)

**Date:** 2026-03-04
**Directory:** `plans/20260304-1100-course-reviews/`

---

## Summary

Allow enrolled students to rate (1–5 stars) and review courses. Display aggregated stats and individual reviews on the public course detail page.

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Database Schema | ✅ Done | [phase-01-database-schema.md](./phase-01-database-schema.md) |
| 2 | Backend API | ✅ Done | [phase-02-backend-api.md](./phase-02-backend-api.md) |
| 3 | Frontend UI | ✅ Done | [phase-03-frontend-ui.md](./phase-03-frontend-ui.md) |

---

## Key Decisions

- **Upsert pattern**: one review per user per course (unique constraint); POST creates or updates
- **Denormalized stats**: `averageRating` (Float) + `totalReviews` (Int) stored on `Course` for fast read; recomputed on each review write/delete via Prisma `_avg` + `_count` aggregate
- **No migration history**: use `npx prisma db push` (Supabase pre-created DB)
- **Auth**: `SupabaseAuthGuard` on write endpoints; GET endpoints are public
- **Enrollment gate**: backend checks `Enrollment` table before allowing review creation

---

## Docs

- [codebase-summary.md](../../docs/codebase-summary.md)
- [code-standards.md](../../docs/code-standards.md)
- [system-architecture.md](../../docs/system-architecture.md)
