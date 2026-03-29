# Quiz UX Optimization Plan

**Date:** 2026-02-28

---

## Context

Current quiz attempt page at `frontend/app/quizzes/[id]/attempt/[attemptId]/page.tsx` has basic UX. Need to improve for better user experience.

---

## UX Issues Identified

| # | Issue | Severity |
|---|-------|----------|
| 1 | No progress indicator - user doesn't know which questions answered | High |
| 2 | No "flag for review" feature | Medium |
| 3 | No question navigator/overview panel | High |
| 4 | Timer not prominent enough | Medium |
| 5 | No warning before time runs out (5min, 1min) | Medium |
| 6 | No confirmation when leaving page | High |
| 7 | Submit button always visible - risk of accidental submit | Medium |
| 8 | No visual feedback for answered questions | High |
| 9 | No loading states for page navigation | Low |
| 10 | Pagination mode info not prominent | Low |

---

## Requirements

### Phase 1: Question Navigator Panel (High Priority)

- Add sidebar showing all questions with status:
  - ✅ Answered (green)
  - ❌ Not answered (gray)
  - 🚩 Flagged for review (yellow)
- Click to jump to any question
- Show current question highlight

### Phase 2: Progress & Flagging (High Priority)

- Add flag/unflag button on each question
- Show progress bar: "5/10 answered"
- Count of flagged questions

### Phase 3: Timer Improvements (Medium Priority)

- More prominent timer display
- Warning colors: yellow at 5 min, red at 1 min
- Browser notification when time low (optional)

### Phase 4: Exit Protection (High Priority)

- Show confirmation dialog when:
  - Closing browser tab
  - Clicking back button
  - Navigating away
- "You have X unanswered questions. Are you sure?"

### Phase 5: Submit Experience (Medium Priority)

- "Review before submitting" summary
- Option to review unanswered questions
- Confirm dialog with answer count

---

## Architecture

```
frontend/app/quizzes/[id]/attempt/[attemptId]/
├── page.tsx          # Main quiz page with navigator
├── components/
│   ├── QuestionNavigator.tsx  # Question sidebar
│   ├── QuestionCard.tsx         # Individual question
│   ├── Timer.tsx               # Enhanced timer
│   └── ProgressBar.tsx         # Progress indicator
```

---

## Implementation Steps

### Step 1: Update API for question status
- Add `isAnswered`, `isFlagged` fields to attempt questions response
- Add endpoint to toggle flag status

### Step 2: Create QuestionNavigator component
- Grid of question buttons with status colors
- Click to navigate
- Current question highlight

### Step 3: Update QuestionCard
- Add flag button
- Show answer status
- Visual feedback for answered

### Step 4: Enhance Timer
- Add warning thresholds
- More prominent display
- Audio notification option

### Step 5: Add exit protection
- BeforeUnload event handler
- Navigation guard

---

## Files to Modify

1. `backend/src/modules/attempts/attempts.service.ts` - Add flag toggle
2. `backend/src/modules/attempts/attempts.controller.ts` - Add flag endpoint
3. `frontend/app/quizzes/[id]/attempt/[attemptId]/page.tsx` - Add navigator
4. New components for quiz UX

---

## Success Criteria

- [x] Question navigator shows all questions with status
- [x] Can flag questions for review
- [x] Progress bar shows answered count
- [x] Timer has warning states
- [x] Exit confirmation prevents data loss
- [x] Submit shows review summary

---

## Status: ✅ COMPLETED

**Commit:** `1a19782` - feat: add quiz UX enhancements and question types
