# Backend Module Architecture

This document details the NestJS backend request pipeline, module map, ORM strategy, and common layer.

See also: `system-architecture.md` for high-level overview, tech stack, and infrastructure.

---

## 1. Request Processing Pipeline

```
HTTP Request
    |
    v
+-------------------+
| DTO Validation    |  class-validator, class-transformer
+-------------------+
    |
    v
+-------------------+
| Auth Guard        |  JwtAuthGuard or SupabaseAuthGuard
+-------------------+
    |
    v
+-------------------+
| Roles Guard       |  RolesGuard + @Roles() decorator
+-------------------+
    |
    v
+-------------------+
| Controller        |  Route handling, param extraction
+-------------------+
    |
    v
+-------------------+
| Service           |  Business logic, authorization helpers
+-------------------+
    |
    v
+-------------------+
| Prisma Service    |  Data access, transactions
+-------------------+
    |
    v
+-------------------+
| JSON Response     |
+-------------------+
```

---

## 2. Module Map (27 modules)

```
backend/src/modules/
├── auth/             Auth (register, login, JWT, email verification toggle)
├── users/            Profiles, RBAC, dashboard API, avatar upload
├── courses/          Course CRUD + reviews + instructor assignment
│   ├── reviews.controller.ts / reviews.service.ts
│   └── course-instructors.controller.ts / course-instructors.service.ts
├── sections/         Course section management (pure Prisma, $transaction reorder)
├── lessons/          Lesson management + prerequisite checks + drip content
├── scorm/            SCORM 1.2/2004 upload, extract, serve, runtime tracking
├── enrollments/      Course enrollment + bulk enrollment (B2B)
├── progress/         Lesson progress tracking (pure Prisma, compound key lookup)
├── learning-paths/   Multi-course learning path programs + progress tracking
├── assignments/      Assignment activity type: create, submit, grade workflow
├── question-banks/   Question banks + CSV/Excel import
│   └── import/       Import sub-module
├── questions/        Individual question management
├── quizzes/          Quiz management + cloning
├── attempts/         Quiz attempts + question flagging
├── grading/          Auto and manual grading
├── certificates/     PDF certificate generation (certificateNumber, pdfUrl)
├── reports/          Course/quiz reports + leaderboard
├── notifications/    In-app notifications
├── settings/         System settings + white label branding
├── emails/           Email send + templates + logs
│   ├── providers/    SMTP and Resend provider implementations
│   ├── templates/    EmailTemplatesService
│   └── logs/         EmailLogsService
├── flash-cards/      Flash card decks, cards, study sessions
├── activities/       Lesson activities (quiz/flashcard/video/file/assignment)
├── payments/         SePay payment gateway
├── organization/     Organization profile (public GET, admin PUT)
├── departments/      Department tree (admin CRUD)
└── shared/           Shared utilities
```

### Module Internal Structure

Each feature module follows:
```
[module-name]/
├── dto/                    # Request/response DTOs (class-validator)
├── [module-name].module.ts
├── [module-name].controller.ts
└── [module-name].service.ts
```

Extended modules with sub-services:
- `courses/` — adds `reviews.controller.ts`, `reviews.service.ts`, `course-instructors.controller.ts`, `course-instructors.service.ts`
- `emails/` — adds `providers/`, `templates/`, `logs/` sub-services
- `question-banks/` — adds `import/` sub-module

---

## 3. ORM Strategy

All data access uses **Prisma exclusively**. The Supabase JS client is restricted to authentication only.

| Layer | Client Used | Notes |
|-------|-------------|-------|
| Auth service + Auth guard | SupabaseService | `signIn`, `signUp`, token validation only |
| All other services (25 modules) | PrismaService | Type-safe, camelCase queries, `$transaction` for multi-step ops |

Key Prisma patterns:
- `prisma.$transaction([...])` — course creation (course + CourseInstructor sync), section/lesson reorder, bulk enrollment, payment + enrollment atomics
- `prisma.model.findUnique` with compound keys (`userId_lessonId`) — progress lookups
- `_count` and `_avg` aggregates — denormalized field recomputation (`lessonCount`, `averageRating`, `totalReviews`)

---

## 4. Common Layer

```
backend/src/common/
├── guards/
│   ├── jwt-auth.guard.ts       Validates backend-issued JWT
│   ├── supabase-auth.guard.ts  Validates Supabase session token
│   └── roles.guard.ts          Checks @Roles() against user.role
├── decorators/
│   └── roles.decorator.ts      @Roles(Role.ADMIN, ...)
├── enums/
│   └── role.enum.ts            Role.STUDENT | INSTRUCTOR | ADMIN
└── services/
    ├── prisma.service.ts       Prisma client wrapper
    └── supabase.service.ts     Supabase admin/client wrapper (auth only)
```

### Dual Guard Pattern

```typescript
// Backend-issued JWT (most endpoints)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
update() { ... }

// Supabase session token (SCORM, reviews — client-to-backend direct auth)
@UseGuards(SupabaseAuthGuard)
upsert() { ... }
```

---

## 5. Email Architecture

```
EmailsService
    |
    +-- reads provider from Settings table (smtp | resend)
    |
    +-- SmtpProvider (Nodemailer)   → sends via SMTP
    +-- ResendProvider              → sends via Resend API
    |
    +-- EmailTemplatesService       → CRUD on email_templates table
    |       GET /emails/templates/:slug/preview  → render with variables
    |       POST /emails/templates/:slug/test    → send rendered template
    |
    +-- EmailLogsService            → writes to email_logs table
```

Templates use slug-based lookup (e.g., `welcome`, `enrollment`, `certificate`) and store HTML with placeholder variables.

---

*Document Last Updated: 2026-03-08*
