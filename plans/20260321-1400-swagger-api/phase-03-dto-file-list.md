# Phase 3: DTO File List

Reference for [phase-03-dto-annotations.md](./phase-03-dto-annotations.md).

All 18 DTO files found under `backend/src/modules/**/dto/` that require `@ApiProperty` annotation.
The `auth/dto/auth.dto.ts` file is excluded — created and annotated in Phase 1.

## File List

| File | Classes inside | Notes |
|------|---------------|-------|
| `courses/dto/course.dto.ts` | `CreateCourseDto`, `UpdateCourseDto`, `CourseQueryDto`, `CloneCourseDto`, `CreateCategoryDto`, `UpdateCategoryDto` | Largest DTO file; query DTO also needs annotation |
| `courses/dto/review.dto.ts` | `CreateReviewDto`, `UpdateReviewDto` (expected) | |
| `courses/dto/course-instructor.dto.ts` | `AddInstructorDto` (expected) | |
| `sections/dto/section.dto.ts` | `CreateSectionDto`, `UpdateSectionDto`, `ReorderSectionsDto` (expected) | May include reorder array |
| `lessons/dto/lesson.dto.ts` | `CreateLessonDto`, `UpdateLessonDto` | May include prerequisite/drip fields |
| `activities/dto/activity.dto.ts` | `CreateActivityDto`, `UpdateActivityDto`, `ReorderActivitiesDto` (expected) | |
| `question-banks/dto/question-bank.dto.ts` | `CreateQuestionBankDto`, `UpdateQuestionBankDto` | |
| `questions/dto/question.dto.ts` | `CreateQuestionDto`, `UpdateQuestionDto`, option-related DTOs | May have nested option arrays |
| `quizzes/dto/quiz.dto.ts` | `CreateQuizDto`, `UpdateQuizDto`, `QuizConfigDto` (expected) | |
| `attempts/dto/attempt.dto.ts` | `StartAttemptDto`, `AnswerQuestionDto`, `FlagQuestionDto`, `SubmitAttemptDto` (expected) | Attempt lifecycle |
| `flash-cards/dto/flash-card.dto.ts` | `CreateDeckDto`, `UpdateDeckDto`, `CreateCardDto`, `UpdateCardDto` (expected) | |
| `assignments/dto/assignment.dto.ts` | `CreateAssignmentDto`, `UpdateAssignmentDto`, `SubmitAssignmentDto`, `GradeSubmissionDto` (expected) | |
| `payments/dto/create-payment.dto.ts` | `CreatePaymentDto` | Single field: `courseId` |
| `payments/dto/webhook.dto.ts` | `SepayWebhookDto` | SePay payload — use generic examples |
| `organization/dto/update-organization.dto.ts` | `UpdateOrganizationDto` | |
| `departments/dto/department.dto.ts` | `CreateDepartmentDto`, `UpdateDepartmentDto` | Tree structure |
| `scorm/dto/scorm.dto.ts` | `InitAttemptDto`, `UpdateAttemptDto` | SCORM runtime tracking fields |
| `learning-paths/dto/learning-path.dto.ts` | `CreateLearningPathDto`, `UpdateLearningPathDto`, `ReorderCoursesDto` (expected) | |

## Files to Verify Exist (No DTO Files Found in Glob)

These modules had no DTO files in the glob results — confirm whether they use inline types or separate DTO files before Phase 3:

- `enrollments/dto/` — bulk enrollment uses CSV/Excel upload (multipart); may have no class DTO
- `progress/dto/` — progress updates may use inline body
- `grading/dto/` — grading payload may be inline
- `notifications/dto/` — notification mark-read may be inline
- `users/dto/` — user update may be inline or share a common DTO
- `reports/dto/` — reports are GET-only (query params), likely no body DTOs
- `settings/dto/` — key-value updates may be inline
- `emails/dto/` — email template/send payloads may be inline
- `certificates/dto/` — certificate issue is event-driven, likely no body DTO
- `contact-sync/dto/` — check if directory exists

## Annotation Priority Order

High complexity first (most fields, most classes):

1. `courses/dto/course.dto.ts`
2. `attempts/dto/attempt.dto.ts`
3. `assignments/dto/assignment.dto.ts`
4. `questions/dto/question.dto.ts`
5. `lessons/dto/lesson.dto.ts`
6. `flash-cards/dto/flash-card.dto.ts`
7. `quizzes/dto/quiz.dto.ts`
8. `sections/dto/section.dto.ts`
9. `activities/dto/activity.dto.ts`
10. `learning-paths/dto/learning-path.dto.ts`
11. `departments/dto/department.dto.ts`
12. `question-banks/dto/question-bank.dto.ts`
13. `scorm/dto/scorm.dto.ts`
14. `courses/dto/review.dto.ts`
15. `courses/dto/course-instructor.dto.ts`
16. `organization/dto/update-organization.dto.ts`
17. `payments/dto/create-payment.dto.ts`
18. `payments/dto/webhook.dto.ts`
