# Plan: Quiz Question Type Frontend UI

**Date:** 2026-02-27
**Task:** Add UI for instructors to create/edit single choice and multiple choice questions

## Current State

- Backend: Full CRUD for questions with options (single, multi, true_false, etc.)
- Frontend Quiz Attempt: Single/multi choice inputs implemented
- Frontend Question Bank: Only edit modal for content/difficulty/score (no options, no create)

## Requirements

1. **Add Question Button** - Button to create new questions
2. **Create Question Modal/Form**:
   - Question type selector (single, multi, true_false, short_answer, essay)
   - Question content editor
   - Options editor (add/remove options, mark correct)
   - Difficulty & score
3. **Edit Question Modal** - Include options editor
4. **Delete Question** - Already exists

---

## Implementation Steps

### Step 1: Add Create Question Button
- Add "Add Question" button next to "Import Questions"
- Open modal with create form

### Step 2: Create Question Form Component
- State for: type, content, difficulty, defaultScore, options[]
- Type selector dropdown
- Conditional rendering based on type:
  - `single`/`multi`/`true_false`: Show options editor
  - `short_answer`/`essay`: No options needed

### Step 3: Options Editor
- Add/remove option buttons
- Radio for single choice (one correct)
- Checkbox for multiple choice (multiple correct)
- Input for option content

### Step 4: API Integration
- Create: POST `/questions/bank/:bankId`
- Update: PUT `/questions/:id`
- Update options: PUT `/questions/:id/options`

---

## Code Changes

### File: `frontend/app/instructor/question-banks/[id]/page.tsx`

```typescript
// Add to interface
interface Option {
  id?: string;
  content: string;
  isCorrect: boolean;
}

// Add state
const [showCreate, setShowCreate] = useState(false);
const [newQuestion, setNewQuestion] = useState({
  type: 'single',
  content: '',
  difficulty: 'medium',
  defaultScore: 1,
  options: [{ content: '', isCorrect: true }]
});

// Add create handler
const handleCreateQuestion = async () => {
  // POST to /questions/bank/:bankId with options
};
```

---

## Success Criteria

- [x] Add Question button visible
- [x] Create modal with type selector
- [x] Options editor works for single/multi/true_false
- [x] Questions saved with options
- [x] Edit existing options
- [x] Delete works

---

## Status: ✅ COMPLETED

**Implemented features:**
- Add Question button at `/instructor/question-banks/[id]`
- Create modal with type selector (8 types: single, multi, true_false, short_answer, essay, matching, ordering, cloze)
- Options editor for all question types
- Question CRUD operations
- Matching, ordering, cloze question types added
