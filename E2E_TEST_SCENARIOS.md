# E2E Test Scenarios: Course, Quiz, and Flashcard Features

**Date:** 2026-03-18
**Environment:** Staging (before production deployment)
**Purpose:** Validate core learning platform features after Quiz-Course refactor

---

## Table of Contents
1. [Setup & Prerequisites](#setup--prerequisites)
2. [Feature Test Scenarios](#feature-test-scenarios)
3. [Test Data](#test-data)
4. [Smoke Tests](#smoke-tests)
5. [Integration Tests](#integration-tests)

---

## Setup & Prerequisites

### Required Roles
- **Admin:** Full system access
- **Instructor:** Can create courses, quizzes, flashcards
- **Co-Instructor:** Can manage same course as primary instructor
- **Student:** Can access and complete quizzes, study flashcards

### Test Environment Setup
```bash
# 1. Backend running
npm run start  # or docker-compose up

# 2. Frontend running
npm run dev --prefix=frontend

# 3. Database migrated
# Execute: backend/prisma/migrations/quiz_enforce_lesson_section_hierarchy.sql

# 4. Test user accounts created (use Supabase)
- instructor1@test.com (password: Test123!)
- instructor2@test.com (password: Test123!)
- student1@test.com (password: Test123!)
- student2@test.com (password: Test123!)
```

### API Testing Tools
- **Postman** or **Insomnia** for API calls
- **Playwright** or **Cypress** for UI automation
- **cURL** for quick API tests

---

## Feature Test Scenarios

---

### SCENARIO 1: Create Course (Complete Flow)

**Objective:** Verify course creation with all required fields

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Login as instructor1@test.com | Login successful, redirected to dashboard | ⏳ |
| 2 | Navigate to `/instructor/courses` | Courses list displayed | ⏳ |
| 3 | Click "Tạo Khóa Học Mới" button | Create course modal appears | ⏳ |
| 4 | Enter course title: "TypeScript Basics" | Title field filled | ⏳ |
| 5 | Enter description: "Learn TypeScript fundamentals" | Description field filled | ⏳ |
| 6 | Select category: "Programming" | Category selected | ⏳ |
| 7 | Set level: "Beginner" | Level set | ⏳ |
| 8 | Check "Is Free" checkbox | Checkbox checked | ⏳ |
| 9 | Click "Tạo Khóa Học" button | Course created successfully | ⏳ |
| 10 | Verify redirect to course editor | Course editor page loads | ⏳ |
| 11 | Verify course title displayed | "TypeScript Basics" shown in editor | ⏳ |

**Expected API Calls:**
```bash
POST /courses
{
  "title": "TypeScript Basics",
  "description": "Learn TypeScript fundamentals",
  "categoryId": "<category-uuid>",
  "level": "beginner",
  "isFree": true
}

Response: 201 Created
{
  "id": "<course-id>",
  "title": "TypeScript Basics",
  "status": "draft",
  "createdAt": "2026-03-18T...",
  ...
}
```

**Test Data:**
- Course Title: TypeScript Basics
- Description: Learn TypeScript fundamentals
- Category: Programming
- Level: Beginner
- Price: Free

---

### SCENARIO 2: Add Sections and Lessons to Course

**Objective:** Verify course structure creation

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | In course editor, click "Thêm Phần" | New section form appears | ⏳ |
| 2 | Enter section name: "Basics" | Section name entered | ⏳ |
| 3 | Click "Tạo Phần" | Section created | ⏳ |
| 4 | In section, click "Thêm Bài Học" | New lesson form appears | ⏳ |
| 5 | Enter lesson title: "What is TypeScript?" | Lesson title entered | ⏳ |
| 6 | Enter lesson description | Description entered | ⏳ |
| 7 | Click "Tạo Bài Học" | Lesson created | ⏳ |
| 8 | Create second lesson: "Installation and Setup" | Second lesson created | ⏳ |
| 9 | Verify section shows "2 bài học" | Counter shows 2 lessons | ⏳ |

**Course Structure After:**
```
TypeScript Basics (Course)
└── Basics (Section)
    ├── What is TypeScript? (Lesson)
    └── Installation and Setup (Lesson)
```

---

### SCENARIO 3: Create Quiz in Lesson (New Feature - Critical)

**Objective:** Test 1-lesson-1-quiz constraint enforcement

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Hover over "What is TypeScript?" lesson | "Tạo Quiz" button appears | ⏳ |
| 2 | Click "Tạo Quiz" button | Quiz creation modal appears | ⏳ |
| 3 | Enter quiz title: "What is TypeScript?" | Title filled | ⏳ |
| 4 | Enter description: "Test your understanding" | Description filled | ⏳ |
| 5 | Set time limit: 30 minutes | Time limit set | ⏳ |
| 6 | Set passing score: 70% | Passing score set | ⏳ |
| 7 | Check "Show Leaderboard" | Checkbox checked | ⏳ |
| 8 | Click "Tạo Quiz" | Quiz created successfully | ⏳ |
| 9 | Verify quiz badge shown on lesson | Badge shows "(3)" questions or draft indicator | ⏳ |
| 10 | Try clicking "Tạo Quiz" again on same lesson | Error shown: "This lesson already has a quiz" | ⏳ ✅ |

**Expected API Call & Response:**
```bash
POST /lessons/{lessonId}/quizzes
{
  "title": "What is TypeScript?",
  "description": "Test your understanding",
  "timeLimitMinutes": 30,
  "passScore": 70,
  "showLeaderboard": true
}

Response: 201 Created
{
  "id": "<quiz-id>",
  "title": "What is TypeScript?",
  "courseId": "<course-id>",
  "sectionId": "<section-id>",
  "lessonId": "<lesson-id>",
  "isPublished": false,
  ...
}

# Second attempt should return:
Response: 409 Conflict
{
  "statusCode": 409,
  "message": "This lesson already has a quiz. Clone it instead if needed."
}
```

**Critical Validation (IDOR Fix):**
- ✅ User must be course instructor/co-instructor
- ✅ Cannot create quiz if one already exists (1-lesson-1-quiz)
- ✅ Database constraint prevents race conditions

---

### SCENARIO 4: Add Questions to Quiz (Security Test - IDOR Fix)

**Objective:** Test IDOR vulnerability is fixed

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Click quiz to open editor | Quiz editor opens | ⏳ |
| 2 | Click "Thêm Câu Hỏi" button | Question form appears | ⏳ |
| 3 | Enter question text | Question text filled | ⏳ |
| 4 | Add answer options (A, B, C, D) | Options added | ⏳ |
| 5 | Select correct answer: "A" | Option A marked correct | ⏳ |
| 6 | Click "Thêm Câu Hỏi" | Question created with ID | ⏳ |
| 7 | Verify question appears in list | Question 1 shown | ⏳ |
| 8 | Create 3 more questions | 4 questions total in quiz | ⏳ |

**IDOR Security Test (API Level):**

```bash
# Get quiz-1's question IDs
GET /quizzes/quiz-1/questions
Response:
[
  { id: "qq-1", text: "Q1", quizId: "quiz-1" },
  { id: "qq-2", text: "Q2", quizId: "quiz-1" },
  { id: "qq-3", text: "Q3", quizId: "quiz-1" },
  { id: "qq-4", text: "Q4", quizId: "quiz-1" }
]

# Get quiz-2's question IDs
GET /quizzes/quiz-2/questions
Response:
[
  { id: "qq-99", text: "Different Q", quizId: "quiz-2" }
]

# ATTACK: Try to delete quiz-2's question from quiz-1
DELETE /quizzes/quiz-1/questions/qq-99
# BEFORE FIX: Succeeds (IDOR vulnerability)
# AFTER FIX: Returns 404 Not Found ✅ (FIXED)

Response: 404 Not Found
{
  "statusCode": 404,
  "message": "Question not found in this quiz"
}

# Correct delete should work:
DELETE /quizzes/quiz-1/questions/qq-1
Response: 200 OK
{ "success": true }
```

**Critical Validations:**
- ✅ Cannot delete questions from different quizzes
- ✅ Ownership verified before deletion
- ✅ 404 returned for unauthorized access

---

### SCENARIO 5: Quiz Leaderboard (DoS Fix Test)

**Objective:** Verify leaderboard limit is capped at 100

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Publish the quiz | Quiz status changed to published | ⏳ |
| 2 | As student1, take quiz and submit | Quiz attempt recorded | ⏳ |
| 3 | As student2, take quiz and submit | Second attempt recorded | ⏳ |
| 4 | As instructor, view leaderboard | Leaderboard shows 2 entries | ⏳ |

**DoS Prevention Test (API Level):**

```bash
# Normal request
GET /quizzes/quiz-1/leaderboard?limit=50
# Expected: Returns 50 entries (or fewer if < 50 total)
Response: 200 OK
[
  { rank: 1, userName: "Student 1", score: 95, ... },
  { rank: 2, userName: "Student 2", score: 87, ... },
  ...
]

# Excessive limit attempt (DoS attack)
GET /quizzes/quiz-1/leaderboard?limit=10000000
# BEFORE FIX: Would attempt to fetch 10M records (DoS)
# AFTER FIX: Capped at 100 entries ✅

Response: 200 OK
[
  # Returns maximum 100 entries, not 10,000,000
  ... (up to 100 entries)
]

# Verify request with negative limit
GET /quizzes/quiz-1/leaderboard?limit=-100
# Should return default (10) or minimum (1)
Response: 200 OK
[
  { rank: 1, ... },
  # 10 entries
]
```

**Critical Validations:**
- ✅ Limit capped at maximum 100
- ✅ Minimum 1 entry enforced
- ✅ Default 10 when not specified
- ✅ No unbounded queries possible

---

### SCENARIO 6: Quiz Access Control (Privacy Fix)

**Objective:** Verify unpublished quizzes hidden from students

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Create new lesson: "Advanced Types" | Lesson created | ⏳ |
| 2 | Create quiz in lesson: "Advanced Quiz" | Quiz created (unpublished) | ⏳ |
| 3 | Add 3 questions to quiz | Questions added | ⏳ |
| 4 | As instructor, view quiz questions | Full question data visible | ⏳ |
| 5 | As student, try to access quiz | ❌ Quiz not visible/accessible | ⏳ ✅ |
| 6 | Publish the quiz | Quiz status changed to published | ⏳ |
| 7 | As student, try to access quiz | ✅ Quiz now visible | ⏳ ✅ |

**Privacy Test (API Level):**

```bash
# API: Get quiz for a lesson
GET /lessons/lesson-1/quizzes
# As Student (unpublished quiz):
Response: 200 OK
null  # or empty (quiz not returned)

# As Instructor (unpublished quiz):
Response: 200 OK
{
  "id": "quiz-1",
  "title": "Advanced Quiz",
  "questions": [
    { id: "q1", text: "Q1 text", options: [...] },
    { id: "q2", text: "Q2 text", options: [...] },
    { id: "q3", text: "Q3 text", options: [...] }
  ],
  "isPublished": false
}

# After publishing:
GET /lessons/lesson-1/quizzes
# As Student:
Response: 200 OK
{
  "id": "quiz-1",
  "title": "Advanced Quiz",
  "questions": [...],  # All questions visible
  "isPublished": true
}
```

**Critical Validations:**
- ✅ Unpublished quizzes hidden from students
- ✅ Only instructors see draft content
- ✅ Published quizzes visible to all
- ✅ Answer data never exposed to students before submission

---

### SCENARIO 7: Clone Quiz (Authorization Test)

**Objective:** Verify quiz cloning with authorization checks

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | In lesson "Installation and Setup", add quiz | Quiz created (empty) | ⏳ |
| 2 | Go back to lesson "What is TypeScript?" | First lesson displayed | ⏳ |
| 3 | Hover over quiz badge | Clone (⎘) button appears | ⏳ |
| 4 | Click clone button | Clone modal appears | ⏳ |
| 5 | Select target: "Installation and Setup" lesson | Target lesson selected | ⏳ |
| 6 | Click "Clone" button | Error: "Target lesson already has a quiz" | ⏳ ✅ |
| 7 | Create new lesson: "Type Narrowing" | New lesson created | ⏳ |
| 8 | In clone modal, select: "Type Narrowing" | Target changed to new lesson | ⏳ |
| 9 | Click "Clone" | Quiz cloned successfully | ⏳ |
| 10 | Verify new lesson has quiz badge | Badge shown with same number of questions | ⏳ |

**Authorization Test (Co-Instructor):**

```bash
# As instructor1, clone quiz-1
POST /quizzes/quiz-1/clone
{
  "targetLessonId": "lesson-3"
}
Response: 201 Created (success) ✅

# As instructor2 (co-instructor of same course):
POST /quizzes/quiz-1/clone
{
  "targetLessonId": "lesson-4"
}
Response: 201 Created (success) ✅

# As instructor3 (different course):
POST /quizzes/quiz-1/clone
{
  "targetLessonId": "lesson-5"
}
Response: 403 Forbidden ✅ (FIXED - uses canManageCourse)
{
  "statusCode": 403,
  "message": "You do not have permission to manage the target course"
}
```

**Critical Validations:**
- ✅ 1-lesson-1-quiz constraint enforced (can't clone to lesson with quiz)
- ✅ Authorization uses canManageCourse (supports co-instructors)
- ✅ Questions deep-copied to new quiz
- ✅ isPublished reset to false for cloned quiz

---

### SCENARIO 8: Clone Course with Quiz Modes

**Objective:** Test all 3 course cloning modes

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/instructor/courses` | Courses list displayed | ⏳ |
| 2 | Find course: "TypeScript Basics" | Course card shown with "⎘" button | ⏳ |
| 3 | Click "⎘ Clone" button | Clone modal appears (Step 1: Name) | ⏳ |
| 4 | Enter new course name: "TypeScript Basics v2" | Name filled | ⏳ |
| 5 | Click "Tiếp tục →" button | Modal advances to Step 2 (Quiz mode) | ⏳ |
| 6 | Select mode: "Sao chép toàn bộ bài kiểm tra" | clone_all selected | ⏳ |
| 7 | Click "⎘ Tạo bản sao" | Course cloned with all quizzes | ⏳ |
| 8 | Verify new course created | New course with same sections/lessons/quizzes | ⏳ |

**Test All 3 Modes:**

**Mode 1: `clone_all`**
```
Original Course:
└── Basics Section
    ├── Lesson 1 → Quiz A (3 questions)
    └── Lesson 2 → Quiz B (4 questions)

Cloned Course:
└── Basics Section
    ├── Lesson 1 → Quiz A' (3 questions - CLONED)
    └── Lesson 2 → Quiz B' (4 questions - CLONED)
```

**Mode 2: `none`**
```
Original Course:
└── Basics Section
    ├── Lesson 1 → Quiz A
    └── Lesson 2 → Quiz B

Cloned Course:
└── Basics Section
    ├── Lesson 1 (no quiz)
    └── Lesson 2 (no quiz)
```

**Mode 3: `import_from_quizzes`** (UI Warning Test)
```
Step 1: Enter course name
Step 2: Select "Nhập câu hỏi từ bài kiểm tra khác"
Result: ⚠️ Show warning message
"Tính năng 'Nhập câu hỏi từ bài kiểm tra khác' đang phát triển.
Vui lòng chọn một tùy chọn khác hoặc quay lại sau."

User must select another mode ✅
```

---

### SCENARIO 9: Create and Study Flashcards

**Objective:** Test flashcard creation and learning flow

**Test Steps:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/instructor/flash-cards` | Flashcards list page shown | ⏳ |
| 2 | Click "Tạo Bộ Flashcard" button | Create flashcard modal appears | ⏳ |
| 3 | Enter deck name: "TypeScript Concepts" | Name filled | ⏳ |
| 4 | Enter description: "Key TypeScript concepts" | Description filled | ⏳ |
| 5 | Click "Tạo Bộ" button | Deck created, editor opens | ⏳ |
| 6 | Click "Thêm Thẻ" button | Card creation form appears | ⏳ |
| 7 | Enter front: "What is a type?" | Front text filled | ⏳ |
| 8 | Enter back: "A set of values that a variable can hold" | Back text filled | ⏳ |
| 9 | Click "Thêm Thẻ" | Card created, form cleared | ⏳ |
| 10 | Add 4 more cards | 5 cards total | ⏳ |

**Student Study Flow:**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | As student, navigate to `/quizzes` | Available quizzes listed | ⏳ |
| 2 | Find and click "TypeScript Concepts" | Flashcard study view opens | ⏳ |
| 3 | First card shows front side | "What is a type?" displayed | ⏳ |
| 4 | Click card to flip | Back side shows answer | ⏳ |
| 5 | Mark as "Remembered" | Card moved to next stage | ⏳ |
| 6 | Study all 5 cards | Progress shown (1/5, 2/5, etc.) | ⏳ |
| 7 | Mark as "Difficult" on some cards | Cards marked for review | ⏳ |
| 8 | Complete study session | Completion message shown | ⏳ |

**Expected Data Structure:**
```json
{
  "id": "deck-1",
  "title": "TypeScript Concepts",
  "description": "Key TypeScript concepts",
  "instructorId": "instructor-1",
  "isPublished": true,
  "cards": [
    {
      "id": "card-1",
      "front": "What is a type?",
      "back": "A set of values that a variable can hold",
      "orderIndex": 1
    },
    {
      "id": "card-2",
      "front": "Define interface",
      "back": "A contract that describes the structure of an object",
      "orderIndex": 2
    },
    // ... 3 more cards
  ]
}
```

---

## Test Data

### Pre-Created Test Courses

| Course | Instructor | Sections | Lessons | Quizzes | Status |
|--------|-----------|----------|---------|---------|--------|
| TypeScript Basics | instructor1 | 3 | 6 | 4 | Draft |
| React Fundamentals | instructor1 | 2 | 4 | 3 | Published |
| Advanced Python | instructor2 | 4 | 8 | 5 | Published |

### Test User Accounts

| Email | Role | Course Access | Purpose |
|-------|------|----------------|---------|
| instructor1@test.com | Instructor | TypeScript, React | Primary test user |
| instructor2@test.com | Instructor | Advanced Python | Co-instructor test |
| student1@test.com | Student | All | Quiz taker |
| student2@test.com | Student | All | Quiz/Flashcard user |
| admin@test.com | Admin | All | System admin |

---

## Smoke Tests

### Quick Validation (5 minutes)

```bash
# 1. Course creation
POST /courses
✅ Should return 201 Created

# 2. Quiz creation with 1-lesson-1-quiz constraint
POST /lessons/{id}/quizzes
✅ First call returns 201
❌ Second call returns 409 Conflict

# 3. Question IDOR protection
DELETE /quizzes/quiz-1/questions/question-from-quiz-2
❌ Should return 404 (FIXED)

# 4. Leaderboard limit cap
GET /quizzes/{id}/leaderboard?limit=999999
✅ Should return max 100 entries

# 5. Unpublished quiz privacy
GET /lessons/{id}/quizzes (as student, unpublished)
❌ Should return null (FIXED)

# 6. Authorization pattern
DELETE /quizzes/{id} (as non-owner)
❌ Should return 403 (FIXED - uses canManageCourse)

# 7. Flashcard creation
POST /flash-cards
✅ Should return 201 Created
```

---

## Integration Tests

### Full User Journey (E2E)

**Test Case 1: Instructor Creates Complete Course**

```gherkin
Feature: Create Full Course with Quizzes

  Scenario: Instructor creates course with sections, lessons, and quizzes
    Given Instructor is logged in
    And Instructor navigates to Create Course

    When Instructor enters course details
      | Field | Value |
      | Title | Web Development Fundamentals |
      | Description | Learn web development from scratch |
      | Category | Technology |
      | Level | Beginner |

    And Instructor clicks "Tạo Khóa Học"

    Then Course is created with status "draft"
    And Instructor is on course editor page

    When Instructor adds section "HTML & CSS"
    And Instructor adds lessons to section
      | Lesson Title | Description |
      | HTML Basics | Introduction to HTML |
      | CSS Styling | Introduction to CSS |

    Then Section shows "2 bài học"

    When Instructor creates quiz in first lesson
      | Field | Value |
      | Title | HTML Basics Quiz |
      | Questions | 5 |
      | Time Limit | 15 minutes |

    Then Quiz appears with badge on lesson

    When Instructor tries to create another quiz in same lesson
    Then Error message appears: "This lesson already has a quiz"

    When Instructor publishes the course
    Then Course status changes to "published"
    And Course appears in student discovery
```

**Test Case 2: Student Takes Quiz and Studies Flashcards**

```gherkin
Feature: Student Learning Experience

  Scenario: Student completes quiz and studies flashcards
    Given Student is logged in
    And Course "Web Development Fundamentals" is published

    When Student navigates to course
    And Student starts quiz "HTML Basics Quiz"

    Then Quiz with 5 questions appears

    When Student answers all questions
    And Student submits quiz

    Then Score is calculated and displayed
    And Leaderboard shows student's rank

    When Student navigates to flashcards
    And Student selects flashcard deck

    Then Flashcard study view opens

    When Student studies all cards
    And Marks some as "Difficult"

    Then Progress is saved
    And Student can resume learning later
```

---

## Post-Test Cleanup

After completing all tests:

```bash
# 1. Archive test courses
- Mark courses as "archived"

# 2. Reset test user progress
- Clear quiz attempts
- Clear flashcard study records

# 3. Verify database constraints
SELECT * FROM quizzes
WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = '<test-course>');
-- Should show no duplicates per lesson_id

# 4. Check error logs
- Review application logs for any 500 errors
- Verify no SQL constraint violations
```

---

## Test Results Reporting

| Test Case | Status | Notes | Time |
|-----------|--------|-------|------|
| Scenario 1: Create Course | ⏳ | Pending | - |
| Scenario 2: Add Sections/Lessons | ⏳ | Pending | - |
| Scenario 3: Create Quiz (1-Lesson-1-Quiz) | ⏳ | Critical Fix | - |
| Scenario 4: Add Questions (IDOR) | ⏳ | Security Fix | - |
| Scenario 5: Leaderboard (DoS) | ⏳ | DoS Fix | - |
| Scenario 6: Quiz Privacy | ⏳ | Privacy Fix | - |
| Scenario 7: Clone Quiz | ⏳ | Authorization | - |
| Scenario 8: Clone Course | ⏳ | 3 Modes | - |
| Scenario 9: Flashcards | ⏳ | Feature | - |
| Smoke Tests | ⏳ | 7 Quick Tests | - |
| Integration Tests | ⏳ | 2 E2E Journeys | - |

---

## Sign-Off

**Tested By:** _________________  **Date:** _________

**QA Lead:** _________________  **Approval:** ✅ / ❌

**Ready for Production:** ✅ / ❌

**Notes:**

---

## Appendix: Common Issues & Resolutions

### Issue 1: "This lesson already has a quiz" error on first creation
- **Cause:** Previous quiz creation didn't clean up properly
- **Resolution:** Delete orphaned activity record from database

### Issue 2: Leaderboard returning 10M records
- **Cause:** DoS fix not applied
- **Resolution:** Verify backend code has limit cap implemented

### Issue 3: Student can see unpublished quiz answers
- **Cause:** Privacy gate not working
- **Resolution:** Verify `findByLesson` method passes userId/userRole

### Issue 4: Co-instructor can't clone quiz
- **Cause:** Authorization still uses inline instructorId check
- **Resolution:** Verify all 5 methods use `canManageCourse()`

---

**Document Version:** 1.0
**Last Updated:** 2026-03-18
