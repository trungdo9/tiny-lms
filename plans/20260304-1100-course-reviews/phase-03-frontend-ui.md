# Phase 03 — Frontend UI

**Ref:** [plan.md](./plan.md)
**Depends on:** [phase-02-backend-api.md](./phase-02-backend-api.md)
**Blocks:** nothing

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Add reviews API methods, query keys, ReviewSection component, update public course page |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Public course page (`/courses/[slug]`) uses `useState`/`useEffect` (no TanStack Query) — new review section follows same pattern with `useAuth()` for current user
- Neobrutalist design: thick black borders, yellow accents (`#ffdb33`), `shadow-[4px_4px_0px_0px_#000]`, `font-black` headings — match existing hero section style
- Star picker: pure CSS/inline — no library, just 5 clickable `★` characters with yellow fill
- Rating display: show avg as `★ 4.5` with `(42 reviews)` subtitle; hide entirely if `totalReviews === 0`
- Review list: show 5 at a time with "Show more" button (append pattern, not pagination)
- Review form shows only when `enrolled === true`; on submit replaces existing review inline
- No TanStack Query in this page — use `useState` + direct `api` calls for consistency

---

## Requirements

1. `frontend/lib/api.ts`: add `reviewsApi` object
2. `frontend/lib/query-keys.ts`: add `reviews` key group (for future use / instructor pages)
3. New `frontend/components/course-review-section.tsx` — stars display + form + list
4. Update `frontend/app/(public)/courses/[slug]/page.tsx`:
   - Add `averageRating`, `totalReviews` to `Course` interface
   - Import + render `CourseReviewSection` below curriculum

---

## Architecture

### `frontend/lib/api.ts` — additions

```typescript
export interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; fullName: string | null; avatarUrl: string | null };
}

export interface ReviewStats {
  averageRating: number | null;
  totalReviews: number;
  distribution: Record<string, number>; // { "1": n, "2": n, ... "5": n }
}

export const reviewsApi = {
  list: (courseId: string, page = 1, limit = 10) =>
    fetchApi<{ reviews: CourseReview[]; pagination: object }>(`/courses/${courseId}/reviews?page=${page}&limit=${limit}`),

  stats: (courseId: string) =>
    fetchApi<ReviewStats>(`/courses/${courseId}/reviews/stats`),

  upsert: (courseId: string, data: { rating: number; comment?: string }) =>
    fetchApi(`/courses/${courseId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),

  delete: (courseId: string, reviewId: string) =>
    fetchApi(`/courses/${courseId}/reviews/${reviewId}`, { method: 'DELETE' }),
};
```

### `frontend/lib/query-keys.ts` — additions

```typescript
reviews: {
  list: (courseId: string, page?: number) => ['reviews', 'list', courseId, page] as const,
  stats: (courseId: string) => ['reviews', 'stats', courseId] as const,
},
```

### `frontend/components/course-review-section.tsx`

Self-contained component:
- Props: `courseId: string`, `enrolled: boolean`, `currentUserId?: string`
- Internal state: `stats`, `reviews`, `myReview`, `showForm`, `rating (1-5)`, `comment`, `page`, `hasMore`
- `useEffect` on mount: fetch `stats` + `reviews?page=1` in parallel
- Star picker subcomponent: `[1,2,3,4,5].map(n => <span onClick={() => setRating(n)} className={n <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>)`
- Submit: call `reviewsApi.upsert`, then refresh stats + reviews list (reset to page 1)
- Show more: append next page to reviews array

Design (neobrutalist):
```
┌─────────────────────────────────────────────────┐
│ ★ 4.5  RATINGS & REVIEWS  (42 reviews)          │  ← yellow bg header
├─────────────────────────────────────────────────┤
│ Distribution bars (1-5 stars, black border)     │
├─────────────────────────────────────────────────┤
│ [Only if enrolled] Write your review:           │
│  ★ ★ ★ ★ ☆  (star picker)                      │
│  [ textarea: share your thoughts... ]           │
│  [Submit Review]                                │
├─────────────────────────────────────────────────┤
│ Review cards (avatar, name, stars, comment)     │
│ [Show more]                                     │
└─────────────────────────────────────────────────┘
```

### Public course page updates

```typescript
// Course interface — add:
averageRating?: number | null;
totalReviews?: number;

// loadCourse — after setCourse:
// averageRating/totalReviews already on course object from GET /courses/:id

// JSX — after curriculum section:
<CourseReviewSection
  courseId={course.id}
  enrolled={enrolled}
  currentUserId={user?.id}
/>
```

---

## Related Code Files

| File | Change |
|------|--------|
| `frontend/lib/api.ts` | Add `CourseReview`, `ReviewStats` types + `reviewsApi` |
| `frontend/lib/query-keys.ts` | Add `reviews` key group |
| `frontend/components/course-review-section.tsx` | NEW |
| `frontend/app/(public)/courses/[slug]/page.tsx` | Update `Course` interface + render `CourseReviewSection` |

---

## Implementation Steps

1. Add types + `reviewsApi` to `api.ts`
2. Add `reviews` key group to `query-keys.ts`
3. Create `course-review-section.tsx` component
4. Update public course page:
   - Add `averageRating?`, `totalReviews?` to `Course` interface
   - Import + render `CourseReviewSection` below curriculum `</div>`
5. Run `npx tsc --noEmit` in `frontend/` to check types

---

## Todo List

- [ ] Add `CourseReview`, `ReviewStats` types to `api.ts`
- [ ] Add `reviewsApi` to `api.ts`
- [ ] Add `reviews` key group to `query-keys.ts`
- [ ] Create `course-review-section.tsx`
- [ ] Update `Course` interface in public course page
- [ ] Render `CourseReviewSection` in public course page
- [ ] `npx tsc --noEmit` passes

---

## Success Criteria

- Public course page shows avg rating + total reviews count when reviews exist
- Rating distribution bars render proportionally
- Enrolled student sees review form; can select 1-5 stars + optional comment
- Submitting updates the stats + adds/replaces review in the list
- "Show more" loads next 10 reviews and appends
- Unenrolled / guest visitors see read-only list (no form)
- Courses with zero reviews show no rating section (graceful empty state)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `fetchApi` adds auth header even for public GET — fine, won't break | Low | None | — |
| `totalReviews` not yet on course object from GET (if not in Prisma include) | Medium | Medium | Check backend `findOne` includes new fields; or fetch stats separately |
| Public page already large (372 LOC) — adding more JSX increases file size | Low | Low | Component is self-contained, only ~10 lines added to page |

---

## Security Considerations

- Review form only rendered when `enrolled === true` (UI gate); backend enforces enrollment check
- `currentUserId` used only for detecting own review — never sent to backend (derived server-side)

---

## Unresolved Questions

1. Does `GET /courses/:id` return `averageRating` + `totalReviews`? Need to verify `courses.service.ts` `findOne()` includes these fields (they're on the Course model so Prisma returns them automatically).
2. Should avg rating appear on course cards in `/courses` listing page? (Not in scope for MVP)
