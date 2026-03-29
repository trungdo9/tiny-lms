# Frontend Patterns Research: Instructor Management UI

## Summary
Research of 5 key frontend files reveals patterns for adding instructor assignment UI to course management with multiple instructor support.

## Files Requiring Changes

### 1. `/frontend/app/instructor/courses/[id]/page.tsx` (Main Course Edit Page)
**Current State:** Single course form handling title, description, level, status, isFree fields. Course info section at lines 645-702.

**Changes Needed:**
- Add instructors array field to formData state (line 478)
- Add new UI section after course info for "Instructors" management (after line 702)
- Implement instructor search/selector UI component
- Display current instructors as removable list
- Include instructors array in saveMutation payload (line 520)

### 2. `/frontend/app/(public)/courses/[slug]/page.tsx` (Public Course Detail)
**Current State:** Shows single instructor info at lines 188-204 with avatar and name display.

**Changes Needed:**
- Modify instructor display to iterate over instructors array (if exists)
- Show multiple instructor badges/cards in hero section
- Consider "Co-instructors" label if multiple instructors exist

### 3. `/frontend/lib/api.ts` (API Methods)
**Current API Pattern:**
```typescript
// Line 33-52: Course APIs follow pattern
update: (id: string, data: Partial<{...}>) =>
  fetchApi(`/courses/${id}`, {method: 'PUT', body: JSON.stringify(data)})
```

**New Methods Needed:**
```typescript
// Add to coursesApi:
assignInstructor: (courseId: string, instructorId: string) =>
  fetchApi(`/courses/${courseId}/instructors`, {method: 'POST', body: JSON.stringify({instructorId})}),

removeInstructor: (courseId: string, instructorId: string) =>
  fetchApi(`/courses/${courseId}/instructors/${instructorId}`, {method: 'DELETE'}),

// Add to usersApi:
searchUsers: (query: string, role?: string) =>
  fetchApi(`/users/search?q=${encodeURIComponent(query)}${role ? `&role=${role}` : ''}`),
```

### 4. `/frontend/app/instructor/courses/page.tsx` (Courses List)
**Current State:** Table display of courses with edit/clone/delete actions.

**Change:** Optional - show instructor count or co-instructor badges in table if needed.

### 5. `/frontend/app/(dashboard)/dashboard/page.tsx` (Dashboard)
**Current State:** No instructor info shown in instructor dashboard.

**Optional Enhancement:** Display instructors for each course in instructor dashboard (lines 138-150).

## UI Pattern: Instructor Search/Selector Component

### Recommended Implementation:
1. **Search Input:** Controlled input with debounced API call to `/users/search?role=instructor&q=query`
2. **Dropdown Results:** Show instructor name, avatar, email in list
3. **Selected List:** Chips/badges showing assigned instructors with remove (X) button
4. **Loading State:** Show spinner during search

### TanStack Query Pattern:
```typescript
// Query key: ['instructors', 'search', searchQuery]
// Debounce using useEffect with cleanup
// Avoid caching to prevent stale search results
```

## Public Display Location

**File:** `/frontend/app/(public)/courses/[slug]/page.tsx`

**Section:** Hero section lines 188-204 shows current instructor info with avatar and name in styled box.

**Update Strategy:** Change from single instructor to instructors array map, showing all co-instructors in similar styled boxes.

## TanStack Query Patterns Used

**Current Patterns:**
- `queryKeys.courses.detail(courseId)` - caches course details
- `queryKeys.courses.instructor()` - lists instructor courses
- `useQuery` with `queryFn` - data fetching
- `useMutation` with `onSuccess`/`onError` callbacks
- `invalidateQueries` - cache invalidation on mutation success

**For Instructor Management:**
- Use `useMutation` for assignInstructor/removeInstructor calls
- Invalidate course detail query on instructor changes: `queryClient.invalidateQueries({queryKey: queryKeys.courses.detail(courseId)})`
- Consider separate query for instructor search to avoid cache pollution

## Architecture Notes

1. **Form Validation:** No validation library detected; raw useState used. Consider same pattern for instructor selection validation.

2. **Error Handling:** Modal-based errors shown to user (lines 170-171, 309-310). Follow same pattern for instructor assignment errors.

3. **API Patterns:** Direct fetch with Bearer token auth (lines 513-519). New methods should follow identical pattern via `fetchApi` helper.

4. **Mutation Optimization:** Uses `onSuccess` callback for query invalidation rather than polling.

## Unresolved Questions

1. Should instructor assignment be limited to instructors only, or allow other roles?
2. Should course have required minimum/maximum instructor count validation?
3. Should instructor removal trigger validation (require at least 1 instructor)?
4. Are there permission checks needed (can instructor modify co-instructors)?
5. Should removed instructor be notified of removal?
