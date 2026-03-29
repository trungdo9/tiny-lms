# Code Review: Quiz-Course Structure Refactor

**Date:** 2026-03-18
**Reviewer:** code-review agent
**Plan:** `20260228-quiz-course-refactor`
**Status:** Completed — pending DB migration

---

## Code Review Summary

### Scope
- Files reviewed: 8 backend files, 4 frontend files
- Lines analyzed: ~1 500 (backend service/controller/dto) + ~1 000 (frontend)
- Review focus: business rule enforcement, security, code quality, task completeness

### Overall Assessment

The implementation is **solid**. All three business rules (quiz hierarchy, 1-lesson-1-quiz, 3-mode clone) are correctly modelled and enforced at the application layer. TypeScript compiles clean on backend (0 errors). Frontend tsc has 0 errors in production code (only a pre-existing test file with missing `@playwright/test` types). Architecture is clean: two controllers, single service, proper module wiring.

However several issues require attention before production: an IDOR in `removeQuestion`, inconsistent authorization pattern across methods, a missing DB unique constraint, and a non-functional `import_from_quizzes` UI mode.

---

### Critical Issues

#### 1. IDOR in `removeQuestion` — quizQuestion not verified to belong to quiz
**File:** `backend/src/modules/quizzes/quizzes.service.ts` line 324–338

`removeQuestion(quizId, quizQuestionId, ...)` deletes the `quizQuestion` row after verifying the caller owns `quizId`, but **never checks that `quizQuestionId` belongs to `quizId`**. Any authenticated instructor who owns any quiz can delete a `quizQuestion` from a different quiz by guessing/knowing its UUID.

Fix: add `where: { id: quizQuestionId, quizId }` to the delete call, or load the record first and verify `quizQuestion.quizId === quizId`.

---

#### 2. Missing DB-level UNIQUE constraint for 1-lesson-1-quiz
**File:** `prisma/migrations/quiz_enforce_lesson_section_hierarchy.sql`

The migration SQL adds `section_id NOT NULL` and `course_id NOT NULL`, but the `UNIQUE(lesson_id)` step noted in the plan's Step 5 is **commented out / missing** from the migration file. The `@@unique` on `activityId` in the Quiz model enforces 1 activity = 1 quiz, but if the Activity row's `activityType` is not `quiz`, multiple activities per lesson can exist. Without a DB-level unique constraint on `(lessonId, activityType='quiz')` or a composite unique on the Activity table, the application-layer `findFirst` check is subject to race conditions under concurrent requests.

Fix: add a partial unique index on `activities(lesson_id) WHERE activity_type = 'quiz'`, or add `@@unique([lessonId, activityType])` to the Activity model.

---

### High Priority Findings

#### 3. Inconsistent authorization pattern — `update`/`delete`/`clone`/`addQuestion`/`removeQuestion` check `instructorId` directly instead of `canManageCourse`
**File:** `backend/src/modules/quizzes/quizzes.service.ts` lines 153, 192, 226, 290, 332

`create()` correctly delegates to `this.coursesService.canManageCourse(courseId, userId, userRole)` which checks the `course_instructors` join table (supporting co-instructors). All other mutating methods do `quiz.course.instructorId !== userId`, which only matches the **primary** instructor and breaks for co-instructors.

Per `docs/code-standards.md` section 3.6: "Never duplicate this check inline — always delegate to `CoursesService`."

Fix: replace all inline `instructorId !== userId` checks with `await this.coursesService.canManageCourse(quiz.courseId, userId, userRole)`.

#### 4. `import_from_quizzes` mode is non-functional from UI
**File:** `frontend/app/instructor/courses/page.tsx` line 73

The clone request hardcodes the body as `{ title, importQuizMode }` — `importFromQuizIds` is never sent. The option is shown in the UI but selecting it silently sends `importFromQuizIds: undefined`, which hits the `else if` branch condition `dto.importFromQuizIds?.length` and skips quiz import entirely with no error.

Fix: either (a) add a quiz selector UI in step 2 when `import_from_quizzes` is chosen, or (b) disable/hide the option with a "coming soon" notice (already noted in plan as known limitation — should be explicitly surfaced to the user, not silently no-op).

#### 5. `getLeaderboard` limit not validated — potential DoS
**File:** `backend/src/modules/quizzes/quizzes.controller.ts` line 92

`parseInt(limit, 10)` with no upper bound cap. A request with `?limit=10000000` will issue a DB query with `take: 10000000`. The service has `limit: number = 10` default but no `Math.min(limit, 100)` guard.

Fix: `Math.min(parseInt(limit, 10) || 10, 100)` in the controller, or add a DTO with `@Max(100)` via `@Query`.

---

### Medium Priority Improvements

#### 6. `CloneCourseDto` duplication acknowledged but not resolved
**File:** `backend/src/modules/quizzes/dto/quiz.dto.ts`

The plan notes `CloneCourseDto` exists in both `quiz.dto.ts` and `course.dto.ts`. Current file `quiz.dto.ts` does **not** contain `CloneCourseDto` (it was removed), so this is now resolved — no action needed. But worth confirming no lingering imports reference it from `quiz.dto.ts`.

#### 7. `clone()` in `quizzes.service.ts` uses `as any` spread with excluded fields
**File:** `backend/src/modules/quizzes/quizzes.service.ts` lines 239–241

```typescript
const { id: _id, courseId: _c, sectionId: _s, activityId: _a,
  createdAt: _ca, updatedAt: _ua, activity: _sourceActivity, ...quizData } = source as any;
```

`quizData` is untyped. If the Prisma schema adds new fields (e.g., a future `lessonId` field or computed column), they propagate silently into the create call and may cause Prisma errors or unexpected behavior at runtime.

Fix: define an explicit `QuizCreateData` type or enumerate the fields to copy.

#### 8. Same `as any` spread in `cloneAllQuizzes` — same concern
**File:** `backend/src/modules/courses/courses.service.ts` line 398–399

Same pattern as above, duplicated in a private method.

#### 9. `findAll` uses `Record<string, unknown>` for where clause
**File:** `backend/src/modules/quizzes/quizzes.service.ts` line 89

```typescript
const where: Record<string, unknown> = {};
```

Should use `Prisma.QuizWhereInput` for type safety.

#### 10. `LessonQuizzesController.findByLesson` has no auth guard on GET
**File:** `backend/src/modules/quizzes/quizzes.controller.ts` line 24–27

`@Get()` under `LessonQuizzesController` inherits the class-level `@UseGuards(SupabaseAuthGuard)` — correct. But the endpoint returns quiz details **including all questions** (via `findByLesson` include), which may expose quiz content (correct answers, options) to any authenticated user including students. For published quizzes this may be acceptable; for unpublished quizzes this is a data leakage risk.

Fix: either restrict the include for the student-facing path, or gate this endpoint to instructors/admins.

#### 11. `courses.service.ts` — `clone()` calls `this.findOne()` then re-checks `!source`
**File:** `backend/src/modules/courses/courses.service.ts` line 298–299

```typescript
const source = await this.findOne(courseId);
if (!source) throw new NotFoundException('Course not found');
```

`findOne()` already throws `NotFoundException` if not found, so the `if (!source)` guard is dead code.

---

### Low Priority Suggestions

#### 12. `UpdateQuizDto` is a verbatim copy of `CreateQuizDto` with all fields optional
Both DTOs have identical fields — only difference is all are `@IsOptional()` in Update. Consider using `PartialType(CreateQuizDto)` from `@nestjs/mapped-types` to avoid duplication and keep them in sync automatically.

#### 13. `DateString` helper type adds no value
**File:** `backend/src/modules/quizzes/dto/quiz.dto.ts` line 15

`type DateString = string;` is a type alias for `string`. It adds no type safety and `@IsDateString()` decorator already enforces the format. Remove or replace with ISO string literal type if needed.

#### 14. Frontend `instructor/courses/[id]/page.tsx` is missing quiz management
The plan states the course editor at `/instructor/courses/[id]` should show quiz badges per lesson (with `+ Tạo Quiz` / `CloneQuizModal`). However the actual `instructor/courses/[id]/page.tsx` renders a read-only section preview and links to `/instructor/courses/[id]/outline`. The full quiz management UI (QuizCreateModal, CloneQuizModal, LessonRow) is in `admin/courses/[id]/page.tsx`. Instructor portal does not have this feature.

This means instructors cannot create/clone quizzes from their course editor — only admins can. The plan's documented checklist marks these as verified, but the instructor page was not updated — only the admin page was. This is a **feature gap** (the plan was implemented on the admin portal, not the instructor portal).

---

### Positive Observations

- `create()` correctly delegates to `canManageCourse` (using the join table) — good SOLID adherence
- Transaction wrapping in `create()`, `clone()`, and `courses.service.clone()` — correct for multi-step DB operations
- ConflictException on duplicate quiz per lesson is correctly enforced application-side
- `cloneAllQuizzes` / `importQuestionsFromQuizzes` as private methods on `CoursesService` — clean separation
- `CloneCourseDto` uses `@IsEnum` with proper TypeScript union type — well typed
- `import_from_quizzes` correctly finds the first available (quiz-free) lesson — safe logic
- Backend `tsc --noEmit` passes with 0 errors
- Frontend `tsc --noEmit` passes with 0 errors in production code
- `CloneCourseDto` duplication cleaned up from `quiz.dto.ts` (plan concern resolved)
- `quizzes.module.ts` correctly registers both controllers and imports `CoursesModule`

---

### Recommended Actions

1. **[Critical]** Fix IDOR in `removeQuestion` — add `quizId` filter to the delete query
2. **[Critical]** Add DB unique constraint for 1-lesson-1-quiz at the Activity level (partial index on `activities(lesson_id) WHERE activity_type='quiz'`)
3. **[High]** Replace all inline `instructorId !== userId` checks in `quizzes.service.ts` with `canManageCourse()`
4. **[High]** Fix `import_from_quizzes` UI — either add quiz picker or show "coming soon" instead of silently no-op
5. **[High]** Cap `getLeaderboard` limit: `Math.min(parseInt(limit, 10) || 10, 100)`
6. **[High]** Add QuizCreateModal + CloneQuizModal to `instructor/courses/[id]/page.tsx` (currently only in admin portal)
7. **[Medium]** Replace `as any` spreads in clone methods with explicit typed field lists
8. **[Medium]** Gate `GET /lessons/:lessonId/quizzes` to not expose unpublished quiz questions to students
9. **[Low]** Use `PartialType(CreateQuizDto)` for `UpdateQuizDto`
10. **[Low]** Remove `DateString` type alias
11. **[Low]** Remove dead `if (!source)` check after `findOne()` in `courses.service.clone()`

---

### Metrics

- Type Coverage: backend 0 tsc errors; frontend 0 tsc errors (production code)
- Test Coverage: 0 unit tests for new quiz/clone logic (runtime E2E tests pending)
- Linting Issues: not run during this review
- DB migration: partially applied — UNIQUE constraint on `activities` still missing

---

### Unresolved Questions

1. Is the quiz management UI on the instructor portal intentionally deferred? The plan documents it as done but the feature exists only on `/admin/courses/[id]`, not `/instructor/courses/[id]`.
2. The migration SQL file does not include the unique constraint for `activities(lesson_id, activity_type='quiz')`. Was this intentional (relying on application-layer check only)?
3. `CoursesService.findOne()` is called inside a `$transaction` in `clone()` — but `findOne` uses the top-level `this.prisma`, not the transaction client `tx`. Is this intentional? Reads outside the transaction may observe stale data under concurrent clones.
