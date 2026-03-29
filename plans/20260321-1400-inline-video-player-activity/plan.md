# Plan: Inline Video Player for Video Activities

**Date**: 2026-03-21
**Status**: Ready for implementation
**Scope**: Frontend only — no backend changes required

---

## Problem

Clicking a video activity in `ActivityList.tsx` calls `window.open(content_url, '_blank')`, forcing a new tab. Students lose context and must return to the lesson page manually.

## Solution

Embed an accordion-style inline player directly in the activity row. Clicking a video activity toggles the player open/closed beneath the row. Instructor view is unchanged (Edit button still navigates).

## Affected Files

| File | Change |
|------|--------|
| `frontend/lib/video-utils.ts` | NEW — extracted `getVideoEmbedUrl()` shared util |
| `frontend/components/activity/ActivityList.tsx` | Add `openVideoId` state, `VideoPlayer` sub-component, update `handleActivityClick` |
| `frontend/app/(student)/courses/[slug]/learn/[lessonId]/lesson-content.tsx` | Replace inline `getVideoEmbedUrl()` with import from shared util |

## Architecture Decisions

- **No new component file**: `VideoPlayer` is a private sub-component inside `ActivityList.tsx` (YAGNI — not reused elsewhere yet; the shared util is the reusable part).
- **`getVideoEmbedUrl` signature preserved**: same `(url, provider)` shape — `lesson-content.tsx` can drop-in replace.
- **URL-based provider detection**: for activity videos, `content_type` field holds provider hint (`'youtube'`, `'vimeo'`); fall back to URL pattern detection for direct/S3 links.
- **Single open at a time**: one `openVideoId: string | null` state; clicking a second video closes the first automatically (simpler UX).

## Out of Scope

- File (`activity_type='file'`) inline viewing — remains `window.open`.
- Upload flow changes.
- Backend changes.

---

**Single phase**: See `phase-01-implementation.md`
