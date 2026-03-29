# Phase 5: Reports & Polish

**Date:** Week 7+
**Priority:** P1 - Important
**Status:** In Progress
**Depends On:** Phase 2 & 3

## Overview
Add reporting features for instructors, student progress dashboard, and polish the UI for production.

## Requirements

### Functional
1. **Student Dashboard**
   - Enrolled courses overview
   - Recent activity
   - Continue learning section
   - Quiz history summary

2. **Student Profile**
   - Edit profile information
   - View quiz history
   - View course progress
   - Certificates earned (future)

3. **Instructor Dashboard**
   - Course overview
   - Student enrollment stats
   - Quiz performance summary
   - Recent submissions

4. **Course Reports**
   - Total enrollments
   - Completion rate
   - Average progress
   - Student list

5. **Quiz Reports**
   - Attempt statistics (total, passed, failed)
   - Average score
   - Question analysis (hardest questions)
   - Student attempt history
   - Time distribution

6. **Admin Features**
   - User management
   - Course management
   - System settings
   - View all reports

### Non-Functional
- Responsive design (mobile, tablet, desktop)
- Loading states and error handling
- Consistent UI components

---

## API Endpoints (Reports)

```
# Student
GET    /users/me/dashboard
GET    /users/me/courses          # Enrolled courses
GET    /users/me/quiz-history
GET    /users/me/progress

# Instructor Reports
GET    /reports/dashboard         # Overview stats
GET    /reports/courses/:id       # Course report
GET    /reports/courses/:id/students
GET    /reports/quizzes/:id       # Quiz report
GET    /reports/quizzes/:id/question-analysis

# Admin
GET    /admin/users
PUT    /admin/users/:id
DELETE /admin/users/:id
GET    /admin/courses
```

---

## Implementation Steps

### Step 5.1: Student Dashboard
- [x] Create dashboard API endpoint
- [x] Build dashboard UI
- [x] Add enrolled courses list
- [x] Add recent activity

### Step 5.2: Student Profile & History
- [ ] Profile edit form
- [x] Quiz history table
- [x] Course progress visualization
- [ ] Achievement badges (future)

### Step 5.3: Instructor Dashboard
- [x] Stats overview (enrollments, completions)
- [x] Recent submissions list
- [x] Quick actions

### Step 5.4: Course Reports
- [x] Enrollment stats
- [x] Completion rate calculation
- [x] Student list with progress
- [ ] Export to CSV

### Step 5.5: Quiz Reports
- [x] Attempt statistics
- [ ] Score distribution chart
- [x] Question analysis ( hardest questions by failure rate)
- [ ] Student attempt details

### Step 5.6: Admin Features
- [ ] User CRUD
- [ ] Course management
- [ ] System configuration

### Step 5.7: UI Polish
- [x] Consistent color scheme
- [x] Loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [x] Responsive layouts

---

## Related Code Files

### Backend Additions
```
backend/src/modules/reports/
├── reports.module.ts
├── reports.controller.ts
├── reports.service.ts
└── dto/

backend/src/modules/admin/
├── admin.module.ts
├── admin.controller.ts
└── admin.service.ts
```

### Frontend Additions
```
frontend/app/(student)/
├── dashboard/page.tsx
└── profile/
    ├── page.tsx
    ├── history/page.tsx
    └── progress/page.tsx

frontend/app/(instructor)/
├── dashboard/page.tsx
└── reports/
    ├── courses/[id]/page.tsx
    └── quizzes/[id]/page.tsx

frontend/app/(admin)/
├── users/page.tsx
├── courses/page.tsx
└── settings/page.tsx
```

---

## Success Criteria

- [ ] Student can view dashboard and progress
- [ ] Instructor can view course and quiz reports
- [ ] Admin can manage users
- [ ] Responsive on mobile/tablet
- [ ] Consistent UI across pages

---

## Optional Future Features

1. **Certificates** - Generate PDF certificates on course completion
2. **Notifications** - Email reminders for incomplete courses
3. **Q&A** - Comment system under lessons
4. **Payments** - Paid course enrollment
5. **Analytics** - Detailed learning analytics
6. **Multi-language** - i18n support
