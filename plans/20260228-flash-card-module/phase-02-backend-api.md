# Phase 2: Backend API

## Overview
- **Date**: 2026-02-28
- **Description**: Tạo NestJS module với CRUD endpoints + study session
- **Priority**: High
- **Status**: ⬜ Pending

## Context
- Dependencies: Phase 1 - Database Schema
- Reference: Quiz module structure (`backend/src/modules/quizzes/`)

## Key Insights
- Tương tự QuizController nhưng đơn giản hơn
- Endpoints: CRUD deck, CRUD cards, start/complete session
- Sử dexisting guards (SupabaseAuthGuard, RolesGuard)

## Architecture

### Module Structure
```
src/modules/flash-cards/
├── flash-cards.module.ts
├── flash-cards.controller.ts
├── flash-cards.service.ts
├── flash-cards.guard.ts
└── dto/
    ├── flash-card.dto.ts
    └── flash-card-session.dto.ts
```

### API Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | /lessons/:lessonId/flash-cards | Get deck by lesson | Student, Instructor |
| POST | /lessons/:lessonId/flash-cards | Create deck | Instructor |
| PUT | /lessons/:lessonId/flash-cards | Update deck | Instructor |
| DELETE | /lessons/:lessonId/flash-cards | Delete deck | Instructor |
| GET | /flash-cards-deck/:deckId/cards | Get all cards | Student, Instructor |
| POST | /flash-cards-deck/:deckId/cards | Add card | Instructor |
| PUT | /flash-cards/cards/:cardId | Update card | Instructor |
| DELETE | /flash-cards/cards/:cardId | Delete card | Instructor |
| POST | /flash-cards-deck/:deckId/start | Start study session | Student |
| POST | /flash-cards-sessions/:sessionId/complete | Complete session | Student |
| GET | /flash-cards-deck/:deckId/history | Get user history | Student |

## DTOs

### CreateDeckDto
```ts
class CreateDeckDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  shuffleCards?: boolean;
}
```

### CreateCardDto
```ts
class CreateCardDto {
  @IsString()
  front: string;

  @IsString()
  back: string;

  @IsString()
  @IsOptional()
  hint?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @IsOptional()
  orderIndex?: number;
}
```

### SessionResultDto
```ts
class SessionResultDto {
  @IsInt()
  knownCards: number;

  @IsInt()
  unknownCards: number;

  @IsInt()
  @IsOptional()
  timeSpentSecs?: number;
}
```

## Related Files
- `backend/src/modules/quizzes/` - Reference structure
- `backend/src/modules/flash-cards/` - New module

## Implementation Steps

1. **Create module skeleton**
   - flash-cards.module.ts
   - flash-cards.controller.ts
   - flash-cards.service.ts

2. **Implement service methods**
   - createDeck, updateDeck, deleteDeck, getDeckByLesson
   - createCard, updateCard, deleteCard, getCardsByDeck
   - startSession, completeSession, getHistory

3. **Implement controller endpoints**
   - Add routes với proper guards
   - Role-based access (instructor vs student)

4. **Register module in app.module.ts**
   - Import FlashCardsModule

## Todo List
- [ ] Create flash-cards module skeleton
- [ ] Implement FlashCardsService CRUD
- [ ] Implement FlashCardsController endpoints
- [ ] Add FlashCardsModule to app.module.ts

## Success Criteria
- [ ] All endpoints return correct responses
- [ ] Authorization works (instructor vs student)
- [ ] TypeScript compiles without errors

## Security Considerations
- Validate lesson ownership (instructor can only edit own lesson's deck)
- Student decks
- Session tied can only access published to userId

## Next Steps
- Proceed to Phase 3: Frontend Instructor
