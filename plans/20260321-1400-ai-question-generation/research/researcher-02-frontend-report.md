# Researcher 02 — Frontend Question Creation UI Report

## Executive Summary
The LMS has a modal-based question creation system. AI generation can integrate as an additional button/tab within the existing question creation modal. No shadcn/ui — inline TailwindCSS + native HTML. Minimal component reuse today.

---

## Current UI Architecture

### Routes
- Instructor: `frontend/app/instructor/question-banks/`
  - `page.tsx` — List banks (grid cards)
  - `[id]/page.tsx` — Questions table + create/edit modals
  - `[id]/import/page.tsx` — CSV import
- Admin: `frontend/app/admin/question-banks/` (mirrors instructor)

### Question Bank Detail Page (`[id]/page.tsx`)
- Header: Bank title, description, buttons: **Add Question | Import | Back**
- Questions in table: content, type, difficulty (color-coded), score, edit/delete actions
- All creation/editing happens in modal overlays

### Question Creation Modal
8 question types: `single`, `multi`, `true_false`, `short_answer`, `essay`, `matching`, `ordering`, `cloze`

**Core fields (all types):**
1. Question Type — Select dropdown (resets options state on change)
2. Question Content — Textarea
3. Difficulty — Select (Easy/Medium/Hard)
4. Score — Number input (min 1)
5. Options — dynamic per type

**Options rendering by type:**
| Type | Options UI |
|------|-----------|
| single / true_false | Radio + text input per option |
| multi | Checkbox + text input, multiple correct |
| short_answer | Single correct answer field |
| essay | No options (open-ended) |
| matching | Key → Value pairs (min 2) |
| ordering | Numbered items (min 2) |
| cloze | Correct answers for [blank]s |

---

## API Integration

### Query Keys
```
queryKeys.questionBanks.list()
queryKeys.questionBanks.detail(id)
queryKeys.questionBanks.questions(bankId)
```

### Relevant API Functions
- `GET /question-banks` — list banks
- `POST /question-banks` — create bank
- `GET /question-banks/:id/questions` — list questions in bank
- `POST /questions/bank/:bankId` — create question (+ options)
- `PUT /questions/:id` — update question
- `DELETE /questions/:id` — delete question
- `PUT /questions/:id/options` — replace options

### Mutation Pattern
```ts
useMutation → mutationFn → onSuccess: queryClient.invalidateQueries(queryKeys.questionBanks.questions(bankId))
```

---

## UI Patterns / Tech Stack
- **No shadcn/ui** — inline JSX + TailwindCSS utilities
- `'use client'` on all pages
- `useState` for form state
- Direct fetch (no centralized api.ts client used here)
- Error: red banner (`bg-red-50 border-red-200`)
- Loading: `animate-spin` spinner inline
- Modals: `fixed inset-0 bg-black/50` overlay, max-w-lg, 90vh scrollable

---

## Recommended UI Approach for AI Generation

### Option A (Best): "Generate with AI" button on question bank detail page
- Add **"Generate with AI"** button next to "Add Question" in page header
- Opens a **new dedicated modal** for AI generation
- Shows form: topic, question types (checkboxes), difficulty, count
- Displays generated questions as preview cards (with edit-in-place)
- Instructor selects which to save → bulk save to bank
- Minimal disruption to existing create modal

### Option B (Alternative): Tab switcher inside create modal
- Add "Manual | AI" tab at top of existing create modal
- AI tab shows generation form, generates 1 question, pre-fills fields
- Simpler but limits bulk generation

**Recommendation: Option A** — better UX for bulk generation (instructors want 5-10 at once)

---

## Reusable Patterns (to extract)
Currently all inline — would need to create:
- `components/question-banks/AIGenerateModal.tsx` — new AI generation modal
- Reuse: question type select options array, difficulty options (already defined inline)

---

## AI Generation Integration Points
1. **Input:** topic string, question types[], difficulty, count (1-20)
2. **Output:** array of generated question objects → preview UI
3. **Save:** map to existing `POST /questions/bank/:bankId` bulk endpoint
4. **Cache:** invalidate `queryKeys.questionBanks.questions(bankId)` after save

---

## Key Files
- `frontend/app/instructor/question-banks/[id]/page.tsx` — main create/edit modal impl
- `frontend/app/instructor/question-banks/page.tsx` — bank list
- `frontend/lib/query-keys.ts` — query key factory
- `frontend/lib/api.ts` — check if questionBanks API functions exist

---

## Unresolved Questions
1. Does `frontend/lib/api.ts` have questionBanks/questions functions or are they inline?
2. Admin vs instructor — need AI generation in both portals?
3. Should generated questions show a preview with inline editing before saving?
4. Streaming response (show questions as they generate) or wait for full batch?
