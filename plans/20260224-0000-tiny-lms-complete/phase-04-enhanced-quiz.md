# Phase 4: Enhanced Quiz

**Date:** Week 6
**Priority:** P1 - Important
**Status:** In Progress
**Depends On:** Phase 3 (Quiz Core)

## Overview
Add advanced quiz features: pagination modes, random questions, CSV import, and advanced question types.

## Requirements

### Functional
1. **Advanced Pagination**
   - `all`: All questions on one page
   - `paginated`: N questions per page
   - `one_by_one`: Single question view

2. **Randomization**
   - Random questions from question bank
   - Shuffle answer options
   - Filter by difficulty/tags when randomizing

3. **Question Import**
   - Import from CSV
   - Import from Excel (.xlsx)
   - Template download
   - Preview before import
   - Batch validation

4. **Advanced Question Types**
   - `matching`: Match pairs (A-B columns)
   - `ordering`: Arrange in correct order
   - `cloze`: Fill in blanks within text
   - `drag_drop_text`: Drag words into text
   - `drag_drop_image`: Drag labels onto image

5. **Manual Grading**
   - Queue for manual grading (essays)
   - Grade interface for instructors
   - Feedback submission

### Non-Functional
- Handle large question banks (1000+ questions)
- Efficient random selection algorithm
- Import progress feedback

---

## Implementation Steps

### Step 4.1: Pagination Enhancement
- [ ] Update quiz config for all pagination modes
- [ ] Implement page navigation logic
- [ ] Add "jump to question" sidebar
- [ ] Persist current page on auto-save

### Step 4.2: Randomization Engine
- [ ] Random selection from banks with filters
- [ ] Fisher-Yates shuffle algorithm
- [ ] Difficulty-weighted selection (optional)
- [ ] Deterministic randomization with seed (for retries)

### Step 4.3: Import Service
- [ ] CSV parser (csv-parse)
- [ ] Excel parser (xlsx library)
- [ ] Validation: required fields, valid options
- [ ] Preview: show parsed questions
- [ ] Bulk insert with transaction
- [ ] Error reporting per row

### Step 4.4: Advanced Question Types (Backend)
- [ ] Matching: store pairs, score by correct matches
- [ ] Ordering: store correct order, score by position
- [ ] Cloze: store blanks, validate each
- [ ] Drag-drop text: token-based validation
- [ ] Drag-drop image: coordinate-based matching

### Step 4.5: Advanced Question Types (Frontend)
- [ ] Matching: two-column drag interface
- [ ] Ordering: sortable list
- [ ] Cloze: inline input fields
- [ ] Drag-drop text: word bank + drop zones
- [ ] Drag-drop image: image with draggable labels

### Step 4.6: Manual Grading Queue
- [ ] List pending essays for grading
- [ ] Instructor grading form
- [ ] Score and feedback submission
- [ ] Notify student on completion

---

## CSV Import Template

```csv
type,content,option_a,option_b,option_c,option_d,correct,score,difficulty,explanation,tags
single,"Question?","A","B","C","D","A",1,easy,"Explanation","tag1,tag2"
multi,"Question?","A","B","C","D","A,C",2,medium,"",""
true_false,"Statement","True","False","","","A",1,easy,"",""
short_answer,"Answer?","","","","","Answer text",1,medium,"",""
```

---

## Related Code Files

### Backend Additions
```
backend/src/modules/question-banks/import/
├── import.module.ts
├── import.service.ts        # CSV/Excel parser
└── dto/
    └── import-preview.dto.ts

backend/src/modules/scoring/
└── scoring.service.ts      # Add scoring for advanced types

backend/src/modules/grading/
├── grading.module.ts
├── grading.controller.ts
└── grading.service.ts
```

### Frontend Additions
```
frontend/components/quiz/answer-inputs/
├── matching.tsx
├── ordering.tsx
├── cloze.tsx
├── drag-drop-text.tsx
└── drag-drop-image.tsx

frontend/app/(instructor)/question-banks/[id]/
└── import/
    └── page.tsx            # Import UI
```

---

## Success Criteria

- [ ] All pagination modes work correctly
- [ ] Random questions appear differently each attempt
- [ ] CSV import works with 100+ questions
- [ ] All advanced question types functional
- [ ] Manual grading queue works

---

## Next Steps

1. Proceed to Phase 5: Reports & Polish
2. Dependencies: Full quiz system needed
