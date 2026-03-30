# Phase 1: Backend normalization and data migration

**Owner:** Linh_Orchestrator
**Status:** ✅ Complete

## Outcome
Backend stores only canonical question difficulty values and existing data is backfilled safely.

## Tasks
1. Add canonical difficulty constants and alias map in a shared backend location
2. Add `normalizeQuestionDifficulty(input)` helper:
   - trim + lowercase
   - map aliases to `easy|medium|hard`
   - reject unsupported values
3. Route question create/update/bulk create flows through the helper
4. Update import parsing to normalize aliases and produce row-level errors for unsupported values
5. Audit other write paths touching question difficulty
6. Backfill `questions.difficulty` legacy rows
7. Normalize `quiz_questions.difficulty_filter` if non-canonical values exist
8. Add tests for helper, API writes, import parsing, and exact-match quiz filtering

## Acceptance
- No backend path persists non-canonical difficulty values
- Migration leaves `questions.difficulty` clean
- Random pick by `difficultyFilter` works against migrated data
