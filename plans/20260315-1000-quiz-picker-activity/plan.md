# Quiz Picker in Course Activity Creation

**Status:** ✅ Complete | **Date:** 2026-03-15

---

## Context Links

- docs/codebase-summary.md
- frontend/app/instructor/courses/[id]/outline/page.tsx
- backend/src/modules/quizzes/quizzes.service.ts
- backend/src/modules/activities/activities.service.ts

---

## Problem Statement

The QuizPickerModal in the outline page has create/select tabs but these gaps:

1. Select tab: raw select, no search, no question count, no course name.
2. GET /quizzes: no instructor ownership filter.
3. ActivitiesService.create(): uses instructorId directly, breaks co-instructor access.
4. Uses raw fetch instead of quizzesApi / TanStack Query.

---

## Architecture Decision

Quiz.activityId is unique -- one quiz per activity. Sharing merges attempt history.
Decision: Always clone via QuizzesService.clone(). Select existing = clone-into-lesson.

---

## Phases

| # | Phase | File | Status |
|---|-------|------|--------|
| 1 | Backend API | phase-01-backend.md | ✅ Complete |
| 2 | Frontend UI | phase-02-frontend.md | ✅ Complete |

---

## Out of Scope

- Other activity types
- Quiz editing UI
- Admin quiz picker
