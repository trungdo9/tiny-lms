# Phase 2 -- Frontend UI

## Context Links

- frontend/app/instructor/courses/[id]/outline/page.tsx
- frontend/lib/api.ts
- frontend/lib/query-keys.ts

---

## Overview

Upgrade the existing QuizPickerModal inside outline/page.tsx:

1. Replace raw fetch calls with quizzesApi + TanStack Query.
2. Replace the raw select in the select tab with a searchable card list showing title, question count, and course name.
3. Add quizzesApi.listMine() method to api.ts.
4. Add queryKeys.quizzes.mine() to query-keys.ts.

No new pages or route groups. All changes within existing files.

---

## Key Insights

- Modal already has mode: create | select state -- keep this structure.
- Select tab currently calls GET /quizzes (all quizzes) inside useQuery with enabled: mode === select. Replace with GET /quizzes/mine.
- Create path calls POST /lessons/:lessonId/quizzes -- keep, just wrap with quizzesApi.create().
- Clone path calls POST /quizzes/:id/clone -- keep, wrap with quizzesApi.clone().
- quizzes.instructor key in query-keys.ts is currently unused -- repurpose as quizzes.mine().
- Modal uses supabase.auth.getSession() directly for auth headers -- migrate to fetchApi abstraction.
- useQueryClient and useMutation are already imported in the outline page.
- YAGNI: do not extract QuizPickerModal to a separate file unless it exceeds ~150 lines after refactor.

---

## Requirements

- Select tab shows scrollable, searchable card list (not a select element) with:
  - Quiz title
  - Question count badge
  - Course name (secondary text)
  - Published/Draft status indicator
- Search filters list client-side (debounced input, no extra API calls).
- Selecting a quiz highlights it; Clone & attach button triggers the action.
- Loading and empty states shown.
- On success (both create and clone), invalidate queryKeys.activities.byLesson(lessonId) to refresh activity list.
- No separate component file required (YAGNI).

---

## Architecture

QuizPickerModal (existing, upgraded)
  mode = create | select

  mode=create:
    form fields (title, timeLimitMinutes, maxAttempts, passScore, shuffleQuestions)
    onSubmit -> quizzesApi.create(lessonId, form) via useMutation
    onSuccess -> invalidate activities.byLesson + call onQuizAttached

  mode=select:
    useQuery(queryKeys.quizzes.mine(), quizzesApi.listMine, { enabled: mode===select })
    [search input] -> client-side filter
    [quiz card list] -> selectable single item
    onSubmit -> quizzesApi.clone(selectedQuizId, lessonId) via useMutation
    onSuccess -> invalidate activities.byLesson

---

## Related Code Files

- frontend/app/instructor/courses/[id]/outline/page.tsx
- frontend/lib/api.ts
- frontend/lib/query-keys.ts

---

## Implementation Steps

### Step 1 -- Add quizzesApi.listMine()

Add to quizzesApi in api.ts: listMine(search?) calls GET /quizzes/mine with optional search param.

### Step 2 -- Update query-keys.ts

Replace unused quizzes.instructor with quizzes.mine() returning ["quizzes","mine"].

### Step 3 -- Upgrade QuizPickerModal

a) Replace useQuery: use queryKeys.quizzes.mine() + quizzesApi.listMine(), enabled when mode===select.

b) Add search state + client-side filter: useState, filter by title and course.title.

c) Replace select element with card list. Each card shows: title, _count.questions badge, course.title, isPublished status. Selected card highlighted with teal border.

d) Replace create handler with useMutation calling quizzesApi.create(lesson.id, form). onSuccess: invalidate activities.byLesson + call onQuizAttached + onClose.

e) Replace clone handler with useMutation calling quizzesApi.clone(selectedQuizId, lesson.id). onSuccess: invalidate activities.byLesson + onClose.

f) Remove supabase.auth.getSession() calls from modal -- handled by fetchApi abstraction.

g) Add useQueryClient hook call inside modal.

---

## Todo List

- [ ] api.ts -- add quizzesApi.listMine(search?)
- [ ] query-keys.ts -- replace quizzes.instructor with quizzes.mine()
- [ ] outline/page.tsx -- QuizPickerModal: replace useQuery with quizzesApi.listMine
- [ ] outline/page.tsx -- QuizPickerModal: replace select element with card list + search input
- [ ] outline/page.tsx -- QuizPickerModal: wrap create handler in useMutation + invalidate
- [ ] outline/page.tsx -- QuizPickerModal: wrap clone handler in useMutation + invalidate
- [ ] outline/page.tsx -- QuizPickerModal: remove supabase.auth.getSession() calls

---

## Success Criteria

- Instructor sees only quizzes from their courses.
- Searchable by quiz title or course name.
- Each quiz card shows title, question count, course name, published status.
- Creating a new quiz works as before.
- Selecting existing quiz clones it into the lesson; activity list refreshes.
- No raw fetch calls in modal -- all through quizzesApi.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| quizzes.instructor key used elsewhere | Low | Key only declared in query-keys.ts; no pages use it |
| Card list performance with many quizzes | Low | max-h-64 scroll; client filter keeps list manageable |
| useQueryClient not available in modal | None | Outline page already inside QueryClientProvider |

---

## Security Considerations

- quizzesApi.listMine() calls GET /quizzes/mine scoped to authenticated user (Phase 1).
- Clone endpoint enforces course ownership server-side; malicious instructor cannot clone into other courses.

---

## Next Steps

- Verify /instructor/quizzes page still works after query-key rename.
- Optionally extract QuizPickerModal to components/activity/ if outline page grows too large.
