# React Query v5 Admin Data Table Patterns - Research Report
**Date**: 2026-03-03 | **Model**: TanStack Query v5.90+ with Next.js App Router

---

## 1. Dynamic Filter Params with useQuery

**Best Approach: URL Search Params (Sync with Router)**

```tsx
// hooks/useUsersQuery.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { queryKeys } from '@/lib/query-keys';

export function useUsersQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';

  return useQuery({
    queryKey: queryKeys.adminUsers.all({ page, limit, search, role, status }),
    queryFn: () => fetchUsers({ page, limit, search, role, status }),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Why URL params > local state/Zustand:**
- Shareable URLs preserve table state
- Browser back/forward work correctly
- SEO-friendly for analytics
- Syncs with Next.js Router seamlessly
- No state management library overhead

---

## 2. Optimistic Updates with useMutation

**Pattern: onMutate + rollback on error**

```tsx
// hooks/useUpdateUserRole.ts
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: (data: { userId: string; role: string }) =>
      api.patch(`/users/${data.userId}`, { role: data.role }),

    onMutate: async (data) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.adminUsers.all({})
      });

      // Snapshot old data
      const previousData = queryClient.getQueryData(
        queryKeys.adminUsers.all({})
      );

      // Update cache optimistically
      queryClient.setQueryData(
        queryKeys.adminUsers.all({}),
        (old: any) => old?.map(u =>
          u.id === data.userId ? { ...u, role: data.role } : u
        )
      );

      return { previousData }; // Return context for rollback
    },

    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.adminUsers.all({}),
          context.previousData
        );
      }
      toast.error('Failed to update user role');
    },

    onSuccess: (data) => {
      // Invalidate to fetch fresh data (soft refresh)
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers.all({})
      });
      toast.success('User role updated');
    }
  });
}
```

---

## 3. Modal State Management Pattern

**Approach: Composition with URL-based state (Next.js App Router)**

```tsx
// app/admin/users/page.tsx (Server Component)
export default function UsersPage() {
  return (
    <Suspense fallback={<LoadingTable />}>
      <UsersClient />
    </Suspense>
  );
}

// app/admin/users/client.tsx (Client Component)
'use client';
export function UsersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isCreateOpen = searchParams.get('modal') === 'create';
  const editUserId = searchParams.get('editId');

  return (
    <>
      <DataTable {...} />

      {isCreateOpen && (
        <CreateUserModal
          open={true}
          onClose={() => router.push('?')}
          onSuccess={() => {
            router.push('?');
            queryClient.invalidateQueries({
              queryKey: queryKeys.adminUsers.all({})
            });
          }}
        />
      )}

      {editUserId && (
        <EditUserModal
          userId={editUserId}
          onClose={() => router.push('?')}
        />
      )}
    </>
  );
}
```

**Benefits:**
- Modal state persists on page reload
- Shareable URLs (`?modal=create&editId=123`)
- No extra state library
- Works with browser history

Alternative for complex state: Use React Hook Form + Zustand for form state only, keep visibility in URL.

---

## 4. Debounced Search with React Query

**Pattern: useTransition + debounce + dependent queries**

```tsx
'use client';
import { useTransition } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function UsersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(searchInput, 300); // 300ms delay

  // Update URL when debounced value changes
  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('search', debouncedSearch);
      params.set('page', '1'); // Reset to page 1
      router.push(`?${params.toString()}`);
    });
  }, [debouncedSearch]);

  const { data, isLoading } = useUsersQuery();

  return (
    <div>
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search users..."
        disabled={isPending || isLoading}
      />
      {/* Loading state from router */}
      {isPending && <Spinner />}
      {/* Table renders with debouncedSearch params */}
    </div>
  );
}

// hooks/useDebouncedValue.ts
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Efficiency gains:**
- Only triggers query when user stops typing (300ms silence)
- No network request spam (saves bandwidth)
- useTransition prevents UI block while URL updates
- Pairs perfectly with `queryKey` that includes search param

---

## 5. Best UX Pattern: Deactivate/Reactivate Toggle

**Recommended: Modal Confirmation (2-step)**

```tsx
// components/UserActionsMenu.tsx
'use client';
export function UserActionsMenu({ userId, isActive }: Props) {
  const { mutate: toggleStatus } = useToggleUserStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
      >
        {isActive ? 'Deactivate' : 'Reactivate'}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title={isActive ? 'Deactivate User?' : 'Reactivate User?'}
        description={
          isActive
            ? 'User will lose access to all courses.'
            : 'User will regain access to their content.'
        }
        onConfirm={() => {
          toggleStatus({ userId, active: !isActive });
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

// Hook
export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; active: boolean }) =>
      api.patch(`/users/${data.userId}`, { active: data.active }),

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.adminUsers.all({}) });
      const prev = queryClient.getQueryData(queryKeys.adminUsers.all({}));

      queryClient.setQueryData(queryKeys.adminUsers.all({}), (old: any) =>
        old?.map(u => u.id === data.userId ? { ...u, active: data.active } : u)
      );

      return { prev };
    },

    onError: (_, __, context) => {
      if (context?.prev) {
        queryClient.setQueryData(queryKeys.adminUsers.all({}), context.prev);
      }
    },
  });
}
```

**Why modal > inline toggle:**
- Prevents accidental deactivations
- Clear confirmation message
- Consistent with admin UX patterns
- Easy to add audit logs on backend

---

## Implementation Checklist

- [ ] Extend `queryKeys.ts` with admin user params filter structure
- [ ] Create `useUsersQuery` hook with URL param extraction
- [ ] Build `useUpdateUserRole` with optimistic updates
- [ ] Implement debounced search hook
- [ ] Create reusable ConfirmDialog component
- [ ] Set up UsersClient page with modals triggered by URL params
- [ ] Add loading states with `useTransition`
- [ ] Test query invalidation cascade
- [ ] Add error boundaries around table + modals

---

## Key TanStack Query v5 Config (Existing Setup)

From `/frontend/lib/query-client.ts`:
- `staleTime: 30s` ✓ (good for fast-changing data)
- `gcTime: 5min` ✓ (keep cache longer)
- `retry: 1` ✓ (network-friendly)
- `refetchOnWindowFocus: true` ✓ (keep data fresh)

**Recommendation:** Keep current defaults, override per-query for fast-changing admin data (e.g., user status queries may use `staleTime: 10s`).

---

## Unresolved Questions

1. Should role change require cascading invalidation of user-specific caches (lessons, enrollments)?
2. Does backend paginate user lists or return full list? Affects limit strategy.
3. Multi-select bulk actions (change roles for 10+ users) — add optimistic queue?
