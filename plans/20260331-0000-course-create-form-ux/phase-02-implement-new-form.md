# Phase 02: Implement New Form Pages

## Context
- Phase 01 created shared components
- This phase replaces the existing form pages with the new shared component

## Overview
- **Date**: 2026-03-31
- **Priority**: High
- **Status**: Pending

## Requirements
- Replace inline forms with `CreateCourseForm` component
- Maintain existing API endpoint calls and auth flow
- Ensure redirect URLs are role-appropriate (instructor vs admin)

## Related Code Files

### Files to MODIFY:
- `frontend/app/instructor/courses/create/page.tsx`
- `frontend/app/admin/courses/create/page.tsx`

### Files to REFERENCE:
- `frontend/components/course/CreateCourseForm.tsx` (from Phase 01)
- `frontend/app/instructor/courses/create/page.tsx` (for redirect URL logic)

## Implementation Steps

### 1. Update instructor create page
- Remove all inline form state and JSX
- Import `CreateCourseForm` from `@/components/course/CreateCourseForm`
- Pass `redirectTo="/instructor/courses/${course.id}"` prop
- Keep existing imports: `useRouter`, `useState`, `supabase`

### 2. Update admin create page
- Same changes as instructor
- Pass `redirectTo="/admin/courses/${course.id}"` prop

### 3. Verify form works end-to-end
- Title + description fields render
- Thumbnail URL shows preview
- Level selector shows 3 cards
- Free toggle visible
- Clone options hidden by default, expandable
- Submit creates course and redirects

## Todo List
- [ ] Replace instructor create page form with CreateCourseForm
- [ ] Replace admin create page form with CreateCourseForm
- [ ] Verify instructor flow works: create → redirect to outline
- [ ] Verify admin flow works: create → redirect to outline

## Success Criteria
- Both pages are simplified to ~15 lines each
- All form UX improvements from Phase 01 are visible
- Course creation still works (manual test)
- Redirects go to correct role-appropriate URL

## Risks
- Existing form submission logic must be preserved exactly
- Clone functionality must continue working

## Next Steps
- Phase 03: Update e2e tests
