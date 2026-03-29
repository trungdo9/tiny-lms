# Phase 1: Database Schema

## Overview
- **Date**: 2026-02-28
- **Description**: Tạo Activity model và cập nhật quan hệ
- **Priority**: High
- **Status**: ⬜ Pending

## Context
- Current: Quiz và FlashCardDeck gắn Lesson qua `lessonId @unique`
- Goal: 1 Lesson có nhiều Activities

## Key Insights
- Activity là "container" trỏ tới content thực tế
- Content types: quiz, flashcard, video, file
- Option A: Giữ video/file trong Lesson (đơn giản)
- Option B: Chuyển video/file sang Activity (nhất quán hơn)

## Architecture - Proposed Models

### Activity Model
```prisma
model Activity {
  id            String    @id @default(uuid()) @db.Uuid
  lessonId      String    @map("lesson_id") @db.Uuid
  activityType  String    @map("activity_type") // quiz, flashcard, video, file
  title         String
  orderIndex    Int       @default(0) @map("order_index")
  isPublished   Boolean   @default(false) @map("is_published")

  // Video/File content (for activityType = video or file)
  contentUrl   String?   @map("content_url")
  contentType  String?   @map("content_type") // video: youtube, vimeo, upload; file: pdf, doc, etc.

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  lesson        Lesson    @relation(fields: [lessonId], references: [id Cascade)
  quiz          Quiz?
], onDelete:  flashCardDeck FlashCardDeck?

  @@schema("public")
  @@map("activities")
}
```

**NOTE**:
- Multiple quizzes per lesson allowed (no unique constraint)
- Each activity has ONE content: quiz OR flashcard OR video/file data

### Quiz - Add activityId, Remove courseId/sectionId
```prisma
model Quiz {
  // ... existing fields (keep: title, description, timeLimit, etc.)
  activityId    String?   @map("activity_id") @db.Uuid

  activity       Activity? @relation(fields: [activityId], references: [id])
  // REMOVED: lessonId, sectionId, courseId (lấy từ Activity -> Lesson -> Course)
  // Note: activityId NOT unique - multiple quizzes allowed
}
```

### FlashCardDeck - Add activityId
```prisma
model FlashCardDeck {
  // ... existing fields
  activityId    String?   @unique @map("activity_id") @db.Uuid

  activity       Activity? @relation(fields: [activityId], references: [id])
  // Remove: lessonId (lấy từ Activity)
  // Note: Keep unique for flashcard (1 deck per activity)
}
```

## Decision Points (RESOLVED)
1. **Multiple quizzes per lesson**: ✅ ALLOWED
   - Remove unique constraint on lessonId + activityType
   - 1 lesson có thể có nhiều quiz, nhiều flashcard

2. **Video/File handling**: ✅ Use Activity
   - Activity type: video → store videoUrl, videoProvider in Activity
   - Activity type: file → store fileUrl, fileType in Activity
   - Each activity has ONE content only (quiz OR flashcard OR video OR file)

## Implementation Steps

1. **Create Activity model**
   ```bash
   npx prisma migrate dev --name add_activity_model
   ```

2. **Add activityId to Quiz**
   - Add field: activityId String? @unique
   - Migrate data: Tạo Activity cho mỗi Quiz hiện có

3. **Add activityId to FlashCardDeck**
   - Add field: activityId String? @unique
   - Migrate data: Tạo Activity cho mỗi Deck hiện có

4. **Remove old relations from Quiz/FlashCardDeck**
   - Remove lessonId, sectionId, courseId (sẽ lấy qua Activity)

## Related Files
- `backend/prisma/schema.prisma`

## Todo List
- [ ] Create Activity model
- [ ] Add activityId to Quiz
- [ ] Add activityId to FlashCardDeck
- [ ] Run migration
- [ ] Migrate existing data

## Success Criteria
- [ ] Activity model tạo đúng
- [ ] Quiz/FlashCard linking hoạt động
- [ ] Dữ liệu cũ được migrate

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration complexity | High | Backup dữ liệu trước |
| Breaking existing queries | Medium | Cập nhật tất cả API references |

## Next Steps
- Proceed to Phase 2: Backend API
