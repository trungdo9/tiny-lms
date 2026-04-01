# Plan: Drag-Drop Question Types

**Date:** 2026-03-21
**Status:** ✅ Complete
**Priority:** P1

## Summary

Add `drag_drop_text` and `drag_drop_image` question types to the quiz system.
No DB migration required — existing `QuestionOption` schema (matchKey, matchValue, isCorrect) supports both types.
`@dnd-kit/core` is already installed.

## Phases

| # | Phase | File | Status |
|---|-------|------|--------|
| 1 | Backend — Types + Scoring | [phase-01-backend.md](./phase-01-backend.md) | ✅ Complete |
| 2 | Frontend — Student Attempt Components | [phase-02-student-attempt.md](./phase-02-student-attempt.md) | ✅ Complete |
| 3 | Frontend — Instructor Question Builder + Image Upload | [phase-03-instructor-builder.md](./phase-03-instructor-builder.md) | ✅ Complete |
| 4 | Frontend — Result Review Display | [phase-04-result-review.md](./phase-04-result-review.md) | ✅ Complete |

## Key Design Decisions

- **No DB migration** — reuse `matchKey`/`matchValue`/`isCorrect` on `QuestionOption`; answers via `QuizAnswer.matchAnswer` (Json)
- **drag_drop_text slots** identified by `[slot_0]`, `[slot_1]` markers in `Question.content`
- **drag_drop_image zones** store `{x,y,w,h}` percentages in `QuestionOption.matchValue` as JSON string
- **Distractors** marked `isCorrect=false`, `matchKey=null` for both types
- **Scoring** — partial credit per correct slot/zone (consistent with `matching`, `ordering`, `cloze`)
- **Drag library** — `@dnd-kit/core` (already installed), PointerSensor for unified mouse+touch
- **Image storage** — local disk: multer diskStorage → `backend/public/uploads/images/`; served via `express.static` at `/uploads/images`

## Research

- [researcher-01-dndkit-patterns.md](./research/researcher-01-dndkit-patterns.md)
- [researcher-02-image-dropzones.md](./research/researcher-02-image-dropzones.md)
