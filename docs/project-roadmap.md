# Tiny LMS - Project Roadmap

## Overview

This document tracks completed features and future development plans for Tiny LMS.

---

## Completed Features

### Phase 1: Foundation (2025-02-24)

| Feature | Status | Description |
|---------|--------|-------------|
| Project Setup | Done | Next.js 16 + NestJS 11 + Prisma + Supabase |
| Authentication | Done | Supabase Auth + JWT, register/login/logout/reset |
| User Profiles | Done | Profile management with role (student/instructor/admin) |
| Course Basic | Done | Course CRUD, sections, lessons |

### Phase 2: Course & Lesson Management (2025-02-24)

| Feature | Status | Description |
|---------|--------|-------------|
| Course Content | Done | Sections and lessons (video/PDF/text) |
| Course Categorization | Done | Category hierarchy |
| Course Publishing | Done | Draft/published workflow |
| Course Pricing | Done | Free or paid courses |
| Lesson Progress | Done | Per-lesson progress tracking |
| Video Resume | Done | Save and resume video position |

### Phase 3: Quiz System (2025-02-24)

| Feature | Status | Description |
|---------|--------|-------------|
| Quiz Creation | Done | Quizzes with full configuration |
| Question Types | Done | 8 types: single, multi, true_false, short_answer, essay, matching, ordering, cloze |
| Question Banks | Done | Reusable question banks per course |
| Quiz Attempts | Done | Start/submit attempts |
| Auto-Grading | Done | Automatic grading for objective questions |
| Manual Grading | Done | Manual grading for essay questions |
| Quiz Configuration | Done | Time limits, max attempts, pass score, shuffling |
| Question Import | Done | CSV/Excel import to question banks |
| Quiz Reports | Done | Performance reports for instructors |

### Phase 4: Reports, Certificates & Notifications (2026-02-27)

| Feature | Status | Description |
|---------|--------|-------------|
| Certificate System | Done | Auto-issue on lesson completion or quiz pass; PDF download |
| Notification System | Done | Bell icon, unread badge, 4 notification types |
| Course Reports | Done | Enrollment reports for instructors |
| Student Progress | Done | Progress tracking and history |

### Phase 5: Admin Dashboard & Email (2026-02-28)

| Feature | Status | Description |
|---------|--------|-------------|
| Admin Route | Done | Protected admin portal |
| System Settings | Done | Key-value settings management |
| White Label Branding | Done | Custom logo, colors, footer text |
| Email Module | Done | SMTP and Resend API providers |
| Email Templates | Done | Customizable HTML templates |
| Email Logs | Done | Delivery tracking |
| Landing Page Redesign | Done | NeoBrutalism / RetroUI style |

### Phase 6: Quiz UX, TanStack Query & Payments (2026-02-28)

| Feature | Status | Description |
|---------|--------|-------------|
| Question Navigator | Done | Sidebar with all questions and status indicators |
| Flag for Review | Done | Toggle flag on any question |
| Enhanced Timer | Done | Warning colors at 5min (yellow) and 1min (red) |
| Exit Protection | Done | Confirmation dialog when leaving quiz |
| Submit Review | Done | Summary before final submission |
| TanStack Query Migration | Done | All pages using useQuery/useMutation |
| Query Key Factory | Done | Consistent queryKeys structure in query-keys.ts |
| SePay Payment | Done | QR code generation, webhook, auto-enroll on completion |
| Payment History | Done | Per-user payment tracking |

### Phase 7: Flash Cards & Activity Module (2026-02-28 to 2026-03-01)

| Feature | Status | Description |
|---------|--------|-------------|
| FlashCardDeck Model | Done | Decks attached to lessons |
| FlashCard Model | Done | front, back, hint, imageUrl, orderIndex |
| FlashCardSession Model | Done | Known/unknown tracking per session |
| Deck CRUD API | Done | Create/read/update/delete decks |
| Card Management API | Done | Add/edit/delete/reorder cards |
| Study Session API | Done | Start/complete sessions with history |
| Activity Model | Done | lessonId, activityType, contentUrl, orderIndex, isPublished |
| Activities API | Done | Nested routes under /lessons/:lessonId/activities |
| Activity Types | Done | quiz, flashcard, video, file |
| Activity Reordering | Done | PUT /lessons/:lessonId/activities/reorder |

### Phase 8: RBAC, Routing & Component Enhancements (2026-03-03)

| Feature | Status | Description |
|---------|--------|-------------|
| Admin User List | Done | GET /users/admin/all with pagination and search |
| Admin User Update | Done | PUT /users/admin/:id for role, status, profile |
| Admin User Deactivate | Done | Soft delete via isActive flag |
| Dashboard API | Done | GET /users/me/dashboard for stats and recent activity |
| Avatar Upload | Done | PUT /users/me/avatar to Supabase Storage |
| Profile Route Fix | Done | Moved to /dashboard/profile to resolve Next.js routing conflict |
| DashboardHeader/Footer | Done | Dedicated header/footer for dashboard route group |
| PublicHeader/Footer | Done | Dedicated header/footer for public route group |

### Phase 9: SCORM 1.2 + 2004 Support (2026-03-03)

| Feature | Status | Description |
|---------|--------|-------------|
| ScormPackage Model | Done | version, entryPoint, extractedPath, manifestData |
| ScormAttempt Model | Done | Full runtime state per user per package |
| SCORM Upload API | Done | POST /scorm/upload/lesson/:lessonId and /course/:courseId |
| imsmanifest.xml Parsing | Done | adm-zip + xml2js with defensive fallbacks |
| Static Content Serving | Done | Backend serves extracted SCORM files |
| Next.js Proxy | Done | /scorm/content/* rewrites to backend (same-origin fix) |
| SCORM API Shim | Done | window.API (1.2) and window.API_1484_11 (2004) injected before iframe |
| Runtime Tracking | Done | lessonStatus, completionStatus, scoreRaw, suspendData, totalTime |
| LMSFinish Sync | Done | POST /scorm/attempts/:id/finish syncs to LessonProgress |
| Lesson-Type SCORM | Done | SCORM as a lesson type in the course outline |
| Standalone Course SCORM | Done | Course-level SCORM player route |

### Phase 10: Course Reviews, Instructor Management & Email UX (2026-03-04)

| Feature | Status | Description |
|---------|--------|-------------|
| CourseReview Model | Done | rating (1-5), comment, unique per userId+courseId |
| Reviews API | Done | GET stats, GET list (paginated), POST upsert, DELETE |
| Denormalized Stats | Done | averageRating + totalReviews on Course, recomputed on write |
| Enrollment Gate | Done | Backend enforces enrollment before review creation |
| Reviews UI | Done | Star rating and review list on public course detail page |
| InstructorManager Component | Done | Search users, assign/remove co-instructors on a course |
| course-instructors API | Done | GET/POST/PUT/DELETE /courses/:id/instructors/:userId |
| Email Verification Toggle | Done | auth.require_email_verification setting in admin Auth tab |
| Email Template Preview | Done | POST /emails/templates/:slug/preview renders with variables |
| Email Template Test Send | Done | POST /emails/templates/:slug/test sends rendered email |

### Phase 11: Organization & Department Modules (2026-03-04)

| Feature | Status | Description |
|---------|--------|-------------|
| Organization Model | Done | name, contact, address, logo, social links, taxCode, foundedYear |
| Organization API | Done | GET /organization (public), PUT /organization (admin) |
| Organization Admin UI | Done | /admin/settings/organization page |
| Department Model | Done | Tree structure via parentId, slug, status, orderIndex |
| Department API | Done | CRUD + flat/tree query via GET /departments?flat=true |
| Department Admin UI | Done | /admin/settings/departments tree view |
| Profile departmentId | Done | Optional FK linking users to departments |

### Phase 12: Architecture Improvement (2026-03-08)

| Feature | Status | Description |
|---------|--------|-------------|
| Supabase → Prisma migration: CoursesService | Done | Pure Prisma; `$transaction` for create + instructor sync; `_count` for denormalized fields; paginated `findAll` |
| Supabase → Prisma migration: SectionsService | Done | Pure Prisma; `$transaction` for reorder |
| Supabase → Prisma migration: LessonsService | Done | Pure Prisma; prerequisite and drip content checks in `findOneForLearning` |
| Supabase → Prisma migration: EnrollmentsService | Done | Pure Prisma; added `bulkEnroll()` |
| Supabase → Prisma migration: ProgressService | Done | Pure Prisma; `findUnique` with compound key |
| SupabaseService scope restriction | Done | SupabaseService now used only in AuthService and SupabaseAuthGuard |
| lessonCount denormalization | Done | `lessonCount` field on Course, recomputed on lesson create/delete |
| Lesson Prerequisites | Done | `prerequisiteLessonId` self-referential FK; access gate in `findOneForLearning` |
| Drip Content | Done | `availableAfterDays` and `availableFrom` on Lesson; availability checked before lesson access |
| Learning Paths | Done | `LearningPath` + `LearningPathCourse` models; full CRUD + reorder + progress tracking |
| Assignment Activity Type | Done | `Assignment` + `AssignmentSubmission` models; create, submit, grade workflow |
| Bulk Enrollment | Done | `POST /enrollments/bulk` (admin only); skips already-enrolled; returns counts |
| Certificate Enhancement | Done | Added `certificateNumber` (unique), `templateData` (JSON), `pdfUrl` to Certificate model |

### Phase 13: Contact Sync, Grading Module & Admin Portal (2026-03-14)

| Feature | Status | Description |
|---------|--------|-------------|
| Contact Sync module | Done | `contact-sync` backend module; Mailchimp + Brevo providers; event-driven triggers; webhooks (unsubscribe/bounce); bulk sync (202 fire-and-forget); admin UI + log viewer |
| ContactSyncLog model | Done | Audit table for all sync operations (provider, operation, trigger, status) |
| Contact sync admin API | Done | `GET /contact-sync/status`, verify, logs, stats, manual sync, `POST /bulk-sync`, webhook endpoints |
| Grading module | Done | Dedicated `grading` module; `GET /grading/pending`, `POST /grading/attempts/:id/answers/:id/grade` |
| Questions module | Done | Standalone `questions` module for question/option CRUD |
| Admin portal pages | Done | Admin pages for courses, quizzes (+ grading), flash-cards, question-banks, reports |
| Admin dashboard | Done | `/admin/dashboard` with charts and platform statistics |
| Role-based dashboard | Done | `(dashboard)/dashboard` renders different UI for student, instructor, admin roles |
| Charts library | Done | Recharts wrapper components: `AreaChart`, `BarChart`, `LineChart`, `PieChart`, `ActivityHeatmap` |
| Activity type: assignment | Done | `assignment` added as fifth activity type; wired to Assignment model |
| CSV export utility | Done | `lib/export-csv.ts` for exporting report data from the frontend |

### Phase 14: Course Category & Admin UI (2026-03-15)

| Feature | Status | Description |
|---------|--------|-------------|
| Category CRUD API | Done | PUT/DELETE `/courses/categories/:id`; admin-only guards on mutating routes |
| Category Admin UI | Done | `/admin/settings/categories` — tree view, create/edit/delete, drag-to-reorder |
| Category Filter on Courses | Done | Dropdown/pill filter on `/courses` public listing; self-ref bug fixed |
| Category picker in course form | Done | Course create/edit forms wired to `categoryId` with typed `Category` interface |

### Phase 15: Landing Page Enhancement (2026-03-18)

| Feature | Status | Description |
|---------|--------|-------------|
| Hero 2-column layout | Done | Benefit-focused headline, dual CTA, above-fold <600px |
| Value Proposition section | Done | 3–5 benefits with ROI focus |
| Features + How-It-Works | Done | Expanded feature grid and step-by-step flow |
| Testimonials + Stats | Done | Social proof section with quantified stats (10K+ learners) |
| FAQ section | Done | Accordion FAQ on landing page |
| SEO & Performance | Done | Schema.org markup, meta tags, Core Web Vitals optimized |
| Analytics visual polish | Done | Analytics stats embedded in landing page |
| Landing components | Done | Dedicated `components/landing/` directory with `HeroSection`, `StatsSection`, `FAQSection`, `CTASection`, etc. |

### Phase 16: Google Analytics Admin Settings (2026-03-19)

| Feature | Status | Description |
|---------|--------|-------------|
| GA code setting | Done | `analytics_ga_code` key seeded in settings with `analytics` category |
| Analytics admin page | Done | `/admin/settings/analytics` — GA4 code input with regex validation |
| Runtime GA injection | Done | Root `layout.tsx` fetches GA code from API; falls back to `NEXT_PUBLIC_GA_ID` env var |

### Phase 17: Learning Path Full Stack + Certificate Enhancement (2026-03-21)

| Feature | Status | Description |
|---------|--------|-------------|
| LearningPathEnrollment model | Done | New DB model with `learningPathId`, `studentId`, `completedAt`, `certificateId` |
| Learning path enroll endpoint | Done | `POST /learning-paths/:id/enroll` — auto-enrolls student in all path courses |
| GET /learning-paths/enrolled | Done | Returns all paths the current student is enrolled in |
| GET /learning-paths/mine | Done | Returns instructor's own learning paths |
| Instructor course-ownership check | Done | Instructors can only add their own courses to a path |
| Learning path student browse | Done | `/learning-paths` — public listing of published paths |
| Learning path detail page | Done | `/learning-paths/[id]` — courses list, progress bar, enroll button |
| Instructor path management | Done | `/instructor/learning-paths` — CRUD, publish/draft, course picker |
| Admin path management | Done | Admin UI for all learning paths |
| Certificate auto-issue | Done | Cert issued automatically when all lessons completed (100% course progress) |
| Certificate number | Done | Unique `CERT-YYYYMMDD-XXXXX` format auto-generated on issuance |
| Public verify endpoint | Done | `GET /certificates/verify/:certificateNumber` — no auth required |
| PDF branding + QR code | Done | PDF includes org name, cert number, QR code linking to verify URL |
| Public verify page | Done | `/verify/[certificateNumber]` — works without login |
| Share/copy-link button | Done | Copy-link on certificate detail page |
| Learning path cert trigger | Done | Path completion triggers certificate issuance |

---

## Version History

| Version | Date | Milestone |
|---------|------|-----------|
| 1.0.0 | 2025-02-27 | Initial release — core LMS features |
| 1.1.0 | 2026-02-28 | Quiz UX, Certificates, Notifications |
| 1.2.0 | 2026-02-28 | Admin Dashboard, Settings, White Label, Email |
| 1.3.0 | 2026-02-28 | TanStack Query migration, Vitest, SePay payment |
| 1.4.0 | 2026-02-28 | Flash Card module with study sessions |
| 1.5.0 | 2026-03-01 | Activity module (quiz/flashcard/video/file) |
| 1.6.0 | 2026-03-03 | RBAC enhancements, routing fix, header/footer components |
| 1.7.0 | 2026-03-03 | SCORM 1.2 + 2004 support (5 phases complete) |
| 1.8.0 | 2026-03-04 | Course reviews & ratings, instructor management UI |
| 1.9.0 | 2026-03-04 | Email verification toggle, template preview/test improvements |
| 1.10.0 | 2026-03-04 | Organization module, Department module (tree hierarchy) |
| 1.11.0 | 2026-03-08 | Architecture improvement: Prisma-first ORM, lesson prerequisites, drip content, learning paths, assignments, bulk enrollment, certificate enhancement |
| 1.12.0 | 2026-03-14 | Contact sync (Mailchimp/Brevo), Grading module, Questions module, admin portal pages, role-based dashboard, Recharts charts, CSV export |
| 1.13.0 | 2026-03-15 | Course Category — full CRUD API, admin UI, public listing filter |
| 1.14.0 | 2026-03-18 | Landing page full enhancement — 2-col hero, features, testimonials, stats, FAQ, SEO |
| 1.15.0 | 2026-03-19 | Google Analytics admin settings — DB-driven GA4 code injection |
| 1.16.0 | 2026-03-21 | Learning Path full stack (frontend), Certificate Enhancement (auto-issue, cert numbers, QR verify, public verify page) |

---

## Future Development

### Near-Term (High Priority)

| Feature | Description |
|---------|-------------|
| Assignment File Upload | Wire up Multer upload endpoint for assignment submissions (fileUrl infrastructure) |
| API Documentation | Swagger/OpenAPI docs auto-generated from NestJS decorators |
| Themes Module | Multiple UI themes or advanced white-label theming |
| Quiz Picker Activity | Clone-on-select quiz picker in course outline activity creation |

### Medium-Term

| Feature | Description |
|---------|-------------|
| Discussion Forums | Per-course student discussion threads |
| Announcements | Instructor announcements per course |
| Real-time Notifications | WebSocket for live notification delivery |
| E2E Tests | Playwright or Cypress test suite |
| Caching Layer | Redis for session and query caching |
| ~~Certificate Verification~~ | ~~Done — public `/verify/[certificateNumber]` page implemented~~ |
| ~~Contact Sync Webhooks~~ | ~~Done — implemented in Phase 13~~ |
| ~~Learning Path UI~~ | ~~Done — full stack frontend implemented in Phase 16~~ |

### Long-Term

| Feature | Description |
|---------|-------------|
| Multi-tenant / Multi-org | Full organizationId partitioning across Courses, Profiles, Settings |
| Mobile App | React Native companion app |
| Multi-language (i18n) | Internationalization support |
| Advanced Analytics | Learning path analytics, cohort analysis |
| Live Sessions | Video conferencing integration |
| Horizontal Scaling | Replace in-process event emitter with Redis pub/sub or RabbitMQ |

---

## Known Technical Debt

| Item | Description |
|------|-------------|
| SCORM file storage | Currently uses local filesystem — needs shared volume or object storage for multi-instance deployments |
| Unit test coverage | Backend unit tests are minimal; service-level coverage should be expanded for learning-paths, assignments, contact-sync, grading |
| Vitest test scope | Frontend tests cover query key structure; component-level tests needed |
| Assignment file storage | Assignment submissions reference `fileUrl` but no file upload endpoint exists yet |
| ~~Learning path UI~~ | ~~Resolved — full stack frontend implemented in Phase 17~~ |
| ~~Contact sync webhooks~~ | ~~Resolved — webhook controller fully implemented with Mailchimp + Brevo handlers~~ |
| Event emitter scaling | `@nestjs/event-emitter` is in-process; not safe for multi-instance horizontal deployments without a broker |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `feature/your-feature-name`
3. Follow code standards in `docs/code-standards.md`
4. Submit a pull request against `main`

For bug reports: open a GitHub issue with steps to reproduce and expected vs actual behavior.

---

*Document Last Updated: 2026-03-21*
