# Phase 4: Frontend - Student

## Overview
- **Date**: 2026-02-28
- **Description**: Tạo study mode cho student với flip animation
- **Priority**: High
- **Status**: ⬜ Pending

## Context
- Dependencies: Phase 3 - Frontend Instructor
- Reference: `frontend/app/quizzes/[id]/attempt/[attemptId]/page.tsx` - quiz attempt page

## Key Insights
- Study mode: Xem card → flip để xem answer → mark known/unknown
- Progress bar showing cards studied
- Shuffle option (từ deck settings)
- Session tracking with time spent

## Architecture

### Page Structure
```
frontend/app/
├── (student)/
│   └── courses/[slug]/learn/[lessonId]/
│       └── page.tsx    # Thêm flash card section
└── components/
    └── flash-card/
        ├── FlashCardStudy.tsx   # Main study component
        ├── FlashCard.tsx        # Single card with flip
        ├── StudyProgress.tsx    # Progress bar
        └── StudyControls.tsx    # Known/Unknown buttons
```

### Study Flow
1. User vào lesson → nếu có deck + published → show "Study Flash Cards" button
2. Click → mở study mode (fullscreen hoặc inline)
3. Show first card (front)
4. Click card hoặc "Show Answer" → flip to back
5. User click "Known" hoặc "Unknown"
6. Next card
7. After last card → show summary (known/unknown counts, time spent)
8. "Complete" → save session

### Component: FlashCardStudy
```tsx
interface FlashCardStudyProps {
  deckId: string;
  onComplete: () => void;
}
```

### Component: FlashCard
```tsx
interface FlashCardProps {
  front: string;
  back: string;
  hint?: string;
  isFlipped: boolean;
  onFlip: () => void;
}
```

### CSS Flip Animation
```css
.card-container {
  perspective: 1000px;
}

.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
```

## Related Files
- `frontend/app/(student)/courses/[slug]/learn/[lessonId]/page.tsx` - Lesson page
- `frontend/app/quizzes/[id]/attempt/[attemptId]/page.tsx` - Quiz attempt (reference)

## Implementation Steps

1. **Create FlashCard component**
   - CSS flip animation
   - Show front/back with hint

2. **Create FlashCardStudy component**
   - State: currentIndex, knownCards[], unknownCards[], isFlipped, startTime
   - Methods: handleFlip, handleKnown, handleUnknown, handleComplete

3. **Create StudyProgress component**
   - Progress bar (cards studied / total)
   - Known/Unknown counts

4. **Integrate vào Lesson Page**
   - Check if lesson has published deck
   - Show "Study Flash Cards" button
   - Open study mode in modal/overlay

5. **Add API calls**
   - Start session: POST /flash-cards-deck/:deckId/start
   - Complete session: POST /flash-cards-sessions/:sessionId/complete

## Study Mode UI

### Card View
┌─────────────────────────┐
│  Card 3 of 10           │
│  ████████░░░░░░  30%    │
├─────────────────────────┤
│                         │
│     [QUESTION]          │
│                         │
│     ───────────         │
│                         │
│     Click to flip       │
│                         │
└─────────────────────────┘
       [Unknown] [Known]

### After Flip
┌─────────────────────────┐
│  Card 3 of 10           │
│  ████████░░░░░░  30%    │
├─────────────────────────┤
│                         │
│     [ANSWER]            │
│                         │
│     (optional hint)     │
│                         │
└─────────────────────────┘
    [Didn't Know] [Got It!]

### Summary View
┌─────────────────────────┐
│      Session Complete!  │
├─────────────────────────┤
│                         │
│    8 / 10 correct       │
│                         │
│    ⏱️  2 minutes         │
│                         │
│    [Study Again]        │
│    [Back to Lesson]     │
└─────────────────────────┘

## Todo List
- [ ] Create FlashCard component với flip animation
- [ ] Create FlashCardStudy component
- [ ] Create StudyProgress component
- [ ] Integrate vào lesson page
- [ ] Add session tracking API calls

## Success Criteria
- [ ] Card flip animation smooth
- [ ] Known/Unknown tracking correct
- [ ] Session saved to database
- [ ] Progress saved (resume later) - v2

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Flip animation jank | Low | Use CSS transforms, test on mobile |
| Session not saved | Medium | Save on each card answer |

## Next Steps
- Consider v2 features: Spaced repetition, statistics
