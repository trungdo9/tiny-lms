# Instructor Management Dashboard Plan

## Overview
Add full CRUD + clone functionality for Courses, Quizzes, and Questions in instructor dashboard.

## Current Status

| Area | Frontend | Backend |
|------|----------|--------|
| Courses | Missing | ✅ CRUD complete |
| Quizzes | Only grading | ✅ CRUD complete |
| Question Banks | List + Create | ✅ CRUD complete |
| Questions | View only | ✅ CRUD complete |

## Implementation

### Phase 1: Course Management
**`/frontend/app/(instructor)/courses/`**

1. **List page** (`page.tsx`)
   - Table of instructor's courses
   - Columns: Title, Status, Lessons, Students, Actions
   - Actions: Edit, Delete, Clone

2. **Create/Edit page** (`[id]/page.tsx` or `create/page.tsx`)
   - Form: Title, Description, Thumbnail, Status
   - Sections management (add/remove/reorder)
   - Lessons management (add/remove/reorder within sections)

3. **Delete** - Confirm dialog, call DELETE API

4. **Clone** - POST to `/courses` with cloned data

### Phase 2: Quiz Management
**`/frontend/app/(instructor)/quizzes/`**

1. **List page** (`page.tsx`)
   - Table of quizzes with course info
   - Actions: Edit, Delete, Clone, View Reports

2. **Create/Edit page** (`[id]/page.tsx`)
   - Form: Title, Description, Course, Time limit, Passing score
   - Pagination mode, shuffle settings
   - Question selection from banks

3. **Delete** - Confirm dialog, call DELETE API

4. **Clone** - POST to `/quizzes` with cloned data

### Phase 3: Question Management
**`/frontend/app/(instructor)/question-banks/[id]/`**

1. **List questions** (update existing)
   - Table with question preview
   - Actions: Edit, Delete

2. **Edit question modal/page**
   - All question fields
   - Options management

3. **Delete** - Confirm, call DELETE API

### Phase 4: Backend Clone Endpoints (if needed)
- POST `/courses/clone/:id`
- POST `/quizzes/clone/:id`

Or handle clone on frontend by fetching data and POSTing to create.

## Files to Create/Modify

```
frontend/app/(instructor)/
├── courses/
│   ├── page.tsx              # List courses
│   ├── create/
│   │   └── page.tsx          # Create course
│   └── [id]/
│       └── page.tsx           # Edit course
├── quizzes/
│   ├── page.tsx              # List quizzes
│   ├── create/
│   │   └── page.tsx          # Create quiz
│   └── [id]/
│       └── page.tsx           # Edit quiz
└── question-banks/
    └── [id]/
        └── page.tsx           # Update - add edit/delete for questions
```

## API Endpoints (Backend exists)
- Courses: GET/POST `/courses`, GET/PUT/DELETE `/courses/:id`
- Quizzes: GET/POST `/quizzes`, GET/PUT/DELETE `/quizzes/:id`
- Questions: POST/PUT/DELETE `/questions/*`

## Success Criteria
- [x] Instructor can view list of courses
- [x] Instructor can create/edit/delete courses
- [ ] Instructor can clone courses
- [x] Instructor can view list of quizzes
- [x] Instructor can create/edit/delete quizzes
- [ ] Instructor can clone quizzes
- [x] Instructor can edit/delete questions in bank

---

## Status: ✅ COMPLETED

**Implemented features:**
- Instructor courses list at `/instructor/courses`
- Course creation/editing at `/instructor/courses/create` and `/instructor/courses/[id]`
- Instructor quizzes at `/instructor/quizzes`
- Question banks management at `/instructor/question-banks/*`
- Note: Clone feature not implemented
