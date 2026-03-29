# Phase 3: Quiz Core

**Date:** Weeks 4-5
**Priority:** P0 - Critical
**Status:** Completed
**Depends On:** Phase 1 & 2

## Overview
Implement quiz system with question banks, various question types, attempt management, and auto-scoring.

## Requirements

### Functional
1. **Question Bank**
   - Create question banks
   - Add/edit/delete questions
   - Question types: single, multi, true/false, short_answer
   - Tag and difficulty levels
   - Import from CSV (Phase 4)

2. **Quiz Configuration**
   - Create quizzes with config
   - Time limit, max attempts, pass score
   - Show/hide results, answers, explanations
   - Shuffle questions and answers
   - Pagination mode: all, paginated, one_by_one

3. **Attempt Flow**
   - Start attempt (snapshot questions)
   - Auto-save answers
   - Navigate between questions
   - Submit attempt
   - Calculate scores

4. **Scoring**
   - Auto-score objective questions
   - Partial scoring for multi-choice
   - String matching for short_answer
   - Manual grading for essay (future)

5. **Results Display**
   - Show score, percentage, pass/fail
   - Show correct answers
   - Show explanations
   - Review attempt details

### Non-Functional
- Prevent duplicate submissions
- Handle timeout gracefully
- Resume incomplete attempts

---

## Architecture

### Database Schema
```sql
-- Question Bank
CREATE TABLE question_banks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  course_id     UUID REFERENCES courses(id),
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Questions
CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id       UUID REFERENCES question_banks(id) ON DELETE CASCADE,
  type          TEXT CHECK (type IN ('single','multi','true_false','short_answer','essay','matching','ordering','cloze')),
  content       TEXT NOT NULL,
  explanation   TEXT,
  media_url     TEXT,
  media_type    TEXT,
  difficulty    TEXT DEFAULT 'medium',
  default_score NUMERIC DEFAULT 1,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Question Options
CREATE TABLE question_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID REFERENCES questions(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_correct    BOOLEAN DEFAULT false,
  match_key     TEXT,
  match_value   TEXT,
  order_index   INT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Quizzes
CREATE TABLE quizzes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id             UUID REFERENCES courses(id),
  lesson_id             UUID REFERENCES lessons(id),
  title                 TEXT NOT NULL,
  description           TEXT,
  time_limit_minutes    INT,
  max_attempts          INT,
  pass_score            NUMERIC,
  show_result           TEXT DEFAULT 'immediately',
  show_correct_answer   BOOLEAN DEFAULT true,
  show_explanation      BOOLEAN DEFAULT true,
  shuffle_questions     BOOLEAN DEFAULT false,
  shuffle_answers       BOOLEAN DEFAULT false,
  pagination_mode       TEXT DEFAULT 'all',
  questions_per_page    INT DEFAULT 1,
  allow_back_navigation BOOLEAN DEFAULT true,
  is_published          BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Quiz Questions (fixed or random from bank)
CREATE TABLE quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id   UUID REFERENCES questions(id),
  bank_id       UUID REFERENCES question_banks(id),
  pick_count    INT,
  difficulty_filter TEXT,
  tag_filter    TEXT[],
  order_index   INT NOT NULL DEFAULT 0,
  score_override NUMERIC
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID REFERENCES quizzes(id),
  user_id         UUID REFERENCES profiles(id),
  attempt_number  INT NOT NULL DEFAULT 1,
  status          TEXT DEFAULT 'in_progress',
  current_page    INT DEFAULT 1,
  started_at      TIMESTAMPTZ DEFAULT now(),
  submitted_at    TIMESTAMPTZ,
  time_spent_secs INT,
  total_score     NUMERIC,
  max_score       NUMERIC,
  percentage      NUMERIC,
  is_passed       BOOLEAN,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Attempt Questions (snapshot)
CREATE TABLE attempt_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id      UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id     UUID REFERENCES questions(id),
  order_index     INT NOT NULL,
  options_order   UUID[],
  page_number     INT NOT NULL DEFAULT 1,
  score           NUMERIC
);

-- Quiz Answers
CREATE TABLE quiz_answers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id        UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  attempt_question_id UUID REFERENCES attempt_questions(id),
  question_id       UUID REFERENCES questions(id),
  selected_options  UUID[],
  text_answer       TEXT,
  order_answer      UUID[],
  match_answer      JSONB,
  is_correct        BOOLEAN,
  score_earned      NUMERIC DEFAULT 0,
  saved_at          TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints
```
# Question Bank
GET    /question-banks
POST   /question-banks
GET    /question-banks/:id
PUT    /question-banks/:id
DELETE /question-banks/:id
GET    /question-banks/:id/questions
POST   /question-banks/:id/questions
PUT    /questions/:id
DELETE /questions/:id

# Quiz
GET    /quizzes
POST   /quizzes
GET    /quizzes/:id
PUT    /quizzes/:id
DELETE /quizzes/:id
POST   /quizzes/:id/questions
DELETE /quizzes/:id/questions/:qid

# Attempt Flow
POST   /quizzes/:id/start
GET    /attempts/:id
GET    /attempts/:id/page/:page
PUT    /attempts/:id/answers
POST   /attempts/:id/submit
GET    /attempts/:id/result

# History
GET    /quizzes/:id/attempts
```

---

## Implementation Steps

### Step 3.1: Question Bank Module
- [ ] Create question banks CRUD
- [ ] Create questions CRUD with all types
- [ ] Create question options
- [ ] Add tag and difficulty filtering

### Step 3.2: Quiz Module
- [ ] Create quiz CRUD
- [ ] Add quiz questions (fixed or from bank)
- [ ] Quiz configuration validation

### Step 3.3: Attempt Service
- [ ] Start attempt (snapshot questions)
- [ ] Randomize from bank
- [ ] Shuffle questions/answers
- [ ] Assign page numbers

### Step 3.4: Answer Service
- [ ] Auto-save answers
- [ ] Update progress
- [ ] Handle pagination

### Step 3.5: Scoring Service
- [ ] Score single choice
- [ ] Score multi choice (partial)
- [ ] Score true/false
- [ ] Score short_answer (case-insensitive match)
- [ ] Score matching and ordering (Phase 4)

### Step 3.6: Submit Flow
- [ ] Validate all questions answered
- [ ] Calculate time spent
- [ ] Run auto-score
- [ ] Update attempt status
- [ ] Return results

### Step 3.7: Frontend - Quiz List & Detail
- [ ] Quiz listing page
- [ ] Quiz intro page (show config)
- [ ] Start quiz button

### Step 3.8: Frontend - Quiz Attempt
- [ ] Question display (all modes)
- [ ] Answer input components
- [ ] Navigation (prev/next)
- [ ] Timer display
- [ ] Auto-save indicator

### Step 3.9: Frontend - Quiz Result
- [ ] Score display
- [ ] Correct answers review
- [ ] Explanations
- [ ] Retry button (if allowed)

---

## Related Code Files

### Backend
```
backend/src/modules/question-banks/
├── question-banks.module.ts
├── question-banks.controller.ts
├── question-banks.service.ts
├── questions/
│   ├── questions.controller.ts
│   └── questions.service.ts
└── dto/

backend/src/modules/quizzes/
├── quizzes.module.ts
├── quizzes.controller.ts
├── quizzes.service.ts
└── dto/

backend/src/modules/attempts/
├── attempts.module.ts
├── attempts.controller.ts
├── attempts.service.ts
└── dto/

backend/src/modules/scoring/
├── scoring.module.ts
└── scoring.service.ts
```

### Frontend
```
frontend/app/(student)/quizzes/
├── [id]/
│   ├── intro/page.tsx         # Quiz info + start
│   ├── attempt/page.tsx       # Take quiz
│   └── result/page.tsx        # Results

frontend/app/(instructor)/quizzes/
├── [id]/
│   ├── page.tsx               # Quiz detail
│   ├── edit/page.tsx          # Edit quiz
│   └── results/page.tsx       # View all attempts

frontend/components/
├── quiz/
│   ├── question-card.tsx
│   ├── answer-inputs/
│   │   ├── single-choice.tsx
│   │   ├── multi-choice.tsx
│   │   ├── true-false.tsx
│   │   └── short-answer.tsx
│   ├── quiz-timer.tsx
│   └── quiz-progress.tsx
```

---

## Success Criteria

- [ ] Can create quiz with questions
- [ ] Student can start and complete attempt
- [ ] Auto-save works (no data loss)
- [ ] Scores calculated correctly
- [ ] Results displayed properly
- [ ] Pagination works in all modes

---

## Security Considerations

1. **Attempt Ownership:** User can only access own attempts
2. **Time Limit:** Auto-submit on timeout
3. **One Submission:** Prevent double submit
4. **Snapshot:** Quiz changes don't affect in-progress attempts

---

## Next Steps

1. Proceed to Phase 4: Enhanced Quiz
2. Dependencies: Core quiz must work first
