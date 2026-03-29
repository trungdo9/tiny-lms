# Tiny LMS - Complete Implementation Plan

## Overview
**Project:** Tiny LMS - A compact Learning Management System focused on lesson viewing and quiz/exam experience with good UX.
**Tech Stack:** Next.js 16 (App Router) + Tailwind CSS + shadcn/ui | NestJS + Prisma ORM | Supabase (PostgreSQL, Auth, Storage)
**Status:** COMPLETE - All Phases Implemented
**Estimated Duration:** 10-14 weeks (MVP: 6 weeks)

---

## Module Summary

| Module | Description | Priority |
|--------|-------------|----------|
| **Auth** | Register, login, JWT, forgot/reset password | P0 |
| **Users/Profiles** | User management, profile CRUD, avatar upload | P0 |
| **Courses** | Course CRUD, sections, enrollment | P0 |
| **Lessons** | Lesson types (video, text, PDF), progress tracking | P0 |
| **Question Banks** | Question CRUD, import CSV/Excel | P1 |
| **Quizzes** | Quiz config, attempts, auto-scoring | P0 |
| **Reports** | Course overview, quiz analytics | P2 |

---

## Phase Breakdown

### Phase 1: Foundation (Weeks 1-2)
- [x] **1.1** Setup Next.js + NestJS + Supabase
- [x] **1.2** Auth module (register, login, JWT)
- [x] **1.3** User profile basic CRUD

### Phase 2: Course & Lesson (Week 3)
- [x] **2.1** Course CRUD (instructor)
- [x] **2.2** Section & Lesson CRUD
- [x] **2.3** Lesson viewer (video, PDF, text)
- [x] **2.4** Progress tracking

### Phase 3: Quiz Core (Weeks 4-5)
- [x] **3.1** Question Bank CRUD
- [x] **3.2** Quiz configuration
- [x] **3.3** Question types: single, multi, true/false, short_answer
- [x] **3.4** Attempt flow + auto-save + submit
- [x] **3.5** Result display

### Phase 4: Enhanced Quiz (Week 6)
- [x] **4.1** Pagination modes (paginated, one_by_one)
- [x] **4.2** Random questions + shuffle
- [x] **4.3** Import questions CSV/Excel
- [x] **4.4** Advanced question types (matching, ordering)

### Phase 5: Reports & Polish (Week 7+)
- [x] **5.1** Student profile dashboard
- [x] **5.2** Quiz history & progress
- [x] **5.3** Instructor reports
- [x] **5.4** Responsive UI polish

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Snapshot `attempt_questions` | Quiz changes don't affect in-progress attempts |
| Server-side pagination state | Resume correctly after F5/disconnect |
| Auto-save answers | Prevent data loss on network issues |
| RLS enabled | Students only see own data |

---

## Dependencies Map

```
Phase 1 (Foundation)
├── 1.1 Setup → 1.2 Auth → 1.3 Profiles
│
Phase 2 (Course & Lesson)
├── 2.1 Courses → 2.2 Sections → 2.3 Lessons → 2.4 Progress
│
Phase 3 (Quiz Core)
├── 3.1 Question Banks → 3.2 Quiz Config → 3.3 Question Types → 3.4 Attempts → 3.5 Results
│
Phase 4 (Enhanced Quiz)
├── Requires Phase 3 complete
│
Phase 5 (Reports & Polish)
├── Requires Phase 2 & 3 complete
```

---

## Detailed Plans

- [Phase 1: Foundation](phase-01-foundation.md)
- [Phase 2: Course & Lesson](phase-02-course-lesson.md)
- [Phase 3: Quiz Core](phase-03-quiz-core.md)
- [Phase 4: Enhanced Quiz](phase-04-enhanced-quiz.md)
- [Phase 5: Reports & Polish](phase-05-reports-polish.md)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase rate limits | Medium | Implement caching, batch operations |
| Quiz concurrency | Medium | Use database transactions, optimistic locking |
| Large file uploads | Medium | Use Supabase Storage with signed URLs |
| Complex scoring logic | High | Unit tests for each question type |

---

## Next Steps

1. Approve this plan
2. Begin Phase 1: Foundation setup
3. Create `.env` configuration
4. Initialize Next.js and NestJS projects
