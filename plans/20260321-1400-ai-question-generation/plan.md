# Plan: AI Question Generation with OpenAI API

**Created:** 2026-03-21
**Status:** ✅ Implemented (Phase 1 & 2)
**Priority:** High

## Overview
Integrate OpenAI API (GPT-4o-mini) into the LMS to allow instructors to automatically generate quiz questions from a topic, subject, or context. Questions are previewed, optionally edited, then bulk-saved to an existing question bank.

## Research
- [Backend research: question/quiz modules](research/researcher-01-backend-report.md)
- [Frontend research: question creation UI](research/researcher-02-frontend-report.md)

---

## Implementation Phases

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 0 | [Refactor Shared Pages](phase-00-refactor-shared-pages.md) | ✅ Complete | Extract 12 duplicated instructor/admin pages into shared components |
| 1 | [Backend AI Module](phase-01-backend-ai-module.md) | ✅ Complete | New `ai-questions` NestJS module with OpenAI SDK integration |
| 2 | [Frontend AI Generate Modal](phase-02-frontend-ai-modal.md) | ✅ Complete | "Generate with AI" button + modal on question bank page |

---

## Architecture Summary

```
Instructor clicks "Generate with AI"
  → AI Generate Modal opens
  → Inputs: topic, types, difficulty, count
  → POST /ai-questions/generate (backend)
     → OpenAI API (GPT-4o-mini, structured JSON output)
     → Returns: Question[] preview
  → Preview cards shown (instructor reviews/edits)
  → Instructor selects questions → "Save to Bank"
  → POST /questions/bank/:bankId/bulk (one call, confirmed endpoint)
  → Cache invalidated, questions appear in table
```

---

## Key Decisions
- **Model:** GPT-4o-mini (best cost/quality ratio for structured data)
- **Output format:** OpenAI structured output / JSON mode for reliable parsing
- **Question types supported:** single, multi, true_false, short_answer, essay (5 most common; matching/ordering/cloze optional in v2)
- **UI placement:** New modal triggered from question bank detail page header
- **Save flow:** Preview first → selective save → `POST /questions/bank/:bankId/bulk` (one call)
- **API key:** `OPENAI_API_KEY` env var on backend only (never exposed to frontend)

---

## Success Criteria
- Instructor can generate 1-20 questions from a topic in <30s
- All 5 primary question types supported with correct options structure
- Generated questions pass same validation as manually-created questions
- Error states handled (API key missing, rate limit, network error)
- Works in both instructor and admin portals
