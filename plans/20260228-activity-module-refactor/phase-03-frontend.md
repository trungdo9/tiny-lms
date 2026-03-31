# Phase 3: Frontend

## Overview
- **Date**: 2026-02-28
- **Description**: Cập nhật frontend để hiển thị Activity
- **Priority**: High
- **Status**: ⚠️ PARTIAL - Updated 2026-03-31

## Context
- Dependencies: Phase 2 - Backend API (✅ Complete)
- Reference: Current lesson page, course editor

## What Was Implemented

### Already Done
1. ✅ `activitiesApi` in api.ts with CRUD operations
2. ✅ Query keys in query-keys.ts
3. ✅ `ActivityList` component with create form
4. ✅ `VideoModal` component for inline video playback
5. ✅ Integration with lesson-content.tsx

### Fixed (2026-03-31)
1. ✅ Flashcard routing: Now uses `onStartFlashCards` callback instead of redirecting to instructor page
2. ✅ Video inline player: Added VideoModal for playing videos without new tab
3. ✅ Quiz link: Fixed to use `activity.quiz.id` correctly

## What Still Needs Work

| Task | Priority | Status |
|------|----------|--------|
| Drag-drop reorder UI | Medium | ✅ Done (2026-03-31) |
| Edit activity form | Medium | ✅ Done (2026-03-31) |
| Activity type selector when creating | Low | ✅ Done (2026-03-31) |
| Assignment activity type support | Low | ✅ Done (2026-03-31) |

## Architecture

### Components Created

```
frontend/components/
└── activity/
    ├── ActivityList.tsx      # ✅ Done - List activities with create form + video modal
    ├── index.ts              # ✅ Exports
```

### API Updates

```typescript
// frontend/lib/api.ts - ✅ Already done
export const activitiesApi = {
  getByLesson: (lessonId: string) =>
    fetchApi(`/lessons/${lessonId}/activities`),
  create: (lessonId: string, data: CreateActivityDto) =>
    fetchApi(`/lessons/${lessonId}/activities`, { method: 'POST', ... }),
  update: (activityId: string, data: UpdateActivityDto) =>
    fetchApi(`/activities/${activityId}`, { method: 'PUT', ... }),
  delete: (activityId: string) =>
    fetchApi(`/activities/${activityId}`, { method: 'DELETE' }),
  reorder: (lessonId: string, activityIds: string[]) =>
    fetchApi(`/lessons/${lessonId}/activities/reorder`, { method: 'PUT', ... }),
};
```

## Implementation Steps

### Completed Steps
1. ✅ **Add Activities API** - Created activitiesApi in api.ts
2. ✅ **Create Activity Components** - ActivityList with VideoModal
3. ✅ **Update Student Lesson Page** - Integrated ActivityList with callbacks

### Pending Steps
4. ✅ **Drag-drop reorder** - Add @dnd-kit support for reordering activities (✅ Done 2026-03-31)
5. ✅ **Edit activity form** - Add edit modal to ActivityList (✅ Done 2026-03-31)
6. ✅ **Activity type selector** - When creating, show type-specific options (✅ Done 2026-03-31)

## UI Mockups (Implemented)

### Lesson Page - Activities List ✅
```
┌─────────────────────────────────────┐
│ 📹 Introduction Video               │
│   [▶ Play Video]                   │
├─────────────────────────────────────┤
│ 📝 Chapter Quiz                     │
│   10 questions • 15 min             │
│   [Start Quiz]                      │
├─────────────────────────────────────┤
│ 📇 Vocabulary Flash Cards           │
│   20 cards                          │
│   [Study Now]                       │
├─────────────────────────────────────┤
│ 📄 Reading Material                 │
│   [View]                           │
└─────────────────────────────────────┘
```

### Video Player Modal ✅ (NEW)
```
┌─────────────────────────────────────┐
│ Video Player                    [X] │
├─────────────────────────────────────┤
│                                     │
│         [Video Content]             │
│                                     │
└─────────────────────────────────────┘
```

### Activity Create Form ✅
```
┌─────────────────────────────────────┐
│ Create Activity                      │
├─────────────────────────────────────┤
│ Type: [Quiz ▼]                      │
│ Title: [Chapter 1 Quiz]             │
│                                     │
│ [Create] [Cancel]                   │
└─────────────────────────────────────┘
```

## Success Criteria

- [x] Multiple activities per lesson
- [x] Activity CRUD works (create, delete - basic)
- [x] Video inline player works (fixed 2026-03-31)
- [x] Flashcard routes to study page (fixed 2026-03-31)
- [x] Drag reorder works (✅ Done 2026-03-31)
- [x] Edit activity works (✅ Done 2026-03-31)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex UI changes | Medium | incremental updates |
| Breaking student flow | Medium | Test thoroughly |

## Next Steps
1. Add drag-drop reorder with @dnd-kit
2. Add edit activity form
3. Add activity type selector for video/file content
