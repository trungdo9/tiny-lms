# Course Content and Activities

This document covers the content hierarchy inside a course: sections, lessons, activity types (quiz, flashcard, video, file, assignment), lesson prerequisites, and drip content.

See also:
- `course-business-logic.md` — Course data model, lifecycle, instructor management, reviews, API endpoints
- `course-enrollment-and-learning-paths.md` — Enrollment flows, bulk enrollment, learning paths
- `course-scorm-and-cloning.md` — SCORM integration and course cloning

---

## 1. Content Hierarchy

```
Course
 └── Section[] (ordered by orderIndex)
      └── Lesson[] (ordered by orderIndex)
           ├── Activity[] (ordered by orderIndex)  ← ALL inline content goes through Activity
           │    ├── activityType: "quiz"        → Quiz (1:1 via activityId)
           │    ├── activityType: "flashcard"   → FlashCardDeck (1:1 via activityId)
           │    ├── activityType: "video"       → contentUrl + contentType (self-contained)
           │    ├── activityType: "file"        → contentUrl + contentType (self-contained)
           │    └── activityType: "assignment"  → Assignment (1:1 via activityId)
           ├── ScormPackage? (1:1, lesson-level SCORM — separate from Activity)
           └── LessonProgress[] (per student)
```

---

## 2. Activity-Centric Model

**Activity is the sole inline content container within a lesson.** Quiz, FlashCardDeck, and Assignment have no direct relationship to Lesson — they are always accessed through an Activity.

```
Lesson ──(1:N)──► Activity ──(1:1)──► Quiz
                                    ► FlashCardDeck
                                    ► Assignment
                                    ► (or self-contained video/file)
```

| activityType | Linked Entity | Content Storage |
|-------------|---------------|-----------------|
| `quiz` | Quiz (1:1 via `activityId`) | QuizQuestion → Question from QuestionBank |
| `flashcard` | FlashCardDeck (1:1 via `activityId`) | FlashCard[] within deck |
| `video` | None (self-contained) | `contentUrl` + `contentType` (youtube/vimeo/upload) |
| `file` | None (self-contained) | `contentUrl` + `contentType` (pdf/doc/etc.) |
| `assignment` | Assignment (1:1 via `activityId`) | Instructions + submission tracking |

### Activity Lifecycle

```
1. Instructor creates Activity with activityType + title
2. For quiz/flashcard/assignment: linked entity is created separately
   and connected via activityId
3. For video/file: content stored directly on Activity (contentUrl, contentType)
4. Activities are ordered within a lesson via orderIndex
5. Deleting an Activity cascades: removes linked Quiz, FlashCardDeck, or Assignment
```

### Key Rules

- Each Lesson belongs to exactly one Section and one Course
- Each Lesson can have many Activities
- Each Activity links to at most one Quiz, one FlashCardDeck, or one Assignment (via `@unique activityId`)
- ScormPackage is separate from Activity — it has a direct 1:1 link to Lesson
- Quizzes pull questions from QuestionBanks via the QuizQuestion join table
- Deleting an Activity cascades to the linked content entity

---

## 3. Assignment Activity Type

Assignments are a fifth activity type alongside quiz, flashcard, video, and file.

### Models

**Assignment** (linked to Activity 1:1 via `activityId`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `activityId` | UUID (unique) | FK to Activity |
| `instructions` | text | Assignment description/brief |
| `maxScore` | Decimal? | Maximum achievable score |
| `dueDate` | DateTime? | Submission deadline |
| `allowLateSubmission` | boolean | Whether late submissions are accepted |
| `maxFileSize` | int? | Max upload size in MB |
| `allowedFileTypes` | string[] | e.g., `["pdf", "doc", "zip"]` |

**AssignmentSubmission** (one per student per assignment via `@@unique([assignmentId, userId])`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `assignmentId` | UUID | FK to Assignment |
| `userId` | UUID | FK to Profile (student) |
| `fileUrl` | string | Uploaded file location |
| `fileName` | string | Original filename |
| `comment` | text? | Student's submission note |
| `score` | Decimal? | Grade awarded by instructor |
| `feedback` | text? | Instructor feedback |
| `gradedBy` | UUID? | FK to Profile (grader) |
| `gradedAt` | DateTime? | When grading was completed |
| `submittedAt` | DateTime | Submission timestamp |

### Workflow

```
Instructor:
  POST /assignments/activity/:activityId       Create assignment for an activity
  PUT  /assignments/:id                        Update assignment details
  GET  /assignments/:id/submissions            List all student submissions
  PATCH /assignments/submissions/:subId/grade  Grade a submission (score + feedback)

Student:
  GET  /assignments/:id        View assignment details and own submission status
  POST /assignments/:id/submit Submit file (upsert — one submission per student)
```

### Business Rules

- Only one submission per student per assignment (upsert pattern — resubmission replaces previous)
- Late submissions are accepted only when `allowLateSubmission = true`
- Grading is manual — instructor assigns `score` and optional `feedback`
- Deleting the parent Activity cascades to the Assignment and all its submissions

---

## 4. Lesson Prerequisites

A lesson can require completion of one other lesson before access is granted.

### Schema Fields (on Lesson)

| Field | Type | Description |
|-------|------|-------------|
| `prerequisiteLessonId` | UUID? | FK to another Lesson in the same course |

### Business Rules

- A lesson can have at most one prerequisite (simple chain, not a graph)
- The prerequisite must belong to the same course — cross-course prerequisites are rejected
- Self-referencing (`prerequisiteLessonId = id`) is not allowed
- Preview lessons (`isPreview = true`) bypass all prerequisite checks
- If the prerequisite is not completed, `GET /lessons/:id/learning` returns a 403

### Access Check Logic (inside `LessonsService.findOneForLearning()`)

```typescript
if (!lesson.prerequisiteLessonId || lesson.isPreview) return; // no gate

const progress = await prisma.lessonProgress.findUnique({
  where: { userId_lessonId: { userId, lessonId: lesson.prerequisiteLessonId } },
});
if (!progress?.isCompleted) throw new ForbiddenException('Prerequisite not completed');
```

---

## 5. Drip Content

Lessons can be time-locked to release on a schedule relative to enrollment date or a fixed calendar date.

### Schema Fields (on Lesson)

| Field | Type | Description |
|-------|------|-------------|
| `availableAfterDays` | int? | Days after `enrolledAt` before the lesson unlocks |
| `availableFrom` | DateTime? | Fixed calendar date when the lesson becomes available |

Both fields are optional and independent. If both are set, both conditions must pass.

### Availability Logic (inside `LessonsService.findOneForLearning()`)

```typescript
if (lesson.availableFrom && new Date() < lesson.availableFrom) {
  throw new ForbiddenException('Lesson not yet available');
}
if (lesson.availableAfterDays) {
  const unlockDate = addDays(enrollment.enrolledAt, lesson.availableAfterDays);
  if (new Date() < unlockDate) throw new ForbiddenException('Lesson not yet available');
}
```

### Interaction with Prerequisites

Drip content availability and prerequisites are checked independently. Both must pass before a student can access a lesson. The availability check runs first.

---

*Document Last Updated: 2026-03-08*
