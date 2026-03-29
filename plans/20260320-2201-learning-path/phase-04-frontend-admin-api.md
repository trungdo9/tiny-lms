# Phase 04 — Admin Management + Certificate Integration

**Date:** 2026-03-20
**Status:** Pending (depends on Phases 1–3)
**Priority:** Medium

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Reference — Admin courses page: `frontend/app/admin/courses/page.tsx`
- Certificate model: `backend/src/modules/certificates/`
- Backend service: `backend/src/modules/learning-paths/learning-paths.service.ts`

---

## Overview

Two goals:
1. **Admin management page** — view/manage all learning paths across all instructors, force-publish/unpublish
2. **Certificate integration** — extend Certificate model to support path-level certificates (or use notification approach)

---

## Part A: Admin Management Page

### Architecture

```
/admin/learning-paths
  └─ AdminLearningPathsPage
       ├─ GET /learning-paths?all=true (admin sees all, published + draft)
       ├─ Table: title, creator, courses, enrolled, published, created date, actions
       ├─ Toggle publish/unpublish
       └─ Delete path (with confirmation)
```

### Files

| File | Action |
|------|--------|
| `frontend/app/admin/learning-paths/page.tsx` | Create — admin table view |

### Implementation

- Reuse `learningPathsApi.getAll()` with `?all=true` query param (admin sees unpublished too)
- `learningPathsApi.update(id, { isPublished: true/false })` for toggle
- `learningPathsApi.delete(id)` for deletion
- Add "Learning Paths" link to admin sidebar nav

---

## Part B: Certificate Integration

### Problem

Current `Certificate` model: `@@unique([userId, courseId])` — designed for course certs only.

### Options

**Option A — Extend Certificate model (recommended)**
Add optional `learningPathId` field:
```prisma
model Certificate {
  // ... existing fields
  learningPathId String? @map("learning_path_id") @db.Uuid
  learningPath   LearningPath? @relation(...)
}
```
Unique constraint: `@@unique([userId, courseId])` stays for course certs; path cert uses `courseId = null, learningPathId = X`.

**Option B — Notification only (quick win)**
Instead of a formal certificate, emit a `learning_path.completed` event → send email + in-app notification. No schema change needed.

**Recommendation:** Implement Option B now (emit event → notification), plan Option A as future enhancement.

### Implementation Steps

**In `LearningPathsService.checkAndIssueCertificate()`:**

```typescript
// After setting completedAt:
this.eventEmitter.emit('learning_path.completed', {
  userId,
  pathId,
  pathTitle: path.title,
});
```

**Add event listener in NotificationsService (or a new handler):**

```typescript
@OnEvent('learning_path.completed')
async handlePathCompleted({ userId, pathId, pathTitle }) {
  await this.notificationsService.create({
    userId,
    type: 'path_completed',
    title: `You completed: ${pathTitle}`,
    message: 'Congratulations on completing your learning path!',
  });
  // Optionally: send email via EmailsService
}
```

**In `LearningPathsService.enroll()`** — after creating enrollments, call `checkAndIssueCertificate()` in case path has 0 courses (edge case).

**Progress re-check trigger** — add `checkAndIssueCertificate()` call after lesson completion. In `LessonProgress` update handler or `EnrollmentsService.markCourseComplete()`:
```typescript
// After course completedAt is set, check all paths student is enrolled in
const pathEnrollments = await this.prisma.learningPathEnrollment.findMany({
  where: { studentId: userId, completedAt: null },
  include: { learningPath: { include: { courses: true } } },
});
for (const pe of pathEnrollments) {
  // check if this course is in the path and if all courses are done
}
```

---

## Todo List

- [ ] Create `frontend/app/admin/learning-paths/page.tsx`
- [ ] Add "Learning Paths" to admin navigation
- [ ] Add `learning_path.completed` event emit in `checkAndIssueCertificate()`
- [ ] Add `@OnEvent('learning_path.completed')` handler → create notification
- [ ] Add path completion check hook after course enrollment `completedAt` set
- [ ] (Future) Extend Certificate model for path certificates

---

## Success Criteria

- [ ] Admin can view all learning paths (published + draft)
- [ ] Admin can toggle publish status of any path
- [ ] Admin can delete any path
- [ ] Student receives in-app notification on path completion
- [ ] `checkAndIssueCertificate()` called after each course completion

---

## Security

- Admin page protected by `RolesGuard` + `ADMIN` role
- Backend `GET /learning-paths?all=true` should check for admin role before returning unpublished paths
- Event handlers should validate userId exists before creating notifications
