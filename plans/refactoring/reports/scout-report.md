# Tiny LMS Backend Architecture Scout Report

**Scope:** Comprehensive analysis of ORM mixing patterns, schema models, and service organization  
**Date:** 2026-03-08  
**Target Directory:** `/home/trung/workspace/project/private/tiny-lms/backend/`

---

## 1. COURSESSERVICE - SUPABASE/PRISMA MIXING PATTERN

**File:** `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/courses/courses.service.ts`

### Architecture Overview
The service exhibits **hybrid ORM usage**:

- **Supabase (Client/Admin):** Primary data mutations - all course CRUD (create, update, delete) and most reads
- **Prisma:** Selective operations only - course instructor relationships, quiz cloning logic

### Key Mixing Points

| Operation | ORM | Reason |
|-----------|-----|--------|
| Create course | Supabase | Direct insert into courses table |
| Update course | Supabase | Direct update with .adminClient |
| Delete course | Supabase | Direct delete with .adminClient |
| Find all courses | Supabase | Queries with filtering/pagination |
| Find one course | Supabase | Direct select query |
| Find my courses | Supabase | Filter by enrollments |
| Find instructor courses | Mixed | Prisma for membership check, Supabase for course query |
| Clone course | Mixed | Supabase for sections/lessons, Prisma for quizzes |
| Instructor join table | Prisma | CourseInstructor model only |
| Quiz cloning | Prisma | findMany, include relations |

### Code Evidence
```typescript
// Line 25-44: Supabase insert
const { data, error } = await this.supabase.adminClient
  .from('courses')
  .insert({ ... })
  .select()
  .single();

// Line 47-54: Prisma insert to join table
await this.prisma.courseInstructor.create({
  data: { courseId: data.id, profileId: instructorId, ... }
});

// Line 182-190: Mixed - Prisma for membership, Supabase for courses
const memberships = await this.prisma.courseInstructor.findMany({...});
const courseIds = memberships.map((m) => m.courseId);
query = query.in('id', courseIds);

// Line 388-421: Prisma for quiz cloning
const sourceQuizzes = await this.prisma.quiz.findMany({...});
await this.prisma.quiz.create({...});
```

### Problems Introduced
1. **Consistency Risk:** Course data split between Supabase (main) and Prisma (relationships)
2. **Sync Challenges:** CoursesService creates in Supabase, then inserts CourseInstructor in Prisma (two-step, can fail mid-operation)
3. **Transaction Absence:** No atomic operations across ORMs
4. **Query Inefficiency:** Multiple round-trips (Supabase for course list, separate Prisma query for instructors)

---

## 2. PRISMA SCHEMA ANALYSIS

**File:** `/home/trung/workspace/project/private/tiny-lms/backend/prisma/schema.prisma`

### Core Models Relevant to Refactoring

#### Course Model (Lines 62-96)
```prisma
model Course {
  id            String     @id @default(uuid()) @db.Uuid
  instructorId  String     @map("instructor_id") @db.Uuid
  categoryId    String?    @map("category_id") @db.Uuid
  title         String
  slug          String     @unique
  description   String?    @db.Text
  thumbnailUrl  String?    @map("thumbnail_url")
  level         String     @default("beginner")
  status        String     @default("draft")  // draft, published
  isFree        Boolean    @default(false)    @map("is_free")
  price         Decimal?   @db.Decimal(10, 2)
  createdAt     DateTime   @default(now())   @map("created_at")
  updatedAt     DateTime   @updatedAt        @map("updated_at")
  
  instructor    Profile      @relation("PrimaryInstructor", ...)
  instructors   CourseInstructor[]
  category      Category?
  sections      Section[]
  enrollments   Enrollment[]
  lessonProgress LessonProgress[]
  lessons       Lesson[]
  questionBanks QuestionBank[]
  certificates  Certificate[]
  quizzes       Quiz[]
  payments      Payment[]
  scormPackage  ScormPackage?
  averageRating Float?     @map("average_rating")
  totalReviews  Int        @default(0)     @map("total_reviews")
  reviews       CourseReview[]
}
```

**Issue:** NO prerequisite field. This must be added for learning path support.

#### Quiz Model (Lines 265-300)
```prisma
model Quiz {
  id                    String    @id @default(uuid()) @db.Uuid
  courseId              String    @map("course_id") @db.Uuid
  sectionId             String    @map("section_id") @db.Uuid
  lessonId              String    @unique @map("lesson_id") @db.Uuid
  activityId            String?   @unique @map("activity_id") @db.Uuid
  title                 String
  description           String?
  timeLimitMinutes      Int?      @map("time_limit_minutes")
  maxAttempts           Int?      @map("max_attempts")
  passScore             Decimal?  @map("pass_score") @db.Decimal(10, 2)
  showResult            String    @default("immediately")
  ... (15 more config fields)
  isPublished           Boolean   @default(false)
  availableFrom         DateTime? @map("available_from")
  availableUntil        DateTime? @map("available_until")
  createdAt             DateTime  @default(now())   @map("created_at")
  updatedAt             DateTime  @updatedAt        @map("updated_at")
  
  course   Course        @relation(fields: [courseId], ...)
  section  Section       @relation(fields: [sectionId], ...)
  activity Activity?     @relation(fields: [activityId], ...)
  questions QuizQuestion[]
  attempts  QuizAttempt[]
}
```

#### FlashCardDeck Model (Lines 388-407)
```prisma
model FlashCardDeck {
  id            String    @id @default(uuid()) @db.Uuid
  lessonId      String    @unique @map("lesson_id") @db.Uuid
  activityId    String?   @unique @map("activity_id") @db.Uuid
  title         String
  description   String?
  shuffleCards  Boolean   @default(false)
  isPublished   Boolean   @default(false)
  createdAt     DateTime  @default(now())   @map("created_at")
  updatedAt     DateTime  @updatedAt        @map("updated_at")
  
  lesson        Lesson           @relation(fields: [lessonId], ...)
  activity      Activity?        @relation(fields: [activityId], ...)
  cards         FlashCard[]
  studySessions FlashCardSession[]
}
```

#### Lesson Model (Lines 140-167)
```prisma
model Lesson {
  id             String    @id @default(uuid()) @db.Uuid
  sectionId      String    @map("section_id") @db.Uuid
  courseId       String    @map("course_id") @db.Uuid
  title          String
  type           String
  content        String?   @db.Text
  videoUrl       String?   @map("video_url")
  videoProvider  String?   @map("video_provider")
  pdfUrl         String?   @map("pdf_url")
  durationMins   Int?      @map("duration_mins")
  orderIndex     Int       @default(0)     @map("order_index")
  isPreview      Boolean   @default(false) @map("is_preview")
  isPublished    Boolean   @default(false) @map("is_published")
  createdAt      DateTime  @default(now())   @map("created_at")
  updatedAt      DateTime  @updatedAt        @map("updated_at")
  
  section        Section         @relation(fields: [sectionId], ...)
  course         Course          @relation(fields: [courseId], ...)
  lessonProgress LessonProgress[]
  activities     Activity[]
  flashCardDeck  FlashCardDeck?
  scormPackage   ScormPackage?
}
```

**Issues:**
- NO prerequisites field
- NO completion requirements
- NO dependencies between lessons

#### Activity Model (Lines 116-138)
```prisma
model Activity {
  id            String    @id @default(uuid()) @db.Uuid
  lessonId      String    @map("lesson_id") @db.Uuid
  activityType  String    @map("activity_type") // quiz, flashcard, video, file
  title         String
  orderIndex    Int       @default(0)     @map("order_index")
  isPublished   Boolean   @default(false) @map("is_published")
  
  contentUrl    String?   @map("content_url")
  contentType   String?   @map("content_type")
  
  createdAt     DateTime  @default(now())   @map("created_at")
  updatedAt     DateTime  @updatedAt        @map("updated_at")
  
  lesson        Lesson          @relation(fields: [lessonId], ...)
  quiz          Quiz?
  flashCardDeck FlashCardDeck?
}
```

**Status:** Good design - flexible polymorphic pattern via activityType + conditional relations.

### Missing Models for Learning Path Refactoring
1. **LearningPath** - Not found in schema
2. **Program** - Not found in schema
3. **Prerequisite** - No prerequisite tracking fields on any model
4. **CourseSequence/Pathway** - No model to enforce course/lesson ordering logic

---

## 3. ORM USAGE PATTERN ACROSS ALL SERVICES

### Services Using SUPABASE ONLY
- `auth` - Authentication
- `certificates` - Certificate records
- `courses` - Core course management (ALSO uses Prisma)
- `enrollments` - Enrollment CRUD
- `lessons` - Lesson CRUD (ALSO uses Prisma indirectly via courses)
- `progress` - User progress tracking
- `sections` - Section CRUD
- `users` - User profile management

### Services Using PRISMA ONLY
- `activities` - Activity polymorphism
- `attempts` - Quiz/SCORM attempt tracking
- `departments` - Organization structure
- `flash-cards` - Flash card management
- `grading` - Grading logic
- `notifications` - Notification system
- `organization` - Organization settings
- `payments` - Payment tracking (Sepay integration)
- `question-banks` - Question bank CRUD
- `questions` - Question management
- `quizzes` - Quiz configuration & orchestration
- `reports` - Reporting aggregation
- `scorm` - SCORM package handling
- `settings` - Application settings

### Services Using BOTH
- `certificates` - Reads from Supabase, writes to Prisma (verify)
- `courses` - Supabase primary, Prisma for CourseInstructor & quizzes
- `users` - Supabase primary, Prisma for some queries (verify)

### Summary Statistics
- **Pure Supabase:** 8 services (auth, enrollments, lessons, progress, sections, users, etc.)
- **Pure Prisma:** 14 services (the majority)
- **Hybrid:** 2-3 services (courses is the main problem)

---

## 4. COURSE CONTROLLER ROUTES & FLOW

**File:** `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/courses/courses.controller.ts`

### Endpoint Summary

| Endpoint | Method | Auth | Handler | Service Call |
|----------|--------|------|---------|--------------|
| `/courses` | GET | None | `findAll()` | `coursesService.findAll(query)` |
| `/courses/my-courses` | GET | Yes | `findMyCourses()` | `coursesService.findMyCourses(req.user.id)` |
| `/courses/instructor` | GET | Yes | `findInstructorCourses()` | `coursesService.findInstructorCourses(req.user.id, req.user.role)` |
| `/courses/categories` | GET | None | `getCategories()` | `coursesService.getCategories()` |
| `/courses/:id` | GET | None | `findOne()` | `coursesService.findOne(id)` |
| `/courses` | POST | Yes | `create()` | `coursesService.create(dto, req.user.id)` |
| `/courses/categories` | POST | Yes | `createCategory()` | `coursesService.createCategory(name, slug)` |
| `/courses/:id` | PUT | Yes | `update()` | `coursesService.update(id, dto, req.user.id, req.user.role)` |
| `/courses/:id` | DELETE | Yes | `delete()` | `coursesService.delete(id, req.user.id, req.user.role)` |
| `/courses/:id/clone` | POST | Yes | `clone()` | `coursesService.clone(id, req.user.id, dto, req.user.role)` |

### Request Flow Example (Create Course)
```
POST /courses + CreateCourseDto + Auth token
  → coursesController.create()
    → req.user.id extracted
      → coursesService.create(dto, instructorId)
        → supabase.adminClient.from('courses').insert() [Supabase]
          → Error handling
        → prisma.courseInstructor.create() [Prisma - potential failure point]
          → Returns course object
```

**Risk:** Two-phase operation - Supabase insert followed by Prisma insert. If Prisma fails, Supabase record exists but no instructor relationship.

---

## 5. ENROLLMENT SERVICE

**File:** `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/enrollments/enrollments.service.ts`

### Architecture
- **Pure Supabase** - All operations
- Uses `supabase.client` (public) and `supabase.adminClient` (service role)

### Key Methods

| Method | Operation | ORM |
|--------|-----------|-----|
| `enroll()` | Check course, validate payment, create enrollment | Supabase |
| `checkEnrollment()` | Verify user enrollment status | Supabase |
| `findByUser()` | Get all enrollments for a user with course details | Supabase (join) |
| `findByCourse()` | Get all enrollees in a course (instructor only) | Supabase |
| `unenroll()` | Remove enrollment | Supabase |

### Enrollment Flow
```typescript
async enroll(courseId: string, userId: string) {
  1. Check course exists + published
  2. Validate payment (if !isFree, throw PAYMENT_REQUIRED)
  3. Check not already enrolled
  4. Insert into enrollments table
}
```

**Issue:** No Prisma sync - enrollments exist only in Supabase. If schema migrates to Prisma, must sync.

---

## 6. LESSON MODEL FIELDS & PREREQUISITES

**File:** `/home/trung/workspace/project/private/tiny-lms/backend/prisma/schema.prisma` (Lines 140-167)

### All Lesson Fields
```
id              String    [PK]
sectionId       String    [FK → Section]
courseId        String    [FK → Course]
title           String
type            String              (e.g., "video", "text", "exercise")
content         String?             (text content)
videoUrl        String?
videoProvider   String?             (youtube, vimeo, etc.)
pdfUrl          String?
durationMins    Int?
orderIndex      Int                 (0-based ordering within section)
isPreview       Boolean             (free preview?)
isPublished     Boolean
createdAt       DateTime
updatedAt       DateTime
```

### Ordering Mechanism
- **orderIndex:** Enables lesson sequencing within sections
- **Used by:** LessonsService.findBySection() orders by `order_index`
- **Reordering:** LessonsService.reorder() updates order_index for all lessons in section

### Prerequisite/Dependency Fields
- **MISSING:** No prerequisite fields exist
- **MISSING:** No completion requirement fields
- **MISSING:** No min/max duration for progression

---

## 7. EXISTING LEARNINGPATH & PROGRAM MODELS

**Result:** NONE FOUND

The schema contains **NO LearningPath, Program, or Pathway models**. This is a blank slate for the refactoring.

---

## REFACTORING READINESS ASSESSMENT

### Current State Problems
1. **ORM Fragmentation** - Supabase dominates (courses, lessons, sections, enrollments) but Prisma handles relationships (quizzes, activities, flash cards)
2. **Sync Gaps** - Course creation is multi-step (Supabase → Prisma), risking data inconsistency
3. **No Atomic Transactions** - Can't roll back across both ORMs
4. **Missing Prerequisite Infrastructure** - No fields in schema to support learning paths

### Recommended Refactoring Strategy
1. **Phase 1:** Migrate CoursesService to pure Prisma (highest risk, highest impact)
   - Move all Supabase queries to Prisma equivalents
   - Consolidate CourseInstructor join table operations
   - Add transaction support for multi-step operations
   
2. **Phase 2:** Add LearningPath/Program models to Prisma schema
   - Create Course prerequisite field or separate CoursePrerequisite join table
   - Create Lesson prerequisites (optional - if fine-grained control needed)
   - Create CourseSequence model for pathway ordering
   
3. **Phase 3:** Migrate remaining Supabase services (lessons, sections, enrollments, progress)
   - Less risky since they have fewer dependencies
   - Enables Prisma transaction support throughout

---

## KEY FILES FOR REFACTORING

### Must Read
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/courses/courses.service.ts`
- `/home/trung/workspace/project/private/tiny-lms/backend/prisma/schema.prisma`
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/courses/courses.controller.ts`
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/quizzes/quizzes.service.ts` (pure Prisma reference)

### Supporting Context
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/enrollments/enrollments.service.ts`
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/lessons/lessons.service.ts`
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/activities/activities.service.ts`
- `/home/trung/workspace/project/private/tiny-lms/backend/src/common/supabase.service.ts`
- `/home/trung/workspace/project/private/tiny-lms/backend/src/common/prisma.service.ts`

---

## UNRESOLVED QUESTIONS

1. **Why was CoursesService split between ORMs?** - Was this intentional for performance or historical artifact?
2. **Are there Supabase RLS policies** that prevent full Prisma migration? - Need to check Supabase config
3. **Does LessonsService also need Prisma migration?** - Currently pure Supabase but indirectly relies on lesson data
4. **Are there existing learning path requirements** captured elsewhere (docs, issues)?
5. **Transaction atomicity requirements** - Does the system need ACID guarantees across course/enrollment/payment operations?

