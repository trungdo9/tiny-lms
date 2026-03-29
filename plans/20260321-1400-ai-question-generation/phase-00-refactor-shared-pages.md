# Phase 00 — Refactor Instructor/Admin Shared Pages

**Context:** [Parent Plan](plan.md)
**Must complete before:** Phase 01 (Backend AI Module), Phase 02 (Frontend AI Modal)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-21 |
| Description | Extract duplicated instructor/admin page files into shared components accepting a `basePath` prop |
| Priority | High (prerequisite for AI feature) |
| Implementation Status | 🔲 Pending |
| Review Status | 🔲 Not reviewed |

---

## Key Insights
- **100% of diffs are route paths only** — logic, UI, state, API calls are identical
- Pattern: instructor uses `/instructor/...`, admin uses `/admin/...`
- Fix: shared component accepts `basePath: '/instructor' | '/admin'` prop
- Instructor/admin page files become **5-line wrappers**
- `courses/[id]/page.tsx`, `courses/[id]/outline/page.tsx`, layouts, reports/quizzes → **keep separate** (genuinely different content)

---

## Scope

### Refactor (path-only diffs)

| File | Lines | Diffs |
|------|-------|-------|
| `question-banks/[id]/page.tsx` | 823 | 1 path (Import button) |
| `question-banks/page.tsx` | 209 | 2 paths (View, Import links) |
| `question-banks/[id]/import/page.tsx` | 249 | 0 (identical) |
| `quizzes/[id]/page.tsx` | 305 | 0 (identical) |
| `quizzes/create/page.tsx` | 49 | 1 path (redirect after create) |
| `quizzes/grading/page.tsx` | 246 | 0 (identical) |
| `quizzes/page.tsx` | 207 | 5 paths (create, view, report links) |
| `flash-cards/page.tsx` | 111 | 2 paths (create, create with lessonId) |
| `flash-cards/create/page.tsx` | 223 | 1 path (redirect after create) |
| `courses/create/page.tsx` | 147 | 1 path (redirect after create) |
| `reports/courses/page.tsx` | 285 | 1 path (detail link) |
| `reports/courses/[id]/page.tsx` | 202 | 1 path (back link) |

**Total: ~3,061 lines of duplicated code → ~1,530 lines saved**

### Keep Separate (genuinely different)
- `courses/[id]/page.tsx` — completely different (500/349 lines differ)
- `courses/[id]/outline/page.tsx` — complex, 83 diffs in 1463 lines
- `layout.tsx` — intentionally different nav menus
- `learning-paths/page.tsx` — mostly different content
- `reports/quizzes/page.tsx` — completely different
- `reports/quizzes/[id]/page.tsx` — completely different

---

## Architecture

### Shared Components Location
```
frontend/components/shared-pages/
├── QuestionBankDetailPage.tsx    (from question-banks/[id]/page.tsx)
├── QuestionBankListPage.tsx      (from question-banks/page.tsx)
├── QuestionBankImportPage.tsx    (from question-banks/[id]/import/page.tsx)
├── QuizDetailPage.tsx            (from quizzes/[id]/page.tsx)
├── QuizCreatePage.tsx            (from quizzes/create/page.tsx)
├── QuizGradingPage.tsx           (from quizzes/grading/page.tsx)
├── QuizListPage.tsx              (from quizzes/page.tsx)
├── FlashCardListPage.tsx         (from flash-cards/page.tsx)
├── FlashCardCreatePage.tsx       (from flash-cards/create/page.tsx)
├── CourseCreatePage.tsx          (from courses/create/page.tsx)
├── CourseReportListPage.tsx      (from reports/courses/page.tsx)
└── CourseReportDetailPage.tsx    (from reports/courses/[id]/page.tsx)
```

### Prop Interface (all components)
```typescript
interface SharedPageProps {
  basePath: '/instructor' | '/admin';
}
```

### Wrapper Pattern (instructor and admin pages become)
```typescript
// app/instructor/question-banks/[id]/page.tsx (AFTER)
import { QuestionBankDetailPage } from '@/components/shared-pages/QuestionBankDetailPage';
export default function Page() {
  return <QuestionBankDetailPage basePath="/instructor" />;
}

// app/admin/question-banks/[id]/page.tsx (AFTER)
import { QuestionBankDetailPage } from '@/components/shared-pages/QuestionBankDetailPage';
export default function Page() {
  return <QuestionBankDetailPage basePath="/admin" />;
}
```

### Path Replacement Pattern (inside shared component)
```typescript
// BEFORE (hardcoded in instructor page):
router.push(`/instructor/question-banks/${bankId}/import`)

// AFTER (parameterized):
router.push(`${basePath}/question-banks/${bankId}/import`)
```

---

## Related Code Files
- `frontend/app/instructor/question-banks/` — source files
- `frontend/app/admin/question-banks/` — becomes wrappers
- `frontend/app/instructor/quizzes/` — source files
- `frontend/app/admin/quizzes/` — becomes wrappers
- `frontend/app/instructor/flash-cards/` — source files
- `frontend/app/admin/flash-cards/` — becomes wrappers
- `frontend/app/instructor/courses/create/` — source file
- `frontend/app/instructor/reports/courses/` — source files

---

## Implementation Steps

**Per file pair (repeat for all 12 pairs):**

1. Copy instructor file → `components/shared-pages/ComponentName.tsx`
2. Add `interface SharedPageProps { basePath: '/instructor' | '/admin' }` at top
3. Add `{ basePath }: SharedPageProps` to function signature
4. Replace all hardcoded `/instructor/` paths with `${basePath}/`
5. Fix any `/quizzes/` or `/reports/` paths that admin uses differently (check quizzes/page.tsx diffs)
6. Replace instructor page content with wrapper (5 lines)
7. Replace admin page content with wrapper (5 lines)
8. Test: navigate to instructor and admin versions, confirm identical behavior

**Priority order (highest impact first):**
1. `QuestionBankDetailPage` — largest file, AI feature goes here
2. `QuestionBankListPage`
3. `QuizListPage` — has 5 path diffs (most complex)
4. `QuizDetailPage` / `QuizGradingPage` / `QuizCreatePage`
5. `QuestionBankImportPage`
6. `FlashCardListPage` / `FlashCardCreatePage`
7. `CourseCreatePage`
8. `CourseReportListPage` / `CourseReportDetailPage`

---

## Todo

### question-banks
- [ ] Create `QuestionBankDetailPage.tsx` (parameterize 1 path)
- [ ] Wrap `instructor/question-banks/[id]/page.tsx`
- [ ] Wrap `admin/question-banks/[id]/page.tsx`
- [ ] Create `QuestionBankListPage.tsx` (parameterize 2 paths)
- [ ] Wrap `instructor/question-banks/page.tsx`
- [ ] Wrap `admin/question-banks/page.tsx`
- [ ] Create `QuestionBankImportPage.tsx` (no changes needed)
- [ ] Wrap both import pages

### quizzes
- [ ] Create `QuizListPage.tsx` (parameterize 5 paths)
- [ ] Wrap both quizzes list pages
- [ ] Create `QuizDetailPage.tsx` (no path changes)
- [ ] Wrap both quizzes detail pages
- [ ] Create `QuizCreatePage.tsx` (parameterize 1 path)
- [ ] Wrap both quizzes create pages
- [ ] Create `QuizGradingPage.tsx` (no path changes)
- [ ] Wrap both grading pages

### flash-cards
- [ ] Create `FlashCardListPage.tsx` (parameterize 2 paths)
- [ ] Wrap both flash-card list pages
- [ ] Create `FlashCardCreatePage.tsx` (parameterize 1 path)
- [ ] Wrap both flash-card create pages

### courses & reports
- [ ] Create `CourseCreatePage.tsx` (parameterize 1 path)
- [ ] Wrap both course create pages
- [ ] Create `CourseReportListPage.tsx` (parameterize 1 path)
- [ ] Wrap both report list pages
- [ ] Create `CourseReportDetailPage.tsx` (parameterize 1 path)
- [ ] Wrap both report detail pages

---

## Success Criteria
- All 12 shared components created in `components/shared-pages/`
- All 24 instructor/admin page files reduced to 5-line wrappers
- Navigation works correctly from both instructor and admin portals
- No behavior change — purely structural refactor
- No TypeScript errors

---

## Risk Assessment
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Missed path replacement | Low | diff output shows exactly which lines to change |
| quizzes/page.tsx instructor bug | Medium | Instructor has `/quizzes/...` (no prefix) — check if intentional |
| Breaking admin navigation | Low | Test each page after wrapping |

### quizzes/page.tsx Special Case
Instructor currently links to `/quizzes/${quiz.id}` (no `/instructor/` prefix) but admin links to `/admin/quizzes/${quiz.id}`. This may be a **pre-existing bug** in the instructor version — verify before refactoring.

---

## Next Steps
After phase 0: proceed to [Phase 01 — Backend AI Module](phase-01-backend-ai-module.md)
