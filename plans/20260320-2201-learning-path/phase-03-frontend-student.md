# Phase 03 — Frontend: Student UI (Browse + Enroll + Progress)

**Date:** 2026-03-20
**Status:** Pending (depends on Phase 1)
**Priority:** High

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Reference — Course catalog: `frontend/app/courses/page.tsx`
- Reference — Course detail: `frontend/app/courses/[slug]/page.tsx`
- Reference — Certificates page: `frontend/app/certificates/page.tsx`
- API: `learningPathsApi` (added in Phase 2)

---

## Overview

Student-facing pages: public browse catalog of paths, path detail with enroll button, progress tracking showing per-course completion, and certificate display on completion.

---

## Architecture

```
/learning-paths  (public)
  └─ LearningPathsCatalogPage
       ├─ GET /learning-paths (published only)
       ├─ Grid of LearningPathCard components
       └─ Each card: thumbnail, title, creator, N courses, enroll CTA

/learning-paths/[id]  (public, auth-aware)
  └─ LearningPathDetailPage
       ├─ Path header: thumbnail, title, description, creator
       ├─ Enroll button (if not enrolled) OR Progress bar (if enrolled)
       ├─ Courses list (ordered)
       │    └─ Each course: thumbnail, title, completion badge (if enrolled)
       └─ Certificate section (if completedAt set)
```

---

## Related Code Files

| File | Action |
|------|--------|
| `frontend/app/learning-paths/page.tsx` | Create — public catalog |
| `frontend/app/learning-paths/[id]/page.tsx` | Create — path detail |
| `frontend/components/learning-paths/learning-path-card.tsx` | Create — catalog card |
| `frontend/components/learning-paths/path-progress-bar.tsx` | Create — progress display |

---

## Implementation Steps

### Step 1 — Catalog page (`/learning-paths/page.tsx`)

```typescript
// Public page — no auth required
const { data: paths } = useQuery(queryKeys.learningPaths.all, learningPathsApi.getAll);

// Grid layout matching /courses page style
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {paths?.map(path => <LearningPathCard key={path.id} path={path} />)}
</div>
```

**LearningPathCard** props: `{ id, title, description, thumbnailUrl, creator, coursesCount }`
- Links to `/learning-paths/[id]`
- Shows: thumbnail, title, creator name, "{N} courses" badge

### Step 2 — Detail page (`/learning-paths/[id]/page.tsx`)

Auth-aware: if logged in, fetch `GET /learning-paths/:id/progress` for enrollment state.

```typescript
const { data: path } = useQuery(queryKeys.learningPaths.detail(id), () => learningPathsApi.getById(id));
const { data: progress } = useQuery(
  queryKeys.learningPaths.progress(id),
  () => learningPathsApi.getProgress(id),
  { enabled: !!user }  // only fetch if logged in
);

const isEnrolled = progress !== undefined;
const overallProgress = progress?.overallProgress ?? 0;
```

**Enroll button behavior:**
```typescript
const enrollMutation = useMutation(
  () => learningPathsApi.enroll(id),
  { onSuccess: () => queryClient.invalidateQueries(queryKeys.learningPaths.progress(id)) }
);

// If not logged in → redirect to /login
// If enrolled → show progress bar
// If not enrolled → show "Enroll Now" button
```

**Courses list:**
- Ordered by `orderIndex`
- If enrolled: show completion badge per course (green check if `completionPercentage === 100`)
- Course title links to `/courses/[slug]`

**Certificate section** (show if `progress?.overallProgress === 100`):
```tsx
{overallProgress === 100 && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <h3>Congratulations! You've completed this path.</h3>
    <Link href="/certificates">View Certificate</Link>
  </div>
)}
```

### Step 3 — PathProgressBar component

```typescript
// frontend/components/learning-paths/path-progress-bar.tsx
export function PathProgressBar({ completed, total, percent }: Props) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{completed}/{total} courses completed</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
```

### Step 4 — Add to public navigation

Add "Learning Paths" link to `frontend/components/public-header.tsx` or student dashboard navigation.

---

## Todo List

- [ ] Create `frontend/app/learning-paths/page.tsx` (catalog)
- [ ] Create `frontend/app/learning-paths/[id]/page.tsx` (detail + enroll)
- [ ] Create `frontend/components/learning-paths/learning-path-card.tsx`
- [ ] Create `frontend/components/learning-paths/path-progress-bar.tsx`
- [ ] Add "Learning Paths" to public navigation header
- [ ] Add "Learning Paths" to student dashboard sidebar/nav
- [ ] Test: unauthenticated user can browse paths
- [ ] Test: enrolling path auto-enrolls all courses
- [ ] Test: progress bar updates as courses complete

---

## Success Criteria

- [ ] `/learning-paths` shows all published paths
- [ ] Path detail shows course list with order
- [ ] Unenrolled student sees "Enroll Now" button
- [ ] Enrolled student sees progress bar
- [ ] Enrolling path auto-enrolls all courses in path
- [ ] Per-course completion badge shown when enrolled
- [ ] Completion message shown when all courses done (100%)
- [ ] Unauthenticated user clicking enroll → redirected to login
