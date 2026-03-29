# Tiny LMS Public Regression Checklist

Last updated: 2026-03-21
Owner: QA / Huy_Tester
Status: Draft canonical regression checklist for public-facing and learner-facing routes

> Draft status: hold final sign-off until backend connectivity verification and the authenticated regression rerun are complete.
> Use this as the current source of truth for shared fixtures, durable accounts, and known blockers during stabilization.

---

## 1. Scope

This document is the repeatable regression checklist for the **public user experience** of Tiny LMS.

It covers routes/pages that are visible to:
- anonymous visitors
- newly registered users
- authenticated students/learners
- authenticated users reaching learner-facing flows such as payment, quiz taking, certificates, and lesson consumption

It does **not** cover the internal authoring/admin surfaces in detail:
- `/admin/*`
- `/instructor/*`

Those areas need their own regression plan.

### In-scope route inventory

#### Marketing / public discovery
- `/`
- `/login`
- `/register`
- `/courses`
- `/courses/[slug]`

#### Learner account + dashboard
- `/dashboard`
- `/dashboard/profile`
- `/dashboard/progress`
- `/profile`
- `/profile/history`

#### Learning + purchase flows
- `/payment/[paymentId]`
- `/courses/[slug]/learn/[lessonId]`
- `/courses/[slug]/scorm`

#### Quiz flows
- `/quizzes`
- `/quizzes/[id]`
- `/quizzes/[id]/attempt/[attemptId]`
- `/quizzes/[id]/result/[attemptId]`

#### Certificates
- `/certificates`
- `/certificates/[id]`

### Key route protections

Based on current frontend layouts/components:
- Public pages: `/`, `/courses`, `/courses/[slug]`, `/login`, `/register`
- Protected by `ProtectedRoute`: `/dashboard*`, `/profile*`, `/quizzes*`, `/certificates*`, `/(student)` routes including learning + SCORM
- Protected routes should redirect unauthenticated users to `/login`

---

## 2. System under test

### Frontend
- Next.js 16 app router
- React 19
- TanStack Query
- Supabase client auth
- Public routes grouped under:
  - `(public)`
  - `(auth)`
  - `(dashboard)`
  - `(student)`
  - `quizzes`
  - `certificates`

### Backend
- NestJS 11
- Prisma 7
- PostgreSQL / Supabase
- Auth via Supabase JWT
- Payments via SePay
- PDF generation via `pdfkit`

### Runtime assumptions
- Frontend default local URL: `http://localhost:3000`
- Backend default local URL: `http://localhost:3001`
- Frontend uses `NEXT_PUBLIC_API_URL`
- Protected API requests rely on Supabase session token in `Authorization: Bearer ...`

---

## 3. Recommended regression environments

### A. Local developer environment
Use for quick checks after frontend/backend changes.

Minimum:
- frontend running
- backend running
- seeded DB or representative staging-like data
- Supabase env configured

### B. Staging / pre-release
Use for full regression and sign-off.

Required:
- real auth configuration
- real email behavior or a controlled test mailbox
- payment integration in test-safe mode or staging configuration
- at least one free course, one paid course, one quiz-enabled course, one SCORM-enabled course, and one completed course with certificate

### C. Production smoke
Use only lightweight no-risk checks after deployment.

Avoid on production unless explicitly approved:
- real paid purchases
- irreversible grading/completion actions
- bulk content changes

---

## 4. Test data requirements

Keep these fixtures available in staging.

### User accounts
- Anonymous visitor
- `student_active_1`
- `student_active_2`
- `instructor_1` (only for cross-checking content exists)
- `admin_1` (preserve as shared regression setup account; do not delete/rename/repurpose between runs)

### Shared test credentials
Use these only as **project test data for local/staging regression**. They are not production credentials.

| Account | Email | Password | Primary use |
|---|---|---|---|
| `admin_1` | `claw.admin+dbfix@example.com` | `ClawFix!2026` | Admin login smoke, auth/role redirect checks, and one-off regression setup that requires an admin session |
| `instructor_regression_1` | `claw.instructor+regression@example.com` | `ClawInstr!2026` | Durable instructor account for regression fixture authoring/verification |
| `student_regression_1` | `claw.student+regression@example.com` | `ClawStudent!2026` | Durable learner account for enrollment and learner-flow regression |

### Regression fixture seeded on 2026-03-21 by Huy_Tester
- Account state normalized so the above instructor/student credentials are valid and reusable.
- Created shared regression asset course:
  - title: `Regression Smoke Course 20260321080343`
  - slug: `regression-smoke-course-20260321080343`
  - course id: `9e778ad8-500e-405a-b963-7ac87e563984`
  - section id: `3b13e4a5-f974-448a-892e-5b14f97c6337`
  - lesson id: `6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96`
  - quiz title: `Regression Quiz - Core Flow`
  - quiz id: `ae59ce08-7620-4bff-86a6-8b72e21b8bbc`
- Seeded a dedicated question bank plus 4 sample quiz questions for the fixture quiz.
- Enrolled `student_regression_1` in the fixture course so learner-side checks can reuse the same asset.
- Verification notes:
  - ✅ `GET /courses/:id` returned the fixture course successfully.
  - ✅ Frontend course page `/courses/regression-smoke-course-20260321080343` returned HTTP 200.
  - ⚠️ Authoring/detail endpoints currently hit backend 500s in this environment for at least:
    - `POST /courses`
    - `GET /courses/:courseId/sections`
    - `GET /lessons/:id`
    - `GET /lessons/:lessonId/quizzes`
    - `GET /quizzes/:id`
    - `GET /quizzes/:id/questions`
  - Because of those blockers, the fixture was inserted directly into the backing database using the configured Supabase service role, then verified through the routes/endpoints that are still working.

### Admin account handling notes
- Preserve this admin account for future regression runs so login, role redirect, and setup checks stay repeatable.
- Do **not** rotate the password, change the role, disable the profile, or reuse this account as ad-hoc personal test data unless the regression docs are updated at the same time.
- In this checklist, use `admin_1` mainly for `/login` role-routing verification and for setup/bootstrap checks needed before learner-facing regression. Detailed `/admin/*` UI coverage still belongs in a separate admin plan.
- Expected account state before each run:
  - Supabase auth user exists and can sign in with password
  - corresponding `profiles` row exists
  - role is `admin`
  - profile is active
  - email is confirmed when the environment requires immediate login
- If login works in Supabase but role-based routing or `/dashboard` behavior looks wrong, verify the `profiles` row and role mapping before treating it as a frontend-only regression.
- If the environment is rebuilt and this shared admin account disappears, restore the same test identity before continuing so regression history remains comparable. Current project reference for that bootstrap expectation: `backend/tmp-admin-login.js`.

### Course fixtures
1. **Free published course**
   - published
   - visible in catalog
   - multiple lessons
   - at least one preview lesson
   - at least one normal lesson

2. **Paid published course**
   - published
   - non-zero price
   - payment flow enabled

3. **Quiz-enabled course**
   - learner can access at least one quiz from lesson or quiz list
   - quiz should have objective questions and, ideally, one essay question

4. **SCORM course**
   - enrolled student
   - valid SCORM package attached

5. **Completed course**
   - learner already completed
   - certificate issued and downloadable

### Quiz fixtures
- Published quiz with time limit
- Published quiz without time limit
- Quiz with leaderboard enabled
- Quiz with showCorrectAnswer + showExplanation enabled
- Quiz with one-by-one or paginated mode if supported

### Payment fixtures
- One pending payment
- One completed payment
- One expired payment

---

## 5. Route-by-route regression cases

---

## 5.1 `/` — Landing page

### Purpose
Top-of-funnel marketing page and entry point into catalog and auth.

### Expected behavior
- Page loads without auth
- Hero and below-the-fold sections render
- CTA links are visible and clickable
- Footer quick links work
- No console-breaking errors on initial render
- Layout looks correct on mobile and desktop

### Core checks
- [ ] Page returns 200 and renders hero content
- [ ] Main sections render: hero, value props, features, how-it-works, stats, testimonials, use cases, FAQ, featured courses, footer
- [ ] CTA button "Get Started Free" links to `/register`
- [ ] Footer link to `/courses` works
- [ ] In-page anchor links like `#features` and `#faq` scroll correctly
- [ ] Public header is visible and sticky
- [ ] No broken images or layout collapse
- [ ] GA/runtime analytics init does not block page render

### High-risk regressions
- Dynamic section lazy-loading fails, leaving blank sections
- Header auth state flickers or never resolves
- SEO metadata or canonical tags regress

### Navigation sanity check to verify every run
- [ ] Public header "Sign Up" button routes correctly to `/register`
  - This was previously a known regression risk when docs/code were out of sync.
  - Keep it in the smoke path because auth entry-point links are high-impact.

### API / dependencies
- May indirectly depend on featured courses component data and runtime analytics settings
- Root layout loads GA initializer and metadata

---

## 5.2 `/login` — Sign in

### Expected behavior
- Anonymous user can open page
- Valid login signs user in and redirects based on role
- Invalid credentials show visible inline error
- Loading state disables repeated submissions

### Core checks
- [ ] Login form renders with email/password inputs and submit button
- [ ] Empty required fields are blocked by browser validation
- [ ] Invalid credentials show error alert and no redirect
- [ ] Valid student login redirects to `/profile` if role lookup succeeds or fallback `/profile`
- [ ] Valid instructor/admin login redirects to `/dashboard`
- [ ] "Sign up" link points to `/register`
- [ ] Refresh after successful login preserves session

### Negative checks
- [ ] Multiple rapid submit clicks do not create duplicate auth attempts or broken UI state
- [ ] Expired/invalid session after login recovers cleanly

### API / dependencies
- Supabase `signInWithPassword`
- `GET /users/me`

### Common failure modes
- Supabase env misconfigured
- backend cannot reliably reach the configured database because `DATABASE_URL` uses a direct host instead of the Supabase pooler / Supavisor URL in environments without suitable connectivity
- role lookup fails after login, causing wrong redirect
- error text swallowed, leaving silent failure

---

## 5.3 `/register` — Registration

### Expected behavior
- Anonymous user can create account
- Success state is clear
- If verification is required, verification messaging is shown
- No partial-success confusion

### Core checks
- [ ] Registration form renders with full name, email, password
- [ ] Password shorter than 6 chars is blocked client-side
- [ ] Duplicate email produces clear error message
- [ ] New account success path displays follow-up instructions
- [ ] "Back to Sign In" links work
- [ ] "Already have an account? Sign in" link works

### Verification-path checks
- [ ] If environment requires email verification, UI shows verify-your-email state
- [ ] If environment auto-signs user in, success state is coherent and session becomes usable

### Important implementation mismatch to watch
Frontend expects:
- `requiresVerification`
- optional `session.access_token`

Backend controller currently returns:
- `user`
- `access_token`
- `refresh_token`

This is a regression hotspot.

### API / dependencies
- `POST /auth/register`
- Supabase sign-in follow-up in some flows

### Common failure modes
- FE/BE response-shape mismatch after registration
- verification setting changes but UI path not updated
- account created but session not established

---

## 5.4 `/courses` — Public catalog

### Expected behavior
- Catalog is visible without auth
- Category pills, search, and level filters work
- Course cards navigate to correct detail pages
- Empty states are friendly and accurate

### Core checks
- [ ] Page loads with header/footer and course grid
- [ ] Skeleton/loading state appears before data resolves
- [ ] Category pills render only for categories with courses
- [ ] "All" category resets filtering
- [ ] Search filters visible list client-side
- [ ] Level dropdown filters visible list client-side
- [ ] Free badge appears on free courses
- [ ] Course card shows title, description, level, lesson count, instructor
- [ ] Clicking a course opens `/courses/[slug]`
- [ ] Empty result set shows "No courses found"

### Data integrity checks
- [ ] Only published/expected public courses are shown
- [ ] Course thumbnail fallback works when image missing
- [ ] Instructor initials fallback works when avatar missing

### API / dependencies
- `GET /courses?limit=50&categoryId=...`
- `GET /courses/categories`

### Common failure modes
- category filtering returns stale list because cache key/query mismatch
- level/search filtering fails when API shape changes
- image URLs broken or blocked

---

## 5.5 `/courses/[slug]` — Course detail

### Expected behavior
- Anonymous users can view published course detail
- Learners can enroll or buy based on course type
- Enrolled users can continue learning
- Curriculum and reviews render correctly

### Core checks: anonymous user
- [ ] Page loads by slug and displays course title, description, level, category, instructor(s)
- [ ] Curriculum sections and lessons render in correct order
- [ ] Preview lessons show preview badge
- [ ] Locked lessons show lock icon when not enrolled
- [ ] Free course shows "Enroll for Free"
- [ ] Paid course shows formatted price and "Buy Now"
- [ ] Clicking enroll/buy while logged out redirects to `/login`
- [ ] Reviews section loads without page crash

### Core checks: authenticated user, not enrolled
- [ ] Enrollment check runs and does not falsely mark user as enrolled
- [ ] Free course enrollment succeeds and button changes to learning CTA
- [ ] Paid course creates payment and navigates to `/payment/[paymentId]`

### Core checks: authenticated user, enrolled
- [ ] Progress bar appears if progress exists
- [ ] Continue Learning goes to first published lesson if available
- [ ] SCORM launch CTA appears when course has SCORM package
- [ ] If no published lessons, button is disabled with "No lessons available"

### Curriculum checks
- [ ] Sections sort by `order_index`
- [ ] Lessons sort by `order_index`
- [ ] Published/unpublished lesson handling is sensible for learner view
- [ ] "Coming soon" does not allow access to unpublished content

### Review checks
- [ ] Review list loads
- [ ] Review stats load
- [ ] Only eligible enrolled users can submit/update review
- [ ] Review deletion rules work for permitted users only

### API / dependencies
- `GET /courses/:slug`
- `GET /courses/:courseId/instructors`
- `GET /courses/:courseId/enroll/check` (auth only)
- `GET /courses/:courseId/progress` (auth + enrolled)
- `POST /courses/:courseId/enroll`
- `POST /payments`
- `GET /courses/:courseId/reviews`
- `GET /courses/:courseId/reviews/stats`
- `POST /courses/:courseId/reviews`
- SCORM package lookup

### Common failure modes
- slug route resolves only by ID logic change in backend
- enrolled state is stale after enroll/payment completion
- instructors endpoint fails but page should still render with fallback instructor
- unpublished content leaks or produces dead "Start" links

---

## 5.6 `/payment/[paymentId]` — Payment status

### Expected behavior
- Only authenticated owner can access payment status
- Pending payment shows QR code, payment code, countdown, polling
- Completed payment auto-redirects to course detail with enrollment state
- Expired payment offers retry path

### Core checks
- [ ] Pending page shows course title, amount, QR code, payment code
- [ ] Countdown decreases every second
- [ ] Status polling occurs while payment is pending
- [ ] Completed payment shows success state then redirects to `/courses/[slug]?enrolled=true`
- [ ] Expired payment shows retry CTA back to course detail
- [ ] Cancel/back to courses works
- [ ] Invalid payment ID or unauthorized access shows error state, not blank page

### API / dependencies
- `GET /payments/:id/status`
- Payment completion depends on SePay webhook processing `POST /payments/webhook`

### Common failure modes
- polling never stops
- countdown expires client-side but backend status still pending/confusing
- payment completes but enrollment not reflected on return to course page

---

## 5.7 `/dashboard` — Learner/instructor dashboard landing

### Expected behavior
- Protected route redirects anonymous users to `/login`
- Student sees learner dashboard data
- Instructor/admin sees reporting-style dashboard

### Core checks
- [ ] Anonymous visit redirects to `/login`
- [ ] Authenticated student sees student dashboard cards and enrolled activity
- [ ] Authenticated instructor/admin sees instructor dashboard instead
- [ ] Loading skeleton appears before profile resolution
- [ ] No role flicker to wrong dashboard

### Student checks
- [ ] Stats render: total courses, completed courses, total quizzes
- [ ] Recent activity loads
- [ ] Enrolled courses/progress list loads

### API / dependencies
- `GET /users/me`
- `GET /users/me/dashboard`
- `GET /reports/dashboard` for instructor/admin
- instructor trend reporting endpoints

### Common failure modes
- profile query fails and dashboard selection breaks
- protected route spinner never resolves when auth state is stuck

---

## 5.8 `/dashboard/profile` — Dashboard profile settings

### Expected behavior
- Protected page for instructor/admin-styled profile edit
- Existing profile data loads
- Profile update succeeds and success message appears

### Core checks
- [ ] Current profile info displays name/email/role
- [ ] Edit fields prefill correctly
- [ ] Saving updates profile and shows success feedback
- [ ] Refresh shows persisted changes

### Risk note
Current code uses `useState(() => { if (profile) setFormData(...) })` instead of an effect. Prefill/update behavior is a regression hotspot.

### API / dependencies
- `GET /users/me`
- `PUT /users/me/profile`

### Common failure modes
- form not populated after async profile load
- success toast shows but backend data not persisted

---

## 5.9 `/dashboard/progress` — Learner progress analytics

### Expected behavior
- Protected page shows learner progress summary, course progress, quiz trend, optional activity heatmap
- Export works for enrolled course progress

### Core checks
- [ ] Summary cards show enrolled/completed/average score/quizzes taken
- [ ] Course progress bars show accurate percentages
- [ ] Back-to-dashboard link works
- [ ] CSV export downloads expected columns
- [ ] Quiz trend chart renders when history exists
- [ ] Activity heatmap renders when activity API returns data
- [ ] Empty states are readable if no enrollments/history

### API / dependencies
- `GET /users/me/dashboard`
- `GET /users/me/quiz-history`
- `GET /users/me/activity?months=6`

### Common failure modes
- chart crashes on empty or malformed data
- export button enabled for empty dataset

---

## 5.10 `/profile` — Student profile

### Expected behavior
- Protected page for current learner profile
- Quick links navigate correctly
- Edit form works

### Core checks
- [ ] Profile header shows name/email/role
- [ ] Quick links render and navigate to `/dashboard` and `/profile/history`
- [ ] Edit form loads initial data
- [ ] Update profile persists and survives refresh
- [ ] Error state is visible if profile fetch fails

### API / dependencies
- `GET /users/me`
- `PUT /users/me/profile`

### Common failure modes
- auth token missing in fetch despite valid session
- edit form and display card get out of sync

---

## 5.11 `/profile/history` — Quiz history

### Expected behavior
- Protected page shows learner attempt history
- Empty state is clean
- Dates/scores/statuses are accurate

### Core checks
- [ ] History table loads for authenticated learner
- [ ] Submitted passed attempts show Passed state
- [ ] Submitted failed attempts show Failed state
- [ ] Non-submitted attempts show raw status
- [ ] Empty state says "No quiz attempts yet"
- [ ] Dates render in local browser format without obvious corruption

### API / dependencies
- `GET /users/me/quiz-history`

### Common failure modes
- status mapping wrong
- score/max score mismatch after grading changes

---

## 5.12 `/courses/[slug]/learn/[lessonId]` — Lesson viewer

### Expected behavior
- Protected route; only authenticated learners with access should proceed
- Supports text/video/PDF and attached activities/flash cards
- Progress can be saved and completion marked
- Prev/next navigation works

### Core checks
- [ ] Anonymous access redirects to `/login`
- [ ] Unenrolled learner attempting direct access gets redirected back to course detail
- [ ] Valid learner sees lesson title and content
- [ ] Sidebar opens/closes and course lesson list is usable
- [ ] Previous/Next navigation goes to correct published lessons
- [ ] Mark Complete updates completion badge/state
- [ ] Video lessons save position periodically and resume when expected
- [ ] Flash cards section opens when lesson has deck
- [ ] Attached activities load without page crash

### Content-type checks
- [ ] Text lesson content renders
- [ ] Video lesson plays and does not break progress save loop
- [ ] PDF lesson opens/embeds correctly if configured

### API / dependencies
- `GET /lessons/:lessonId/learn`
- `GET /courses/:slug`
- `PUT /lessons/:lessonId/progress`
- `POST /lessons/:lessonId/complete`
- flash card APIs
- activities APIs

### Common failure modes
- FE has course by slug while lesson APIs use IDs; cross-data mismatch can break navigation
- unpublished lesson IDs become reachable from direct URL
- progress save throws silently and user loses position

---

## 5.13 `/courses/[slug]/scorm` — SCORM player

### Expected behavior
- Protected route
- Enrolled learner with valid SCORM package can launch course
- Non-enrolled learner is bounced back to course detail

### Core checks
- [ ] Anonymous access redirects to `/login`
- [ ] Enrolled learner loads SCORM shell and player
- [ ] Back-to-course navigation works
- [ ] Completion callback returns learner to course page
- [ ] Missing package shows readable error state
- [ ] Non-enrolled learner is redirected to course detail

### API / dependencies
- `GET /courses?limit=100` then client-side slug match
- `GET /courses/:courseId/enroll/check`
- `GET SCORM package by course`
- SCORM runtime endpoints/proxy used by player

### Known risk
This page currently finds the course by slug via `coursesApi.list({ limit: 100 })` and then client-side filtering. Regression risk increases when total public courses exceeds 100.

### Common failure modes
- SCORM package exists but runtime API/proxy broken
- course not found because catalog pagination limit hides it

---

## 5.14 `/quizzes` — Quiz list

### Expected behavior
- Protected route
- Shows quizzes available to current learner/user
- Clicking a card opens quiz intro page

### Core checks
- [ ] Anonymous access redirects to `/login`
- [ ] List loads with title, optional course title, optional description
- [ ] Empty state says no quizzes available
- [ ] Clicking card navigates to `/quizzes/[id]`

### API / dependencies
- `GET /quizzes`

### Common failure modes
- backend access rules become too broad or too narrow
- course title missing causes render issues

---

## 5.15 `/quizzes/[id]` — Quiz intro/details

### Expected behavior
- Protected route
- Shows quiz metadata, availability, leaderboard when enabled, and lets user start attempt

### Core checks
- [ ] Quiz title/description render
- [ ] Cards show question count, time limit, max attempts, pass score
- [ ] Availability window text renders if configured
- [ ] Leaderboard renders only when enabled and data exists
- [ ] "Start Quiz" starts attempt and navigates to attempt page
- [ ] Unpublished quiz disables start button
- [ ] Start failure shows visible error

### API / dependencies
- `GET /quizzes/:id`
- `GET /quizzes/:id/leaderboard?limit=10`
- `POST /quizzes/:id/start`

### Common failure modes
- learner can see intro but start is blocked unexpectedly
- max attempts logic breaks at boundary condition
- leaderboard fetch failure breaks whole page instead of degrading gracefully

---

## 5.16 `/quizzes/[id]/attempt/[attemptId]` — Quiz taking

### Expected behavior
- Protected route
- Attempt loads current page/questions
- Answers auto-save
- Flagging works
- Timer auto-submits when expired
- Submission lands on result page

### Core checks
- [ ] Attempt page loads current question set
- [ ] Timer appears for timed quizzes and counts down correctly
- [ ] Answering single-choice, multi-choice, text, essay, matching, ordering, and cloze works for representative fixtures
- [ ] Auto-save occurs without visibly blocking the UI
- [ ] Flag/unflag updates navigator state
- [ ] Navigator opens question pages correctly
- [ ] Progress bar reflects answered count
- [ ] Submit modal counts answered/flagged/unanswered correctly
- [ ] Final submission redirects to result page
- [ ] Browser refresh during attempt preserves server-side attempt state
- [ ] beforeunload warning appears when trying to leave active attempt

### Pagination mode checks
- [ ] `one_by_one`: Previous/Next behavior respects `allowBackNavigation`
- [ ] `paginated`: page transitions work
- [ ] `all_at_once`: all questions visible and summary text accurate

### API / dependencies
- `GET /attempts/:id/page/:page`
- `GET /attempts/:id/questions`
- `POST /attempts/:id/answers`
- `PUT /attempts/:id/questions/:questionId/flag`
- `POST /attempts/:id/submit`

### Common failure modes
- debounced save loses last answer before submit
- timer drift causes premature submit
- question navigator status desynchronizes from actual saved answers
- matching/ordering/cloze serialization breaks after backend DTO changes

---

## 5.17 `/quizzes/[id]/result/[attemptId]` — Quiz result

### Expected behavior
- Protected route
- Shows pass/fail, score, points, time spent
- Optional answer review obeys quiz settings

### Core checks
- [ ] Result page loads after submit
- [ ] Pass/fail banner matches backend scoring
- [ ] Percentage and points are mathematically consistent
- [ ] Time spent displays in minutes/seconds
- [ ] Retry button returns to quiz intro page
- [ ] Back to Dashboard works
- [ ] If `showCorrectAnswer` is enabled, answer review toggles correctly
- [ ] If `showExplanation` is enabled, explanations render

### API / dependencies
- `GET /attempts/:id/result`

### Common failure modes
- result available before grading is complete for essay-heavy attempts
- answer review exposes answers when quiz config should hide them

---

## 5.18 `/certificates` — Certificate list

### Expected behavior
- Protected route
- Shows learner certificates or a clear empty state

### Core checks
- [ ] Anonymous access redirects to `/login`
- [ ] List loads certificate cards for completed courses
- [ ] Empty state prompts learner to browse courses
- [ ] Each certificate card shows course title, instructor, issue date
- [ ] View button opens `/certificates/[id]`

### API / dependencies
- `GET /certificates/my`

### Common failure modes
- certificate issue date formatting invalid
- thumbnail absence breaks card layout

---

## 5.19 `/certificates/[id]` — Certificate view/download

### Expected behavior
- Protected route
- Learner can view own certificate and download PDF

### Core checks
- [ ] Certificate preview renders student name, course title, instructor, issue date, certificate ID
- [ ] Download PDF triggers file download
- [ ] View Course link returns to course detail
- [ ] Invalid/nonexistent certificate shows readable error state
- [ ] Unauthorized user cannot view someone else’s certificate

### API / dependencies
- `GET /certificates/:id`
- `GET /certificates/:id/pdf`

### Common failure modes
- PDF download endpoint returns HTML/error blob instead of PDF
- certificate authorization missing or too permissive

---

## 6. Cross-route regression themes

These checks catch bugs that often span multiple pages.

### Authentication/session
- [ ] Protected routes redirect to `/login` when session absent
- [ ] Valid session survives browser refresh
- [ ] Logout/login cycle does not leave stale learner state in TanStack Query cache
- [ ] Switching accounts does not leak previous user data

### Navigation consistency
- [ ] Header/footer links point to real routes
- [ ] Browser Back works through login, course detail, payment, attempt result flows
- [ ] Query strings do not break rendering

### Data freshness
- [ ] Enroll action updates course detail and dashboard without requiring hard refresh
- [ ] Quiz submit updates result/history/dashboard quickly enough
- [ ] Certificate issuance appears in certificate list after completion

### Error handling
- [ ] API 401/403/404 states produce readable UI
- [ ] Broken image/optional data does not blank the page
- [ ] Console errors are reviewed for severe runtime failures

### Responsive behavior
- [ ] Landing page usable on mobile width
- [ ] Catalog filters usable on mobile width
- [ ] Course detail CTA and curriculum readable on mobile width
- [ ] Quiz attempt page remains usable on laptop and narrow tablet widths

### Performance / UX sanity
- [ ] Pages show loading skeleton/spinner rather than blank screen
- [ ] No obvious infinite polling or request loops
- [ ] Quiz attempt interactions feel responsive during auto-save

---

## 7. API dependency map by route

| Route | Primary backend dependencies |
|---|---|
| `/` | runtime analytics/settings, featured course data if component fetches it |
| `/login` | Supabase auth, `GET /users/me` |
| `/register` | `POST /auth/register`, optional Supabase sign-in |
| `/courses` | `GET /courses`, `GET /courses/categories` |
| `/courses/[slug]` | `GET /courses/:slug`, `GET /courses/:courseId/instructors`, enrollment/progress/reviews/payment create |
| `/payment/[paymentId]` | `GET /payments/:id/status`, payment webhook side effects |
| `/dashboard` | `GET /users/me`, `GET /users/me/dashboard`, instructor reports |
| `/dashboard/profile` | `GET /users/me`, `PUT /users/me/profile` |
| `/dashboard/progress` | `GET /users/me/dashboard`, `GET /users/me/quiz-history`, `GET /users/me/activity` |
| `/profile` | `GET /users/me`, `PUT /users/me/profile` |
| `/profile/history` | `GET /users/me/quiz-history` |
| `/courses/[slug]/learn/[lessonId]` | lesson learning endpoint, progress endpoints, course detail, flash cards, activities |
| `/courses/[slug]/scorm` | catalog list, enrollment check, SCORM package endpoints/runtime |
| `/quizzes` | `GET /quizzes` |
| `/quizzes/[id]` | `GET /quizzes/:id`, leaderboard, `POST /quizzes/:id/start` |
| `/quizzes/[id]/attempt/[attemptId]` | attempt page/questions/save/flag/submit |
| `/quizzes/[id]/result/[attemptId]` | `GET /attempts/:id/result` |
| `/certificates` | `GET /certificates/my` |
| `/certificates/[id]` | `GET /certificates/:id`, `GET /certificates/:id/pdf` |

---

## 8. Common failure modes and hotspots

Use this section as the "where bugs like to hide" summary.

### High-risk hotspots from current codebase
1. **Auth entry-link regression risk**
   - Keep verifying that public header auth CTAs still route to the real login/register pages.

2. **Register response-shape mismatch risk**
   - Frontend expects `requiresVerification` / nested `session`
   - Backend controller returns flat tokens

3. **SCORM course lookup capped at first 100 courses**
   - `/courses/[slug]/scorm` finds course by slug from `coursesApi.list({ limit: 100 })`

4. **Dashboard profile prefill bug risk**
   - `useState` used where `useEffect` would normally sync async profile data

5. **ProtectedRoute blank-state behavior**
   - When user is absent after loading, component returns `null` while redirecting; watch for apparent white flashes

6. **Course detail mixed fallback behavior**
   - instructor loading failure is swallowed; page should still remain usable

7. **Payment polling + redirect timing**
   - can produce duplicate polls, stale status, or awkward redirects

8. **Quiz auto-save / timer synchronization**
   - classic source of lost-answer or premature-submit bugs

### Backend/auth hotspots
- JWT/session expiry handling
- authorization for certificates and payments
- enrollment state after webhook/payment completion
- quiz attempt ownership checks

---

## 9. Pre-release smoke checklist

Run this before each release to staging/prod. This is the short version.

### Must-pass smoke
- [ ] `/` loads and main CTA works
- [ ] `/courses` loads and at least one course card opens
- [ ] `/login` valid student login works
- [ ] `/register` basic happy path works in current environment mode
- [ ] Free course enrollment works end-to-end
- [ ] Paid course payment page opens from course detail
- [ ] Student dashboard loads after login
- [ ] Learner can open one lesson and mark it complete
- [ ] Learner can open one quiz, start it, submit it, and view result
- [ ] Quiz history updates after submission
- [ ] Certificate list/view/download works for a test user with certificate
- [ ] No severe console/runtime errors on tested pages

### Conditional smoke
- [ ] SCORM launch works if SCORM feature is enabled in release scope
- [ ] Review submission works if course review feature changed in release scope
- [ ] Leaderboard renders if quiz/leaderboard code changed
- [ ] Email verification path works if auth settings changed
- [ ] Payment completion webhook path works if payment code changed

---

## 10. Regression matrix

Use this to decide what to rerun based on change area.

| Change area | Minimum routes to retest |
|---|---|
| Public layout/header/footer | `/`, `/courses`, `/courses/[slug]`, `/login`, `/register` |
| Auth / session / Supabase | `/login`, `/register`, all protected-route entry pages: `/dashboard`, `/profile`, `/quizzes`, `/certificates` |
| Catalog / course API | `/courses`, `/courses/[slug]`, `/courses/[slug]/scorm` |
| Enrollment logic | `/courses/[slug]`, `/dashboard`, `/dashboard/progress`, lesson access route |
| Payment integration | `/courses/[slug]`, `/payment/[paymentId]`, enrollment reflected in `/dashboard` and lesson access |
| Lesson viewer / progress | `/courses/[slug]/learn/[lessonId]`, `/dashboard`, `/dashboard/progress` |
| Quiz metadata / permissions | `/quizzes`, `/quizzes/[id]` |
| Quiz attempt engine | `/quizzes/[id]/attempt/[attemptId]`, `/quizzes/[id]/result/[attemptId]`, `/profile/history`, `/dashboard` |
| Certificates | `/certificates`, `/certificates/[id]` |
| Reviews | `/courses/[slug]` |
| SCORM | `/courses/[slug]`, `/courses/[slug]/scorm` |
| Analytics/runtime settings | `/`, `/courses`, `/dashboard` |

---

## 11. Suggested execution order for full regression

1. Anonymous journey
   - `/`
   - `/courses`
   - `/courses/[slug]`
   - `/login`
   - `/register`

2. Free learner journey
   - login as student
   - free course detail
   - enroll
   - dashboard
   - lesson view
   - progress page

3. Paid learner journey
   - paid course detail
   - payment page
   - post-payment return to course

4. Assessment journey
   - quizzes list
   - quiz intro
   - quiz attempt
   - result
   - quiz history

5. Completion journey
   - certificates list
   - certificate detail
   - PDF download

6. Feature-specific extras
   - SCORM launch
   - reviews
   - leaderboard

---

## 12. Pass/fail guidance

Mark a route as failed if any of the following occur:
- user cannot complete the primary action
- page crashes or becomes blank
- auth/authorization is bypassed or blocks valid access
- core data shown is obviously wrong/stale after the action completes
- a key CTA points to a broken route
- severe console or network errors indicate broken functionality even if page partially renders

Mark as soft-fail / follow-up if:
- only cosmetic issues are present
- optional data widgets fail gracefully while primary task still works
- copy/formatting is off but flow is intact

---

## 13. Notes for future QA updates

When updating this checklist, also update:
- route inventory if pages are added/removed
- fixture requirements if new learner-facing modules ship
- regression matrix if dependencies shift
- known hotspot section when recurring bugs are discovered
are discovered
