# Phase 3: DTO @ApiProperty Annotations

## Context Links

- Plan overview: [plan.md](./plan.md)
- Previous phase: [phase-02-controller-annotations.md](./phase-02-controller-annotations.md)
- DTO file list: [phase-03-dto-file-list.md](./phase-03-dto-file-list.md)

---

## Overview

Add `@ApiProperty()` / `@ApiPropertyOptional()` to every field in the 18 class-based DTO files. This makes Swagger UI render accurate request body schemas with field names, types, and constraints — replacing the empty `{}` that appears when decorators are absent.

This is an additive-only change: no field names, types, validators, or business logic are touched.

---

## Key Insights

- `@ApiProperty()` must be imported from `@nestjs/swagger`, not re-exported from elsewhere.
- Optional fields (decorated with `@IsOptional()`) use `@ApiPropertyOptional()` — shorthand for `@ApiProperty({ required: false })`.
- Enum fields use `@ApiProperty({ enum: ['val1', 'val2'] })` — matches the existing `@IsEnum([...])` array.
- Nested DTO fields (e.g., `@ValidateNested()` with `@Type(() => ChildDto)`) use `@ApiProperty({ type: () => ChildDto })` to trigger recursive schema generation.
- Array fields use `@ApiProperty({ type: [String] })` or `@ApiProperty({ isArray: true, type: String })`.
- UUID fields: `@ApiProperty({ format: 'uuid' })`.
- Number fields with `@Min`/`@Max`: mirror those as `minimum`/`maximum` in `@ApiProperty`.
- The `auth.dto.ts` created in Phase 1 is already annotated — skip it here.
- Query DTOs (e.g., `CourseQueryDto`) are also classes and need `@ApiProperty` — Swagger uses them for `@Query()` param documentation.

---

## Requirements

1. Add `@ApiProperty()` or `@ApiPropertyOptional()` to every field in all 18 DTO files.
2. Preserve all existing `class-validator` decorators — no removals.
3. Use `enum`, `format`, `minimum`, `maximum`, `example`, `isArray`, `type` options where they add clarity.
4. Annotate query DTOs (pagination, filter classes) as well as request body DTOs.

---

## Architecture

No structural changes. Each DTO file gains an additional import line and per-field decorators:

```typescript
// Before
import { IsString, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

// After
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to TypeScript' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'A beginner-friendly course covering TypeScript fundamentals.' })
  @IsString()
  @IsOptional()
  description?: string;
}
```

Enum field example:

```typescript
@ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'] })
@IsEnum(['beginner', 'intermediate', 'advanced'])
@IsOptional()
level?: string;
```

UUID field example:

```typescript
@ApiPropertyOptional({ format: 'uuid' })
@IsUUID()
@IsOptional()
categoryId?: string;
```

Array field example:

```typescript
@ApiPropertyOptional({ type: [String], format: 'uuid' })
@IsArray()
@IsUUID('4', { each: true })
@IsOptional()
importFromQuizIds?: string[];
```

---

## Related Code Files

See [phase-03-dto-file-list.md](./phase-03-dto-file-list.md) for the complete annotated file list with field counts.

Key files with the most fields:
- `courses/dto/course.dto.ts` — 5 classes, ~25 total fields
- `lessons/dto/lesson.dto.ts` — multiple classes including drip/prerequisite fields
- `attempts/dto/attempt.dto.ts` — quiz attempt lifecycle DTOs
- `assignments/dto/assignment.dto.ts` — submission + grading fields
- `flash-cards/dto/flash-card.dto.ts` — deck + card + study session DTOs

---

## Implementation Steps

1. Open each DTO file from the list in [phase-03-dto-file-list.md](./phase-03-dto-file-list.md).
2. Add `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';` at the top.
3. For each class field:
   - Required field → `@ApiProperty({ ... })`
   - Optional field (`@IsOptional()`) → `@ApiPropertyOptional({ ... })`
   - Add `example`, `enum`, `format`, `minimum`, `maximum` where applicable.
4. Verify: no existing decorator removed, no field type changed.
5. After all files done, restart dev server and inspect Swagger UI schemas.

---

## Todo List

- [x] `courses/dto/course.dto.ts` — `CreateCourseDto`, `UpdateCourseDto`, `CourseQueryDto`, `CloneCourseDto`, `CreateCategoryDto`, `UpdateCategoryDto`
- [x] `sections/dto/section.dto.ts`
- [x] `lessons/dto/lesson.dto.ts`
- [x] `activities/dto/activity.dto.ts`
- [x] `enrollments/dto/` — check for DTO files (bulk enrollment may use multipart)
- [x] `question-banks/dto/question-bank.dto.ts`
- [x] `questions/dto/question.dto.ts`
- [x] `quizzes/dto/quiz.dto.ts`
- [x] `attempts/dto/attempt.dto.ts`
- [x] `flash-cards/dto/flash-card.dto.ts`
- [x] `assignments/dto/assignment.dto.ts`
- [x] `payments/dto/create-payment.dto.ts`
- [x] `payments/dto/webhook.dto.ts`
- [x] `courses/dto/course-instructor.dto.ts`
- [x] `courses/dto/review.dto.ts`
- [x] `organization/dto/update-organization.dto.ts`
- [x] `departments/dto/department.dto.ts`
- [x] `scorm/dto/scorm.dto.ts`
- [x] `learning-paths/dto/learning-path.dto.ts`
- [x] Verify all body schemas in Swagger UI show field names (not empty `{}`)
- [x] Verify query param schemas render on list endpoints

---

## Success Criteria

- Every DTO class used as a `@Body()` parameter renders a complete schema in Swagger UI
- Every DTO class used as a `@Query()` parameter shows individual query fields
- No field shows as `{}` (unresolved type)
- Enum dropdowns appear for fields annotated with `enum: [...]`
- `npm run build` passes with no TypeScript errors
- No existing `class-validator` decorator is missing after edits

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Nested `@ValidateNested` DTO missing `type: () => ChildDto` | Medium | Search for `@ValidateNested` across all DTO files before starting |
| Query DTO fields not appearing (wrong decorator order) | Low | `@ApiProperty` must be above `@IsOptional` — enforce consistent order |
| `webhook.dto.ts` fields may map to SePay's payload structure — wrong examples | Low | Use generic examples; do not reverse-engineer SePay internals |
| Missing DTO files (some modules may inline body types) | Low | Grep for `@Body()` across all controllers to find any un-DTOd endpoints |

---

## Security Considerations

- Do not add real example values for security-sensitive fields (`token`, `webhookSecret`, `password` fields).
- Use placeholder examples: `'••••••••'` for passwords, `'<token>'` for reset tokens.
- `SepayWebhookDto` fields should have generic examples — do not document internal payment identifiers with real formats that could aid exploitation.

---

## Unresolved Questions

- Do any modules (enrollments, reports, notifications, users, grading, settings, emails, certificates) have inline body types rather than DTO classes? Verify with a grep for `@Body() body: {` or `@Body() dto: any` before starting.
- Does `contact-sync` module have DTO files not found in the glob? Check `contact-sync/dto/` exists.
