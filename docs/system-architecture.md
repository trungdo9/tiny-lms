# Tiny LMS - System Architecture

Top-level architecture overview. Detailed sub-topics:
- `backend-module-architecture.md` — Request pipeline, module map (27 modules), ORM strategy, common layer, email architecture
- `backend-data-flows.md` — Auth, SCORM runtime, reviews, payments, bulk enrollment, lesson access, department hierarchy
- `course-business-logic.md` — Course data model, lifecycle, instructor management, API endpoints

---

## 1. High-Level Architecture

Tiny LMS follows a client-server architecture:

- **Frontend**: Next.js 16 App Router (port 3000)
- **Backend**: NestJS 11 REST API (port 3001)
- **Database**: PostgreSQL hosted on Supabase
- **Auth**: Supabase Auth + JWT

```
+------------------+     +------------------+     +------------------+
|  Browser         |     |  Backend API     |     |  PostgreSQL      |
|  (Next.js :3000) |---->|  (NestJS :3001)  |---->|  (Supabase)      |
+------------------+     +------------------+     +------------------+
        |                        |
        v                        v
+------------------+     +------------------+
|  Supabase Auth   |     |  Supabase Storage|
|  (sessions)      |     |  (avatars, media)|
+------------------+     +------------------+
```

**SCORM proxy**: Next.js rewrites `/scorm/content/*` to `http://localhost:3001/scorm/content/*` so SCORM iframes share the same origin as the frontend, enabling `window.parent.API` access.

**Event-driven side effects**: `@nestjs/event-emitter` decouples contact-sync triggers from enrollment, registration, and profile-update flows.

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js | 16.1.6 |
| Frontend UI | React | 19.2.3 |
| Styling | Tailwind CSS | v4 |
| Component Library | shadcn/ui | latest |
| Charts | Recharts | - |
| State Management | Zustand | 5.0.11 |
| Server State | TanStack Query | 5.90.21 |
| Testing | Vitest | 3.0.0 |
| Backend Framework | NestJS | 11.0.1 |
| ORM | Prisma | 7.5.0 |
| Database | PostgreSQL | - |
| Authentication | Supabase Auth + JWT | - |
| Event Bus | @nestjs/event-emitter | 3.0.1 |
| Payment Gateway | SePay | - |
| Email Option 1 | Nodemailer (SMTP) | - |
| Email Option 2 | Resend API | - |
| Contact Sync 1 | Mailchimp Marketing API v3 | - |
| Contact Sync 2 | Brevo Contacts API v3 | - |
| PDF Generation | pdfkit | - |
| File Parsing | csv-parse, xlsx | - |
| SCORM Parsing | adm-zip, xml2js | - |

---

## 3. Frontend Route Architecture

### 3.1 Route Groups

```
app/
├── (auth)/                   No nav — login, register
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (dashboard)/              DashboardHeader + DashboardFooter
│   └── dashboard/
│       ├── page.tsx          Student/instructor/admin role-based dashboard
│       ├── profile/page.tsx  Profile (moved to avoid routing conflict)
│       └── progress/page.tsx Student progress overview
│
├── (public)/                 PublicHeader + PublicFooter
│   ├── courses/
│   │   ├── page.tsx          Course catalog
│   │   └── [slug]/page.tsx   Course detail (with reviews)
│   └── payment/
│       └── [paymentId]/page.tsx
│
├── (student)/                Student learning layout
│   ├── courses/[slug]/learn/[lessonId]/page.tsx  Lesson viewer (SCORM-aware)
│   ├── courses/[slug]/scorm/page.tsx             Standalone course SCORM player
│   └── profile/page.tsx
│
├── instructor/               Instructor portal (no route group wrapper)
│   ├── courses/              Course + outline management
│   ├── flash-cards/          Flash card deck management
│   ├── question-banks/       Question bank + import
│   └── reports/              Course and quiz reports
│
├── admin/                    Admin portal
│   ├── dashboard/page.tsx    Admin dashboard (stats, charts)
│   ├── users/page.tsx        User management
│   ├── courses/              Admin course management
│   ├── quizzes/              Admin quiz management + grading
│   ├── flash-cards/          Admin flash card management
│   ├── question-banks/       Admin question bank management
│   ├── reports/              Admin reports
│   └── settings/             Settings tabs via layout.tsx
│       ├── page.tsx          General settings
│       ├── email/            Email config, templates, logs
│       ├── branding/         White label
│       ├── auth/             Email verification toggle
│       ├── organization/     Organization profile
│       └── departments/      Department hierarchy
│
├── quizzes/                  Quiz taking (no route group)
│   └── [id]/page.tsx
│
└── certificates/             Certificate view/download
```

### 3.2 Admin Navigation

| Section | Path |
|---------|------|
| Dashboard | `/admin/dashboard` |
| Users | `/admin/users` |
| Courses | `/admin/courses` |
| Quizzes | `/admin/quizzes` |
| Flash Cards | `/admin/flash-cards` |
| Question Banks | `/admin/question-banks` |
| Reports | `/admin/reports` |
| Settings | `/admin/settings` |
| Email | `/admin/settings/email` |
| Templates | `/admin/settings/email/templates` |
| Logs | `/admin/settings/email/logs` |
| Branding | `/admin/settings/branding` |
| Auth | `/admin/settings/auth` |
| Organization | `/admin/settings/organization` |
| Departments | `/admin/settings/departments` |
| Contact Sync | `/admin/settings/contact-sync` |
| Sync Logs | `/admin/settings/contact-sync/logs` |

---

## 4. Database Architecture

### 4.1 Entity Relationship Overview

```
Organization 1──N Department (tree via parentId)
Department   1──N Profile (optional, via departmentId)

Profile M──N Course (via CourseInstructor: role = primary|co_instructor)
Profile 1──N Enrollment
Profile 1──N CourseReview (unique per courseId)
Profile 1──N QuizAttempt
Profile 1──N ScormAttempt
Profile 1──N Payment
Profile 1──N AssignmentSubmission (as student and as grader)
Profile 1──N LearningPath (created_by)

Course 1──N Section 1──N Lesson
Course 1──1 ScormPackage (course-level SCORM)
Course 1──N CourseReview
Course ──── lessonCount, averageRating, totalReviews (denormalized)
Course M──N LearningPath (via LearningPathCourse)

Lesson ──── prerequisiteLessonId (self-referential FK, optional)
Lesson ──── availableAfterDays, availableFrom (drip content)
Lesson 1──1 ScormPackage (lesson-level SCORM)
Lesson 1──N Activity

Activity 1──1 Quiz (optional, via activityId)
Activity 1──1 FlashCardDeck (optional, via activityId)
Activity 1──1 Assignment (optional, via activityId)

Assignment 1──N AssignmentSubmission (unique per userId+assignmentId)

LearningPath 1──N LearningPathCourse (unique per learningPathId+courseId)

QuestionBank 1──N Question 1──N QuestionOption
Quiz N──N Question (via QuizQuestion, supports random bank picks)
QuizAttempt 1──N AttemptQuestion 1──N QuizAnswer

Certificate ──── certificateNumber (unique), templateData (JSON), pdfUrl

ScormPackage 1──N ScormAttempt (unique per userId+packageId)

ContactSyncLog ──── userId, provider, operation, trigger, status
```

### 4.2 Key Database Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `profiles` | email (unique) | User lookup |
| `courses` | slug (unique) | Course URL routing |
| `courses` | instructorId | Instructor course list |
| `courses` | status | Course catalog filtering |
| `course_instructors` | (courseId, profileId) unique | Prevent duplicate assignment |
| `course_reviews` | (courseId, userId) unique | One review per user per course |
| `enrollments` | (userId, courseId) unique | Enrollment check |
| `lesson_progress` | (userId, lessonId) unique | Progress tracking |
| `learning_path_courses` | (learningPathId, courseId) unique | One entry per course per path |
| `assignment_submissions` | (assignmentId, userId) unique | One submission per student |
| `quiz_attempts` | (quizId, userId) | User attempt history |
| `scorm_attempts` | (userId, packageId) unique | Per-user SCORM state |
| `notifications` | userId, isRead | Notification query |
| `departments` | organizationId | Dept list by org |
| `departments` | parentId | Hierarchy traversal |
| `payments` | status | Payment status filtering |
| `contact_sync_logs` | userId, status, provider, createdAt | Sync log queries |

---

## 5. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS/TLS in production |
| API | JWT token validation (JwtAuthGuard / SupabaseAuthGuard) |
| Authorization | Role-based (RolesGuard + @Roles decorator) |
| Course content | `canManageCourse()` checks CourseInstructor join table |
| Lesson access | Prerequisite check + drip content availability in `findOneForLearning()` |
| Reviews | Enrollment check before write |
| Assignments | Instructor role check before grading |
| Bulk enrollment | Admin role guard |
| Payments | SePay Bearer token validation on webhook (timing-safe) |
| SCORM | ZIP path traversal prevention in adm-zip extraction |
| Contact sync | Admin-only controller; provider credentials stored in Settings (not in code) |
| Database | Parameterized queries via Prisma ORM |

---

## 6. Infrastructure

### 6.1 Development Environment

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| SCORM content proxy | http://localhost:3000/scorm/content/* → :3001 |
| Database | Supabase (remote PostgreSQL) |

### 6.2 Deployment Architecture

```
+------------------+       +------------------+
|  Frontend        |       |  Backend         |
|  (Vercel / CDN)  |<----->|  (Node.js server)|
|  :80/:443        |       |  :3001           |
+------------------+       +------------------+
        |                          |
        v                          v
+------------------+       +------------------+
|  Supabase Auth   |       |  Supabase DB     |
|  + Storage       |       |  (PostgreSQL)    |
+------------------+       +------------------+
```

### 6.3 Scalability Considerations

- Stateless backend — can be horizontally scaled with a load balancer
- TanStack Query client-side caching reduces redundant API calls
- Prisma connection pooling for database efficiency
- SCORM files stored on local filesystem — requires shared volume or object storage for multi-instance deployments
- Next.js code splitting and lazy loading for frontend bundle optimization
- Event emitter is in-process — for multi-instance deployments, replace with a message broker (Redis, RabbitMQ)

---

## 7. Monitoring & Logging

- Email delivery tracked in `email_logs` table (status: pending/sent/failed)
- Contact sync operations tracked in `contact_sync_logs` table (status: pending/success/failed)
- SCORM attempt state persisted in `scorm_attempts` (resumable across sessions)
- Payment webhook data stored in `Payment.webhookData` JSON field
- NestJS default console logger in development; structured logging recommended for production

---

*Document Last Updated: 2026-03-14*
