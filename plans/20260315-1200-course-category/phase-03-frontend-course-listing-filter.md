# Phase 03 — Frontend: Category Filter on Course Listing

**Date:** 2026-03-15
**Status:** Pending (depends on Phase 01)
**Priority:** Medium

---

## Context Links

- Plan overview: `plans/20260315-1200-course-category/plan.md`
- Backend phase: `plans/20260315-1200-course-category/phase-01-backend-category-api.md`
- Public courses page: `frontend/app/(public)/courses/page.tsx`
- API client: `frontend/lib/api.ts` (`coursesApi.list` already accepts `categoryId`)
- Query keys: `frontend/lib/query-keys.ts` (`queryKeys.courses.categories` exists)

---

## Overview

The public course listing at `/courses` currently filters by `search` and `level` client-side. Category filtering must go server-side (the backend `CourseQueryDto` already has `categoryId`). Add a category dropdown/pill filter that passes `categoryId` as a query param to `coursesApi.list()`.

---

## Key Insights

- `coursesApi.list()` already accepts `categoryId` — no API client changes needed.
- Current filtering is **client-side** (filter on already-fetched data). Category filter must be **server-side** — the query key must include `categoryId` so TanStack Query refetches when it changes.
- `queryKeys.courses.list({ limit: 50 })` is the current key — must include `categoryId` in params to avoid stale cache.
- Public page uses NeoBrutalism styling (`border-[3px] border-black`, `shadow-[4px_4px_0px_0px_#000]`) — category filter must match.
- Categories fetched separately via `coursesApi.getCategories()` (already in api.ts). Cache with `queryKeys.courses.categories`.
- Keep level filter as client-side (already implemented); move search to server-side too while touching the file (low-effort improvement).
- Fetch limit: keep at 50 for now; pagination is out of scope.

---

## Requirements

**Functional:**
- Category filter renders as horizontal pill buttons (matches level filter style)
- "All" pill selected by default (no category filter)
- Selecting a category pill refetches courses with `categoryId` param
- Only show categories that have at least one published course (to avoid empty results) — fetch via existing `GET /courses/categories` which now returns `_count.courses`
- Active pill visually distinct (NeoBrutalism: filled black background)

**Non-Functional:**
- No URL state for category filter (keep simple — YAGNI; URL state would require `useSearchParams` + Suspense wrapper)
- No pagination
- Loading skeleton shown during refetch

---

## Architecture

```
/courses/page.tsx (public)
  useQuery(categories)  → GET /courses/categories
  useQuery(courses)     → GET /courses?categoryId=X&limit=50
  [state: selectedCategoryId]

Filter UI:
  [All] [Category A] [Category B] ...  (pills)
  [Level select]  [Search input]
```

`selectedCategoryId` is local state. On change: update `coursesApi.list({ categoryId, limit: 50 })` query params; TanStack Query refetches.

---

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/app/(public)/courses/page.tsx` | Modify | Add category state, category query, category pill UI, pass `categoryId` to `coursesApi.list` |
| `frontend/lib/api.ts` | No change | `coursesApi.list` + `categoriesApi` already correct after Phase 01 |

---

## Implementation Steps

### Step 1 — Add category state and query

In `frontend/app/(public)/courses/page.tsx`:

```typescript
const [categoryId, setCategoryId] = useState('');

const { data: categoriesData } = useQuery({
  queryKey: queryKeys.courses.categories,
  queryFn: () => coursesApi.getCategories(),
  staleTime: 5 * 60 * 1000, // 5 min — categories rarely change
});
const categories = (categoriesData as Category[]) || [];
// Only show categories with at least 1 course
const activeCategories = categories.filter((c) => (c._count?.courses ?? 0) > 0);
```

Add `Category` type import from `@/lib/api` (added in Phase 02).

### Step 2 — Move course fetch to server-side params

Replace current query:
```typescript
// Before
queryKey: queryKeys.courses.list({ limit: 50 }),
queryFn: () => coursesApi.list({ limit: 50 }),

// After
queryKey: queryKeys.courses.list({ limit: 50, categoryId }),
queryFn: () => coursesApi.list({ limit: 50, ...(categoryId && { categoryId }) }),
```

### Step 3 — Update client-side filter

Remove `category` from client-side `filteredCourses` filter (it is now server-side). Keep `search` and `level` client-side (existing behavior — no regression).

### Step 4 — Add category pill filter UI

Insert between the page title and the existing filter bar, using the NeoBrutalism style:

```tsx
{activeCategories.length > 0 && (
  <div className="mb-6 flex flex-wrap gap-2">
    <button
      onClick={() => setCategoryId('')}
      className={`px-4 py-2 border-[3px] border-black font-bold text-sm transition-all
        ${categoryId === ''
          ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
          : 'bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5'
        }`}
      style={{ fontFamily: 'var(--font-space-grotesk)' }}
    >
      All
    </button>
    {activeCategories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => setCategoryId(cat.id)}
        className={`px-4 py-2 border-[3px] border-black font-bold text-sm transition-all
          ${categoryId === cat.id
            ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
            : 'bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5'
          }`}
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {cat.name}
      </button>
    ))}
  </div>
)}
```

### Step 5 — Verify skeleton shown on refetch

Current skeleton renders when `isLoading` is true. TanStack Query sets `isLoading=false` after first load; subsequent refetches use `isFetching`. Update condition:

```typescript
// Before
isLoading ? <skeletons> : ...

// After
(isLoading || isFetching) ? <skeletons> : ...
```

Destructure `isFetching` from `useQuery`.

---

## Todo List

- [ ] Add `categoryId` state to `frontend/app/(public)/courses/page.tsx`
- [ ] Add categories query (with `staleTime: 5 min`)
- [ ] Filter `activeCategories` to those with `_count.courses > 0`
- [ ] Update `courses` query key + queryFn to include `categoryId`
- [ ] Add category pill filter UI (NeoBrutalism style, above existing filters)
- [ ] Remove category from client-side `filteredCourses` (now server-side)
- [ ] Update loading check to `isLoading || isFetching`
- [ ] Import `Category` type from `@/lib/api`

---

## Success Criteria

- `/courses` page shows category pills when categories with courses exist
- Clicking a category pill refetches and shows only courses in that category
- "All" pill clears filter and shows all published courses
- No categories shown if all have 0 courses (graceful empty state)
- Skeleton re-shows during category switch (not a blank flash)
- Existing search and level filters still work alongside category filter

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `_count.courses` not returned by `GET /courses/categories` | Medium | Phase 01 explicitly adds this; verify before implementing |
| Many categories causing pill overflow | Low | `flex-wrap` handles it; no pagination needed at small scale |
| `isFetching` skeleton causes flicker on fast networks | Low | Acceptable UX; alternative is `keepPreviousData: true` (TanStack Query v5: `placeholderData: keepPreviousData`) |

---

## Security Considerations

- Public endpoint — no auth needed
- `categoryId` passed as query string to backend; Prisma parameterizes it — no injection risk
- `_count.courses` only counts courses matching `courseId` FK — no data leak

---

## Next Steps

- Smoke test end-to-end: create category in admin → tag course → verify filter works on public page
- Optional follow-up: add category badge to course cards (already rendered in instructor listing; replicate in public card)
