# Course SCORM Integration and Cloning

This document covers SCORM package support (lesson-level and standalone) and the course cloning feature.

See also:
- `course-content-and-activities.md` — Content hierarchy, activity types, prerequisites, drip content
- `course-business-logic.md` — Course data model, lifecycle, instructor management, reviews

---

## 1. SCORM Integration

Courses support SCORM 1.2 and SCORM 2004 in two modes.

### 1.1 Lesson-Level SCORM

- SCORM package attached to a specific Lesson (`ScormPackage.lessonId`)
- Played inline within the lesson viewer
- Progress synced to `LessonProgress` on completion (`isCompleted = true` when status = `"passed"` or `"completed"`)

### 1.2 Standalone Course SCORM

- SCORM package attached to the Course directly (`ScormPackage.courseId`)
- Accessed via the dedicated `/courses/[slug]/scorm` page
- Requires an active enrollment
- 1:1 relationship — at most one standalone package per course

Both modes share the same `ScormAttempt` tracking model with CMI data mapping for SCORM 1.2 and 2004.

### 1.3 Upload and Extraction

```
POST /scorm/upload/lesson/:lessonId   (lesson-level)
POST /scorm/upload/course/:courseId   (standalone)

adm-zip extracts ZIP to public/scorm/{packageId}/
xml2js parses imsmanifest.xml → version, entryPoint, manifestData
ScormPackage row created
```

### 1.4 Runtime Flow

```
Student opens SCORM lesson
  → GET /scorm/package/lesson/:lessonId
  → POST /scorm/attempts/init  →  ScormAttempt row (userId, packageId)
  → Next.js proxy: /scorm/content/* → :3001/scorm/content/*  (same-origin fix)
  → window.API (1.2) or window.API_1484_11 (2004) shim injected before iframe
  → iframe.src = /scorm/content/{packageId}/{entryPoint}
  → LMSSetValue calls → debounced PUT /scorm/attempts/:id
  → LMSFinish / Terminate → POST /scorm/attempts/:id/finish
      ScormAttempt updated (lessonStatus, completionStatus, scoreRaw, suspendData, totalTime)
      LessonProgress synced (isCompleted = true if passed/completed)
```

### 1.5 ScormAttempt Model

| Field | Description |
|-------|-------------|
| `userId` + `packageId` | Unique — one attempt record per user per package (resumable) |
| `lessonStatus` | SCORM 1.2 CMI lesson status |
| `completionStatus` | SCORM 2004 completion status |
| `successStatus` | SCORM 2004 success status |
| `scoreRaw` | Raw score from the package |
| `suspendData` | Bookmark data for resume |
| `totalTime` | Accumulated session time |

---

## 2. Course Cloning

Courses can be duplicated with three quiz handling modes.

### 2.1 Quiz Import Modes

| Mode | Behavior |
|------|----------|
| `none` | Clone structure only (sections + lessons), no quizzes |
| `clone_all` | Clone all quizzes with their question references, mapped to new lesson IDs |
| `import_from_quizzes` | Import questions from selected quizzes into a single new quiz |

### 2.2 Clone Process

```
1. Verify canManageCourse (source course)
2. Create new course (status: draft, new unique slug)
3. Clone sections with orderIndex preserved
4. Clone lessons within each section (build lessonIdMap for quiz mapping)
5. Handle quiz import based on importQuizMode
6. Return new course
```

### 2.3 What Is NOT Cloned

Enrollments, payments, reviews, certificates, SCORM packages, lesson progress, quiz attempts, assignment submissions.

### 2.4 API Endpoint

```
POST /courses/:id/clone
Guard: Auth (canManageCourse)
Body: { importQuizMode: "none" | "clone_all" | "import_from_quizzes", quizIds?: string[] }
```

---

*Document Last Updated: 2026-03-08*
