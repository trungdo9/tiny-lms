# Phase 02 — Frontend Users Page
**Date:** 2026-03-03 | **Priority:** High | **Status:** Pending (depends on Phase 1)

## Context Links
- [Plan overview](./plan.md)
- [Frontend patterns research](./research/researcher-02-frontend-patterns.md)
- [Phase 01](./phase-01-backend-api.md)
- [frontend/lib/api.ts](../../frontend/lib/api.ts)
- [frontend/lib/query-keys.ts](../../frontend/lib/query-keys.ts)
- [frontend/app/admin/layout.tsx](../../frontend/app/admin/layout.tsx)

## Overview
Create `/admin/users` — a full-page client component with stats bar, filter bar, data table, and pagination. All filter/sort/page state lives in URL search params. `queryKeys.adminUsers` already exists.

## Key Insights
- `queryKeys.adminUsers.all(params)` already defined in `query-keys.ts` — no change needed
- `adminUsersApi` in `api.ts` already has `getAll`, `getById`, `updateUser`, `deactivateUser` — only add `createUser`, `reactivateUser`, `getStats`
- `admin/layout.tsx` provides `AdminGuard` + `DashboardHeader` + `DashboardFooter` — page only needs content
- URL params as state: shareable URLs, browser back/forward, no extra state library
- Use `useTransition` + 300ms debounce for search input to avoid query spam
- Page is a `'use client'` component (no server-side data fetch needed)
- Design tokens from existing admin pages: `bg-gray-50` body, `bg-white border border-slate-200 rounded-xl shadow-sm` cards

## Requirements

### Functional
1. Stats bar: 5 cards (Total, Students, Instructors, Admins, Inactive) sourced from `GET /users/admin/stats`
2. Filter bar: search input (debounced 300ms), role dropdown, status dropdown, sort dropdown, "Add User" button
3. Table columns: Avatar+Name+Email, Role badge, Status badge, Joined date, Last login, Actions menu
4. Pagination: page-based, 20 per page, prev/next + page numbers
5. Actions per row: Edit (opens edit modal), Deactivate/Reactivate (2-step confirm dialog)
6. URL params: `q`, `role`, `isActive`, `sortBy`, `sortOrder`, `page`

### Non-functional
- Loading skeleton for table rows
- Empty state when no results
- All mutations: optimistic update with rollback on error
- Errors shown via toast

## Architecture

### File structure
```
frontend/app/admin/users/
└── page.tsx        — single file, 'use client'
```
Single file is correct here: the page logic is cohesive and not reused elsewhere (KISS + YAGNI).

### Component tree
```
UsersPage (page.tsx)
├── StatsBar          — inline sub-component, uses useQuery(adminUsers.stats)
├── FilterBar         — inline sub-component, writes URL params
├── UsersTable        — inline sub-component, reads URL params → useQuery
│   ├── UserRow       — inline, renders each row
│   └── TableSkeleton — inline loading state
└── Pagination        — inline sub-component
```
All sub-components defined in the same file (no external component files needed — they're page-specific).

### API extensions needed in `frontend/lib/api.ts`
```typescript
// Add to adminUsersApi:
getStats: () =>
  fetchApi('/users/admin/stats'),

createUser: (data: { email: string; password: string; fullName?: string; role?: string }) =>
  fetchApi('/users/admin', { method: 'POST', body: JSON.stringify(data) }),

reactivateUser: (id: string) =>
  fetchApi(`/users/admin/${id}/reactivate`, { method: 'PUT' }),
```

### URL param pattern
```typescript
// Read
const searchParams = useSearchParams();
const page     = parseInt(searchParams.get('page')  || '1');
const q        = searchParams.get('q')        || '';
const role     = searchParams.get('role')     || '';
const isActive = searchParams.get('isActive') || '';
const sortBy   = searchParams.get('sortBy')   || 'createdAt';
const sortOrder= searchParams.get('sortOrder')|| 'desc';

// Write (helper)
function updateParams(updates: Record<string, string>) {
  const params = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
  params.set('page', '1');   // always reset page on filter change
  router.push(`?${params.toString()}`);
}
```

### Debounced search
Local `searchInput` state → `useDebouncedValue(searchInput, 300)` → `useEffect` calls `updateParams({ q: debouncedQ })` when debounced value settles. Define `useDebouncedValue<T>(value, delay)` at top of file: `setTimeout` inside `useEffect`, returns stable debounced value.

### Optimistic deactivate/reactivate
```typescript
const toggleStatus = useMutation({
  mutationFn: ({ id, active }: { id: string; active: boolean }) =>
    active
      ? adminUsersApi.reactivateUser(id)
      : adminUsersApi.deactivateUser(id),
  onMutate: async ({ id, active }) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.adminUsers.all(listParams) });
    const prev = queryClient.getQueryData(queryKeys.adminUsers.all(listParams));
    queryClient.setQueryData(queryKeys.adminUsers.all(listParams), (old: any) => ({
      ...old,
      users: old?.users?.map((u: any) => u.id === id ? { ...u, isActive: active } : u),
    }));
    return { prev };
  },
  onError: (_, __, ctx) => {
    queryClient.setQueryData(queryKeys.adminUsers.all(listParams), ctx?.prev);
    toast.error('Failed to update user status');
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all(listParams) }),
});
```

### Design tokens
```
Stats card:    bg-white border border-slate-200 rounded-xl shadow-sm p-4
Table header:  bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider
Table row:     hover:bg-gray-50 border-b border-gray-100
Role badges:   student=bg-blue-100 text-blue-700 | instructor=bg-amber-100 text-amber-700 | admin=bg-red-100 text-red-700
Status badges: active=bg-emerald-100 text-emerald-700 | inactive=bg-gray-100 text-gray-500
Primary btn:   bg-slate-900 text-white hover:bg-slate-700
```

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/app/admin/users/page.tsx` | CREATE | Full users management page |
| `frontend/lib/api.ts` | MODIFY | Add `getStats`, `createUser`, `reactivateUser` to `adminUsersApi` |

## Implementation Steps

1. **`frontend/lib/api.ts`** — add `getStats`, `createUser`, `reactivateUser` to `adminUsersApi` object
2. **Create** `frontend/app/admin/users/page.tsx` with `'use client'` directive
3. **Add imports**: `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`; `useSearchParams`, `useRouter` from `next/navigation`; `useState`, `useEffect`, `useTransition` from `react`; `adminUsersApi` from `@/lib/api`; `queryKeys` from `@/lib/query-keys`; toast from shadcn
4. **Define `useDebouncedValue` hook** at top of file
5. **Implement `StatsBar`** sub-component — `useQuery` on `adminUsers.stats`, render 5 stat cards
6. **Implement `FilterBar`** sub-component — search input with debounce, role/status/sort dropdowns, "Add User" button that sets `?modal=create`
7. **Implement `UsersTable`** sub-component — `useQuery` on `adminUsers.all(params)`, table with skeleton loading and empty state
8. **Implement `UserRow`** — role badge, status badge, formatted dates, actions dropdown (Edit, Deactivate/Reactivate)
9. **Implement confirm dialog** for deactivate/reactivate (use shadcn `AlertDialog`)
10. **Implement `Pagination`** — prev/next buttons, page number display, disable at boundaries
11. **Implement `toggleStatus` mutation** with optimistic update pattern
12. **Wire modal triggers**: "Add User" → `?modal=create`, "Edit" → `?modal=edit&editId=<id>` (modals implemented in Phase 3)

## Todo List
- [ ] Extend `adminUsersApi` in `api.ts` with `getStats`, `createUser`, `reactivateUser`
- [ ] Create `frontend/app/admin/users/page.tsx`
- [ ] Implement `useDebouncedValue` helper
- [ ] Build `StatsBar` with stats query
- [ ] Build `FilterBar` with URL param writes and debounced search
- [ ] Build `UsersTable` with loading skeleton and empty state
- [ ] Build `UserRow` with role/status badges and actions menu
- [ ] Implement confirm dialog for status toggle
- [ ] Build `Pagination` component
- [ ] Implement `toggleStatus` mutation with optimistic updates
- [ ] Wire "Add User" and "Edit" to modal URL params (stubs for Phase 3)

## Success Criteria
- Navigating to `/admin/users` shows stats bar, filter bar, and user table
- Typing in search filters table after 300ms debounce
- Changing role/status/sort dropdowns updates URL params and refetches
- Deactivating a user shows confirm dialog; on confirm, row updates immediately (optimistic)
- Pagination controls work correctly; page resets to 1 on filter change
- Non-admin users redirected by `AdminGuard` in layout

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `useSearchParams` requires `Suspense` boundary in Next.js 14+ | High | Medium | Wrap page in `<Suspense>` or use `useRouter` directly |
| Optimistic update key mismatch (wrong params object) | Medium | Medium | Store current `listParams` in a stable variable before mutation |
| Stats query stale on user create/deactivate | Low | Low | Invalidate `adminUsers.stats` key alongside list key in mutation `onSuccess` |

## Security Considerations
- `AdminGuard` in `admin/layout.tsx` redirects non-admins before page renders
- No sensitive data (passwords) stored in URL params
- Role change displayed immediately via optimistic update but confirmed by server response

## Next Steps
- Phase 3: implement Create User and Edit User modals triggered by `?modal=create` and `?modal=edit&editId=<id>`
