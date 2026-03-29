# Phase 3: Frontend

## Overview
- **Date**: 2026-02-28
- **Description**: Cập nhật frontend để hiển thị Activity
- **Priority**: High
- **Status**: ⬜ Pending

## Context
- Dependencies: Phase 2 - Backend API
- Reference: Current lesson page, course editor

## Key Insights
- Lesson page: Hiển thị list of activities thay vì type-specific content
- Course editor: Activity management (add, reorder, delete)
- Student: Study activity based on type

## Architecture

### Page Updates

1. **Student Lesson Page** (`/courses/[slug]/learn/[lessonId]`)
   - Fetch activities for lesson
   - Render each activity based on type
   - Activity types: quiz, flashcard, video, file

2. **Instructor Course Editor** (`/instructor/courses/[id]`)
   - Show activities list per lesson
   - Add activity button (dropdown: quiz, flashcard, video, file)
   - Drag to reorder

### Components

```
frontend/components/
└── activity/
    ├── ActivityList.tsx      # List activities in lesson
    ├── ActivityItem.tsx     # Single activity card
    ├── ActivityEditor.tsx   # Create/edit activity
    └── ActivityContent.tsx  # Type-specific content
```

### API Updates

```typescript
// frontend/lib/api/activities.ts
export const activitiesApi = {
  getByLesson: (lessonId: string) =>
    fetchApi(`/lessons/${lessonId}/activities`),

  create: (lessonId: string, data: CreateActivityDto) =>
    fetchApi(`/lessons/${lessonId}/activities`, { method: 'POST', body: JSON.stringify(data) }),

  update: (activityId: string, data: UpdateActivityDto) =>
    fetchApi(`/lessons/*/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (activityId: string) =>
    fetchApi(`/lessons/*/activities/${activityId}`, { method: 'DELETE' }),

  reorder: (lessonId: string, activityIds: string[]) =>
    fetchApi(`/lessons/${lessonId}/activities/reorder`, { method: 'PUT', body: JSON.stringify({ activityIds }) }),
};
```

## Related Files
- `frontend/app/(student)/courses/[slug]/learn/[lessonId]/page.tsx`
- `frontend/app/instructor/courses/[id]/page.tsx`
- `frontend/lib/api.ts`

## Implementation Steps

1. **Add Activities API**
   - Create `activitiesApi` in api.ts
   - Add query keys

2. **Create Activity Components**
   - ActivityList
   - ActivityItem
   - ActivityEditor

3. **Update Student Lesson Page**
   - Replace type-specific rendering with activity list
   - Render video/file inline
   - Show quiz/flashcard buttons

4. **Update Instructor Course Editor**
   - Add activity management UI
   - Activity type selector
   - Reorder support

## UI Mockups

### Lesson Page - Activities List
```
┌─────────────────────────────────────┐
│ 📹 Introduction Video               │
│   [Watch Video]                    │
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
│   [Read Article]                    │
└─────────────────────────────────────┘
```

### Activity Editor
```
┌─────────────────────────────────────┐
│ Add Activity                        │
├─────────────────────────────────────┤
│ Type: [Quiz ▼]                      │
│ Title: [Chapter 1 Quiz]             │
│ [ ] Published                       │
│                                     │
│ [Create] [Cancel]                   │
└─────────────────────────────────────┘
```

## Todo List
- [ ] Add activities API
- [ ] Create activity components
- [ ] Update lesson page
- [ ] Update course editor

## Success Criteria
- [ ] Multiple activities per lesson
- [ ] Activity CRUD works
- [ ] Drag reorder works

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex UI changes | Medium | incremental updates |
| Breaking student flow | Medium | Test thoroughly |

## Next Steps
- Consider v2: Activity analytics, completion tracking
