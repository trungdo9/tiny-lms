# Phase 01: Inline Video Player — Implementation

## Overview

Three surgical file changes. No new routes, no backend calls, no new packages.

---

## Step 1 — Create `frontend/lib/video-utils.ts`

Extract the existing function verbatim from `lesson-content.tsx` and export it.

```ts
// frontend/lib/video-utils.ts
export function getVideoEmbedUrl(url: string, provider: string): string | null {
  if (!url) return null;
  if (provider === 'youtube') {
    const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return id ? `https://www.youtube.com/embed/${id[1]}` : null;
  }
  if (provider === 'vimeo') {
    const id = url.match(/vimeo\.com\/(\d+)/);
    return id ? `https://player.vimeo.com/video/${id[1]}` : null;
  }
  // Direct / S3 URL — returned as-is for <video> tag
  return url;
}

/** Returns true when URL should be embedded via iframe (YouTube / Vimeo). */
export function isEmbedProvider(provider: string): boolean {
  return provider === 'youtube' || provider === 'vimeo';
}
```

**Notes**:
- `provider` maps to the activity's `content_type` field (`'youtube'`, `'vimeo'`, `''`, `null`).
- Non-embed URLs (direct/S3) return the raw URL; caller decides `<video>` vs `<iframe>`.

---

## Step 2 — Update `frontend/app/(student)/courses/[slug]/learn/[lessonId]/lesson-content.tsx`

Replace the local `getVideoEmbedUrl` declaration with an import. One-line change.

```diff
-function getVideoEmbedUrl(url: string, provider: string) {
-  ...
-}
+import { getVideoEmbedUrl } from '@/lib/video-utils';
```

The call site `getVideoEmbedUrl(lesson.video_url, lesson.video_provider)` is unchanged.

---

## Step 3 — Update `frontend/components/activity/ActivityList.tsx`

### 3a — Add import

```ts
import { getVideoEmbedUrl, isEmbedProvider } from '@/lib/video-utils';
```

### 3b — Add `openVideoId` state inside `ActivityList`

```ts
const [openVideoId, setOpenVideoId] = useState<string | null>(null);
```

### 3c — Update `handleActivityClick`

Replace the `'video'` case (student path only — instructor path is unchanged):

```ts
// Student click handler (called from student button)
const handleStudentActivityClick = (activity: Activity) => {
  switch (activity.activity_type) {
    case 'quiz':
      router.push(`/quizzes/${activity.quiz?.id}`);
      break;
    case 'flashcard':
      // no-op for students; flash cards shown in lesson body
      break;
    case 'video':
      setOpenVideoId((prev) => (prev === activity.id ? null : activity.id));
      break;
    case 'file':
      if (activity.content_url) window.open(activity.content_url, '_blank');
      break;
  }
};
```

The existing `handleActivityClick` continues to handle the instructor Edit navigation (quiz/flashcard redirects). The student button calls `handleStudentActivityClick` instead.

### 3d — Render inline player below each activity row

Replace the activities map block:

```tsx
{activities.map((activity) => (
  <div key={activity.id}>
    {/* Existing activity row — unchanged markup */}
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
      {/* ... icon, title, info, badges ... */}
      <div className="flex items-center gap-2">
        {/* ... published badge ... */}
        {isInstructor ? (
          /* ... Edit / Delete buttons unchanged ... */
        ) : (
          <button
            onClick={() => handleStudentActivityClick(activity)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            {activity.activity_type === 'quiz' ? 'Start' :
             activity.activity_type === 'flashcard' ? 'Study' :
             activity.activity_type === 'video'
               ? openVideoId === activity.id ? 'Close' : 'Watch'
               : 'View'}
          </button>
        )}
      </div>
    </div>

    {/* Inline video player — student only, accordion */}
    {!isInstructor && activity.activity_type === 'video' && openVideoId === activity.id && (
      <ActivityVideoPlayer
        url={activity.content_url ?? ''}
        provider={activity.content_type ?? ''}
      />
    )}
  </div>
))}
```

### 3e — Add `ActivityVideoPlayer` private sub-component (bottom of file)

```tsx
function ActivityVideoPlayer({ url, provider }: { url: string; provider: string }) {
  const embedUrl = getVideoEmbedUrl(url, provider);
  if (!embedUrl) return null;

  return (
    <div className="border-[4px] border-black shadow-[8px_8px_0px_0px_#000] bg-black overflow-hidden mt-1">
      <div className="aspect-video w-full">
        {isEmbedProvider(provider) ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video src={embedUrl} controls className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

| # | Criterion |
|---|-----------|
| 1 | Student clicks video activity → player expands inline below row |
| 2 | Clicking same activity again → player collapses |
| 3 | Clicking a different video → previous closes, new one opens |
| 4 | YouTube and Vimeo URLs render as iframe; direct/S3 URLs as `<video>` |
| 5 | Player uses `border-[4px] border-black shadow-[8px_8px_0px_0px_#000] aspect-video` |
| 6 | Instructor view: Edit button navigates as before; no inline player rendered |
| 7 | `lesson-content.tsx` lesson-level video player unaffected |
| 8 | No TypeScript or ESLint errors |

---

## Risk Notes

- **`content_type` field as provider**: existing data in the DB uses values like `'youtube'`, `'vimeo'`, or free-text. The util returns raw URL as fallback, so unknown values degrade to `<video>` (may fail to play embed streams — acceptable).
- **CSP / iframe sandbox**: Supabase/Vercel deployments may need `frame-src` CSP additions for youtube.com and vimeo.com. No code change required, but infra config should be verified at deploy time.
