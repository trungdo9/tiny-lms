# Activity Module Refactor Plan

## Overview
Refactor course structure: 1 lesson có thể có nhiều activities thay vì 1 lesson = 1 quiz.

## Status: ✅ COMPLETED (FULLY)

**Completed:** 2026-03-31

**Fully Completed:** 2026-03-31 (all pending tasks done)

---

## Summary

Activity model đã được implement cho phép 1 lesson có nhiều activities (quiz, flashcard, video, file).

## Implemented Features

### Database Schema
- Activity model với relations tới Quiz, FlashCardDeck, Assignment
- Activity fields: lessonId, activityType, title, orderIndex, isPublished, contentUrl, contentType

### Backend API
- ActivitiesService với CRUD operations
- ActivitiesController + LessonActivitiesController
- DTOs: CreateActivityDto, UpdateActivityDto, ReorderActivitiesDto
- Module registered in app.module.ts

### Frontend
- activitiesApi client trong api.ts
- Query keys cho activities
- ActivityList component với:
  - Create activity form
  - Delete activity
  - Video modal player (inline video playback)
  - Flashcard routing via callback
- Integration với lesson-content.tsx

## Code Changes

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Activity model + relations |
| `backend/src/modules/activities/*` | Full CRUD module |
| `frontend/lib/api.ts` | activitiesApi client |
| `frontend/lib/query-keys.ts` | Activity query keys |
| `frontend/components/activity/ActivityList.tsx` | Activity list + video modal |

## Fixes Applied

1. **Flashcard routing**: Uses `onStartFlashCards` callback thay vì redirect to instructor page
2. **Video inline player**: VideoModal component for playing videos without opening new tab
3. **Quiz ID routing**: Fixed to use `activity.quiz.id` correctly

## Known Limitations

- ✅ All planned features implemented (2026-03-31)

## Decisions Resolved

- ✅ Multiple quizzes per lesson allowed (via activityId)
- ✅ Video/File: Activity model handles contentUrl, contentType
- ✅ Legacy lesson fields kept for backward compatibility

## Timeline

- Phase 1 (Database): ~0.5 day ✅
- Phase 2 (Backend): ~1 day ✅
- Phase 3 (Frontend): ~1.5 day ✅ (fully complete 2026-03-31)

**Total**: ~3 days (fully complete)
