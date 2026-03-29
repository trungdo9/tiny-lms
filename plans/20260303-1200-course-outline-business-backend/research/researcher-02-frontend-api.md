# Frontend API Research Report

## API Functions Status

### Sections API (api.ts lines 55-68)
**Functions available:**
- `getByCourse(courseId)` - GET `/courses/{courseId}/sections`
- `create(courseId, data)` - POST `/courses/{courseId}/sections`
- `update(id, data)` - PUT `/sections/{id}`
- `delete(id)` - DELETE `/sections/{id}`
- `reorder(courseId, sectionIds)` - PUT `/courses/{courseId}/sections/reorder`

### Lessons API (api.ts lines 71-88)
**Functions available:**
- `getBySection(sectionId)` - GET `/sections/{sectionId}/lessons`
- `get(id)` - GET `/lessons/{id}`
- `getForLearning(id)` - GET `/lessons/{id}/learn`
- `create(sectionId, data)` - POST `/sections/{sectionId}/lessons`
- `update(id, data)` - PUT `/lessons/{id}`
- `delete(id)` - DELETE `/lessons/{id}`
- `reorder(sectionId, lessonIds)` - PUT `/sections/{sectionId}/lessons/reorder`

## Backend Endpoints Status

### Flash Cards Endpoints
✅ **GET /lessons/:lessonId/flash-cards** - EXISTS
- Controller: `LessonFlashCardsController` (flash-cards.controller.ts line 8-44)
- Method: `findByLesson(lessonId)` returns deck for a lesson
- Uses: `POST` to create, `PUT` to update, `DELETE` to remove

### Quizzes Endpoints
✅ **GET /lessons/:lessonId/quizzes** - EXISTS
- Controller: `LessonQuizzesController` (quizzes.controller.ts line 8-28)
- Method: `findByLesson(lessonId)` returns quiz attached to lesson or null
- Uses: `POST` to create (1 lesson = 1 quiz max)

### Frontend API Methods
✅ `flashCardsApi.getDeckByLesson(lessonId)` - Calls GET `/lessons/{lessonId}/flash-cards`
✅ No dedicated quizzes API in api.ts but backend endpoint exists - can fetch directly or add wrapper

## Query Keys Status
✅ Flash Cards query keys exist (query-keys.ts lines 100-106)
- `flashCards.deck(lessonId)` → `['flash-cards', 'deck', lessonId]`
- `flashCards.cards(deckId)` → `['flash-cards', 'cards', deckId]`
- `flashCards.session(sessionId)` → `['flash-cards', 'session', sessionId]`
- `flashCards.history(deckId)` → `['flash-cards', 'history', deckId]`

❌ Quiz query keys missing - only instructor/list/detail keys exist, no lesson-specific quiz key

## Frontend Pages Status
✅ Flash Cards pages exist:
- `/instructor/flash-cards/` - main page
- `/instructor/flash-cards/create/` - create page

## Existing Edit Page Layout
Course edit page (courses/[id]/page.tsx) structure:
- Fetches course with all sections/lessons (lines 14-41)
- For each lesson, fetches quiz and flash-cards data in parallel
- Uses custom fetch instead of API wrapper (lines 14-41)
- Inline pattern: Build nested course structure with related data

## Key Findings
1. **Flash cards endpoints fully implemented** with create/update/delete support
2. **Quiz endpoints fully implemented** with GET for lesson quizzes
3. **Frontend API wrapper incomplete** - quizzes missing from api.ts, needs wrapper methods
4. **Query keys incomplete** - quiz lesson-specific key missing
5. **Existing pattern** in course edit uses direct fetch with parallel Promise.all loading
6. **Flash cards frontend complete** - full create page with persistence exists
