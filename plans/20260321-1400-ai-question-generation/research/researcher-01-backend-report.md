# Researcher 01 — Backend Question/Quiz Modules Report

## Executive Summary
The NestJS backend has robust question management infrastructure with clear separation between QuestionBanks (collections) and Questions (individual items). Supports 8 question types and comprehensive CRUD operations. **No existing AI/OpenAI dependencies.** Module structure provides clear patterns to follow for a new AI generation module.

---

## Data Models

### QuestionBank
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| title | String | required |
| description | String? | optional |
| courseId | UUID? | optional FK to Course |
| createdBy | UUID | FK to Profile |
| createdAt/updatedAt | Timestamps | |

### Question
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| bankId | UUID | FK to QuestionBank |
| type | String | 8 supported types |
| content | String | question text |
| explanation | String? | answer feedback |
| mediaUrl/mediaType | String? | optional media |
| difficulty | String | easy/medium/hard (default: medium) |
| defaultScore | Decimal | default 1.0 |
| tags | String[] | categorization |
| createdAt/updatedAt | Timestamps | |

### QuestionOption
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| questionId | UUID | FK to Question |
| content | String | option text |
| isCorrect | Boolean | marks correct answers |
| matchKey/matchValue | String? | for matching questions |
| orderIndex | Int? | display order |

---

## Supported Question Types
1. `single` — Single select/MCQ (one correct answer)
2. `multi` — Multiple select (multiple correct)
3. `true_false` — Boolean
4. `short_answer` — Text input (no options)
5. `essay` — Long text (teacher-graded, no options)
6. `matching` — Pair matching (uses matchKey/matchValue)
7. `ordering` — Sequence arrangement
8. `cloze` — Fill-in-the-blank

---

## Existing API Endpoints

### Question Banks
- `POST /question-banks` — Create bank
- `GET /question-banks` — List banks
- `GET /question-banks/:id` — Get bank with questions
- `PUT /question-banks/:id` — Update bank
- `DELETE /question-banks/:id` — Delete (cascades)

### Questions
- `POST /questions/:bankId` — Create single question
- `POST /questions/:bankId/bulk` — Bulk create
- `PUT /questions/:id` — Update question
- `DELETE /questions/:id` — Delete question
- `POST /questions/:id/options` — Add options
- `PUT /questions/:id/options` — Replace options

---

## Quiz-Question Association
Via **QuizQuestion** join table:
- `quizId` / `questionId` / `bankId`
- `pickCount` — how many to randomly select from bank
- `difficultyFilter` / `tagFilter` — filter criteria
- `orderIndex` / `scoreOverride`

---

## Current Module Structure
```
backend/src/modules/
├── question-banks/
│   ├── dto/question-bank.dto.ts
│   ├── question-banks.controller.ts
│   ├── question-banks.service.ts
│   └── question-banks.module.ts
└── questions/
    ├── dto/question.dto.ts
    ├── questions.controller.ts
    ├── questions.service.ts
    └── questions.module.ts
```

**Key service patterns:**
- Creator ownership checks + admin bypass
- `prisma.$transaction()` for bulk operations
- NotFoundException / BadRequestException for validation

---

## Recommended AI Module Structure
```
backend/src/modules/ai-questions/
├── dto/
│   ├── generate-questions.dto.ts
│   └── ai-question-response.dto.ts
├── ai-questions.controller.ts
├── ai-questions.service.ts
└── ai-questions.module.ts
```

**Proposed endpoints:**
- `POST /ai-questions/generate` — generate questions from topic/context
- `POST /ai-questions/save/:bankId` — bulk-save selected AI questions to bank

---

## Unresolved Questions
1. Which LLM provider? (OpenAI GPT-4o-mini is cheapest and sufficient)
2. Real-time streaming vs. single-shot batch response?
3. Rate limiting strategy for AI API calls?
4. Store AI generation history/logs?
5. Async background processing needed for large batches?
