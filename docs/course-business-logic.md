# Course Business Logic

This document is the top-level reference for the Course entity: data model, relationships, lifecycle, instructor management, reviews, and API endpoints.

**Sub-topic documents:**
- `course-content-and-activities.md` — Content hierarchy, activity types (quiz, flashcard, video, file, assignment), lesson prerequisites, drip content
- `course-enrollment-and-learning-paths.md` — Enrollment flows, bulk enrollment, learning paths, certificate enhancement
- `course-scorm-and-cloning.md` — SCORM integration and course cloning

---

## 1. Data Model

### Core Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | UUID | auto | Primary key |
| `instructorId` | UUID | required | Primary instructor (Profile FK) |
| `categoryId` | UUID? | null | Optional category classification |
| `title` | string | required | Course title |
| `slug` | string | auto | URL-friendly unique identifier |
| `description` | text? | null | Full course description |
| `thumbnailUrl` | string? | null | Course thumbnail image |
| `level` | string | `"beginner"` | `beginner` / `intermediate` / `advanced` |
| `status` | string | `"draft"` | `draft` / `published` / `archived` |
| `isFree` | boolean | `false` | Whether the course is free |
| `price` | Decimal? | null | Course price (VND), Decimal(10,2) |
| `lessonCount` | int | `0` | Denormalized lesson count, recomputed on lesson create/delete |
| `averageRating` | float? | null | Denormalized average review rating |
| `totalReviews` | int | `0` | Denormalized total review count |

### Slug Generation

Slugs are auto-generated from the title:
```
title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)
```
The base36 timestamp suffix ensures uniqueness even for identical titles.

### Denormalized Fields

| Field | Trigger | Method |
|-------|---------|--------|
| `lessonCount` | Lesson create / delete / move | Count `lessons` where `courseId`, update course |
| `averageRating` | Review create / update / delete | `_avg.rating` aggregate, update course |
| `totalReviews` | Review create / update / delete | `_count.rating` aggregate, update course |

---

## 2. Entity Relationships

```
                         ┌──────────────────┐
                         │     Category      │
                         │  (optional, N:1)  │
                         └────────┬─────────┘
                                  │
┌──────────┐              ┌───────┴────────┐              ┌──────────────┐
│ Profile   │─────────────│    COURSE      │──────────────│  Enrollment  │
│(instructor│  1:N primary│                │  1:N         │  (students)  │
│  owner)   │             │                │              └──────────────┘
└──────────┘              │                │
      │                   │                │              ┌──────────────┐
      │ M:N via           │                │──────────────│   Payment    │
      │ CourseInstructor  │                │  1:N         │  (SePay QR)  │
      │                   │                │              └──────────────┘
      └───────────────────│                │
                          │                │              ┌──────────────┐
                          │                │──────────────│   Section    │
                          │                │  1:N         │  └─ Lesson[] │
                          │                │              └──────────────┘
                          │                │
                          │                │──── 1:N ────── Lesson[] (direct shortcut)
                          │                │──── 1:N ────── Quiz[]
                          │                │──── 1:N ────── QuestionBank[]
                          │                │──── 1:N ────── Certificate[]
                          │                │──── 1:N ────── LessonProgress[]
                          │                │──── 1:N ────── CourseReview[]
                          │                │──── 1:1? ───── ScormPackage?
                          │                │──── M:N ────── LearningPath (via LearningPathCourse)
                          └────────────────┘
```

### Relationship Details

| Relation | Type | Model | On Delete | Description |
|----------|------|-------|-----------|-------------|
| `instructor` | N:1 | Profile | — | Primary instructor (required) |
| `instructors` | M:N | CourseInstructor | Cascade | All instructors (primary + co-instructors) |
| `category` | N:1 | Category | — | Optional hierarchical category |
| `sections` | 1:N | Section | Cascade | Course structure containers |
| `lessons` | 1:N | Lesson | Cascade | Direct lesson reference (shortcut) |
| `enrollments` | 1:N | Enrollment | — | Student enrollments |
| `lessonProgress` | 1:N | LessonProgress | — | Per-student per-lesson progress |
| `quizzes` | 1:N | Quiz | — | Quizzes belonging to this course |
| `questionBanks` | 1:N | QuestionBank | — | Question banks scoped to course |
| `certificates` | 1:N | Certificate | — | Certificates issued for this course |
| `payments` | 1:N | Payment | Cascade | Payment records (1 per user max via unique) |
| `reviews` | 1:N | CourseReview | Cascade | Student reviews (1 per user via unique) |
| `scormPackage` | 1:1 | ScormPackage | Cascade | Standalone SCORM package (optional) |
| `learningPaths` | M:N | LearningPathCourse | Cascade | Learning paths this course belongs to |

---

## 3. Instructor Management

### Dual Instructor Pattern

Courses use a dual ownership model:

1. **Primary Instructor** (`instructorId` FK on Course): The original creator. Only the primary instructor or an admin can delete the course.
2. **CourseInstructor join table**: Tracks all instructors (primary + co-instructors). Used for authorization via `canManageCourse()`.

```typescript
// Authorization check — injected into Sections, Lessons, Quizzes services
async canManageCourse(courseId, userId, userRole): boolean
  - Admin → always true
  - Otherwise → checks CourseInstructor membership
```

### Permission Matrix

| Action | Primary Instructor | Co-Instructor | Admin | Student |
|--------|-------------------|---------------|-------|---------|
| View (published) | Yes | Yes | Yes | Yes |
| Edit course metadata | Yes | Yes | Yes | No |
| Manage sections/lessons | Yes | Yes | Yes | No |
| Manage quizzes | Yes | Yes | Yes | No |
| Delete course | Yes | No | Yes | No |
| Clone course | Yes | Yes | Yes | No |

---

## 4. Course Lifecycle

### Status Flow

```
  draft ──────► published ──────► archived
    ▲               │
    └───────────────┘ (can unpublish)
```

### Business Rules by Status

| Status | Visible to Students | Enrollable | Editable |
|--------|-------------------|------------|----------|
| `draft` | No | No | Yes |
| `published` | Yes | Yes | Yes |
| `archived` | Listed but not enrollable | No | Yes |

### Course Creation Flow

```
1. Instructor calls POST /courses with title, description, etc.
2. System generates unique slug from title
3. prisma.$transaction:
   a. Course created with status = "draft"
   b. Primary instructor synced to CourseInstructor join table (role: "primary")
4. Instructor adds sections → lessons → activities
5. Instructor sets status to "published" when ready
```

---

## 5. Course Reviews

### Rules

- Only enrolled students can submit reviews
- One review per student per course (`@@unique([courseId, userId])`)
- Reviews use the upsert pattern (create or update on second submission)
- Admin or review owner can delete

### Denormalized Rating Recompute

When a review is created, updated, or deleted:
```typescript
recomputeRating(courseId):
  aggregate → _avg.rating, _count.rating
  course.update → averageRating, totalReviews
```

This avoids expensive aggregation queries on course listing pages.

---

## 6. Reporting & Analytics

### Course-Level Reports (Instructor)

`getCourseReport(courseId, instructorId)`:
- Enrollment count, completion rate
- Per-student progress (completed lessons / total lessons)
- Quiz summary with attempt counts

`getCourseStudents(courseId, instructorId)`:
- Student list with progress percentage and completed lesson count

### Top Courses (Admin)

`getTopCourses(limit)`: ordered by enrollment count descending, used for admin dashboard.

### Revenue Stats

Revenue is tracked through the Payment model with `status: "completed"` and aggregated by month using raw SQL.

---

## 7. API Endpoints

### Course Core

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/courses` | Public | List published courses (paginated, with filters) |
| GET | `/courses/:id` | Public | Get course with sections/lessons |
| POST | `/courses` | Auth | Create new course |
| PATCH | `/courses/:id` | Auth | Update course (canManageCourse) |
| DELETE | `/courses/:id` | Auth | Delete course (primary/admin only) |
| POST | `/courses/:id/clone` | Auth | Clone course |
| GET | `/courses/my` | Auth | Get enrolled courses |
| GET | `/courses/instructor` | Auth | Get instructor's courses |
| GET | `/courses/categories` | Public | List categories |
| POST | `/courses/categories` | Auth | Create category |

### Reviews

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/courses/:courseId/reviews` | Public | List reviews (paginated) |
| GET | `/courses/:courseId/reviews/stats` | Public | Get rating stats + distribution |
| POST | `/courses/:courseId/reviews` | Auth | Create/update review |
| DELETE | `/courses/:courseId/reviews/:id` | Auth | Delete review |

### Enrollments

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/enrollments` | Auth | Enroll in a free course |
| POST | `/enrollments/bulk` | Auth (admin) | Bulk enroll multiple users |

### Learning Paths

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/learning-paths` | Public | List published learning paths |
| GET | `/learning-paths/:id` | Public | Get path with courses |
| GET | `/learning-paths/:id/progress` | Auth | Get path progress for current user |
| POST | `/learning-paths` | Auth (admin/instructor) | Create learning path |
| PUT | `/learning-paths/:id` | Auth (owner/admin) | Update path |
| DELETE | `/learning-paths/:id` | Auth (owner/admin) | Delete path |
| POST | `/learning-paths/:id/courses` | Auth (owner/admin) | Add course to path |
| DELETE | `/learning-paths/:id/courses/:courseId` | Auth (owner/admin) | Remove course |
| PUT | `/learning-paths/:id/courses/reorder` | Auth (owner/admin) | Reorder courses |

### Assignments

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/assignments/activity/:activityId` | Auth (instructor) | Create assignment |
| GET | `/assignments/:id` | Auth | Get assignment details |
| PUT | `/assignments/:id` | Auth (instructor) | Update assignment |
| POST | `/assignments/:id/submit` | Auth (student) | Submit assignment |
| PATCH | `/assignments/submissions/:subId/grade` | Auth (instructor) | Grade submission |
| GET | `/assignments/:id/submissions` | Auth (instructor) | List all submissions |

---

## 8. Database Indexes & Constraints

| Constraint | Type | Purpose |
|-----------|------|---------|
| `courses.slug` | Unique | URL-based course lookup |
| `enrollments(userId, courseId)` | Unique | One enrollment per user |
| `payments(userId, courseId)` | Unique | One active payment per user |
| `course_reviews(courseId, userId)` | Unique | One review per user |
| `scorm_packages.lessonId` | Unique | One SCORM per lesson |
| `scorm_packages.courseId` | Unique | One standalone SCORM per course |
| `course_instructors(courseId, profileId)` | Unique | One membership per instructor |
| `learning_path_courses(learningPathId, courseId)` | Unique | One entry per course per path |
| `assignment_submissions(assignmentId, userId)` | Unique | One submission per student |
| `course_reviews.courseId` | Index | Fast review queries by course |
| `course_instructors.courseId` | Index | Fast instructor lookup |
| `course_instructors.profileId` | Index | Fast course lookup by instructor |

---

*Document Last Updated: 2026-03-08*
