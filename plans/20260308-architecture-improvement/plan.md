# Architecture Improvement Plan

**Created**: 2026-03-08
**Status**: pending
**Priority**: P0-P3 (phased)
**Scope**: Schema cleanup, ORM standardization, new features

---

## Phase 1: Structural Cleanup (P0 — Tech Debt)

### 1.1 Migrate Supabase → Prisma for Core Services

**Why**: 5 services use Supabase JS client (snake_case, no type safety, no transactions). 14 services use Prisma. This split causes bugs and confusion.

**Services to migrate** (in dependency order):

| # | Service | Lines | Complexity | Notes |
|---|---------|-------|-----------|-------|
| 1 | `CoursesService` | 501 | HIGH | Hybrid (Supabase + Prisma). Core dependency for other services. |
| 2 | `SectionsService` | 153 | LOW | Depends on CoursesService.canManageCourse |
| 3 | `LessonsService` | 224 | MEDIUM | Depends on CoursesService.canManageCourse |
| 4 | `EnrollmentsService` | 143 | LOW | Pure Supabase. No Prisma dependency. |
| 5 | `ProgressService` | 160 | LOW | Pure Supabase. |

**Migration pattern for each service:**
```
1. Replace SupabaseService import → PrismaService
2. Replace snake_case queries → Prisma camelCase queries
3. Replace .from('table').select() → prisma.model.findMany()
4. Replace .insert() → prisma.model.create()
5. Replace .update().eq() → prisma.model.update({ where })
6. Replace .delete().eq() → prisma.model.delete({ where })
7. Keep SupabaseService ONLY in auth guard + auth service
8. Use Prisma transactions where needed (reorder, clone)
9. Update module imports (remove SupabaseService from providers where no longer needed)
```

**Key decisions:**
- `CoursesService.create()`: Currently uses Supabase insert + Prisma CourseInstructor create in two steps. Migrate to single `prisma.$transaction()`.
- `CoursesService.findAll()`: Has N+1 lesson count query. Fix by using Prisma `_count` or denormalized field.
- `LessonsService.reorder()`: Currently `Promise.all` without transaction. Migrate to `prisma.$transaction()`.
- `SectionsService.reorder()`: Same issue.

### 1.2 Remove Legacy `lessonId` from Quiz and FlashCardDeck

**Why**: These fields violate the Activity-centric model. Content connects to Lesson ONLY through Activity.

**Schema changes:**
```prisma
model Quiz {
  // REMOVE: lessonId String @unique @map("lesson_id") @db.Uuid
  // KEEP: activityId String? @unique @map("activity_id") @db.Uuid
  // Make activityId required (non-nullable)
  activityId String @unique @map("activity_id") @db.Uuid
}

model FlashCardDeck {
  // REMOVE: lessonId String @unique @map("lesson_id") @db.Uuid
  // Make activityId required
  activityId String @unique @map("activity_id") @db.Uuid
}

model Lesson {
  // REMOVE: flashCardDeck FlashCardDeck? relation
}
```

**Migration steps:**
1. Create migration to make `activityId` required on Quiz and FlashCardDeck
2. Backfill: For any Quiz/FlashCardDeck that has `lessonId` but no `activityId`, create an Activity record and link it
3. Drop `lessonId` column from both tables
4. Update all service code that references `quiz.lessonId` or `flashCardDeck.lessonId`
5. Update clone logic in CoursesService

**Affected code:**
- `CoursesService.cloneAllQuizzes()` — uses `quiz.lessonId` for mapping
- `CoursesService.importQuestionsFromQuizzes()` — uses `quiz.lessonId`
- Any frontend code referencing lessonId on quiz

### 1.3 Denormalize `lessonCount` on Course

**Schema change:**
```prisma
model Course {
  lessonCount Int @default(0) @map("lesson_count")
}
```

**Recompute pattern** (same as averageRating):
```typescript
async recomputeLessonCount(courseId: string) {
  const count = await this.prisma.lesson.count({ where: { courseId } });
  await this.prisma.course.update({
    where: { id: courseId },
    data: { lessonCount: count },
  });
}
```

**Trigger points:** After lesson create, delete, or move between courses.

---

## Phase 2: Core Missing Features (P1-P2)

### 2.1 Lesson Prerequisites

**Schema:**
```prisma
model Lesson {
  // Add:
  prerequisiteLessonId String? @map("prerequisite_lesson_id") @db.Uuid
  prerequisiteLesson   Lesson? @relation("LessonPrerequisite", fields: [prerequisiteLessonId], references: [id])
  dependentLessons     Lesson[] @relation("LessonPrerequisite")
}
```

**Business rules:**
- A lesson can have ONE prerequisite lesson (simple chain)
- Student must complete prerequisite before accessing the lesson
- Prerequisite must be in the same course
- Preview lessons bypass prerequisites
- Circular dependency check on set

**API changes:**
- `PATCH /lessons/:id` — add `prerequisiteLessonId` field to UpdateLessonDto
- `GET /lessons/:id/learning` — check prerequisite completion before allowing access
- `GET /courses/:id` — include prerequisite info in lesson list

**Service logic:**
```typescript
async checkPrerequisite(lessonId: string, userId: string): Promise<boolean> {
  const lesson = await this.prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { prerequisiteLessonId: true, isPreview: true },
  });
  if (!lesson?.prerequisiteLessonId || lesson.isPreview) return true;

  const progress = await this.prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.prerequisiteLessonId } },
  });
  return progress?.isCompleted ?? false;
}
```

### 2.2 Learning Paths (Multi-Course Programs)

**Schema:**
```prisma
model LearningPath {
  id          String   @id @default(uuid()) @db.Uuid
  title       String
  slug        String   @unique
  description String?  @db.Text
  thumbnailUrl String? @map("thumbnail_url")
  createdBy   String   @map("created_by") @db.Uuid
  isPublished Boolean  @default(false) @map("is_published")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  creator     Profile          @relation(fields: [createdBy], references: [id])
  courses     LearningPathCourse[]

  @@schema("public")
  @@map("learning_paths")
}

model LearningPathCourse {
  id             String   @id @default(uuid()) @db.Uuid
  learningPathId String   @map("learning_path_id") @db.Uuid
  courseId        String   @map("course_id") @db.Uuid
  orderIndex     Int      @default(0) @map("order_index")
  isRequired     Boolean  @default(true) @map("is_required")

  learningPath   LearningPath @relation(fields: [learningPathId], references: [id], onDelete: Cascade)
  course         Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([learningPathId, courseId])
  @@schema("public")
  @@map("learning_path_courses")
}
```

**Profile relation:**
```prisma
model Profile {
  learningPaths LearningPath[]
}

model Course {
  learningPaths LearningPathCourse[]
}
```

**API endpoints:**
| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/learning-paths` | Public | List published paths |
| GET | `/learning-paths/:id` | Public | Get path with courses + progress |
| POST | `/learning-paths` | Auth (admin/instructor) | Create path |
| PATCH | `/learning-paths/:id` | Auth | Update path |
| DELETE | `/learning-paths/:id` | Auth | Delete path |
| POST | `/learning-paths/:id/courses` | Auth | Add course to path |
| DELETE | `/learning-paths/:id/courses/:courseId` | Auth | Remove course |
| PUT | `/learning-paths/:id/courses/reorder` | Auth | Reorder courses |

**Business rules:**
- Only admin or instructor can create/manage paths
- Courses in a path can be required or optional
- Progress = completed required courses / total required courses
- A course can belong to multiple paths

### 2.3 Assignment Activity Type

**Schema:**
```prisma
model Activity {
  // Existing activityType enum gains: "assignment"
  assignment Assignment?
}

model Assignment {
  id            String    @id @default(uuid()) @db.Uuid
  activityId    String    @unique @map("activity_id") @db.Uuid
  instructions  String    @db.Text
  maxScore      Decimal?  @map("max_score") @db.Decimal(10, 2)
  dueDate       DateTime? @map("due_date")
  allowLateSubmission Boolean @default(false) @map("allow_late_submission")
  maxFileSize   Int?      @map("max_file_size") // in MB
  allowedFileTypes String[] @map("allowed_file_types") // pdf, doc, zip, etc.
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  activity      Activity           @relation(fields: [activityId], references: [id], onDelete: Cascade)
  submissions   AssignmentSubmission[]

  @@schema("public")
  @@map("assignments")
}

model AssignmentSubmission {
  id            String    @id @default(uuid()) @db.Uuid
  assignmentId  String    @map("assignment_id") @db.Uuid
  userId        String    @map("user_id") @db.Uuid
  fileUrl       String    @map("file_url")
  fileName      String    @map("file_name")
  comment       String?   @db.Text
  score         Decimal?  @db.Decimal(10, 2)
  feedback      String?   @db.Text
  gradedBy      String?   @map("graded_by") @db.Uuid
  gradedAt      DateTime? @map("graded_at")
  submittedAt   DateTime  @default(now()) @map("submitted_at")

  assignment    Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student       Profile    @relation("StudentSubmissions", fields: [userId], references: [id])
  grader        Profile?   @relation("GraderSubmissions", fields: [gradedBy], references: [id])

  @@unique([assignmentId, userId])
  @@schema("public")
  @@map("assignment_submissions")
}
```

**API endpoints:**
| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/activities/:activityId/assignment` | Auth (instructor) | Create assignment for activity |
| GET | `/assignments/:id` | Auth | Get assignment details |
| POST | `/assignments/:id/submit` | Auth (student) | Submit assignment |
| PATCH | `/assignments/:id/submissions/:subId/grade` | Auth (instructor) | Grade submission |
| GET | `/assignments/:id/submissions` | Auth (instructor) | List all submissions |

---

## Phase 3: Growth Features (P3)

### 3.1 Drip Content

**Schema change:**
```prisma
model Lesson {
  availableAfterDays Int? @map("available_after_days") // Days after enrollment
  availableFrom      DateTime? @map("available_from")   // Fixed date
}
```

**Logic:**
```typescript
async isLessonAvailable(lesson, enrollment): boolean {
  if (lesson.availableFrom && new Date() < lesson.availableFrom) return false;
  if (lesson.availableAfterDays) {
    const unlockDate = addDays(enrollment.enrolledAt, lesson.availableAfterDays);
    return new Date() >= unlockDate;
  }
  return true;
}
```

### 3.2 Certificate Enhancement

**Schema change:**
```prisma
model Certificate {
  // Add:
  certificateNumber String? @unique @map("certificate_number")
  templateData      Json?   @map("template_data") // Template customization
  pdfUrl            String? @map("pdf_url")
}
```

**Auto-issue on course completion:**
- When all required lessons are completed → auto-generate certificate
- Generate unique certificate number
- Store PDF URL (generated via template)

### 3.3 Bulk Enrollment (B2B)

**API:**
```
POST /enrollments/bulk
Body: { courseId, userIds: string[] }
Guard: Admin only
```

**Logic:**
- Validate all users exist
- Skip already enrolled
- Create enrollments in transaction
- Return success/skipped counts

---

## Implementation Order

```
Phase 1.1: Migrate CoursesService → Prisma (P0)
Phase 1.1: Migrate SectionsService → Prisma
Phase 1.1: Migrate LessonsService → Prisma
Phase 1.1: Migrate EnrollmentsService → Prisma
Phase 1.1: Migrate ProgressService → Prisma
Phase 1.3: Add lessonCount denormalization
Phase 1.2: Remove legacy lessonId (requires data migration)
Phase 2.1: Lesson Prerequisites
Phase 2.2: Learning Paths
Phase 2.3: Assignment Activity Type
Phase 3.1: Drip Content
Phase 3.2: Certificate Enhancement
Phase 3.3: Bulk Enrollment
```

## Files to Create/Modify

### New Files:
- `backend/src/modules/learning-paths/learning-paths.module.ts`
- `backend/src/modules/learning-paths/learning-paths.service.ts`
- `backend/src/modules/learning-paths/learning-paths.controller.ts`
- `backend/src/modules/learning-paths/dto/learning-path.dto.ts`
- `backend/src/modules/assignments/assignments.module.ts`
- `backend/src/modules/assignments/assignments.service.ts`
- `backend/src/modules/assignments/assignments.controller.ts`
- `backend/src/modules/assignments/dto/assignment.dto.ts`
- `backend/prisma/migrations/XXXXXX_architecture_improvement/migration.sql`

### Modified Files:
- `backend/prisma/schema.prisma` — All schema changes
- `backend/src/modules/courses/courses.service.ts` — Supabase → Prisma
- `backend/src/modules/courses/courses.module.ts` — Remove SupabaseService
- `backend/src/modules/sections/sections.service.ts` — Supabase → Prisma
- `backend/src/modules/sections/sections.module.ts` — Remove SupabaseService
- `backend/src/modules/lessons/lessons.service.ts` — Supabase → Prisma + prerequisites
- `backend/src/modules/lessons/lessons.module.ts` — Remove SupabaseService
- `backend/src/modules/enrollments/enrollments.service.ts` — Supabase → Prisma + bulk
- `backend/src/modules/enrollments/enrollments.module.ts` — Remove SupabaseService
- `backend/src/modules/progress/progress.service.ts` — Supabase → Prisma
- `backend/src/modules/progress/progress.module.ts` — Remove SupabaseService
- `backend/src/modules/activities/activities.service.ts` — Assignment support
- `backend/src/app.module.ts` — Register new modules
- `backend/test/helpers/mock-prisma.ts` — Add new models
- `backend/test/helpers/mock-factories.ts` — Add new factories
- `docs/course-business-logic.md` — Update with new features
- `docs/system-architecture.md` — Update architecture
- `docs/project-roadmap.md` — Update roadmap
