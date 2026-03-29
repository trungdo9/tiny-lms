# Phase 03 — Frontend UI

**Ref:** [plan.md](./plan.md)
**Depends on:** [phase-02-backend-api.md](./phase-02-backend-api.md)
**Blocks:** nothing

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Add instructor management UI to course edit page, update public course page to show all instructors, add API methods and query keys |
| Priority | High |
| Status | Completed |

---

## Key Insights

- `frontend/app/instructor/courses/[id]/page.tsx` uses TanStack Query + direct `fetch` calls (not `fetchApi`). New instructor management section must follow the same pattern.
- `frontend/app/(public)/courses/[slug]/page.tsx` uses raw `useState`/`useEffect` (no TanStack Query). It fetches the course via `coursesApi.get(id)` which already includes the single `instructor` object from Supabase join. We need to also fetch `GET /courses/:id/instructors` and render all results.
- No validation library in use — stick with inline state validation.
- Error display pattern: `alert()` or inline error state (see existing course edit page). Use inline `<p className="text-red-600">` for errors in the new component.
- shadcn/ui is available. Use `Input`, `Button`, `Badge` from existing imports. No new UI library installs needed.
- Debounce user search: 300ms via `useEffect` with `setTimeout` cleanup — no library needed.
- `queryKeys` file must be updated to add `courseInstructors` key.
- Permission check: the course edit page already has access to `user` from `useAuth()`. Compare `user.id` against the primary instructor id to show/hide management UI. The API call `GET /courses/:id/instructors` returns the list; find `role === 'primary'` and compare ids.
- The `InstructorManager` component is a self-contained client component at `frontend/components/instructor-manager.tsx` — fits existing component conventions (flat `components/` dir for shared pieces).

---

## Requirements

1. `frontend/lib/api.ts`: add `courseInstructorsApi` object and `usersApi.search()`.
2. `frontend/lib/query-keys.ts`: add `courseInstructors` key group.
3. New `frontend/components/instructor-manager.tsx` component.
4. Update `frontend/app/instructor/courses/[id]/page.tsx`: add "Instructors" section after course info.
5. Update `frontend/app/(public)/courses/[slug]/page.tsx`: render all instructors from join table.

---

## Architecture

### `frontend/lib/api.ts` additions

Add after `coursesApi`:

```typescript
// Course Instructor APIs
export const courseInstructorsApi = {
  list: (courseId: string) =>
    fetchApi<CourseInstructor[]>(`/courses/${courseId}/instructors`),

  assign: (courseId: string, data: { userId: string; role?: string }) =>
    fetchApi(`/courses/${courseId}/instructors`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (courseId: string, userId: string) =>
    fetchApi(`/courses/${courseId}/instructors/${userId}`, { method: 'DELETE' }),

  updateRole: (courseId: string, userId: string, data: { role: string }) =>
    fetchApi(`/courses/${courseId}/instructors/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
```

Add to `usersApi`:

```typescript
search: (q: string, role?: string) =>
  fetchApi<{ users: UserSearchResult[]; pagination: object }>(
    `/users/search?q=${encodeURIComponent(q)}${role ? `&role=${encodeURIComponent(role)}` : ''}`
  ),
```

Add types near top of `api.ts` (or a separate `types.ts` — follow existing inline pattern):

```typescript
export interface CourseInstructor {
  id: string;
  role: 'primary' | 'co_instructor';
  addedAt: string;
  profile: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
}

export interface UserSearchResult {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
}
```

### `frontend/lib/query-keys.ts` additions

```typescript
// Add inside queryKeys object:
courseInstructors: {
  list: (courseId: string) => ['course-instructors', courseId] as const,
},
users: {
  search: (q: string, role?: string) => ['users', 'search', q, role] as const,
},
```

### `frontend/components/instructor-manager.tsx`

Full self-contained component:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseInstructorsApi, usersApi, CourseInstructor, UserSearchResult } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

interface InstructorManagerProps {
  courseId: string;
  currentUserId: string;
  currentUserRole: string; // 'admin' | 'instructor' | 'student'
}

export function InstructorManager({ courseId, currentUserId, currentUserRole }: InstructorManagerProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch current instructors
  const { data: instructors = [], isLoading } = useQuery({
    queryKey: queryKeys.courseInstructors.list(courseId),
    queryFn: () => courseInstructorsApi.list(courseId),
  });

  // Search users
  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: queryKeys.users.search(debouncedQuery, 'instructor'),
    queryFn: () => usersApi.search(debouncedQuery, 'instructor'),
    enabled: debouncedQuery.length >= 2,
    staleTime: 0,
  });
  const searchResults: UserSearchResult[] = searchData?.users ?? [];

  // Determine if current user is primary instructor or admin
  const isPrimaryOrAdmin =
    currentUserRole === 'admin' ||
    instructors.some(i => i.profile.id === currentUserId && i.role === 'primary');

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (userId: string) =>
      courseInstructorsApi.assign(courseId, { userId, role: 'co_instructor' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courseInstructors.list(courseId) });
      setSearchQuery('');
      setDebouncedQuery('');
    },
    onError: (err: Error) => setSearchError(err.message),
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (userId: string) => courseInstructorsApi.remove(courseId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.courseInstructors.list(courseId) }),
    onError: (err: Error) => alert(err.message),
  });

  if (!isPrimaryOrAdmin) return null; // Hide UI for co-instructors (read-only view handled elsewhere)

  if (isLoading) return <p className="text-sm text-gray-500">Loading instructors...</p>;

  // Filter out already-assigned users from search results
  const assignedIds = new Set(instructors.map(i => i.profile.id));
  const filteredResults = searchResults.filter(u => !assignedIds.has(u.id));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Instructors</h3>

      {/* Current instructors list */}
      <ul className="space-y-2">
        {instructors.map(instructor => (
          <li key={instructor.id} className="flex items-center justify-between border rounded px-3 py-2">
            <div className="flex items-center gap-2">
              {instructor.profile.avatarUrl && (
                <img src={instructor.profile.avatarUrl} className="w-7 h-7 rounded-full" alt="" />
              )}
              <span className="font-medium text-sm">
                {instructor.profile.fullName ?? instructor.profile.email}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                instructor.role === 'primary'
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}>
                {instructor.role === 'primary' ? 'Primary' : 'Co-instructor'}
              </span>
            </div>
            {instructor.role !== 'primary' && (
              <button
                onClick={() => removeMutation.mutate(instructor.profile.id)}
                disabled={removeMutation.isPending}
                className="text-red-500 text-sm hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Search + assign */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search instructor by name or email..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSearchError(''); }}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        {searching && (
          <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</span>
        )}
        {debouncedQuery.length >= 2 && filteredResults.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded shadow-md mt-1 max-h-48 overflow-auto">
            {filteredResults.map(user => (
              <li
                key={user.id}
                onClick={() => assignMutation.mutate(user.id)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
              >
                {user.avatarUrl && <img src={user.avatarUrl} className="w-6 h-6 rounded-full" alt="" />}
                <span>{user.fullName ?? user.email}</span>
                <span className="text-gray-400 text-xs">{user.email}</span>
              </li>
            ))}
          </ul>
        )}
        {debouncedQuery.length >= 2 && !searching && filteredResults.length === 0 && (
          <p className="absolute w-full bg-white border rounded shadow-md mt-1 px-3 py-2 text-sm text-gray-500">
            No instructors found
          </p>
        )}
      </div>
      {searchError && <p className="text-red-600 text-sm">{searchError}</p>}
    </div>
  );
}
```

### `frontend/app/instructor/courses/[id]/page.tsx` — add Instructors section

After existing course info section (around line 702 per research report), add:

```typescript
// 1. Import at top
import { InstructorManager } from '@/components/instructor-manager';

// 2. Inside the JSX, after the course info card closing tag:
{courseId && user && (
  <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_#000] mt-6">
    <InstructorManager
      courseId={courseId}
      currentUserId={user.id}
      currentUserRole={user.role ?? 'instructor'}
    />
  </div>
)}
```

Where `courseId` is `params.id` (already available) and `user` comes from `useAuth()` (already used in this page).

### `frontend/app/(public)/courses/[slug]/page.tsx` — show all instructors

**Step 1:** Add `instructors` to the `Course` interface:

```typescript
interface Course {
  // ... existing fields ...
  instructor: { id: string; full_name: string; avatar_url: string };  // keep for fallback
  instructors?: Array<{ id: string; role: string; profile: { id: string; full_name: string; avatar_url: string } }>;
}
```

**Step 2:** After `setCourse(fullCourse as Course)`, fetch instructors:

```typescript
const instructorData = await courseInstructorsApi.list(found.id);
setCourse({ ...fullCourse, instructors: instructorData } as Course);
```

**Step 3:** In the hero section, replace the single instructor display block (lines 188-204) with:

```typescript
{/* Multiple instructors from join table, fallback to single instructor */}
{(course.instructors && course.instructors.length > 0
  ? course.instructors.map(i => i.profile)
  : course.instructor ? [{ id: course.instructor.id, full_name: course.instructor.full_name, avatar_url: course.instructor.avatar_url }] : []
).map(profile => (
  <span key={profile.id} className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-white">
      {profile.avatar_url
        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {(profile.full_name ?? '?')[0]}
          </div>
      }
    </div>
    <span className="text-lg bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
      {profile.full_name}
    </span>
  </span>
))}
```

---

## Related Code Files

| File | Change |
|------|--------|
| `frontend/lib/api.ts` | Add `courseInstructorsApi`, `usersApi.search()`, `CourseInstructor` + `UserSearchResult` types |
| `frontend/lib/query-keys.ts` | Add `courseInstructors` and `users` key groups |
| `frontend/components/instructor-manager.tsx` | NEW — search + assign + list component |
| `frontend/app/instructor/courses/[id]/page.tsx` | Import + render `InstructorManager` after course info section |
| `frontend/app/(public)/courses/[slug]/page.tsx` | Fetch instructors list, render all in hero |

---

## Implementation Steps

1. **Add types to `frontend/lib/api.ts`** — `CourseInstructor` and `UserSearchResult` interfaces at top of file.

2. **Add `courseInstructorsApi`** object to `api.ts` after `coursesApi`.

3. **Add `usersApi.search()`** method to existing `usersApi` object.

4. **Update `frontend/lib/query-keys.ts`** — add `courseInstructors` and `users` groups.

5. **Create `frontend/components/instructor-manager.tsx`** with full component code.

6. **Update `frontend/app/instructor/courses/[id]/page.tsx`**:
   - Add `import { InstructorManager }` at top.
   - Add the section JSX after the course info card (find the closing `</div>` of the course info card block, ~line 702).

7. **Update `frontend/app/(public)/courses/[slug]/page.tsx`**:
   - Add `courseInstructorsApi` to the import from `@/lib/api`.
   - Add `instructors?` field to `Course` interface.
   - In `loadCourse()`, after `setCourse`, fetch instructors and merge.
   - Replace single-instructor display block with multi-instructor map.

8. **Test**: create a course, assign a co-instructor, verify both appear on public page. Verify co-instructor can log in and edit sections. Verify primary instructor cannot be removed via UI.

---

## Todo List

- [ ] Add `CourseInstructor` and `UserSearchResult` types to `api.ts`
- [ ] Add `courseInstructorsApi` to `api.ts`
- [ ] Add `usersApi.search()` to `api.ts`
- [ ] Add `courseInstructors` query key to `query-keys.ts`
- [ ] Add `users.search` query key to `query-keys.ts`
- [ ] Create `frontend/components/instructor-manager.tsx`
- [ ] Update course edit page — import + render `InstructorManager`
- [ ] Update public course page — fetch instructors, render all in hero section
- [ ] Manual test: assign co-instructor, verify display on public page
- [ ] Manual test: primary instructor cannot be removed via UI
- [ ] Manual test: co-instructor does not see management UI (only primary + admin do)

---

## Success Criteria

- Course edit page shows "Instructors" section with current instructors listed.
- Search input (min 2 chars) returns matching instructors in a dropdown.
- Selecting a user from dropdown assigns them as co-instructor and updates the list.
- Primary instructor row has no Remove button.
- Co-instructor rows have a Remove button.
- Public course page hero shows all instructors (avatar + name) side by side.
- Co-instructor user does not see the management UI (only read-only list).

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `courseInstructorsApi.list()` call on public page fails for unpublished courses | Low | Low | Use try/catch in `loadCourse()`; fall back to single `instructor` field |
| Search dropdown stays open after assignment | Medium | Low | Clear `searchQuery` + `debouncedQuery` in `assignMutation.onSuccess` (already in plan) |
| `user.role` not available from `useAuth()` on course edit page | Medium | Medium | Inspect auth context; `req.user.role` is set by `SupabaseAuthGuard` on backend — ensure frontend auth context exposes `role` from Supabase user metadata |

---

## Security Considerations

- The `InstructorManager` component hides itself when `isPrimaryOrAdmin` is false — this is a UI-only guard. The backend enforces the real authorization.
- No sensitive data displayed in search results beyond name, email, avatar.
- Search results filtered to `role=instructor` by default — prevents assigning students as instructors via UI (backend still enforces this independently).

---

## Unresolved Questions

1. Does `useAuth()` expose `user.role`? Check `frontend/lib/auth-context.tsx` — if not, the `currentUserRole` prop must be sourced differently (e.g., from `usersApi.getMe()` response).
2. Should `GET /courses/:id/instructors` be called on the public page without auth? Currently backend requires `SupabaseAuthGuard`. If so, either make it public or fall back gracefully when unauthenticated.

---

## Next Steps

After this phase: the feature is complete. Consider adding instructor avatars to course cards in the instructor courses list (`frontend/app/instructor/courses/page.tsx`) as a follow-up enhancement.
