# Activity Module Refactor Plan

## Overview
Refactor course structure: 1 lesson có thể có nhiều activities thay vì 1 lesson = 1 quiz.

## Current State
- **Lesson**: type (video|quiz|article), content, videoUrl, pdfUrl
- **Quiz**: gắn Lesson qua `lessonId @unique` (1:1)
- **FlashCardDeck**: gắn Lesson qua `lessonId @unique` (1:1)

## Proposed State
- **Activity**: Tham chiếu tới Quiz, FlashCardDeck, Video, File
- Activity types: quiz, flashcard, video, file

## Phases

| Phase | Description | Status |
|-------|-------------|--------|
| [Phase 1: Database Schema](./phase-01-database.md) | Tạo Activity model | ⬜ Pending |
| [Phase 2: Backend API](./phase-02-backend-api.md) | CRUD endpoints cho Activity | ⬜ Pending |
| [Phase 3: Frontend](./phase-03-frontend.md) | Cập nhật UI | ⬜ Pending |

## Key Changes
1. Quiz: Remove `lessonId`, `courseId`, `sectionId`, add `activityId` (NOT unique - multiple quizzes allowed)
2. FlashCardDeck: Remove `lessonId`, add `activityId` (keep unique - 1 deck per activity)
3. Activity: Contains `contentUrl`, `contentType` for video/file types
4. Lesson: Giữ type, content, videoUrl, pdfUrl để tương thích ngược (legacy)

## Decisions (Resolved)
- ✅ Multiple quizzes per lesson allowed
- ✅ Video/File: Chuyển sang Activity (store contentUrl, contentType in Activity)

## Timeline Estimate
- Phase 1: 0.5 day
- Phase 2: 1 day
- Phase 3: 1.5 days

**Total**: ~3 days
