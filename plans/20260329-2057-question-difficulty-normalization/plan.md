# Plan: Question Difficulty Normalization

**Date:** 2026-03-29 20:57
**Status:** Phase 1 & 2 Complete
**Priority:** Medium

## Overview
Normalize question difficulty handling across Tiny LMS so all write paths, read paths, filters, and seeded/imported data consistently use the same canonical values: `easy`, `medium`, `hard`.

This is a cleanup and consistency task, not a feature expansion. The goal is to remove drift between current question authoring, import flows, quiz random-pick filters, and any UI labels so difficulty behaves predictably everywhere.

## Why this matters
Current code already assumes normalized difficulty in several places:
- Prisma schema defaults `Question.difficulty` to `medium`
- DTO validation restricts difficulty to `easy|medium|hard`
- Question bank create/edit UIs expose only those three values
- Quiz random-pick logic filters by exact string match on `difficultyFilter`
- CSV/Excel import lowercases input but does not clearly enforce aliases or reject unsupported labels

That means inconsistent historical or imported values can silently break quiz selection and filtering even if authoring UI looks correct.

## Existing repo signals
- `backend/prisma/schema.prisma` → `Question.difficulty` default is `medium`
- `backend/src/modules/questions/dto/question.dto.ts` → `VALID_DIFFICULTIES = ['easy', 'medium', 'hard']`
- `backend/src/modules/questions/questions.service.ts` → create/update/list depend on difficulty strings
- `backend/src/modules/question-banks/import/import.service.ts` → import lowercases `record.difficulty` but does not define alias normalization policy
- `backend/src/modules/attempts/attempts.service.ts` → random quiz bank selection filters by exact `q.difficulty === qq.difficultyFilter`
- `frontend/app/instructor/question-banks/[id]/page.tsx` and admin equivalent → UI hardcodes easy/medium/hard selectors and badges

## Problem statement
Difficulty currently behaves like a free-form string at the data layer but like an enum in the app layer. That mismatch creates three risks:
1. **Data drift:** legacy/imported rows may contain synonyms like `beginner`, `intermediate`, `advanced`, uppercase values, or whitespace variants.
2. **Broken quiz filtering:** `difficultyFilter` uses exact match, so non-canonical stored values are skipped during random question selection.
3. **Inconsistent UX/reporting:** lists, badges, imports, bulk creation, and future analytics cannot reliably group difficulty if values are inconsistent.

## Goal / Definition of Done
After implementation:
- All newly created or updated questions persist only `easy`, `medium`, or `hard`
- Import flows normalize supported aliases into canonical values before save
- Existing non-canonical question rows are migrated to canonical values
- Quiz question picking by `difficultyFilter` works reliably against normalized data
- UI shows one consistent label set everywhere and does not offer non-canonical difficulty values
- Validation and tests make it hard to reintroduce bad difficulty strings

## Canonical decision
Use exactly these canonical stored values:
- `easy`
- `medium`
- `hard`

### Alias policy
Normalize common aliases to canonical values:
- `beginner` → `easy`
- `basic` → `easy`
- `intermediate` → `medium`
- `normal` → `medium`
- `avg` / `average` → `medium`
- `advanced` → `hard`
- `difficult` → `hard`

Also normalize case and surrounding whitespace.

Anything outside the approved canonical set and alias table should be rejected at validation/import preview time instead of being silently stored.

## Recommended approach
Create one shared backend normalization utility and route every question difficulty write path through it.

### Scope in
- Question create/update/bulk create paths
- Question import parsing
- Existing data backfill/migration
- Quiz filter compatibility review for `difficultyFilter`
- Frontend display consistency if any label helpers/constants are duplicated
- Automated coverage for normalization behavior

### Scope out
- Expanding difficulty beyond 3 levels
- Reworking course-level difficulty (`beginner/intermediate/advanced`) into the same enum; that is a separate domain concept
- Analytics/dashboard redesign
- Manual content quality review of question wording

## Implementation phases

| # | Phase | File | Status | Owner |
|---|-------|------|--------|-------|
| 1 | Backend normalization and data migration | [phase-01-backend-normalization.md](phase-01-backend-normalization.md) | ✅ Complete | - |
| 2 | Frontend alignment and regression checks | [phase-02-frontend-alignment.md](phase-02-frontend-alignment.md) | ✅ Complete | - |

## Architecture decisions
1. **Canonical persistence:** Store only canonical values in DB, not aliases.
2. **Single normalization source:** One backend helper/constant set should define canonical values + alias mapping.
3. **Fail closed for unknown values:** Reject unsupported values on import/API writes rather than saving arbitrary strings.
4. **Backfill before relying on exact filters:** Existing rows must be normalized so quiz random-pick filtering stays trustworthy.
5. **Frontend should mirror, not redefine, semantics:** UI can keep local labels if needed, but product meaning must stay aligned with backend canonical values.

## Work plan summary

### Phase 1 — Backend normalization and migration
- Add shared difficulty constants + normalization helper in question domain/common area
- Update create/update/bulk create question service flow to normalize before persistence
- Update import service to normalize aliases and raise row-level errors for unsupported values
- Audit any other backend writes touching `Question.difficulty`
- Add migration/backfill script or Prisma SQL migration for existing question rows
- Review whether `QuizQuestion.difficultyFilter` should also be normalized on write for safety
- Add unit/integration tests for normalization, alias mapping, and filter compatibility

### Phase 2 — Frontend alignment and regression checks
- Confirm admin and instructor question-bank pages only emit canonical values
- Replace duplicated hardcoded difficulty options/badges with a small shared constant/helper if cheap
- Verify import UX/error text reflects accepted values/aliases
- Regression test question creation, edit, import preview, question list filtering, and quiz random-pick setup

## Data migration notes
Backfill should target the `questions` table first. Suggested mapping:
- lowercase and trim all existing values
- map known aliases to canonical values
- decide how to handle null/empty/unknown legacy values:
  - preferred: set empty/null to `medium`
  - unknown non-empty values should be surfaced before mass rewrite unless product owner explicitly approves fallback to `medium`

If there are stored `quiz_questions.difficulty_filter` values outside canonical set, normalize those too so future matching remains exact.

## Risks
- **Silent legacy data drift:** Historical rows may contain values not visible in current UI.
- **Cross-domain naming conflict:** Course difficulty docs already reference `beginner/intermediate/advanced`; developers could wrongly unify the two concepts.
- **Import regressions:** Existing CSV files may rely on loose labels and start failing if alias handling is incomplete.
- **Partial normalization:** Fixing API writes without backfilling existing rows would leave quiz selection bugs in place.

## Mitigations
- Run a pre-migration query to enumerate distinct difficulty values in `questions` and `quiz_questions`
- Keep alias mapping explicit and tested
- Normalize on every write path before validation/persistence boundary completes
- Add regression tests around exact-match random-pick behavior

## Validation checklist
- [ ] All question write APIs persist only `easy|medium|hard`
- [ ] CSV/Excel import accepts approved aliases and rejects unknown labels with row-level errors
- [ ] Existing rows are migrated/backfilled
- [ ] Question list filters work with canonical values
- [ ] Quiz bank random-pick with `difficultyFilter` returns expected questions
- [ ] Instructor and admin UIs display consistent labels/colors
- [ ] Tests cover normalization helper + representative service paths

## Suggested implementation order
1. Measure existing DB values
2. Add backend normalization helper/constants
3. Route all write paths through helper
4. Normalize import flow
5. Backfill existing data
6. Align frontend constants/messages if needed
7. Run focused regression tests

## Open questions
1. Are there existing production rows using non-canonical difficulty values beyond common aliases?
2. Should unknown legacy values be blocked for manual cleanup or auto-coerced to `medium` during one-time migration?
3. Is `QuizQuestion.difficultyFilter` exposed in any UI that may also need alias normalization or stricter validation?

## Recommended next handoff
Once approved, hand to Linh_Orchestrator for technical sequencing and implementation routing.