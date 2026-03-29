# Phase 1: Database Schema

## Overview
- **Date**: 2026-02-28
- **Description**: Tạo Prisma models cho flash card module
- **Priority**: High
- **Status**: ⬜ Pending

## Context
- Reference: Lesson model (schema.prisma:101-121)
- Reference: Quiz model (schema.prisma:223-253)
- Dependencies: None (new feature)

## Key Insights
- Flash card deck gắn với lesson qua `lessonId` @unique (như Quiz)
- Cần track study progress per user per deck

## Architecture

### Models

```prisma
model FlashCardDeck {
  id            String    @id @default(uuid()) @db.Uuid
  lessonId      String    @unique @map("lesson_id") @db.Uuid
  title         String
  description   String?
  shuffleCards  Boolean   @default(false) @map("shuffle_cards")
  isPublished   Boolean   @default(false) @map("is_published")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  lesson        Lesson              @relation(fields: [lessonId], references: [id])
  cards         FlashCard[]
  studySessions FlashCardSession[]

  @@schema("public")
  @@map("flash_card_decks")
}

model FlashCard {
  id          String    @id @default(uuid()) @db.Uuid
  deckId      String    @map("deck_id") @db.Uuid
  front       String    // Question/term
  back        String    // Answer/definition
  hint        String?   // Optional hint
  imageUrl    String?   @map("image_url")
  orderIndex  Int       @default(0) @map("order_index")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  deck        FlashCardDeck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  @@schema("public")
  @@map("flash_cards")
}

model FlashCardSession {
  id            String    @id @default(uuid()) @db.Uuid
  deckId        String    @map("deck_id") @db.Uuid
  userId        String    @map("user_id") @db.Uuid
  totalCards    Int       @default(0) @map("total_cards")
  knownCards    Int       @default(0) @map("known_cards")
  unknownCards  Int       @default(0) @map("unknown_cards")
  timeSpentSecs Int?      @map("time_spent_secs")
  completedAt   DateTime? @map("completed_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  deck          FlashCardDeck @relation(fields: [deckId], references: [id])
  user          Profile       @relation(fields: [userId], references: [id])

  @@unique([deckId, userId, createdAt])
  @@schema("public")
  @@map("flash_card_sessions")
}
```

## Related Files
- `backend/prisma/schema.prisma` - Add models here

## Implementation Steps

1. **Add models to schema.prisma**
   - FlashCardDeck
   - FlashCard
   - FlashCardSession

2. **Generate migration**
   ```bash
   cd backend && npx prisma migrate dev --name add_flash_card_module
   ```

3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

## Todo List
- [ ] Add FlashCardDeck, FlashCard, FlashCardSession models to schema.prisma
- [ ] Run prisma migrate dev
- [ ] Run prisma generate

## Success Criteria
- [ ] Models tạo đúng với relationships
- [ ] Migration chạy thành công
- [ ] TypeScript types generated correctly

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema conflicts | Low | Dùng prefix "flash_card_" để tránh trùng |
| Migration failures | Low | Test local trước |

## Next Steps
- Proceed to Phase 2: Backend API
