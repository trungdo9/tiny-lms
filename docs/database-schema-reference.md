# Database Schema Reference

This document lists all Prisma models grouped by domain with their key fields.

See also: `system-architecture.md` section 4 for the entity relationship overview and index table.

---

## Core Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| Profile | `profiles` | role, isActive, emailVerified, departmentId |
| Category | `categories` | name, slug, parentId (hierarchy) |
| Course | `courses` | instructorId, status, isFree, price, lessonCount, averageRating, totalReviews |
| Section | `sections` | courseId, orderIndex |
| Lesson | `lessons` | sectionId, courseId, type, isPreview, isPublished, prerequisiteLessonId, availableAfterDays, availableFrom |
| Enrollment | `enrollments` | userId, courseId (unique) |
| LessonProgress | `lesson_progress` | userId, lessonId (unique), isCompleted, lastPosition |

---

## Content Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| Activity | `activities` | lessonId, activityType (`quiz`/`flashcard`/`video`/`file`/`assignment`), contentUrl, isPublished |
| Assignment | `assignments` | activityId (unique), instructions, maxScore, dueDate, allowLateSubmission, allowedFileTypes |
| AssignmentSubmission | `assignment_submissions` | assignmentId, userId (unique together), fileUrl, score, feedback, gradedBy |
| FlashCardDeck | `flash_card_decks` | lessonId (unique), activityId (unique) |
| FlashCard | `flash_cards` | deckId, front, back, hint, imageUrl, orderIndex |
| FlashCardSession | `flash_card_sessions` | deckId, userId, knownCards, unknownCards |

---

## Quiz Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| QuestionBank | `question_banks` | courseId, createdBy |
| Question | `questions` | bankId, type, difficulty, tags |
| QuestionOption | `question_options` | questionId, isCorrect, matchKey, matchValue |
| Quiz | `quizzes` | courseId, sectionId, lessonId, activityId (unique) |
| QuizQuestion | `quiz_questions` | quizId, questionId (or bankId for random pick) |
| QuizAttempt | `quiz_attempts` | quizId, userId, status, expiresAt, isPassed |
| AttemptQuestion | `attempt_questions` | attemptId, questionId, isFlagged, optionsOrder |
| QuizAnswer | `quiz_answers` | attemptId, questionId, selectedOptions, textAnswer |

---

## SCORM Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| ScormPackage | `scorm_packages` | lessonId (unique), courseId (unique), version, entryPoint, extractedPath |
| ScormAttempt | `scorm_attempts` | userId, packageId (unique together), lessonStatus, completionStatus, scoreRaw, suspendData |

---

## Learning Path Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| LearningPath | `learning_paths` | slug (unique), createdBy, isPublished |
| LearningPathCourse | `learning_path_courses` | learningPathId, courseId (unique together), orderIndex, isRequired |
| LearningPathEnrollment | `learning_path_enrollments` | learningPathId, studentId (unique together), enrolledAt, completedAt, certificateId |

---

## Course Interaction Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| CourseReview | `course_reviews` | courseId, userId (unique together), rating (1–5), comment |
| CourseInstructor | `course_instructors` | courseId, profileId (unique together), role (`primary`/`co_instructor`) |
| Certificate | `certificates` | userId, courseId (unique), certificateNumber (unique), templateData (JSON), pdfUrl |
| Payment | `payments` | userId, courseId (unique), amount, status, qrCodeUrl |

---

## Organization & Department Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| Organization | `organizations` | slug (unique), name, email, phone, logoUrl, socialLinks |
| Department | `departments` | organizationId, parentId (tree), slug, status, orderIndex |

---

## Supporting Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| Notification | `notifications` | userId, type, isRead |
| Setting | `settings` | key (unique), value, category |
| EmailTemplate | `email_templates` | slug (unique), subject, body (HTML) |
| EmailLog | `email_logs` | templateSlug, to, status (`pending`/`sent`/`failed`) |

---

## Schema Conventions

- UUID primary keys: `@id @default(uuid()) @db.Uuid`
- Timestamps: `createdAt` / `updatedAt` on all mutable models
- Table names: `@@map("snake_case")`
- Column names: `@map("snake_case")`
- Soft deletes: `isActive` flag on Profile
- String-based enums stored as plain strings (e.g., role: `"student"`, `"instructor"`, `"admin"`)
- All schemas declared under `@@schema("public")`

---

*Document Last Updated: 2026-03-08*
