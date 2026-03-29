# Phase 03 — SCORM Player

## Context
- [Plan](plan.md)
- [SCORM Runtime Research](research/researcher-01-scorm-runtime.md)
- [Serving & Player Research](research/researcher-02-serving-and-player.md)
- `frontend/app/(student)/courses/[slug]/learn/[lessonId]/page.tsx` — lesson viewer
- `frontend/lib/api.ts` — API helpers
- `frontend/lib/query-keys.ts` — query key registry

## Overview
Implement the browser-side SCORM runtime: API shim objects (`window.API` / `window.API_1484_11`)
injected into an iframe before content loads. All LMSSetValue calls are buffered and flushed to
the backend via debounced PUT. LMSFinish/Terminate triggers a POST finish call and invalidates
the lesson progress query.

## Critical Insight: Cross-Origin Solution
Frontend (:3000) cannot access `window.parent.API` on an iframe whose src is `:3001`
(different port = cross-origin). Fix: add a Next.js rewrite proxy so SCORM content is
fetched through the same origin as the app.

**`frontend/next.config.js` (or `.ts`) addition:**
```javascript
async rewrites() {
  return [
    {
      source: '/scorm/content/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/scorm/content/:path*`,
    },
  ];
},
```
Then iframe src = `/scorm/content/{packageId}/{entryPoint}` (same-origin, no port).

## Requirements
1. `ScormApiShim.ts` — factory functions for 1.2 and 2004 API objects
2. `ScormPlayer.tsx` — React component; injects shim, renders iframe, manages attempt lifecycle
3. `frontend/next.config.js` — add rewrite proxy
4. `frontend/lib/api.ts` — add `scormApi` object
5. `frontend/lib/query-keys.ts` — add `scorm` keys
6. Lesson viewer — add `case 'scorm':` render branch

## New Files
```
frontend/components/scorm/
├── ScormApiShim.ts
└── ScormPlayer.tsx
```

## Architecture

### ScormApiShim.ts
```typescript
export type ScormHandlers = {
  getValue: (key: string) => string;
  setValue: (key: string, value: string) => string; // returns "true"/"false"
  commit: () => string;
  finish: () => string;
};

export function createScorm12Api(handlers: ScormHandlers) {
  return {
    LMSInitialize: (_: string) => 'true',
    LMSFinish: (_: string) => handlers.finish(),
    LMSGetValue: (key: string) => handlers.getValue(key),
    LMSSetValue: (key: string, value: string) => handlers.setValue(key, value),
    LMSCommit: (_: string) => handlers.commit(),
    LMSGetLastError: () => '0',
    LMSGetErrorString: (_: string) => '',
    LMSGetDiagnostic: (_: string) => '',
  };
}

export function createScorm2004Api(handlers: ScormHandlers) {
  return {
    Initialize: (_: string) => 'true',
    Terminate: (_: string) => handlers.finish(),
    GetValue: (key: string) => handlers.getValue(key),
    SetValue: (key: string, value: string) => handlers.setValue(key, value),
    Commit: (_: string) => handlers.commit(),
    GetLastError: () => '0',
    GetErrorString: (_: string) => '',
    GetDiagnostic: (_: string) => '',
  };
}
```

### ScormPlayer.tsx — design
```typescript
// Props
interface ScormPlayerProps {
  lessonId: string;
  onComplete?: () => void;
}

// Lifecycle
// 1. useQuery: GET /scorm/package/lesson/:lessonId → { packageId, version, entryPoint }
// 2. POST /scorm/attempts/init → { attemptId, cmiData }
// 3. Build cmiStore from cmiData (in-memory Record<string, string>)
// 4. Create shim handlers:
//    getValue(key) → cmiStore[key] ?? ''
//    setValue(key, value) → cmiStore[key] = value; enqueue flush; return 'true'
//    commit() → flush immediately; return 'true'
//    finish() → flush(); POST finish; onComplete?.(); return 'true'
// 5. Inject window.API (1.2) or window.API_1484_11 (2004) on iframeRef.contentWindow
//    BEFORE setting iframe src — do this in useEffect([attemptId])
// 6. Set iframe src = `/scorm/content/${packageId}/${entryPoint}`
// 7. Flush: debounced 2s → PUT /scorm/attempts/:id { values: pendingBuffer }; clear buffer

// Key implementation note:
// inject API via: iframeRef.current.contentWindow.API = createScorm12Api(handlers)
// then: iframeRef.current.src = contentUrl
// Same-origin (via Next.js proxy) makes window.parent.API === window.API on iframe side
```

### api.ts additions
```typescript
export const scormApi = {
  getPackageByLesson: (lessonId: string) =>
    fetchApi(`/scorm/package/lesson/${lessonId}`),
  initAttempt: (packageId: string, lessonId?: string) =>
    fetchApi('/scorm/attempts/init', { method: 'POST', body: JSON.stringify({ packageId, lessonId }) }),
  updateAttempt: (attemptId: string, values: Record<string, string>) =>
    fetchApi(`/scorm/attempts/${attemptId}`, { method: 'PUT', body: JSON.stringify({ values }) }),
  finishAttempt: (attemptId: string) =>
    fetchApi(`/scorm/attempts/${attemptId}/finish`, { method: 'POST' }),
  uploadLesson: async (lessonId: string, file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch(`${API_URL}/scorm/upload/lesson/${lessonId}`, {
      method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}` }, body: fd,
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
};
```

### query-keys.ts additions
```typescript
scorm: {
  package: (lessonId: string) => ['scorm', 'package', lessonId] as const,
  attempt: (packageId: string) => ['scorm', 'attempt', packageId] as const,
},
```

### Lesson viewer integration
In `(student)/courses/[slug]/learn/[lessonId]/page.tsx`:
- Add `import { ScormPlayer } from '@/components/scorm/ScormPlayer'`
- After the `quiz` block, add:
```tsx
{lesson.type === 'scorm' && (
  <div className="max-w-5xl mx-auto border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-10 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
    <ScormPlayer lessonId={lessonId} onComplete={() => completeMutation.mutate()} />
  </div>
)}
```

## Implementation Steps

1. Add rewrite to `frontend/next.config.js`
2. Create `frontend/components/scorm/ScormApiShim.ts`
3. Create `frontend/components/scorm/ScormPlayer.tsx`
4. Add `scormApi` to `frontend/lib/api.ts`
5. Add `scorm` keys to `frontend/lib/query-keys.ts`
6. Edit lesson viewer — add scorm render block
7. Test: load a SCORM lesson, verify API calls in network tab, verify completion sync

## Todo
- [ ] Add Next.js rewrite proxy for /scorm/content
- [ ] Create ScormApiShim.ts (1.2 + 2004 factories)
- [ ] Create ScormPlayer.tsx (fetch package, init attempt, inject API, iframe)
- [ ] Implement debounced flush (2s) + immediate flush on commit/finish
- [ ] Add scormApi to api.ts
- [ ] Add scorm query keys
- [ ] Integrate ScormPlayer in lesson viewer page
- [ ] Test same-origin API injection via proxy
- [ ] Verify LessonProgress.isCompleted updated on finish

## Success Criteria
- Lesson viewer renders ScormPlayer for type='scorm'
- iframe src resolves via proxy (same-origin, no CORS error)
- `window.API.LMSInitialize('')` returns 'true' in SCORM content
- CMI values flush to backend on debounce and on finish
- LessonProgress row shows `is_completed=true` after passing package

## Risk Assessment
- **High**: iframe API injection timing — must set `contentWindow.API` before `src` assignment
- If `contentWindow` is null (iframe not yet mounted), use `onLoad` ref callback pattern
- Some legacy SCORM packages walk up `window.top` not `window.parent` — shim on both:
  `iframeRef.current.contentWindow.API = shim; window.API = shim;` (belt-and-suspenders)

## Security Considerations
- iframe sandbox: `allow-scripts allow-same-origin` — both required; do NOT add `allow-top-navigation`
- next.config.js rewrite only proxies GET; upload POST goes directly to backend with auth header
- Rewrite destination uses env var — never hardcode `:3001` in production config

## Next Steps
Phase 04 — Instructor UI
