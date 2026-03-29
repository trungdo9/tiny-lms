# Frontend Structure

This document covers the Next.js 16 frontend: App Router pages, components, libraries, API client, and query key conventions.

See also: `system-architecture.md` for the high-level architecture and route group diagram.

---

## App Router Pages (`frontend/app/`)

| Route | Description |
|-------|-------------|
| `/` | Landing page (NeoBrutalism / RetroUI style) |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Student dashboard |
| `/dashboard/profile` | Student profile (moved here to avoid Next.js routing conflict with `/profile`) |
| `/courses` | Public course catalog |
| `/courses/[slug]` | Public course detail (with reviews and ratings) |
| `/payment/[paymentId]` | SePay payment status page |
| `/courses/[slug]/learn/[lessonId]` | Lesson viewer (video/PDF/text/SCORM) |
| `/profile` | Student profile (student layout) |
| `/profile/history` | Learning history |
| `/quizzes/[id]` | Quiz details |
| `/quizzes/[id]/attempt/[attemptId]` | Quiz taking (navigator, timer, flags) |
| `/quizzes/[id]/result/[attemptId]` | Quiz results |
| `/certificates` | My certificates |
| `/certificates/[id]` | Certificate view/download |
| `/instructor/courses` | Instructor courses list |
| `/instructor/courses/create` | Create course |
| `/instructor/courses/[id]` | Edit course (outline, SCORM upload) |
| `/instructor/quizzes` | Instructor quizzes |
| `/instructor/quizzes/create` | Create quiz |
| `/instructor/quizzes/[id]` | Edit quiz |
| `/instructor/quizzes/grading` | Essay grading |
| `/instructor/question-banks` | Question banks |
| `/instructor/question-banks/[id]` | Question bank detail |
| `/instructor/question-banks/[id]/import` | Import questions |
| `/instructor/reports/courses/[id]` | Course reports |
| `/instructor/reports/quizzes/[id]` | Quiz reports |
| `/admin/settings` | System settings (General) |
| `/admin/settings/email` | Email configuration |
| `/admin/settings/email/templates` | Email template management |
| `/admin/settings/email/logs` | Email delivery logs |
| `/admin/settings/branding` | White label branding |
| `/admin/settings/auth` | Email verification toggle |
| `/admin/settings/organization` | Organization profile |
| `/admin/settings/departments` | Department hierarchy |
| `/admin/settings/categories` | Course category management (tree view) |
| `/admin/settings/analytics` | Google Analytics code configuration |
| `/admin/learning-paths` | Admin learning path management |
| `/instructor/learning-paths` | Instructor learning paths list |
| `/instructor/learning-paths/create` | Create learning path |
| `/instructor/learning-paths/[id]` | Edit learning path (metadata, course picker, publish) |
| `/learning-paths` | Public learning path catalog |
| `/learning-paths/[id]` | Learning path detail — course list, progress bar, enroll |
| `/verify/[certificateNumber]` | Public certificate verification (no auth required) |

---

## Components (`frontend/components/`)

| Component / Directory | Description |
|----------------------|-------------|
| `layout/` | Layout-specific headers and footers |
| `auth/` | Auth-related UI components |
| `ui/` | shadcn/ui primitive components |
| `quiz/` | Question navigator, timer, flag controls |
| `flash-card/` | Flip card, deck, session UI |
| `activity/` | Activity list, create/edit UI |
| `retroui/` | NeoBrutalism landing page components |
| `dashboard-header.tsx` | Dashboard navigation header with user menu |
| `dashboard-footer.tsx` | Dashboard footer |
| `public-header.tsx` | Public pages header |
| `public-footer.tsx` | Public pages footer |
| `notification-bell.tsx` | Notification indicator with unread badge |
| `instructor-manager.tsx` | Assign/remove co-instructors on a course |
| `protected-route.tsx` | Route guard for authentication |

---

## Libraries (`frontend/lib/`)

| File | Purpose |
|------|---------|
| `api.ts` | Centralized API client with all endpoint functions |
| `auth-context.tsx` | Authentication context provider |
| `query-keys.ts` | TanStack Query key factory |
| `supabase.ts` | Supabase client configuration |
| `utils.ts` | Utility functions (`cn`, etc.) |

---

## API Client (`frontend/lib/api.ts`)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T>
```

API functions are grouped by resource:
- `authApi`, `usersApi`, `coursesApi`, `reviewsApi`
- `sectionsApi`, `lessonsApi`, `scormApi`
- `enrollmentsApi`, `progressApi`
- `quizzesApi`, `attemptsApi`, `questionBanksApi`, `questionsApi`
- `gradingApi`, `certificatesApi`, `reportsApi`
- `notificationsApi`, `settingsApi`, `emailsApi`
- `flashCardsApi`, `activitiesApi`, `paymentsApi`
- `organizationApi`, `departmentsApi`
- `learningPathsApi`, `assignmentsApi`, `contactSyncApi`

---

## TanStack Query Key Factory (`frontend/lib/query-keys.ts`)

```typescript
export const queryKeys = {
  courses: {
    list: () => ['courses', 'list'],
    detail: (id: string) => ['courses', 'detail', id],
    detailBySlug: (slug: string) => ['courses', 'slug', slug],
    instructor: () => ['courses', 'instructor'],
    reviews: (courseId: string) => ['courses', courseId, 'reviews'],
    reviewStats: (courseId: string) => ['courses', courseId, 'reviewStats'],
  },
  courseInstructors: {
    list: (courseId: string) => ['courseInstructors', courseId],
  },
  learningPaths: {
    list: () => ['learningPaths', 'list'],
    detail: (id: string) => ['learningPaths', id],
    progress: (id: string) => ['learningPaths', id, 'progress'],
  },
  assignments: {
    detail: (id: string) => ['assignments', id],
    submissions: (id: string) => ['assignments', id, 'submissions'],
  },
  scorm: {
    packageByLesson: (lessonId: string) => ['scorm', 'lesson', lessonId],
    packageByCourse: (courseId: string) => ['scorm', 'course', courseId],
  },
  organization: () => ['organization'],
  departments: {
    tree: () => ['departments', 'tree'],
    detail: (id: string) => ['departments', id],
  },
  // ... quizzes, attempts, questionBanks, lessons, profile, etc.
}
```

---

## Key Frontend Dependencies

```json
{
  "next": "16.1.6",
  "react": "19.2.3",
  "@supabase/supabase-js": "^2.97.0",
  "@tanstack/react-query": "^5.90.21",
  "zustand": "^5.0.11",
  "tailwindcss": "^4",
  "shadcn": "^3.8.5",
  "lucide-react": "^0.575.0",
  "vitest": "^3.0.0",
  "@testing-library/react": "^16.0.0"
}
```

---

## Conventions

- App Router with route groups: `(auth)`, `(dashboard)`, `(public)`, `(student)`
- Profile page at `(dashboard)/dashboard/profile/` to avoid Next.js routing conflict with `(student)/profile/`
- TanStack Query for all server state; `queryKeys` factory for cache key consistency
- shadcn/ui + Tailwind CSS v4 for UI; NeoBrutalism design on public pages
- Separate layout/header/footer component per route group

---

*Document Last Updated: 2026-03-21*
