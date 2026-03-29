# Tiny LMS - Codebase Summary

Top-level index for the Tiny LMS codebase. Detailed sub-topic documents:

- `frontend-structure.md` — App Router pages, components, libraries, API client, query keys
- `backend-module-architecture.md` — Request pipeline, module map (27 modules), ORM strategy, common layer, email architecture
- `backend-data-flows.md` — Auth, SCORM runtime, reviews, payments, bulk enrollment, lesson access, department hierarchy
- `database-schema-reference.md` — All Prisma models grouped by domain
- `system-architecture.md` — High-level diagram, tech stack, frontend routes, DB ERD, security, infrastructure
- `course-business-logic.md` — Course data model, lifecycle, instructor management, reviews, all API endpoints
- `course-content-and-activities.md` — Content hierarchy, activity types, assignment workflow, prerequisites, drip content
- `course-enrollment-and-learning-paths.md` — Enrollment flows, bulk enrollment, learning paths, certificate enhancement
- `course-scorm-and-cloning.md` — SCORM integration and course cloning

---

## Overview

Tiny LMS is a full-stack LMS built with Next.js 16 (frontend) and NestJS 11 (backend), using PostgreSQL via Supabase and Prisma 7 as the ORM.

| Dimension | Count |
|-----------|-------|
| Backend modules | 27 feature modules under `backend/src/modules/` |
| Frontend route groups | 4 route groups + standalone instructor/admin portals |
| Prisma models | 34 |

---

## Directory Structure

```
tiny-lms/
├── frontend/                 # Next.js 16 frontend
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   └── lib/                  # API client, auth context, utilities
├── backend/                  # NestJS 11 backend
│   ├── src/
│   │   ├── config/           # Application configuration
│   │   ├── common/           # Guards, decorators, enums, shared services
│   │   └── modules/          # 27 feature modules
│   └── prisma/               # Database schema and migrations
├── supabase/                 # Supabase configuration and SQL migrations
├── plans/                    # Architecture and feature planning docs
└── docs/                     # Project documentation
```

---

## Backend Module Map (27 modules)

| Module | Path | Description |
|--------|------|-------------|
| auth | `modules/auth/` | Supabase Auth + JWT login/register/reset |
| users | `modules/users/` | Profile management, admin CRUD, dashboard API |
| courses | `modules/courses/` | Courses + reviews + course-instructors sub-controllers |
| sections | `modules/sections/` | Section CRUD and reordering |
| lessons | `modules/lessons/` | Lessons with prerequisites and drip content |
| enrollments | `modules/enrollments/` | Enrollment + bulk enrollment (CSV/Excel) |
| progress | `modules/progress/` | Lesson progress tracking |
| question-banks | `modules/question-banks/` | Question bank CRUD + CSV/Excel import |
| questions | `modules/questions/` | Question and option CRUD |
| quizzes | `modules/quizzes/` | Quiz config and management |
| attempts | `modules/attempts/` | Quiz attempt lifecycle (start/answer/flag/submit) |
| grading | `modules/grading/` | Pending grading queue, manual essay grading |
| reports | `modules/reports/` | Course and quiz reports + leaderboard |
| notifications | `modules/notifications/` | In-app notifications |
| certificates | `modules/certificates/` | Certificate issuance and PDF generation |
| settings | `modules/settings/` | Key-value system settings |
| emails | `modules/emails/` | SMTP/Resend providers + templates + logs |
| flash-cards | `modules/flash-cards/` | Flash card decks, cards, study sessions |
| activities | `modules/activities/` | Activity CRUD and reordering per lesson |
| payments | `modules/payments/` | SePay QR code + webhook + auto-enroll |
| organization | `modules/organization/` | Organization profile (single-tenant) |
| departments | `modules/departments/` | Tree-structured department hierarchy |
| scorm | `modules/scorm/` | SCORM upload, extraction, runtime tracking |
| learning-paths | `modules/learning-paths/` | Learning path CRUD, course ordering, progress |
| assignments | `modules/assignments/` | Assignment creation, student submission, grading |
| contact-sync | `modules/contact-sync/` | Mailchimp/Brevo contact sync; event triggers; webhook handlers (unsubscribe/bounce); bulk sync; admin UI + log viewer |
| shared | `modules/shared/` | PrismaService, SupabaseService (shared providers) |

---

## Key Patterns & Conventions

### Backend

- NestJS module-based architecture with DTOs and class-validator
- **Prisma-first ORM**: all data access uses PrismaService; SupabaseService is restricted to auth only
- `prisma.$transaction()` for multi-step operations (course creation, reorder, bulk enrollment, payment + enroll)
- JWT + Supabase Auth dual guard pattern (`JwtAuthGuard` for most routes, `SupabaseAuthGuard` for SCORM/reviews/grading)
- `canManageCourse(courseId, userId)` helper on `CoursesService`, injected into Sections, Lessons, Quizzes services
- String-based enums in DB (e.g., role: `"student"`, `"instructor"`, `"admin"`)
- `@nestjs/event-emitter` for decoupled event-driven side effects (contact sync triggers)

### Frontend

- Next.js App Router with route groups: `(auth)`, `(dashboard)`, `(public)`, `(student)`
- Profile page at `(dashboard)/dashboard/profile/` to avoid Next.js routing conflict with `(student)/profile/`
- TanStack Query for all server state; `queryKeys` factory for cache key consistency
- shadcn/ui + Tailwind CSS v4; NeoBrutalism design on public pages
- Separate layout/header/footer per route group
- Admin portal includes dedicated pages for courses, quizzes, question-banks, flash-cards, and reports
- Charts built with Recharts via wrapper components in `components/charts/`

### Database

- UUID primary keys (`@id @default(uuid()) @db.Uuid`)
- Soft deletes via `isActive` flag on Profile
- `createdAt` / `updatedAt` on all mutable models
- `@@map("snake_case")` for tables; `@map("snake_case")` for columns
- All schemas under `@@schema("public")`

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)

```
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000
SEPAY_WEBHOOK_SECRET=...
```

---

## Build & Run Commands

### Frontend

```bash
cd frontend
npm install
npm run dev      # Development on port 3000
npm run build    # Production build
npm run start    # Production server
npm run test     # Vitest tests
npm run lint     # ESLint
```

### Backend

```bash
cd backend
npm install
npm run start:dev    # Development on port 3001
npm run build        # Production build
npm run start:prod   # Production server
npm run test         # Jest tests
npm run lint         # ESLint
npx prisma db push   # Apply schema changes to database
```

---

*Document Last Updated: 2026-03-21*
