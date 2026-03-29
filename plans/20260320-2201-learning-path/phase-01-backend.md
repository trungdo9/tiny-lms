# Phase 01 — Backend: DB Migration + Missing Endpoints

**Date:** 2026-03-20
**Status:** Pending
**Priority:** High (blocks all frontend phases)

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Existing service: `backend/src/modules/learning-paths/learning-paths.service.ts`
- Existing controller: `backend/src/modules/learning-paths/learning-paths.controller.ts`
- Certificate service: `backend/src/modules/certificates/certificates.service.ts`
- Enrollments service: `backend/src/modules/enrollments/enrollments.service.ts`
- Prisma schema: `backend/prisma/schema.prisma`
- App module: `backend/src/app.module.ts`

---

## Overview

Backend module exists but is incomplete. This phase adds:
1. `LearningPathEnrollment` Prisma model
2. `enroll()` — POST /learning-paths/:id/enroll (auto-enroll all courses)
3. `getMine()` — GET /learning-paths/mine
4. Course ownership check for instructors in `addCourse()`
5. Certificate trigger when all courses in path are completed
6. Register `LearningPathsModule` in `AppModule` (verify)

---

## Key Insights

- `LearningPath` + `LearningPathCourse` Prisma models already exist
- Existing service has: create, findAll, findOne, findOneWithProgress, update, delete, addCourse, removeCourse, reorderCourses, verifyOwnership
- `CertificatesService.issueCertificate(userId, courseId)` pattern → adapt for path-level cert
- Enrollment uniqueness: `@@unique([learningPathId, studentId])`
- Progress uses `isRequired` field — spec says all courses count, so treat `isRequired=true` as default

---

## Requirements

**Functional:**
- `POST /learning-paths/:id/enroll` — student enrolls path, auto-enrolled in all courses
- `GET /learning-paths/mine` — returns paths created by current user (instructor/admin)
- `addCourse()` — INSTRUCTOR can only add courses where `course.instructorId === userId`; ADMIN bypasses
- Certificate issued when `LearningPathEnrollment.completedAt` is set
- Progress check after each lesson completion (hook into enrollment `completedAt` or periodic check)

**Non-Functional:**
- `prisma.$transaction()` for enroll (create enrollment + bulk course enrollments atomically)
- No double enrollment (skip courses already enrolled)
- Idempotent enroll (return existing enrollment if already enrolled)

---

## Architecture

```
POST /learning-paths/:id/enroll
  → LearningPathsService.enroll(pathId, userId)
    → Verify path exists + isPublished
    → Upsert LearningPathEnrollment (idempotent)
    → Fetch all LearningPathCourse for path
    → For each course: enrollments.upsert({userId, courseId}) — skip if exists
    → Return { enrolled: N, skipped: M }

GET /learning-paths/mine
  → LearningPathsService.findMine(userId)
    → findMany where createdBy === userId
    → Include course count + enrollment count

addCourse() instructor check:
  → If userRole === 'instructor':
      fetch course, verify course.instructorId === userId
      else throw ForbiddenException

Certificate trigger:
  → After lesson completion (hook from LessonProgress or periodic check),
     OR better: add checkPathCompletion(userId) called after course enrollment.completedAt set
  → Query all LearningPathEnrollment where studentId = userId, completedAt IS NULL
  → For each: check if all courses in path are completed by user
  → If yes: set completedAt, call issueCertificate(userId, pathId context)
```

---

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `backend/prisma/schema.prisma` | Modify | Add `LearningPathEnrollment` model + relation to `LearningPath` + `Profile` |
| `backend/src/modules/learning-paths/learning-paths.service.ts` | Modify | Add `enroll()`, `findMine()`, course ownership check in `addCourse()`, `checkAndIssueCertificate()` |
| `backend/src/modules/learning-paths/learning-paths.controller.ts` | Modify | Add `POST /:id/enroll`, `GET /mine` routes |
| `backend/src/modules/learning-paths/dto/learning-path.dto.ts` | Modify | Add `EnrollPathDto` (empty or with options) |
| `backend/src/modules/learning-paths/learning-paths.module.ts` | Modify | Import CertificatesModule or inject CertificatesService |
| `backend/src/app.module.ts` | Verify/Modify | Ensure LearningPathsModule is registered |

---

## Implementation Steps

### Step 1 — Add LearningPathEnrollment to Prisma schema

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

Also add to `LearningPath` model:
```prisma
enrollments LearningPathEnrollment[]
```

Also add to `Profile` model:
```prisma
learningPathEnrollments LearningPathEnrollment[]
```

Run: `npx prisma db push`

### Step 2 — Add enroll() to LearningPathsService

```typescript
async enroll(pathId: string, userId: string) {
  const path = await this.prisma.learningPath.findUnique({
    where: { id: pathId },
    include: { courses: { select: { courseId: true } } },
  });
  if (!path) throw new NotFoundException('Learning path not found');
  if (!path.isPublished) throw new ForbiddenException('Learning path is not published');

  // Upsert path enrollment
  const existing = await this.prisma.learningPathEnrollment.findUnique({
    where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
  });
  if (!existing) {
    await this.prisma.learningPathEnrollment.create({
      data: { learningPathId: pathId, studentId: userId },
    });
  }

  // Auto-enroll in each course (skip existing)
  let enrolled = 0, skipped = 0;
  for (const { courseId } of path.courses) {
    const courseEnrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!courseEnrollment) {
      await this.prisma.enrollment.create({ data: { userId, courseId } });
      enrolled++;
    } else {
      skipped++;
    }
  }

  return { success: true, enrolled, skipped };
}
```

### Step 3 — Add findMine() to LearningPathsService

```typescript
async findMine(userId: string) {
  return this.prisma.learningPath.findMany({
    where: { createdBy: userId },
    include: {
      _count: { select: { courses: true, enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

### Step 4 — Add course ownership check in addCourse()

```typescript
async addCourse(pathId, dto, userId, userRole) {
  await this.verifyOwnership(pathId, userId, userRole);

  // Instructor can only add their own courses
  if (userRole === 'instructor') {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { instructorId: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only add your own courses to a learning path');
    }
  }
  // ... rest of existing logic
}
```

### Step 5 — Add certificate check method

```typescript
async checkAndIssueCertificate(pathId: string, userId: string) {
  const enrollment = await this.prisma.learningPathEnrollment.findUnique({
    where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
  });
  if (!enrollment || enrollment.completedAt) return; // already completed

  const path = await this.prisma.learningPath.findUnique({
    where: { id: pathId },
    include: { courses: { select: { courseId: true } } },
  });

  // Check all courses completed
  const allCompleted = await Promise.all(
    path.courses.map(async ({ courseId }) => {
      const e = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      return e?.completedAt != null;
    }),
  );

  if (allCompleted.every(Boolean)) {
    await this.prisma.learningPathEnrollment.update({
      where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
      data: { completedAt: new Date() },
    });
    // Issue certificate using existing CertificatesService
    // Note: Certificate model uses courseId — for path cert, consider using pathId as a virtual courseId
    // OR add a new certificate type for paths (discuss with team)
  }
}
```

> **Note on Certificate:** Current Certificate model has `@@unique([userId, courseId])`. For path certificates, two options:
> A) Store with `courseId = null` + new `learningPathId` field (requires schema change)
> B) Use a dedicated notification/badge without the existing Certificate model
> **Recommended for now:** Trigger a notification event; certificate schema extension is out-of-scope for this phase.

### Step 6 — Add routes to controller

```typescript
@Post(':id/enroll')
@UseGuards(SupabaseAuthGuard)
async enroll(@Param('id') id: string, @Request() req: any) {
  return this.service.enroll(id, req.user.id);
}

@Get('mine')
@UseGuards(SupabaseAuthGuard)
async findMine(@Request() req: any) {
  return this.service.findMine(req.user.id);
}
```

> **Route order matters:** `GET /mine` must be declared BEFORE `GET /:id` in the controller to avoid Express treating "mine" as an id param.

### Step 7 — Verify AppModule registration

Check `backend/src/app.module.ts` — confirm `LearningPathsModule` is imported. If not, add it.

---

## Todo List

- [ ] Add `LearningPathEnrollment` model to `schema.prisma`
- [ ] Add `enrollments` relation to `LearningPath` model
- [ ] Add `learningPathEnrollments` relation to `Profile` model
- [ ] Run `npx prisma db push`
- [ ] Add `enroll()` to `LearningPathsService`
- [ ] Add `findMine()` to `LearningPathsService`
- [ ] Add course ownership check in `addCourse()` for INSTRUCTOR role
- [ ] Add `checkAndIssueCertificate()` (emit completion event for now)
- [ ] Add `POST /:id/enroll` route to controller (before `GET /:id`)
- [ ] Add `GET /mine` route to controller (before `GET /:id`)
- [ ] Verify `LearningPathsModule` is in `AppModule`
- [ ] Test: POST /learning-paths + enroll + verify course enrollments created
- [ ] Test: GET /learning-paths/mine returns only creator's paths
- [ ] Test: Instructor cannot add another instructor's course

---

## Success Criteria

- [ ] `POST /learning-paths/:id/enroll` creates `LearningPathEnrollment` + N `Enrollment` records
- [ ] Already-enrolled courses skipped (no duplicate enrollment error)
- [ ] `GET /learning-paths/mine` returns only current user's paths
- [ ] Instructor adding another instructor's course → 403 Forbidden
- [ ] Admin can add any course → 200 OK
- [ ] `npx prisma db push` succeeds with no errors

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `GET /mine` parsed as `GET /:id` with id="mine" | Declare mine route BEFORE `:id` route in controller |
| Double enrollment race condition | Use Prisma upsert or catch unique constraint error |
| Certificate schema doesn't support paths | Defer path cert to Phase 4 enhancement; emit event now |
| `Profile` model `@@schema("public")` — LearningPathEnrollment must also be in same schema | Add `@@schema("public")` to new model |

---

## Security Considerations

- `SupabaseAuthGuard` on all write endpoints
- Instructor course ownership check prevents cross-instructor data manipulation
- Admin bypass is explicit (`userRole === 'admin'`) not implicit
- `verifyOwnership()` already handles path ownership check

---

## Next Steps

→ Phase 2 can start: Add `learningPathsApi` to `frontend/lib/api.ts`, create instructor pages
