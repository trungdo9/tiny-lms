# Phase 02 — Frontend: Instructor UI (Create/Edit Path)

**Date:** 2026-03-20
**Status:** Pending (depends on Phase 1)
**Priority:** High

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Reference — Instructor courses list: `frontend/app/instructor/courses/page.tsx`
- Reference — Activity picker: `frontend/app/instructor/courses/[id]/activities/`
- Reference — Course outline DnD: `frontend/app/instructor/courses/[id]/outline/`
- API client: `frontend/lib/api.ts`
- Query keys: `frontend/lib/query-keys.ts`

---

## Overview

Create instructor-facing pages for managing learning paths. Reuse existing course outline DnD pattern for reordering and quiz-picker pattern for course picker modal.

---

## Requirements

- `/instructor/learning-paths` — list of instructor's paths (GET /learning-paths/mine)
- `/instructor/learning-paths/create` — create new path form
- `/instructor/learning-paths/[id]` — edit path (metadata + courses)
- Course picker modal — only shows instructor's own courses
- DnD reorder courses within path
- Publish/unpublish toggle

---

## Architecture

```
/instructor/learning-paths
  └─ LearningPathsListPage
       ├─ useLearningPathsMine() → GET /learning-paths/mine
       ├─ Table: title, courses count, enrolled, published, actions
       └─ "Create Path" button → /instructor/learning-paths/create

/instructor/learning-paths/create
  └─ CreateLearningPathPage
       ├─ Form: title, description, thumbnail
       └─ Submit → POST /learning-paths → redirect to edit page

/instructor/learning-paths/[id]
  └─ EditLearningPathPage
       ├─ Metadata form: title, description, thumbnail, publish toggle
       ├─ Courses list with DnD reorder (DndContext from @dnd-kit/core)
       │    └─ Each row: course thumbnail, title, remove button
       ├─ "Add Course" button → CoursePicker modal
       └─ Save buttons (separate: metadata save vs course reorder auto-save)

CoursePicker modal (new component)
  ├─ Fetches GET /courses (instructor's own courses only — backend filters by instructorId)
  ├─ Excludes already-added courses
  ├─ Search/filter input
  └─ Select → POST /learning-paths/:id/courses
```

---

## Related Code Files

| File | Action |
|------|--------|
| `frontend/lib/api.ts` | Add `learningPathsApi` section |
| `frontend/lib/query-keys.ts` | Add `learningPaths` keys |
| `frontend/app/instructor/learning-paths/page.tsx` | Create — list page |
| `frontend/app/instructor/learning-paths/create/page.tsx` | Create — create form |
| `frontend/app/instructor/learning-paths/[id]/page.tsx` | Create — edit page |
| `frontend/components/learning-paths/course-picker-modal.tsx` | Create — course picker |

---

## Implementation Steps

### Step 1 — Extend `learningPathsApi` in `frontend/lib/api.ts`

> **`learningPathsApi` already exists** at lines 594–614. Only add missing methods:

```typescript
// Add to existing learningPathsApi object:
getMine: () => fetchApi<any[]>('/learning-paths/mine'),
enroll: (id: string) => fetchApi<any>(`/learning-paths/${id}/enroll`, { method: 'POST' }),
```

### Step 2 — Add query keys to `frontend/lib/query-keys.ts`

```typescript
learningPaths: {
  all: ['learningPaths'] as const,
  mine: () => [...queryKeys.learningPaths.all, 'mine'] as const,
  detail: (id: string) => [...queryKeys.learningPaths.all, id] as const,
  progress: (id: string) => [...queryKeys.learningPaths.all, id, 'progress'] as const,
},
```

### Step 3 — List page (`/instructor/learning-paths/page.tsx`)

- `useQuery(queryKeys.learningPaths.mine(), learningPathsApi.getMine)`
- Table columns: title, courses count, enrolled count, status badge (Published/Draft), actions (Edit, Delete)
- Delete with confirmation → `useMutation` → `learningPathsApi.delete`
- "New Learning Path" button → router.push('/instructor/learning-paths/create')

### Step 4 — Create page (`/instructor/learning-paths/create/page.tsx`)

Simple form:
- Title (required), Description (textarea), Thumbnail URL (optional)
- Submit → `learningPathsApi.create()` → on success → `router.push('/instructor/learning-paths/' + id)`

### Step 5 — Edit page (`/instructor/learning-paths/[id]/page.tsx`)

Two sections:
1. **Metadata card** — form with title/description/thumbnail + publish toggle + Save button
2. **Courses card** — DnD sortable list + "Add Course" button

DnD pattern (reuse `@dnd-kit/core` already used in course outline):
```typescript
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={courseIds}>
    {courses.map(c => <SortableCourseRow key={c.courseId} {...c} onRemove={handleRemove} />)}
  </SortableContext>
</DndContext>
```
On drag end → call `learningPathsApi.reorderCourses(id, newOrder)` + invalidate query.

### Step 6 — CoursePicker modal component

```
frontend/components/learning-paths/course-picker-modal.tsx
```
- Props: `pathId`, `existingCourseIds`, `onAdd(courseId)`, `onClose`
- Fetches instructor's courses: `GET /courses?instructorId=me` (or use existing instructor courses endpoint)
- Filter out already-added courses client-side
- Search input for filtering by title
- Click course → `learningPathsApi.addCourse(pathId, courseId)` → close modal

---

## Todo List

- [ ] Add `learningPathsApi` to `frontend/lib/api.ts`
- [ ] Add `learningPaths` query keys to `frontend/lib/query-keys.ts`
- [ ] Create `frontend/app/instructor/learning-paths/page.tsx` (list)
- [ ] Create `frontend/app/instructor/learning-paths/create/page.tsx`
- [ ] Create `frontend/app/instructor/learning-paths/[id]/page.tsx` (edit + DnD + course picker)
- [ ] Create `frontend/components/learning-paths/course-picker-modal.tsx`
- [ ] Add "Learning Paths" link to instructor navigation

---

## Success Criteria

- [ ] Instructor can create a learning path
- [ ] Instructor can add only their own courses
- [ ] Courses can be reordered via drag-and-drop
- [ ] Courses can be removed from path
- [ ] Path can be published/unpublished
- [ ] Path can be deleted (with confirmation)
- [ ] List page shows course count and enrollment count per path
