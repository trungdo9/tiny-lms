# Flash Card Module Implementation Plan

## Overview
Module flash card đơn giản hơn quiz, gắn vào lessons. Sinh viên học bằng cách lật thẻ để xem đáp án.

## Relationship với Lesson
- Mỗi lesson có thể có 1 flash card deck (tương tự Quiz có `lessonId` @unique)
- Instructor tạo flash cards trong lesson editor
- Student học flash cards trong lesson viewer

## Phases

| Phase | Description | Status |
|-------|-------------|--------|
| [Phase 1: Database Schema](./phase-01-database.md) | Tạo Prisma models | ⬜ Pending |
| [Phase 2: Backend API](./phase-02-backend-api.md) | CRUD endpoints + study session | ⬜ Pending |
| [Phase 3: Frontend - Instructor](./phase-03-frontend-instructor.md) | Tạo/edit flash cards | ⬜ Pending |
| [Phase 4: Frontend - Student](./phase-04-frontend-student.md) | Study mode với flip animation | ⬜ Pending |

## Key Decisions

| Aspect | Decision |
|--------|----------|
| Deck per Lesson | 1 deck per lesson (như Quiz) |
| Card Fields | front (question), back (answer), hint (optional), order |
| Study Mode | Flip card, mark known/unknown, shuffle option |
| Progress | Track cards studied, known count, session history |
| Spaced Repetition | Basic (known → show less frequent) - v2 |

## Timeline Estimate
- Phase 1: 0.5 day
- Phase 2: 1 day
- Phase 3: 1 day
- Phase 4: 1 day

**Total**: ~3.5 days
