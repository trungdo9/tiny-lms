# Phase 3: Frontend - Instructor

## Overview
- **Date**: 2026-02-28
- **Description**: Tạo UI cho instructor quản lý flash cards
- **Priority**: High
- **Status**: ⬜ Pending

## Context
- Dependencies: Phase 2 - Backend API
- Reference: `frontend/app/instructor/quizzes/[id]/page.tsx` (quiz editor)

## Key Insights
- Tích hợp vào lesson editor page (lesson detail)
- Instructor tạo/edit deck và cards trong cùng page với lesson content
- Dùng TanStack Query (đã migrate ở plan trước)

## Architecture

### Page Structure

```
frontend/app/
├── lib/
│   └── api/
│       └── flash-cards.ts    # API wrapper
├── components/
│   └── flash-card/
│       ├── DeckEditor.tsx    # Edit deck title/description
│       ├── CardList.tsx      # List cards với reorder
│       ├── CardForm.tsx      # Add/edit card modal
│       └── CardPreview.tsx   # Preview card (flip)
```

### API Wrapper
```ts
// frontend/lib/api/flash-cards.ts
export const flashCardsApi = {
  getDeckByLesson: (lessonId: string) =>
    api.get(`/lessons/${lessonId}/flash-cards`),

  createDeck: (lessonId: string, data: CreateDeckDto) =>
    api.post(`/lessons/${lessonId}/flash-cards`, data),

  updateDeck: (lessonId: string, data: UpdateDeckDto) =>
    api.put(`/lessons/${lessonId}/flash-cards`, data),

  deleteDeck: (lessonId: string) =>
    api.delete(`/lessons/${lessonId}/flash-cards`),

  getCards: (deckId: string) =>
    api.get(`/flash-cards-deck/${deckId}/cards`),

  createCard: (deckId: string, data: CreateCardDto) =>
    api.post(`/flash-cards-deck/${deckId}/cards`, data),

  updateCard: (cardId: string, data: UpdateCardDto) =>
    api.put(`/flash-cards/cards/${cardId}`, data),

  deleteCard: (cardId: string) =>
    api.delete(`/flash-cards/cards/${cardId}`),
};
```

### Query Keys
```ts
// frontend/lib/query-keys.ts (extend existing)
flashCards: {
  deck: (lessonId: string) => ['flashCards', 'deck', lessonId] as const,
  cards: (deckId: string) => ['flashCards', 'cards', deckId] as const,
}
```

## Related Files
- `frontend/app/instructor/courses/[id]/page.tsx` - Lesson editor
- `frontend/lib/api.ts` - API wrapper
- `frontend/lib/query-keys.ts` - Query keys

## Implementation Steps

1. **Add API wrapper**
   - Create `frontend/lib/api/flash-cards.ts`
   - Add methods to main `api.ts` barrel export

2. **Create components**
   - DeckEditor: Title, description, shuffle toggle, publish toggle
   - CardList: Draggable list (dùng dnd-kit hoặc simple up/down)
   - CardForm: Modal form với front, back, hint fields

3. **Integrate vào Lesson Editor**
   - Add "Flash Cards" tab trong lesson editor
   - Show deck status (published/draft)
   - Quick preview button

4. **Add TanStack Query**
   - useQuery for deck + cards
   - useMutation for CRUD operations
   - invalidateQueries on changes

## UI Components

### DeckEditor
- Title input
- Description textarea
- Toggle: Shuffle cards
- Toggle: Publish (only when cards > 0)
- Preview button → opens study mode

### CardList
- Table/List view
- Columns: Order, Front (truncated), Back (truncated), Actions
- Drag handle for reorder
- Edit/Delete buttons
- "Add Card" button (primary)

### CardForm Modal
- Front field (required)
- Back field (required)
- Hint field (optional)
- Image upload (optional) - future

## Todo List
- [ ] Add flashCardsApi wrapper
- [ ] Create DeckEditor component
- [ ] Create CardList component
- [ ] Create CardForm modal
- [ ] Integrate vào lesson editor page
- [ ] Add TanStack Query hooks

## Success Criteria
- [ ] Instructor có thể tạo deck cho lesson
- [ ] Instructor có thể add/edit/delete cards
- [ ] Instructor có thể publish deck
- [ ] Preview mode hoạt động

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex form handling | Medium | Dùng shadcn form components |
| Reorder complexity | Medium | Simple up/down arrows first |

## Next Steps
- Proceed to Phase 4: Frontend Student
