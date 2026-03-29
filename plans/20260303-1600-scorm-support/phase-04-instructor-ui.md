# Phase 04 — Instructor UI

## Context
- [Plan](plan.md)
- `frontend/app/instructor/courses/[id]/outline/page.tsx` — outline page (1003 lines)
- `frontend/lib/api.ts` — `scormApi.uploadLesson` added in Phase 03
- Phase 02 must be complete (upload endpoint live)
- Phase 03 must be complete (scormApi.getPackageByLesson available)

## Overview
Two targeted changes to the course outline page:
1. Add `<option value="scorm">` to `AddLessonForm` type select
2. Extend `LessonItem` to show SCORM upload area (no package) or package status badge (has package)

No new pages required — both changes are inline within the existing component file.

## Key Insights
- `LessonItem` is a self-contained component at line 235 — add SCORM state/UI there
- `typeIcon` map at line 245 needs `scorm: '📦'` entry
- `fetchCourseOutline` at line 72 fetches quiz and flashCards per lesson — add scormPackage fetch too
- `Lesson` interface at line 43 needs `scormPackage?: { id, version, entryPoint } | null`
- Upload is multipart/form-data — use `scormApi.uploadLesson` from Phase 03 (not `fetchApi`)

## Related Code Files
- `frontend/app/instructor/courses/[id]/outline/page.tsx`
- `frontend/lib/api.ts`

## Architecture

### Lesson interface extension (line 43)
```typescript
interface Lesson {
  // ... existing fields ...
  scormPackage?: { id: string; version: string; entryPoint: string } | null;
}
```

### fetchCourseOutline addition (inside lessonsWithActivities map, after flashCards fetch)
```typescript
const scormRes = await fetch(`${API}/scorm/package/lesson/${lesson.id}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const scormPackage = scormRes.ok ? await scormRes.json() : null;
return { ...lesson, quiz, flashCards, scormPackage };
```

### AddLessonForm select addition (line 164, after pdf option)
```tsx
<option value="scorm">📦 SCORM</option>
```

### typeIcon map addition (line 245)
```typescript
scorm: '📦',
```

### LessonItem SCORM section (add after flash cards badge, before published badge)
```tsx
{/* SCORM upload / status */}
{lesson.type === 'scorm' && !lesson.scormPackage && (
  <ScormUploadButton lessonId={lesson.id} onUploaded={(pkg) => /* update local state */} />
)}
{lesson.type === 'scorm' && lesson.scormPackage && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
    📦 SCORM {lesson.scormPackage.version}
  </span>
)}
```

### ScormUploadButton — inline component in outline page
Keep it simple: a hidden `<input type="file" accept=".zip">` triggered by a button.
On change: call `scormApi.uploadLesson(lessonId, file)`, show loading state, call `onUploaded(pkg)`.

```typescript
function ScormUploadButton({ lessonId, onUploaded }: {
  lessonId: string;
  onUploaded: (pkg: any) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const pkg = await scormApi.uploadLesson(lessonId, file);
      onUploaded(pkg);
    } catch { /* silent */ }
    finally { setUploading(false); }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".zip" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="hidden group-hover:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {uploading ? '...' : '+ SCORM'}
      </button>
    </>
  );
}
```

### State update for onUploaded
In `LessonItem`, `onUploaded` needs to update the parent section state.
Pass a callback down: `onScormUploaded: (lessonId: string, pkg: any) => void`
from `SortableLesson` → `LessonItem` → `ScormUploadButton`.

In the outline page `handleLessonScormUploaded` handler:
```typescript
const handleLessonScormUploaded = (sectionId: string, lessonId: string, pkg: any) => {
  setSections(prev => prev.map(s =>
    s.id === sectionId
      ? { ...s, lessons: s.lessons.map(l => l.id === lessonId ? { ...l, scormPackage: pkg } : l) }
      : s
  ));
};
```

## Implementation Steps

1. Add `scormPackage` field to `Lesson` interface in outline page
2. Add scormPackage fetch in `fetchCourseOutline`
3. Add `📦 SCORM` option to `AddLessonForm` select
4. Add `scorm: '📦'` to `typeIcon` map in `LessonItem`
5. Add `ScormUploadButton` component (inline in same file)
6. Add SCORM section to `LessonItem` render (upload button or status badge)
7. Wire `onScormUploaded` callback through `SortableLesson` → `LessonItem`
8. Add `handleLessonScormUploaded` to outline page and pass down via `SectionCard`

## Todo
- [ ] Extend Lesson interface with scormPackage field
- [ ] Add scormPackage fetch in fetchCourseOutline
- [ ] Add SCORM option to AddLessonForm select
- [ ] Add scorm to typeIcon map
- [ ] Create ScormUploadButton inline component
- [ ] Add SCORM conditional block in LessonItem
- [ ] Wire onScormUploaded callback up the component tree
- [ ] Test: create SCORM lesson → upload ZIP → badge appears

## Success Criteria
- AddLessonForm shows "📦 SCORM" as type option
- SCORM lesson row shows "+ SCORM" button on hover when no package uploaded
- After upload: row shows "📦 SCORM 1.2" (or 2004) badge
- No regression on other lesson types (quiz badge, flash cards badge still appear)

## Risk Assessment
- **Low**: purely additive UI changes; no existing component logic modified
- `fetchCourseOutline` adds one extra fetch per lesson — negligible for typical course sizes
- If scormPackage fetch fails (404 = no package), `scormRes.ok` is false → `null` → shows upload button correctly

## Security Considerations
- Upload restricted to instructor/admin via auth guard on backend endpoint
- File input `accept=".zip"` is UX-only hint; real validation on backend

## Next Steps
Phase 05 — Standalone Course
