# Plan: Learning Path Feature

**Date:** 2026-03-20
**Completed:** 2026-03-21
**Status:** Completed
**Priority:** High

---

## Overview

Ordered course collections (playlists) created by Admin/Instructor. Students enroll in a path → auto-enrolled in all courses → certificate on 100% completion.

**Key finding:** Backend module (`modules/learning-paths/`) already exists with CRUD + reorder. Missing: `LearningPathEnrollment` schema, enroll endpoint, `getMine`, instructor course-ownership check, certificate trigger, and all frontend pages.

---

## Phases

| # | Phase | Status | File | Dependencies |
|---|-------|--------|------|--------------|
| 1 | Backend: DB migration + missing endpoints | Completed | [phase-01-backend.md](./phase-01-backend.md) | None |
| 2 | Frontend Instructor: Create/edit path UI | Completed | [phase-02-frontend-instructor.md](./phase-02-frontend-instructor.md) | Phase 1 |
| 3 | Frontend Student: Browse + enroll + progress | Completed | [phase-03-frontend-student.md](./phase-03-frontend-student.md) | Phase 1 |
| 4 | Frontend Admin + API client integration | Completed | [phase-04-frontend-admin-api.md](./phase-04-frontend-admin-api.md) | Phase 1–3 |

---

## Existing Code (reuse)

| File | Role |
|------|------|
| `backend/src/modules/learning-paths/` | Already has CRUD, reorder, progress — extend, don't rewrite |
| `backend/src/modules/certificates/` | `issueCertificate(userId, courseId)` → adapt for path cert |
| `backend/src/modules/enrollments/` | Reuse enroll logic for auto-enroll courses |
| `frontend/app/instructor/courses/[id]/activities/` | Quiz picker pattern → course picker |
| `frontend/lib/api.ts` | Add `learningPathsApi` section |
| `frontend/lib/query-keys.ts` | Add `learningPaths` query keys |

---

## Schema Delta

**Add to Prisma:**
```prisma
model LearningPathEnrollment {
  id             String    @id @default(uuid()) @db.Uuid
  learningPathId String    @map("learning_path_id") @db.Uuid
  studentId      String    @map("student_id") @db.Uuid
  enrolledAt     DateTime  @default(now()) @map("enrolled_at")
  completedAt    DateTime? @map("completed_at")
  certificateId  String?   @map("certificate_id") @db.Uuid

  learningPath LearningPath @relation(fields: [learningPathId], references: [id], onDelete: Cascade)
  student      Profile      @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([learningPathId, studentId])
  @@map("learning_path_enrollments")
  @@schema("public")
}
```

**Modify LearningPath (add relation):**
```prisma
enrollments LearningPathEnrollment[]
```

---

## Success Criteria

- [x] Admin/Instructor can create, edit, publish, delete learning paths
- [x] Instructor can only add their own courses to a path
- [x] Student can browse published paths and enroll
- [x] Enrolling path auto-enrolls student in all courses
- [x] Progress bar reflects completed courses / total courses
- [x] Certificate issued when all courses completed
- [x] `/learning-paths/mine` returns instructor's own paths
