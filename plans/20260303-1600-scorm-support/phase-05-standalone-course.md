# Phase 05 — Standalone Course Mode

## Context
- [Plan](plan.md)
- Phase 02 must be complete (`POST /scorm/upload/course/:courseId` endpoint live)
- Phase 03 must be complete (`ScormPlayer.tsx` exists; reuse with `courseId` prop variant)
- `frontend/app/instructor/courses/[id]/page.tsx` — course settings page
- `frontend/app/(student)/courses/[slug]/` — student course area

## Overview
Allow a course to be "SCORM-only": upload one SCORM package at the course level, then
students launch it from a dedicated player route rather than the lesson-based viewer.

Scope is intentionally narrow (YAGNI): no section/lesson structure for standalone mode.
A course is standalone when `scormPackage` relation is populated on the Course row.

## Key Insights
- `Course` already has `scormPackage ScormPackage?` relation added in Phase 01
- `ScormPlayer` accepts `lessonId` in Phase 03 — extend props to accept `packageId` directly for standalone use (skips the GET package/lesson fetch)
- Standalone player route: `/courses/[slug]/scorm` — simple page, no sidebar needed
- Instructor upload lives in the existing course edit page (`/instructor/courses/[id]/page.tsx`)
- `scormApi` already has `uploadLesson`; add `uploadCourse` + `getPackageByCourse` in Phase 03 api.ts additions

## Requirements
1. `ScormPlayer.tsx` — add `packageId` prop variant (bypass lesson package lookup)
2. `frontend/app/(student)/courses/[slug]/scorm/page.tsx` — standalone player page
3. Course page (`/instructor/courses/[id]/page.tsx`) — add SCORM upload section
4. `api.ts` — add `scormApi.uploadCourse` and `scormApi.getPackageByCourse`
5. `query-keys.ts` — add `scorm.coursePackage` key

## Architecture

### ScormPlayer.tsx props extension
```typescript
interface ScormPlayerProps {
  lessonId?: string;    // lesson mode: fetch package via /scorm/package/lesson/:id
  packageId?: string;   // standalone mode: skip lookup, use packageId directly
  onComplete?: () => void;
}
// Logic: if packageId provided, skip GET package/lesson fetch; use packageId directly in initAttempt
```

### New page: `frontend/app/(student)/courses/[slug]/scorm/page.tsx`
```typescript
// Minimal standalone player — no sidebar, full viewport iframe
export default function StandaloneScormPage() {
  const { slug } = useParams();
  // 1. GET /courses/:slug → course.scormPackage.id
  // 2. Render <ScormPlayer packageId={course.scormPackage.id} onComplete={...} />
  // 3. onComplete: show completion toast; update enrollment progress if applicable
}
```

### Course edit page — SCORM upload section
In `frontend/app/instructor/courses/[id]/page.tsx`, add a "SCORM Package" section card
(similar pattern to existing metadata form sections):

```tsx
{/* SCORM Package section — show only if course has no sections/lessons or already has package */}
<div className="bg-white rounded-2xl border border-gray-200 p-6">
  <h3 className="font-semibold text-gray-800 mb-4">SCORM Package (Standalone Mode)</h3>
  {course.scormPackage ? (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">
        📦 {course.scormPackage.title} — SCORM {course.scormPackage.version}
      </span>
      <button onClick={handleReplaceScorm} className="text-xs text-red-500 hover:underline">
        Replace
      </button>
    </div>
  ) : (
    <ScormUploadButton courseId={courseId} onUploaded={handleScormUploaded} label="Upload SCORM Package" />
  )}
</div>
```

`ScormUploadButton` from Phase 04 needs a `courseId` prop variant calling `scormApi.uploadCourse`.

### api.ts additions (append to scormApi object)
```typescript
uploadCourse: async (courseId: string, file: File) => {
  const { data: { session } } = await supabase.auth.getSession();
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch(`${API_URL}/scorm/upload/course/${courseId}`, {
    method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}` }, body: fd,
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
},
getPackageByCourse: (courseId: string) =>
  fetchApi(`/scorm/package/course/${courseId}`),
```

### query-keys.ts addition
```typescript
scorm: {
  // existing from Phase 03:
  package: (lessonId: string) => ['scorm', 'package', lessonId] as const,
  attempt: (packageId: string) => ['scorm', 'attempt', packageId] as const,
  // new:
  coursePackage: (courseId: string) => ['scorm', 'course-package', courseId] as const,
},
```

### Navigation to standalone player
On the course detail page (`/courses/[slug]`), if `course.scormPackage` exists:
show a "Launch Course" button linking to `/courses/${slug}/scorm` instead of the lesson list.

```tsx
{course.scormPackage && (
  <Button asChild>
    <Link href={`/courses/${course.slug}/scorm`}>Launch SCORM Course</Link>
  </Button>
)}
```

## Implementation Steps

1. Extend `ScormPlayer.tsx` to accept `packageId` prop (skip lesson fetch)
2. Add `scormApi.uploadCourse` and `getPackageByCourse` to `api.ts`
3. Add `scorm.coursePackage` to `query-keys.ts`
4. Create `frontend/app/(student)/courses/[slug]/scorm/page.tsx`
5. Add SCORM upload card to instructor course edit page
6. Add "Launch SCORM Course" button to public course detail page
7. Test: upload course-level ZIP, navigate to `/courses/slug/scorm`, verify player loads

## Todo
- [ ] Extend ScormPlayer props for standalone (packageId) mode
- [ ] Add uploadCourse + getPackageByCourse to api.ts
- [ ] Add coursePackage query key
- [ ] Create standalone player page `/courses/[slug]/scorm/page.tsx`
- [ ] Add SCORM upload section to instructor course edit page
- [ ] Add "Launch SCORM Course" button to public course detail page
- [ ] Test full standalone flow end-to-end

## Success Criteria
- Instructor can upload SCORM zip on course edit page
- Course detail page shows "Launch SCORM Course" button when package present
- `/courses/[slug]/scorm` renders full-viewport ScormPlayer
- Attempt tracked and completion recorded in scorm_attempts table

## Risk Assessment
- **Medium**: ScormPlayer props extension must not break existing `lessonId` usage from Phase 03
  — use optional props with clear guard: `if (packageId) { use directly } else { fetch by lessonId }`
- Course with both sections/lessons AND a scormPackage is ambiguous — document: standalone mode
  is intended for courses with no section content; UI should surface a warning if sections exist

## Security Considerations
- Standalone player page at `/courses/[slug]/scorm` must verify enrollment before rendering
  (same pattern as lesson viewer — redirect to `/courses/[slug]` if not enrolled)
- `getPackageByCourse` endpoint guarded by `SupabaseAuthGuard`

## Unresolved Questions
- Should `scormPackage` presence hide the lesson list on the public course detail page entirely,
  or coexist? Needs product decision before implementing the course detail page change.
- Completion in standalone mode: should it mark the course enrollment as `completedAt`?
  Current plan only writes to `scorm_attempts.isCompleted`. Enrollment completion logic TBD.

## Next Steps
All phases complete. Perform end-to-end test across both lesson mode and standalone mode.
