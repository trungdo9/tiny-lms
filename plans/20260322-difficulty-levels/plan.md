# Plan: Add Difficulty Levels (EASY, NORMAL, HARD) to Questions

**Date:** 2026-03-22
**Scope:** `backend/src/modules/questions/`, `backend/src/common/enums/`, `backend/prisma/`, and cross-module consumers
**Status:** Ready for implementation

---

## Context & Current State

The codebase already has a `difficulty` field on the `Question` model but it is implemented as a plain `String` with an informal comment `// easy, medium, hard` and validated only via `IsIn(VALID_DIFFICULTIES)` in the DTO layer.

**Current values:** `['easy', 'medium', 'hard']` (string literal array in `question.dto.ts`)
**Requested values:** `EASY`, `NORMAL`, `HARD`

Key difference: `NORMAL` replaces `MEDIUM`. This is a **breaking rename** — existing DB rows with `difficulty = 'medium'` must be migrated.

Cross-module consumers that reference `difficulty` or `difficultyFilter`:
- `backend/src/modules/attempts/attempts.service.ts` — filters bank questions by `difficultyFilter`
- `backend/src/modules/quizzes/quizzes.service.ts` — passes `difficultyFilter` when building quiz question sets
- `backend/src/modules/courses/courses.service.ts` — clones `difficultyFilter` on course duplication
- `backend/src/modules/question-banks/import/import.service.ts` — parses CSV `difficulty` column, falls back to `'medium'`

---

## Decision: String Constant vs Prisma Enum

**Use TypeScript string-constant enum in the common enums layer; keep Prisma field as `String`.**

Rationale:
- The schema uses `String` for `type` (8 values) and `difficulty` consistently — no Prisma `enum` anywhere in the file.
- Adding a Prisma `enum` requires Supabase DB migration to create a PostgreSQL enum type and `ALTER COLUMN` — high operational friction.
- A DB `CHECK` constraint (in the SQL migration) achieves data integrity with zero schema-model churn.
- The `VALID_DIFFICULTIES` constant pattern is already established in `question.dto.ts` and mirrors `VALID_QUESTION_TYPES`.

---

## Files to Modify

### 1. New file — Enum definition
**`backend/src/common/enums/difficulty.enum.ts`** (create)

```ts
export enum Difficulty {
  EASY   = 'easy',
  NORMAL = 'normal',
  HARD   = 'hard',
}

export const DIFFICULTY_VALUES = ['easy', 'normal', 'hard'] as const;
export type DifficultyValue = (typeof DIFFICULTY_VALUES)[number];
```

Pattern mirrors `role.enum.ts` exactly. Values are lowercase strings to keep DB data human-readable (same convention as `type` field).

---

### 2. `backend/src/modules/questions/dto/question.dto.ts`

- Import `Difficulty, DIFFICULTY_VALUES` from the new enum file.
- Replace the inline `VALID_DIFFICULTIES = ['easy', 'medium', 'hard']` constant with `DIFFICULTY_VALUES`.
- Update all `@IsIn()` decorators and `@ApiPropertyOptional({ enum: ... })` usages.
- Update default in `@ApiPropertyOptional` from `'medium'` to `'normal'`.
- No structural changes to DTO classes — only the constant reference changes.

Affected DTOs in this file:
| DTO | Field | Change |
|-----|-------|--------|
| `CreateQuestionDto` | `difficulty?` | `@IsIn(DIFFICULTY_VALUES)`, default hint `'normal'` |
| `UpdateQuestionDto` | `difficulty?` | `@IsIn(DIFFICULTY_VALUES)` |
| `ListQuestionsQueryDto` | `difficulty?` | description example update |

---

### 3. `backend/src/modules/questions/questions.service.ts`

Two hardcoded `'medium'` default strings must become `Difficulty.NORMAL`:

- Line 70: `difficulty: dto.difficulty || 'medium'` → `dto.difficulty ?? Difficulty.NORMAL`
- Line 101 (bulkCreate): same pattern
- Import `Difficulty` from common enums.

No other logic changes needed — the filter query at line 19 is dynamic and needs no change.

---

### 4. `backend/src/modules/question-banks/import/import.service.ts`

- Line 201: `record.difficulty?.toLowerCase().trim() || 'medium'` → `|| Difficulty.NORMAL`
- The CSV template examples (line 210–213) reference `easy`, `medium` — update `medium` to `normal` in the example rows.
- Import `Difficulty`.

---

### 5. `backend/prisma/migrations/add_difficulty_rename_medium_to_normal.sql` (create)

```sql
-- Migration: add_difficulty_rename_medium_to_normal
-- Apply via: Supabase Dashboard → SQL Editor

-- Step 1: Rename existing 'medium' values to 'normal'
UPDATE public.questions
  SET difficulty = 'normal'
  WHERE difficulty = 'medium';

-- Step 2: Add CHECK constraint to enforce valid values going forward
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_difficulty_check;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_difficulty_check
  CHECK (difficulty IN ('easy', 'normal', 'hard'));
```

> No Prisma schema file changes needed — `difficulty String @default("medium")` becomes `@default("normal")` only (comment update optional). The Prisma client does not enforce values; validation lives in DTO and DB constraint.

---

### 6. `backend/prisma/schema.prisma`

Minor — update comment and default value on the `Question` model:

```
difficulty    String    @default("normal") // easy, normal, hard
```

This keeps `prisma db pull` and seed scripts consistent.

---

## Controller Changes

**None required.** The controller (`questions.controller.ts`) is a pure passthrough — it delegates to the service and does not reference difficulty strings directly. The Swagger `@ApiPropertyOptional({ enum: DIFFICULTY_VALUES })` changes flow through the DTO file.

---

## Prisma Schema Changes (summary)

| Field | Before | After |
|-------|--------|-------|
| `difficulty` default | `"medium"` | `"normal"` |
| `difficulty` comment | `// easy, medium, hard` | `// easy, normal, hard` |
| DB CHECK constraint | none | `IN ('easy', 'normal', 'hard')` |

---

## Cross-Module Impact

### `attempts.service.ts` & `quizzes.service.ts` & `courses.service.ts`
These pass `difficultyFilter` string values that originate from `QuizQuestion.difficultyFilter` (a nullable `String?` column). After the data migration, any stored `'medium'` values in that column also need updating.

**Add to the SQL migration:**
```sql
-- Also migrate difficultyFilter in quiz_questions table
UPDATE public.quiz_questions
  SET difficulty_filter = 'normal'
  WHERE difficulty_filter = 'medium';
```

Check the actual column name against the schema before applying.

### `quizzes/dto/quiz.dto.ts` — `difficultyFilter` field (line 225)
Currently typed as plain `string`. Optionally update the `@ApiPropertyOptional` description/example to reference `'normal'` instead of `'medium'`. Not strictly required for correctness.

---

## Implementation Order

1. Create `difficulty.enum.ts` in common enums
2. Update `question.dto.ts` to import and use the enum
3. Update `questions.service.ts` defaults
4. Update `import.service.ts` defaults and CSV template
5. Update `schema.prisma` default + comment
6. Create and apply SQL migration (both `questions` and `quiz_questions` tables)

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Existing DB rows with `difficulty = 'medium'` | Handled by `UPDATE` in SQL migration |
| Existing `quiz_questions.difficulty_filter = 'medium'` | Handled by second `UPDATE` in same migration |
| CSV import with `'medium'` in file | Falls through to `Difficulty.NORMAL` default via `|| Difficulty.NORMAL`; old CSVs with explicit `medium` will fail DB CHECK — document in changelog |
| API clients sending `difficulty: 'medium'` | `@IsIn(DIFFICULTY_VALUES)` rejects with 400 Bad Request — **breaking API change**, must be communicated |
| Seed data | Search `seed.ts` for any `difficulty: 'medium'` and update to `'normal'` before re-seeding |

---

## Unresolved Questions

1. **Is `NORMAL` truly replacing `MEDIUM`, or should both be accepted?** If backward compatibility is required, `VALID_DIFFICULTIES` could include both during a transition window and the DB constraint relaxed accordingly.
2. **Are there frontend components** (quiz builder, question picker) that hardcode the string `'medium'`? Frontend code was not in scope for this research — verify before deploying.
3. **`quiz_questions` column name** — the Prisma model uses `difficultyFilter` mapping to `difficulty_filter`; confirm the exact column name in the live DB before running the migration UPDATE.
