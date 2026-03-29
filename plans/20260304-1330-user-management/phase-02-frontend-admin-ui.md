# Phase 02 — Frontend Admin UI
**Date:** 2026-03-04 | **Priority:** High | **Status:** Pending (depends on Phase 1)

## Context Links
- [Plan overview](./plan.md)
- [Phase 01](./phase-01-backend-api.md)
- [frontend/lib/api.ts](../../frontend/lib/api.ts) — `adminUsersApi` already has `getAll`, `getById`, `updateUser`, `deactivateUser`
- [frontend/lib/query-keys.ts](../../frontend/lib/query-keys.ts) — `adminUsers.all(params)` and `adminUsers.detail(id)` already exist
- [frontend/app/admin/layout.tsx](../../frontend/app/admin/layout.tsx) — provides `AdminGuard` + `DashboardHeader/Footer`
- [frontend/app/admin/settings/page.tsx](../../frontend/app/admin/settings/page.tsx) — reference for admin page patterns

## Overview
Create `/admin/users` page: stats bar, search/filter bar, data table with pagination, create/edit dialogs, role management, deactivate/reactivate with confirmation. Single `'use client'` file. All filter/pagination state in URL params.

## Key Insights
- `queryKeys.adminUsers` already defined — no changes to `query-keys.ts`
- `adminUsersApi` needs 4 additions: `getStats`, `createUser`, `reactivateUser`, `resetPassword`
- `admin/layout.tsx` handles auth guard — page only renders content
- Design tokens from existing admin pages: `bg-white border border-slate-200 rounded-xl shadow-sm`
- Use shadcn/ui components: `Dialog`, `AlertDialog`, `Select`, `Input`, `Button`, `Badge`, `DropdownMenu`, `Table`

## Requirements

### Functional
1. **Stats bar**: 5 cards (Total, Students, Instructors, Admins, Inactive) from `GET /users/admin/stats`
2. **Filter bar**: debounced search input (300ms), role dropdown (all/student/instructor/admin), status dropdown (all/active/inactive), sort dropdown, "Add User" button
3. **Data table columns**: Avatar+Name+Email, Role (badge), Status (badge), Created date, Last login, Actions menu
4. **Pagination**: 20/page, prev/next + page numbers
5. **Create user dialog**: email, password, full name, role select
6. **Edit user dialog**: full name, bio, phone, role select, active toggle, reset password section
7. **Deactivate/Reactivate**: confirmation dialog before action
8. **URL params**: `q`, `role`, `isActive`, `sortBy`, `sortOrder`, `page`

### Non-functional
- Loading skeleton for table
- Empty state when no results
- Optimistic updates on status toggle
- Error/success feedback via toast

## Architecture

### File Structure
```
frontend/app/admin/users/
  page.tsx          — single 'use client' file with all sub-components inline
```

### Component Tree (all inline in page.tsx)
```
AdminUsersPage
  StatsBar          — useQuery(adminUsers.stats)
  FilterBar         — search input + dropdowns, writes URL params
  UsersTable        — useQuery(adminUsers.all(params)), table rows
  Pagination        — prev/next + page numbers
  CreateUserDialog  — Dialog with form, useMutation
  EditUserDialog    — Dialog with form + reset password, useMutation
```

### API Extensions (`frontend/lib/api.ts`)
Add to existing `adminUsersApi`:
```typescript
getStats: () => fetchApi('/users/admin/stats'),

createUser: (data: { email: string; password: string; fullName?: string; role?: string }) =>
  fetchApi('/users/admin', { method: 'POST', body: JSON.stringify(data) }),

reactivateUser: (id: string) =>
  fetchApi(`/users/admin/${id}/reactivate`, { method: 'PUT' }),

resetPassword: (id: string, data: { newPassword: string }) =>
  fetchApi(`/users/admin/${id}/reset-password`, { method: 'PUT', body: JSON.stringify(data) }),
```

### URL Param Pattern
```typescript
const searchParams = useSearchParams();
const params = {
  page: parseInt(searchParams.get('page') || '1'),
  q: searchParams.get('q') || '',
  role: searchParams.get('role') || '',
  isActive: searchParams.get('isActive') || '',
  sortBy: searchParams.get('sortBy') || 'createdAt',
  sortOrder: searchParams.get('sortOrder') || 'desc',
};

function updateParams(updates: Record<string, string>) {
  const p = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
  if (!updates.page) p.set('page', '1'); // reset page on filter change
  router.push(`?${p.toString()}`);
}
```

### Debounced Search
Define inline `useDebouncedValue(value, delay)` hook using `useState` + `useEffect` + `setTimeout`.

### Optimistic Deactivate/Reactivate
```typescript
const toggleStatus = useMutation({
  mutationFn: ({ id, active }: { id: string; active: boolean }) =>
    active ? adminUsersApi.reactivateUser(id) : adminUsersApi.deactivateUser(id),
  onMutate: async ({ id, active }) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.adminUsers.all(listParams) });
    const prev = queryClient.getQueryData(queryKeys.adminUsers.all(listParams));
    queryClient.setQueryData(queryKeys.adminUsers.all(listParams), (old: any) => ({
      ...old, users: old?.users?.map((u: any) => u.id === id ? { ...u, isActive: active } : u),
    }));
    return { prev };
  },
  onError: (_, __, ctx) => queryClient.setQueryData(queryKeys.adminUsers.all(listParams), ctx?.prev),
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  },
});
```

### Design Tokens
```
Stats card:   bg-white border border-slate-200 rounded-xl shadow-sm p-4
Table header: bg-gray-50 text-xs font-medium text-gray-500 uppercase
Table row:    hover:bg-gray-50 border-b border-gray-100
Role badges:  student=bg-blue-100/text-blue-700, instructor=bg-amber-100/text-amber-700, admin=bg-red-100/text-red-700
Status:       active=bg-emerald-100/text-emerald-700, inactive=bg-gray-100/text-gray-500
Primary btn:  bg-slate-900 text-white hover:bg-slate-700
```

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/lib/api.ts` | MODIFY | Add `getStats`, `createUser`, `reactivateUser`, `resetPassword` to `adminUsersApi` |
| `frontend/app/admin/users/page.tsx` | CREATE | Full admin users management page |
| `frontend/components/dashboard-header.tsx` | MODIFY | Add "Users" nav link visible to admin role |

## Implementation Steps

1. **`api.ts`** — add `getStats`, `createUser`, `reactivateUser`, `resetPassword` to `adminUsersApi`
2. **Create `page.tsx`** — `'use client'`, imports: React Query hooks, `useSearchParams`/`useRouter`, `adminUsersApi`, `queryKeys`, shadcn components
3. **`useDebouncedValue` hook** — inline at top of file
4. **`StatsBar`** — `useQuery` on stats endpoint, 5 cards in a grid
5. **`FilterBar`** — search input with debounce, role/status/sort `Select` components, "Add User" `Button`
6. **`UsersTable`** — `useQuery` on list endpoint with URL params, table skeleton, empty state
7. **Row rendering** — avatar, name/email, role `Badge`, status `Badge`, formatted dates, `DropdownMenu` actions
8. **`Pagination`** — prev/next buttons, page display, disable at boundaries
9. **`CreateUserDialog`** — shadcn `Dialog`, form with email/password/name/role, `useMutation` + invalidate
10. **`EditUserDialog`** — `Dialog`, form with name/bio/phone/role/active toggle, reset password section
11. **Status toggle** — `AlertDialog` confirmation, optimistic mutation
12. **`dashboard-header.tsx`** — add "Users" link in admin nav section

## Todo List
- [ ] Extend `adminUsersApi` in `api.ts`
- [ ] Create `frontend/app/admin/users/page.tsx`
- [ ] Implement `useDebouncedValue` helper
- [ ] Build StatsBar with stats query
- [ ] Build FilterBar with URL param writes
- [ ] Build UsersTable with skeleton + empty state
- [ ] Build row with badges and actions dropdown
- [ ] Build Pagination
- [ ] Build CreateUserDialog with form + mutation
- [ ] Build EditUserDialog with form + reset password + mutation
- [ ] Add AlertDialog for deactivate/reactivate confirmation
- [ ] Add "Users" nav link in dashboard-header.tsx for admin

## Success Criteria
- `/admin/users` shows stats, filters, table, pagination
- Search filters after 300ms debounce; role/status dropdowns filter immediately
- URL params persist across navigation (shareable URLs)
- Create dialog creates user; table refreshes
- Edit dialog updates user; row reflects changes
- Deactivate/reactivate shows confirmation; optimistic UI update
- Page resets to 1 on any filter change
- Non-admin redirected by AdminGuard

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `useSearchParams` needs `Suspense` in Next.js 16 | High | Medium | Wrap page content in `<Suspense>` |
| Optimistic key mismatch | Medium | Medium | Compute `listParams` once, use stable reference |
| Stats stale after mutations | Low | Low | Invalidate broad `['admin', 'users']` prefix on all mutations |

## Security Considerations
- `AdminGuard` in layout prevents non-admin access
- No passwords stored in client state or URL params
- Password field in create dialog uses `type="password"`

## Next Steps
After both phases complete: add "Users" count badge to admin sidebar/nav if desired.
