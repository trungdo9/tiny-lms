# Tiny LMS

A compact and efficient Learning Management System (LMS) built with modern web technologies.

## Overview

Tiny LMS enables instructors to create and manage courses, quizzes, and question banks while allowing students to enroll in courses, track their progress, and take assessments.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| UI Components | shadcn/ui (neobrutalist design), Lucide React |
| State Management | Zustand, TanStack Query |
| Testing | Vitest (jsdom) |
| Backend | NestJS 11, Prisma 7 ORM |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth + JWT |
| Payments | SePay (QR code + webhook) |
| Email | SMTP (Nodemailer) / Resend API |
| Contact Sync | Mailchimp / Brevo |
| PDF | pdfkit |

## Features

### Authentication & Users
- Email/password registration with optional email verification toggle
- Login with Supabase Auth + JWT
- Role-based access control (Student, Instructor, Admin)
- Profile management with avatar upload
- Admin user management (search, update role, deactivate)
- Department assignment (tree-structured departments)

### Course Management
- Course creation with sections, lessons, drag-and-drop outline reordering
- Multiple lesson types: video, PDF, text, SCORM
- Course categorization with hierarchy
- Course publishing workflow (draft/published)
- Course pricing (free or paid)
- Multi-instructor support (primary + co-instructor roles)
- Course reviews and ratings (1-5 stars, enrolled students only)
- Lesson prerequisites and drip content (availableAfterDays / availableFrom)

### SCORM Support
- SCORM 1.2 and SCORM 2004 package upload (ZIP, up to 100MB)
- Automatic imsmanifest.xml parsing and content extraction
- Runtime API shim (window.API / window.API_1484_11) via Next.js proxy
- Completion, score, suspend_data, and session time tracking
- Standalone course-level SCORM mode

### Quiz System
- 8 question types: Single choice, Multiple choice, True/False, Short answer, Essay, Matching, Ordering, Cloze
- Quiz configuration: time limits, max attempts, pass score, shuffling
- Question bank with CSV/Excel import
- Auto-grading for objective questions; manual grading for essays
- Quiz navigator, flag-for-review, timer warnings, exit protection
- Grading portal for instructors (pending essay answers)

### Enrollment & Progress
- Course enrollment with SePay payment integration
- Bulk enrollment (admin, CSV/Excel import)
- Lesson prerequisites and drip content access gates
- Progress tracking per lesson, video position resume
- Course completion and certificate generation (PDF, unique certificate number)
- Leaderboard for quiz scores

### Learning Paths
- Curated learning paths grouping multiple courses
- Ordered course list with required/optional flags
- Progress tracking across learning path courses

### Assignments
- Assignment activity type (file upload by student)
- Due dates, late submission policy, allowed file types
- Instructor grading with score and feedback

### Flash Cards
- Flash card decks attached to lessons
- Flip card study interface (front/back/hint/image)
- Known/unknown card tracking per session, study history

### Activity Module
- Activity types: quiz, flashcard, video, file, assignment
- Reorder activities within lessons, published/draft status

### Notifications & Email
- In-app notification bell with unread count
- Email notifications via SMTP or Resend API
- Customizable email templates with preview and test-send

### Contact Sync (Marketing)
- Sync user contacts to Mailchimp or Brevo
- Event-driven: syncs on register, enroll, profile update, course completion
- Contact tagging by role, enrolled courses, completion status
- Bulk sync for initial import; admin logs and status dashboard

### Admin Dashboard
- System settings, white label branding
- Email configuration, template management, delivery logs
- Email verification toggle (require verification on registration)
- Organization profile management (name, logo, social links, etc.)
- Department hierarchy management (tree structure, linked to users)
- User management with role assignment
- Admin portal for courses, quizzes, question banks, flash cards, reports

## Project Structure

```
tiny-lms/
├── frontend/
│   ├── app/
│   │   ├── (auth)/         # Login, register
│   │   ├── (dashboard)/    # Student dashboard (/dashboard/profile)
│   │   ├── (public)/       # Course catalog, payment
│   │   ├── (student)/      # Lesson viewer, profile
│   │   ├── instructor/     # Instructor portal (courses, reports, quizzes, flash-cards)
│   │   ├── admin/          # Admin portal (users, courses, quizzes, flash-cards, question-banks, reports, settings)
│   │   ├── quizzes/        # Quiz taking
│   │   └── certificates/   # Certificates
│   ├── components/         # React components (quiz/, flash-card/, activity/, charts/, retroui/, ui/)
│   └── lib/                # api.ts, auth-context.tsx, supabase.ts, query-keys.ts
├── backend/
│   ├── src/modules/        # 27 feature modules
│   └── prisma/schema.prisma
├── supabase/
└── docs/
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Installation

```bash
git clone <repository-url>
cd tiny-lms
cd frontend && npm install
cd ../backend && npm install
```

**`frontend/.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**`backend/.env`**:
```env
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
SEPAY_WEBHOOK_SECRET=your-sepay-webhook-secret
```

```bash
cd backend && npx prisma db push
npm run start:dev          # backend on :3001
cd ../frontend && npm run dev  # frontend on :3000
npm run test               # run Vitest tests
```

## User Roles

| Role | Key Permissions |
|------|----------------|
| Student | Enroll, learn, take quizzes, download certificates, study flash cards, write course reviews |
| Instructor | All student permissions + create/manage courses, quizzes, question banks, flash cards, grade essays, view reports |
| Admin | All permissions + system settings, branding, email/contact-sync config, organization/department management, user roles |

## Documentation

- [Project Overview & PDR](./docs/project-overview-pdr.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Code Standards](./docs/code-standards.md)
- [System Architecture](./docs/system-architecture.md)
- [Project Roadmap](./docs/project-roadmap.md)

## License

MIT
