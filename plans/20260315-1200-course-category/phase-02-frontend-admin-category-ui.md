# Phase 02 — Frontend: Category Admin Management UI

**Date:** 2026-03-15
**Status:** Pending (depends on Phase 01)
**Priority:** High

---

## Context Links

- Plan overview: `plans/20260315-1200-course-category/plan.md`
- Backend phase: `plans/20260315-1200-course-category/phase-01-backend-category-api.md`
- Settings layout (tab nav pattern): `frontend/app/admin/settings/layout.tsx`
- Departments page (UI pattern to follow): `frontend/app/admin/settings/departments/page.tsx`
- API client: `frontend/lib/api.ts`
- Query keys: `frontend/lib/query-keys.ts`

---

## Overview

Add a "Categories" tab to admin settings and a full CRUD page. Categories are simple (name + slug + optional parent). UI pattern: inline edit/delete rows, inline create form — same as the Departments settings page.

---

## Key Insights

- Settings layout tab nav is in `frontend/app/admin/settings/layout.tsx` — add one entry to `tabs` array.
- Departments page uses direct API calls + local state (no TanStack Query). Categories page can follow same pattern for consistency.
- `queryKeys.courses.categories` already exists in `query-keys.ts` — use if TanStack Query is preferred; otherwise stick with local state to match departments pattern.
- Category has `parentId` — support flat list with optional parent selector. Do NOT build a tree UI (YAGNI — most LMSes have only a few top-level categories).
- Admin-only: page should be under `/admin/settings/categories` (fits existing settings tab structure).
- Slug: auto-generate from name on the frontend (show it, let admin override). Mirror backend `generateSlug` logic client-side: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`.

---

## Requirements

**Functional:**
- List all categories (name, slug, parent name, course count)
- Create category (name required, slug auto-generated, parent optional)
- Edit category inline (name, slug, parent)
- Delete category (confirm dialog; show error if has courses/children)
- Display course count per category (from `_count.courses` returned by Phase 01)

**Non-Functional:**
- No separate route per category — all inline on one page
- No pagination (expect < 100 categories in any LMS)

---

## Architecture

```
/admin/settings/categories/page.tsx    ← new page
frontend/app/admin/settings/layout.tsx ← add tab entry
frontend/lib/api.ts                    ← add categoriesApi
```

No new components needed — keep everything in the page file (< 200 LOC target; split if exceeded).

---

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/app/admin/settings/layout.tsx` | Modify | Add `{ name: 'Categories', href: '/admin/settings/categories' }` to `tabs` array |
| `frontend/app/admin/settings/categories/page.tsx` | Create | Full CRUD page |
| `frontend/lib/api.ts` | Modify | Add `categoriesApi` object |
| `frontend/lib/query-keys.ts` | No change | `queryKeys.courses.categories` already exists |

---

## Implementation Steps

### Step 1 — Add `categoriesApi` to `frontend/lib/api.ts`

Add after `coursesApi`:

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  createdAt: string;
  _count?: { courses: number };
}

export const categoriesApi = {
  list: () => fetchApi<Category[]>('/courses/categories'),
  get: (id: string) => fetchApi<Category>(`/courses/categories/${id}`),
  create: (data: { name: string; slug?: string; parentId?: string }) =>
    fetchApi<Category>('/courses/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; slug?: string; parentId?: string }) =>
    fetchApi<Category>(`/courses/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi(`/courses/categories/${id}`, { method: 'DELETE' }),
};
```

### Step 2 — Add Categories tab to settings layout

In `frontend/app/admin/settings/layout.tsx`, add to `tabs` array:

```typescript
{ name: 'Categories', href: '/admin/settings/categories' },
```

Place after `'Departments'` entry.

### Step 3 — Create categories page

File: `frontend/app/admin/settings/categories/page.tsx`

Structure:
- `'use client'` directive
- State: `categories`, `loading`, `message`, `editingId`, `showAddForm`
- `fetchCategories()` — calls `categoriesApi.list()`, sets state
- `handleCreate(data)` — calls `categoriesApi.create()`, refreshes list
- `handleUpdate(id, data)` — calls `categoriesApi.update()`, refreshes list
- `handleDelete(id, name)` — confirm dialog, calls `categoriesApi.delete()`, shows backend error message on 400

UI layout:
```
[+ Add Category] button (top right)

[Add form — shown inline when showAddForm=true]
  Name: [input]   Slug: [auto-filled input]   Parent: [select]   [Save] [Cancel]

Table:
  Name | Slug | Parent | Courses | Actions
  row  | row  | row    | count   | [Edit] [Delete]

  [Edit row — inline form replacing the row]
    Name: [input]  Slug: [input]  Parent: [select]  [Save] [Cancel]
```

Client-side slug generation helper:
```typescript
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
```

Auto-fill slug when user types name (only if slug field is untouched). Allow manual override.

### Step 4 — Handle delete error message

Backend returns 400 with `{ message: "Cannot delete: 3 course(s) still assigned" }`. Catch and display this in the page message banner.

---

## Todo List

- [ ] Add `Category` interface and `categoriesApi` to `frontend/lib/api.ts`
- [ ] Add `Categories` tab entry to `frontend/app/admin/settings/layout.tsx`
- [ ] Create directory `frontend/app/admin/settings/categories/`
- [ ] Create `frontend/app/admin/settings/categories/page.tsx` with:
  - [ ] Category list table (name, slug, parent, course count)
  - [ ] Inline add form (name, slug auto-gen, parent select)
  - [ ] Inline edit row
  - [ ] Delete with confirm + error display
  - [ ] Loading state
  - [ ] Success/error message banner (auto-dismiss 3s)

---

## Success Criteria

- Navigate to `/admin/settings/categories` — page loads with category list
- Create category: form saves, list refreshes, new category visible
- Edit category: inline edit saves correctly, slug can be overridden
- Delete category with courses: error message shown, category remains
- Delete empty category: removed from list
- Parent selector shows all categories (excluding self when editing)

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Circular parent reference (category is its own parent) | Low | Backend: add check; Frontend: filter self from parent dropdown |
| Page auth — non-admin reaches `/admin/settings/categories` | Low | Admin portal already has auth middleware; no extra work needed |
| Slug collision (user manually enters duplicate) | Low | Show backend 409 error in message banner |

---

## Security Considerations

- Page lives under `/admin/` — admin layout/middleware already restricts access
- `categoriesApi` write calls use `fetchApi` which attaches Supabase JWT; backend enforces `admin` role
- No user-supplied HTML rendered — XSS not a concern

---

## Next Steps

- Phase 03 (public course listing filter) can start in parallel
- After completion: verify category picker in course create/edit forms works end-to-end (already wired via `categoryId` in DTOs and service)
