# Phase 2: Controller Tag Map

Reference for [phase-02-controller-annotations.md](./phase-02-controller-annotations.md).

## Tag Assignments and Bearer Auth Placement

| Controller file | Tag | Guard scope | `@ApiBearerAuth` placement |
|----------------|-----|-------------|---------------------------|
| `courses/courses.controller.ts` | `courses` | Mixed (some public) | Per-method |
| `courses/reviews.controller.ts` | `courses` | Mixed | Per-method |
| `courses/course-instructors.controller.ts` | `courses` | All guarded | Class-level |
| `sections/sections.controller.ts` | `sections` | All guarded | Class-level |
| `lessons/lessons.controller.ts` | `lessons` | All guarded | Class-level |
| `activities/activities.controller.ts` | `activities` | All guarded | Class-level |
| `enrollments/enrollments.controller.ts` | `enrollments` | All guarded | Class-level |
| `progress/progress.controller.ts` | `progress` | All guarded | Class-level |
| `question-banks/question-banks.controller.ts` | `question-banks` | All guarded | Class-level |
| `question-banks/import/import.controller.ts` | `question-banks` | All guarded | Class-level |
| `questions/questions.controller.ts` | `questions` | All guarded | Class-level |
| `quizzes/quizzes.controller.ts` | `quizzes` | All guarded | Class-level |
| `attempts/attempts.controller.ts` | `attempts` | All guarded | Class-level |
| `grading/grading.controller.ts` | `grading` | All guarded | Class-level |
| `flash-cards/flash-cards.controller.ts` | `flash-cards` | All guarded | Class-level |
| `assignments/assignments.controller.ts` | `assignments` | All guarded | Class-level |
| `users/users.controller.ts` | `users` | All guarded | Class-level |
| `reports/reports.controller.ts` | `reports` | All guarded | Class-level |
| `notifications/notifications.controller.ts` | `notifications` | All guarded | Class-level |
| `certificates/certificates.controller.ts` | `certificates` | Mixed (public verify) | Per-method |
| `scorm/scorm.controller.ts` | `scorm` | All guarded (class-level guard) | Class-level |
| `payments/payments.controller.ts` | `payments` | Mixed (webhook unauthenticated) | Per-method |
| `organization/organization.controller.ts` | `organization` | All guarded | Class-level |
| `departments/departments.controller.ts` | `departments` | All guarded | Class-level |
| `settings/settings.controller.ts` | `settings` | All guarded | Class-level |
| `emails/emails.controller.ts` | `emails` | All guarded | Class-level |
| `learning-paths/learning-paths.controller.ts` | `learning-paths` | All guarded | Class-level |
| `contact-sync/contact-sync.controller.ts` | `contact-sync` | All guarded | Class-level |
| `contact-sync/contact-sync-webhook.controller.ts` | `contact-sync` | No guard | None |

## Special Cases

| Endpoint | Special annotation |
|----------|--------------------|
| `POST /payments/webhook` | `@ApiHeader({ name: 'authorization', description: 'Bearer <SEPAY_WEBHOOK_SECRET>' })` — not `@ApiBearerAuth()` |
| `POST /scorm/upload/lesson/:id` | `@ApiConsumes('multipart/form-data')` + `@ApiBody` with file field |
| `POST /scorm/upload/course/:id` | Same as above |
| `GET /certificates/verify/:number` | Public — no `@ApiBearerAuth()` |
| `GET /courses`, `GET /courses/:id`, `GET /courses/categories` | Public — no `@ApiBearerAuth()` |

## Suggested Processing Order

courses → sections → lessons → activities → enrollments → progress →
question-banks → questions → quizzes → attempts → grading →
flash-cards → assignments → users → reports → notifications →
certificates → scorm → payments → organization → departments →
settings → emails → learning-paths → contact-sync
