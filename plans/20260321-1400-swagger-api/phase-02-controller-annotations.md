# Phase 2: Controller Annotations (29 Controllers)

## Context Links

- Plan overview: [plan.md](./plan.md)
- Controller tag map: [phase-02-controller-tag-map.md](./phase-02-controller-tag-map.md)
- Previous phase: [phase-01-setup-and-auth.md](./phase-01-setup-and-auth.md)
- Next phase: [phase-03-dto-annotations.md](./phase-03-dto-annotations.md)

---

## Overview

Add `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, and `@ApiResponse` to the 29 remaining controllers. No DTO changes in this phase — that is Phase 3. The goal is a complete, navigable Swagger UI where every endpoint is labeled and auth requirements are visible.

---

## Key Insights

- Two guard types exist (`SupabaseAuthGuard`, `JwtAuthGuard`) — both consume Bearer JWTs. The single `addBearerAuth()` scheme from Phase 1 covers both. Apply `@ApiBearerAuth()` wherever either guard appears.
- Controllers with a class-level `@UseGuards(...)` get `@ApiBearerAuth()` on the class; mixed-auth controllers get it per-method.
- `POST /payments/webhook` uses a secret Bearer token (not user JWT) — use `@ApiHeader` instead of `@ApiBearerAuth()`. See tag map for details.
- Three sub-controllers live in parent module directories (`reviews`, `course-instructors`, `import`) — they share the parent tag.
- Tag names use kebab-case matching URL path prefixes: `'question-banks'`, `'flash-cards'`, `'learning-paths'`.
- SCORM upload endpoints need `@ApiConsumes('multipart/form-data')` in addition to standard decorators.

---

## Requirements

1. `@ApiTags(tag)` on every controller class — see [phase-02-controller-tag-map.md](./phase-02-controller-tag-map.md).
2. `@ApiBearerAuth()` at class-level when all/most methods are guarded; per-method when mixed.
3. `@ApiOperation({ summary })` on every endpoint method.
4. `@ApiResponse` for at minimum: success code, 401 (if guarded), 404 (if `:id` param), 400 (if body accepted).

---

## Architecture

No structural changes — purely decorator additions on existing controller classes. `SwaggerModule.createDocument()` reflects on all registered controllers at startup.

**Fully-guarded controller pattern:**

```typescript
@ApiTags('sections')
@ApiBearerAuth()
@Controller('sections')
@UseGuards(SupabaseAuthGuard)
export class SectionsController {

  @Get(':id')
  @ApiOperation({ summary: 'Get section by ID' })
  @ApiResponse({ status: 200, description: 'Section found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  findOne(@Param('id') id: string) { ... }

  @Post()
  @ApiOperation({ summary: 'Create a new section in a course' })
  @ApiResponse({ status: 201, description: 'Section created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateSectionDto) { ... }
}
```

**Mixed-auth controller pattern (courses):**

```typescript
@ApiTags('courses')
@Controller('courses')
export class CoursesController {

  @Get()
  @ApiOperation({ summary: 'List all published courses' })
  @ApiResponse({ status: 200, description: 'Paginated course list' })
  findAll(@Query() query: CourseQueryDto) { ... }

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course (instructor/admin)' })
  @ApiResponse({ status: 201, description: 'Course created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient role' })
  create(@Body() dto: CreateCourseDto) { ... }
}
```

**Payments webhook special case:**

```typescript
@Post('webhook')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'SePay payment webhook — validated by secret Bearer token, not user JWT' })
@ApiHeader({ name: 'authorization', description: 'Bearer <SEPAY_WEBHOOK_SECRET>', required: true })
@ApiResponse({ status: 200, description: 'Webhook processed' })
@ApiResponse({ status: 401, description: 'Invalid webhook secret' })
handleWebhook(...) { ... }
```

---

## Related Code Files

All 29 controller files under `backend/src/modules/` — full list in [phase-02-controller-tag-map.md](./phase-02-controller-tag-map.md).

---

## Implementation Steps

1. For each controller, open the file and add to imports:
   `import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';`
2. Add `@ApiTags(tag)` immediately before `@Controller(...)`.
3. If class-level guard scope: add `@ApiBearerAuth()` before `@Controller(...)`.
4. For each method: add `@ApiOperation({ summary })` and `@ApiResponse` decorators.
5. For per-method auth: add `@ApiBearerAuth()` on the individual method.
6. Handle `payments/webhook` with `@ApiHeader` (no `@ApiBearerAuth()`).
7. Add `@ApiConsumes('multipart/form-data')` to SCORM upload endpoints.
8. Process controllers in the order listed in the tag map.

---

## Todo List

- [x] `courses.controller.ts` — tag, per-method bearer, operations, responses
- [x] `reviews.controller.ts` — tag `courses`, per-method bearer, operations, responses
- [x] `course-instructors.controller.ts` — tag `courses`, class bearer, operations, responses
- [x] `sections.controller.ts` — class bearer, operations, responses
- [x] `lessons.controller.ts` — class bearer, operations, responses
- [x] `activities.controller.ts` — class bearer, operations, responses
- [x] `enrollments.controller.ts` — class bearer, operations, responses
- [x] `progress.controller.ts` — class bearer, operations, responses
- [x] `question-banks.controller.ts` — class bearer, operations, responses
- [x] `import.controller.ts` — tag `question-banks`, class bearer, operations, responses
- [x] `questions.controller.ts` — class bearer, operations, responses
- [x] `quizzes.controller.ts` — class bearer, operations, responses
- [x] `attempts.controller.ts` — class bearer, operations, responses
- [x] `grading.controller.ts` — class bearer, operations, responses
- [x] `flash-cards.controller.ts` — class bearer, operations, responses
- [x] `assignments.controller.ts` — class bearer, operations, responses
- [x] `users.controller.ts` — class bearer, operations, responses
- [x] `reports.controller.ts` — class bearer, operations, responses
- [x] `notifications.controller.ts` — class bearer, operations, responses
- [x] `certificates.controller.ts` — per-method bearer, operations, responses
- [x] `scorm.controller.ts` — class bearer, `@ApiConsumes` on upload endpoints, operations, responses
- [x] `payments.controller.ts` — per-method bearer, `@ApiHeader` on webhook, operations, responses
- [x] `organization.controller.ts` — class bearer, operations, responses
- [x] `departments.controller.ts` — class bearer, operations, responses
- [x] `settings.controller.ts` — class bearer, operations, responses
- [x] `emails.controller.ts` — class bearer, operations, responses
- [x] `learning-paths.controller.ts` — class bearer, operations, responses
- [x] `contact-sync.controller.ts` — class bearer, operations, responses
- [x] `contact-sync-webhook.controller.ts` — tag `contact-sync`, no bearer, operations, responses
- [x] Smoke-test: all 30 tags visible in Swagger UI, lock icons correct

---

## Success Criteria

- All 30 tags appear in Swagger UI sidebar
- Every endpoint has a non-empty `summary`
- Lock icons on all guarded endpoints; absent on public ones
- `POST /payments/webhook` shows `authorization` header field, no lock icon
- No TypeScript compile errors (`npm run build`)

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Mis-tagging a method as bearer-auth when it is public | Medium | Cross-reference `@UseGuards` in each controller before annotating |
| SCORM upload endpoints missing `@ApiConsumes` | Medium | Flag in tag map; check Swagger UI shows file input field |
| Endpoint count mismatch between UI and actual routes | Low | Count methods per controller before and after |

---

## Security Considerations

- `@ApiBearerAuth()` is metadata only — adding or omitting it does not change runtime guard behavior.
- The payments webhook secret must not appear as an example value in `@ApiHeader` — description only.
- Public certificate verify and public course list endpoints must not receive `@ApiBearerAuth()`.

---

## Next Steps

After Phase 2 merged: [phase-03-dto-annotations.md](./phase-03-dto-annotations.md)
