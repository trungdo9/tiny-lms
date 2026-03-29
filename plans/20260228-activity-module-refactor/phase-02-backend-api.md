# Phase 2: Backend API

## Overview
- **Date**: 2026-02-28
- **Description**: Cập nhật NestJS API để hỗ trợ Activity
- **Priority**: High
- **Status**: ⬜ Pending

## Context
- Dependencies: Phase 1 - Database Schema
- Reference: Quiz, FlashCard modules

## Key Insights
- Activity CRUD: Create, Read, Update, Delete, Reorder
- Nested routes: /lessons/:lessonId/activities
- Activity type determines content lookup

## Architecture

### Module Structure
```
src/modules/activities/
├── activities.module.ts
├── activities.controller.ts
├── activities.service.ts
└── dto/
    └── activity.dto.ts
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /lessons/:lessonId/activities | Get all activities for lesson |
| POST | /lessons/:lessonId/activities | Create activity |
| PUT | /lessons/:lessonId/activities/:id | Update activity |
| DELETE | /lessons/:lessonId/activities/:id | Delete activity |
| PUT | /lessons/:lessonId/activities/reorder | Reorder activities |

### DTOs

```ts
class CreateActivityDto {
  @IsString()
  activityType: 'quiz' | 'flashcard' | 'video' | 'file';

  @IsString()
  title: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

class UpdateActivityDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

class ReorderActivitiesDto {
  @IsString({ each: true })
  activityIds: string[];
}
```

## Service Logic

```typescript
async createActivity(lessonId: string, dto: CreateActivityDto) {
  // 1. Validate lesson ownership (instructor)
  // 2. Create activity
  // 3. If quiz/flashcard - create corresponding content record
  // 4. Return activity with content
}

async getActivitiesByLesson(lessonId: string) {
  return this.prisma.activity.findMany({
    where: { lessonId },
    include: {
      quiz: true,
      flashCardDeck: true,
    },
    orderBy: { orderIndex: 'asc' },
  });
}

async deleteActivity(activityId: string) {
  // 1. Get activity with content
  // 2. Delete related content (quiz/flashcard)
  // 3. Delete activity
}
```

## Related Files
- `backend/src/modules/activities/` - New module
- `backend/src/modules/quizzes/` - Update to use activityId
- `backend/src/modules/flash-cards/` - Update to use activityId

## Implementation Steps

1. **Create ActivitiesModule**
   - activities.module.ts
   - activities.controller.ts
   - activities.service.ts

2. **Update Quiz Module**
   - Remove lessonId from create/update
   - Add activityId
   - Query via Activity

3. **Update FlashCards Module**
   - Remove lessonId from create/update
   - Add activityId
   - Query via Activity

4. **Register module in app.module.ts**

## Todo List
- [ ] Create activities module
- [ ] Update quiz module
- [ ] Update flash-cards module
- [ ] Register module

## Success Criteria
- [ ] Activity CRUD works
- [ ] Quiz/FlashCard link to Activity
- [ ] TypeScript compiles

## Next Steps
- Proceed to Phase 3: Frontend
