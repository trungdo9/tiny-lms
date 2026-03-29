# Tiny LMS - Project Overview and Product Development Requirements

## 1. Project Overview

### 1.1 Project Name
**Tiny LMS** - A compact Learning Management System

### 1.2 Project Description
Tiny LMS is a full-featured Learning Management System designed to provide an efficient and intuitive platform for online education. It enables instructors to create and manage courses, quizzes, and question banks while allowing students to enroll in courses, track their progress, take assessments, and earn certificates. The system supports SCORM content, flash cards, an activity module, assignments, learning paths, a SePay payment gateway integration, and contact synchronization with external marketing platforms (Mailchimp/Brevo).

### 1.3 Technology Stack

#### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4 + shadcn/ui (neobrutalist design)
- **Charts**: Recharts (via wrapper components in `components/charts/`)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: Supabase Auth (client-side)
- **Testing**: Vitest with jsdom environment
- **Icons**: Lucide React

#### Backend
- **Framework**: NestJS 11
- **ORM**: Prisma 7
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth + JWT (Passport)
- **Event Bus**: @nestjs/event-emitter (contact-sync triggers)
- **File Upload**: Multer (memory storage for SCORM ZIPs)
- **SCORM Parsing**: adm-zip, xml2js
- **Data Processing**: CSV/Excel parsing (csv-parse, xlsx)
- **PDF Generation**: pdfkit

#### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (media files, avatars)
- **SCORM Content**: Local filesystem (`public/scorm/{packageId}/`)

---

## 2. Product Features

### 2.1 Authentication & Authorization
- User registration with email/password
- Email verification toggle (configurable via admin settings)
- User login with Supabase Auth
- JWT-based session management
- Password reset functionality
- Role-based access control (Student, Instructor, Admin)

### 2.2 User Management
- Profile management (full name, avatar, bio, phone)
- User roles: Student, Instructor, Admin
- Avatar upload to Supabase Storage
- Role assignment by admin
- Admin user search and listing with pagination
- User deactivation/reactivation (soft delete via `isActive`)
- Student dashboard API (enrolled courses, progress stats, recent quiz activity)
- `emailVerified` field on Profile (tracked from Supabase auth)
- Department assignment (optional FK to `Department`)

### 2.3 Course Management
- Course creation, editing, and deletion
- Course categorization (categories with hierarchy)
- Course publishing workflow (draft/published)
- Course pricing (free or paid with price)
- Course levels (beginner, intermediate, advanced)
- Course thumbnail and media support
- Multi-instructor support: primary instructor + co-instructors via `CourseInstructor` join table
- `canManageCourse(courseId, userId)` helper shared across Sections, Lessons, Quizzes services
- Instructor management UI (`InstructorManager` component)
- Denormalized `lessonCount` recomputed on lesson create/delete

### 2.4 Course Reviews & Ratings
- Enrolled students can create or update a review (1-5 star rating + optional comment)
- Upsert pattern: one review per user per course (unique constraint)
- Aggregated stats (`averageRating`, `totalReviews`) stored denormalized on `Course`
- Stats recomputed on each review write/delete via Prisma aggregates
- Public GET endpoints for reviews and stats; write endpoints require enrollment

### 2.5 Content Structure
- **Sections**: Organize course content into ordered sections
- **Lessons**: Individual learning units (video, PDF, text, SCORM)
- Lesson preview capability
- Video provider support (YouTube, Vimeo)
- Lesson duration tracking
- Drag-and-drop section/lesson reordering
- **Lesson Prerequisites**: `prerequisiteLessonId` self-referential FK; access gate in `findOneForLearning()`
- **Drip Content**: `availableAfterDays` and `availableFrom` on Lesson; availability checked before lesson access

### 2.6 SCORM Support
- SCORM 1.2 and SCORM 2004 package upload (ZIP, max 100MB)
- Automatic `imsmanifest.xml` parsing; stores `version`, `entryPoint`, `extractedPath`, `manifestData`
- Content extracted to `public/scorm/{packageId}/` on the backend
- SCORM content served from backend (:3001); Next.js proxy rewrites `/scorm/content/*` → backend to share origin with frontend
- `window.API` (SCORM 1.2) / `window.API_1484_11` (SCORM 2004) shim injected before iframe loads
- Runtime data tracked: `lessonStatus`, `completionStatus`, `successStatus`, `scoreRaw`, `scoreMax`, `suspendData`, `location`, `totalTime`
- `LMSFinish`/`Terminate` syncs completion to `LessonProgress`
- Standalone course-level SCORM mode (package linked to `courseId` instead of `lessonId`)

### 2.7 Enrollment & Progress
- Course enrollment system
- **Bulk enrollment**: `POST /enrollments/bulk` (admin only); CSV/Excel upload; skips already-enrolled; returns counts
- Progress tracking per lesson
- Video position saving/resuming
- Course completion tracking
- Student enrollment history

### 2.8 Learning Paths
- Curated sequences of courses created by instructors
- `LearningPath` + `LearningPathCourse` models (ordered, required/optional flag)
- Full CRUD + course reordering + progress tracking across path courses
- Published/draft status

### 2.9 Quiz System
- Quiz creation and management
- Question bank system for reusable questions
- Multiple question types:
  - Single choice, Multiple choice, True/False
  - Short answer, Essay
  - Matching, Ordering
  - Cloze (fill in the blanks)
- Quiz configuration: time limits, max attempts, pass score, shuffling, pagination modes, back navigation
- Quiz result display options

### 2.10 Quiz UX Enhancements
- Question navigator panel with status indicators (answered, not answered, flagged)
- Flag/unflag questions for review
- Progress tracking (answered count display)
- Enhanced timer: yellow warning at 5 minutes, red at 1 minute
- Exit protection (confirmation dialog when leaving)
- Submit review summary before final submission

### 2.11 Question Bank
- Create and manage question banks
- Associate question banks with courses
- Import questions from CSV/Excel files
- Question tagging and difficulty levels
- Question media support (images, videos)

### 2.12 Grading System
- Automatic grading for objective questions
- Manual grading for essay questions via dedicated Grading module
- Pending grading queue: `GET /grading/pending` (filtered by quizId)
- Grade individual answer: `POST /grading/attempts/:attemptId/answers/:answerId/grade`
- Grading feedback and explanations
- Attempt history and scoring
- Leaderboard for quiz scores

### 2.13 Assignments
- Assignment activity type linked to lessons via `Activity` model
- Fields: instructions, maxScore, dueDate, allowLateSubmission, maxFileSize, allowedFileTypes
- Students submit files with optional comment
- Instructor grades with score and feedback; `gradedBy` and `gradedAt` tracked
- One submission per student per assignment (unique constraint)

### 2.14 Certificates
- Automatic certificate generation on course completion
- Certificate triggers: 100% lesson completion or quiz pass
- PDF certificate download (student name, course name, completion date)
- Duplicate prevention (unique constraint on userId + courseId)
- `certificateNumber` (unique), `templateData` (JSON), `pdfUrl` on Certificate model

### 2.15 Notifications
- In-app notification system with bell icon and unread badge
- Notification types: `quiz_result`, `enrollment`, `grading_complete`, `course_published`
- Read/unread status tracking

### 2.16 Admin Dashboard
- System settings management (key-value store)
- White label branding customization (logo, colors, footer text)
- Email verification toggle (`auth.require_email_verification` setting)
- Admin pages for courses, quizzes, question banks, flash cards, reports

### 2.17 Email Notifications
- SMTP provider support (Nodemailer)
- Resend API provider support
- Customizable HTML email templates with `slug`-based lookup
- Email template preview endpoint
- Test email send with template variables
- Email delivery logging

### 2.18 Flash Cards
- Flash card decks attached to lessons
- Deck configuration (title, description, shuffle, publish)
- Card management (front, back, hint, image URL, order)
- Study sessions with known/unknown tracking
- Study history per deck

### 2.19 Activity Module
- Activity types: quiz, flashcard, video, file, assignment
- Activities attached to lessons with ordered list
- Published/draft status
- Activity reordering within lessons

### 2.20 Payment System
- SePay payment gateway integration
- QR code generation for paid course enrollment
- Webhook handler with Bearer token validation
- Payment history per user (status: pending, completed, failed, expired)
- Auto-enrollment on payment completion

### 2.21 Organization Module
- Single-organization profile (name, short name, email, phone, address, city, country)
- Extended fields: website, description, logo URL, favicon URL, tax code, founded year, Facebook/LinkedIn URLs
- Public GET endpoint for frontend footer/contact display
- Admin PUT endpoint (admin only)
- Architecture supports future multi-tenant expansion

### 2.22 Department Module
- Tree-structured department hierarchy (self-referencing `parentId`)
- Linked to `Organization` via `organizationId` FK
- Slug auto-generated from name
- `orderIndex` for sibling sorting; `status` (active/inactive)
- Optional `departmentId` FK on `Profile` to assign users to departments
- Admin CRUD UI at `/admin/settings/departments` with tree view

### 2.23 Contact Sync (Marketing Integration)
- One-way sync from LMS to external marketing platforms (Mailchimp, Brevo)
- Provider selected via Settings table (`contact_sync_provider` key)
- Event-driven triggers: register, enroll, profile update, course completion
- Contact tagged by role (`role:student`), enrolled courses (`enrolled:{slug}`), completed courses (`completed:{slug}`)
- Completion trigger removes `enrolled:` tag and adds `completed:` tag
- Bulk sync endpoint for initial import or manual re-sync
- `ContactSyncLog` table tracks every operation (status: pending/success/failed)
- Admin endpoints: status, verify connection, logs, manual user sync

---

## 3. Functional Requirements

### 3.1 Authentication Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| REG-001 | Users can register with email and password | Must Have |
| REG-002 | Users can log in with email and password | Must Have |
| REG-003 | Users can log out | Must Have |
| REG-004 | Users can reset their password | Must Have |
| REG-005 | JWT tokens are used for API authentication | Must Have |
| REG-006 | Admin can toggle email verification requirement | Should Have |

### 3.2 Users Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| USR-001 | Users can view their profile | Must Have |
| USR-002 | Users can edit their profile | Must Have |
| USR-003 | Users can upload avatar | Should Have |
| USR-004 | Admin can assign roles | Must Have |
| USR-005 | Admin can search and list all users | Must Have |
| USR-006 | Admin can deactivate/reactivate users | Should Have |
| USR-007 | Users can view enrolled courses | Must Have |
| USR-008 | Users can view quiz history | Must Have |
| USR-009 | Dashboard API returns stats and recent activity | Must Have |
| USR-010 | Users can be assigned to a department | Should Have |

### 3.3 Course Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| CRS-001 | Instructors can create new courses | Must Have |
| CRS-002 | Instructors can edit course details | Must Have |
| CRS-003 | Instructors can delete courses | Must Have |
| CRS-004 | Courses can have sections and lessons | Must Have |
| CRS-005 | Courses can be categorized | Should Have |
| CRS-006 | Courses can be free or paid | Should Have |
| CRS-007 | Course publishing workflow | Must Have |
| CRS-008 | Multiple instructors per course (primary + co-instructors) | Should Have |
| CRS-009 | Students can review and rate courses | Should Have |
| CRS-010 | Lessons can have prerequisites and drip content rules | Should Have |

### 3.4 SCORM Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| SCO-001 | Instructors can upload SCORM 1.2/2004 ZIP packages | Must Have |
| SCO-002 | imsmanifest.xml is parsed automatically | Must Have |
| SCO-003 | SCORM content served via Next.js proxy (same origin) | Must Have |
| SCO-004 | window.API / window.API_1484_11 shim injected before iframe | Must Have |
| SCO-005 | Runtime data (score, completion, suspend_data) tracked | Must Have |
| SCO-006 | LMSFinish syncs completion to LessonProgress | Must Have |
| SCO-007 | Standalone course-level SCORM mode | Should Have |

### 3.5 Lesson Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| LSN-001 | Instructors can create lessons | Must Have |
| LSN-002 | Lessons support video content | Must Have |
| LSN-003 | Lessons support PDF content | Should Have |
| LSN-004 | Lessons support text content | Must Have |
| LSN-005 | Lessons support SCORM packages | Should Have |
| LSN-006 | Lessons can be marked as preview | Should Have |
| LSN-007 | Lesson progress is tracked | Must Have |
| LSN-008 | Lesson prerequisites block access until prior lesson is completed | Should Have |
| LSN-009 | Drip content can delay access by days or fixed date | Should Have |

### 3.6 Quiz Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| QZ-001 | Instructors can create quizzes | Must Have |
| QZ-002 | Quizzes support multiple question types | Must Have |
| QZ-003 | Quiz time limits can be set | Should Have |
| QZ-004 | Quiz attempts are tracked | Must Have |
| QZ-005 | Quiz results are calculated automatically | Must Have |
| QZ-006 | Quiz questions can be shuffled | Should Have |
| QZ-007 | Question navigator shows status | Should Have |
| QZ-008 | Questions can be flagged for review | Should Have |
| QZ-009 | Timer warnings at 5min and 1min | Should Have |
| QZ-010 | Exit protection prevents data loss | Should Have |

### 3.7 Question Bank Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| QB-001 | Question banks can be created | Must Have |
| QB-002 | Questions can be added to banks | Must Have |
| QB-003 | Questions can be imported from CSV | Should Have |
| QB-004 | Questions can be imported from Excel | Should Have |
| QB-005 | Questions can have multiple types | Must Have |

### 3.8 Grading Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| GRD-001 | Pending essay answers are queued for instructor grading | Must Have |
| GRD-002 | Instructor can grade individual answers with score and feedback | Must Have |
| GRD-003 | Grading filtered by quiz | Should Have |

### 3.9 Progress & Enrollment Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| ENR-001 | Students can enroll in courses | Must Have |
| ENR-002 | Student progress is tracked | Must Have |
| ENR-003 | Lesson completion is recorded | Must Have |
| ENR-004 | Course completion is tracked | Should Have |
| ENR-005 | Admin can bulk-enroll users via CSV/Excel | Should Have |

### 3.10 Learning Paths Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| LP-001 | Instructors can create learning paths with ordered courses | Should Have |
| LP-002 | Courses in a path can be marked required or optional | Should Have |
| LP-003 | Progress is tracked across learning path courses | Should Have |
| LP-004 | Learning paths can be published or kept as draft | Should Have |

### 3.11 Assignment Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| ASN-001 | Instructors can create assignment activities with instructions | Should Have |
| ASN-002 | Students can submit files with a comment | Should Have |
| ASN-003 | Instructors can grade submissions with score and feedback | Should Have |
| ASN-004 | Due dates and late submission policies are enforced | Should Have |

### 3.12 Certificate Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| CERT-001 | Certificate issued on 100% lesson completion | Should Have |
| CERT-002 | Certificate issued on quiz pass | Should Have |
| CERT-003 | Certificate can be downloaded as PDF | Should Have |
| CERT-004 | Duplicate certificates prevented | Should Have |
| CERT-005 | Certificate has unique certificateNumber and templateData | Should Have |

### 3.13 Notification Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| NOT-001 | Users receive quiz result notifications | Should Have |
| NOT-002 | Users receive enrollment notifications | Should Have |
| NOT-003 | Users receive grading notifications | Should Have |
| NOT-004 | Bell icon shows unread count | Should Have |

### 3.14 Settings Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| SET-001 | Admin can manage system settings | Should Have |
| SET-002 | White label branding customization | Should Have |
| SET-003 | Email provider configuration | Should Have |
| SET-004 | Email verification toggle | Should Have |

### 3.15 Emails Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| EMAIL-001 | SMTP email provider support | Should Have |
| EMAIL-002 | Resend API provider support | Should Have |
| EMAIL-003 | Custom HTML email templates | Should Have |
| EMAIL-004 | Email template preview | Should Have |
| EMAIL-005 | Test email send with template | Should Have |
| EMAIL-006 | Email delivery logging | Should Have |

### 3.16 Flash Cards Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| FC-001 | Flash card decks attached to lessons | Should Have |
| FC-002 | Deck CRUD operations | Should Have |
| FC-003 | Card management (create/edit/delete/reorder) | Should Have |
| FC-004 | Study session with flip cards | Should Have |
| FC-005 | Known/unknown tracking | Should Have |
| FC-006 | Study history | Should Have |

### 3.17 Activity Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| ACT-001 | Activities attached to lessons | Should Have |
| ACT-002 | Activity types: quiz, flashcard, video, file, assignment | Should Have |
| ACT-003 | Create/read/update/delete activities | Should Have |
| ACT-004 | Activity reordering | Should Have |
| ACT-005 | Content URL for video/file types | Should Have |
| ACT-006 | Published/draft status | Should Have |

### 3.18 Payment Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| PAY-001 | Create payment for a paid course | Must Have |
| PAY-002 | Generate QR code via SePay | Must Have |
| PAY-003 | Handle SePay webhook callbacks | Must Have |
| PAY-004 | Track payment status (pending, completed, failed, expired) | Must Have |
| PAY-005 | View payment history per user | Should Have |
| PAY-006 | Enroll user automatically on payment completion | Must Have |

### 3.19 Organization Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| ORG-001 | Store organization profile (name, contact, address, social) | Should Have |
| ORG-002 | Public GET endpoint for footer/contact display | Should Have |
| ORG-003 | Admin can update organization info | Should Have |
| ORG-004 | Single default organization seeded on startup | Should Have |

### 3.20 Department Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| DEPT-001 | Tree-structured department hierarchy | Should Have |
| DEPT-002 | Admin CRUD for departments | Should Have |
| DEPT-003 | Users can be assigned to departments | Should Have |
| DEPT-004 | Status (active/inactive) and ordering support | Should Have |

### 3.21 Contact Sync Module
| Requirement | Description | Priority |
|-------------|-------------|----------|
| CS-001 | Admin can enable/disable contact sync via Settings | Should Have |
| CS-002 | Mailchimp provider support (Marketing API v3) | Should Have |
| CS-003 | Brevo provider support (Contacts API v3) | Should Have |
| CS-004 | Contacts tagged by role, enrolled/completed courses | Should Have |
| CS-005 | Sync triggered on register, enroll, profile update, completion | Should Have |
| CS-006 | Admin bulk sync endpoint | Should Have |
| CS-007 | Admin can view sync logs with status filtering | Should Have |
| CS-008 | Admin can verify provider connection | Should Have |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- API response time under 500ms for standard operations
- Page load time under 3 seconds
- SCORM ZIP extraction under 10 seconds for packages up to 100MB

### 4.2 Security
- All API endpoints require authentication except public routes
- Passwords securely hashed via Supabase Auth
- JWT tokens have appropriate expiration times
- Input validation on all endpoints via class-validator
- SQL injection prevention via Prisma ORM
- Role-based access control for sensitive operations
- SePay webhook Bearer token validation
- Contact sync credentials stored in Settings table, never in code or environment variables

### 4.3 Scalability
- Modular NestJS architecture for easy scaling
- Database queries optimized with proper indexing
- Frontend code splitting for optimized bundles
- Event emitter is in-process (single instance); use message broker for horizontal scaling

### 4.4 Maintainability
- Clear code organization following NestJS and Next.js best practices
- Consistent naming conventions
- TypeScript strict mode enabled
- ESLint and Prettier configuration

---

## 5. Database Schema Overview

### Core Entities
- **Profile**: User profile with role, `emailVerified`, optional `departmentId`
- **Category**: Course categories with hierarchy
- **Course**: Course metadata with `averageRating`, `totalReviews`, `lessonCount`
- **Section**: Course sections for organization
- **Lesson**: Individual learning content units with prerequisite and drip content
- **Enrollment**: Student course enrollments
- **LessonProgress**: Student progress tracking

### Quiz Entities
- **QuestionBank**: Collection of reusable questions
- **Question**: Individual question with options
- **QuestionOption**: Answer options for questions
- **Quiz**: Quiz configuration linked to Activity
- **QuizQuestion**: Quiz-question associations (supports bank-based random selection)
- **QuizAttempt**: Student quiz attempts with timer sync
- **AttemptQuestion**: Questions in an attempt with flag status and options order
- **QuizAnswer**: Student answers to questions

### SCORM Entities
- **ScormPackage**: Package metadata (version, entryPoint, extractedPath, manifestData)
- **ScormAttempt**: Per-user runtime state (lessonStatus, completionStatus, scores, suspendData)

### Organization Entities
- **Organization**: LMS organization profile (name, contact, social links, branding)
- **Department**: Tree-structured departments linked to Organization; optional FK on Profile

### Learning & Assignment Entities
- **LearningPath**: Curated course sequence with publish status
- **LearningPathCourse**: Ordered courses in a path (isRequired flag)
- **Assignment**: Assignment activity config (instructions, dueDate, fileTypes, maxScore)
- **AssignmentSubmission**: Student file submission with grader feedback

### Course Interaction Entities
- **CourseReview**: Student review (rating 1-5, comment) with unique userId+courseId
- **CourseInstructor**: Many-to-many join (role: primary | co_instructor)

### Supporting Entities
- **Certificate**: Course completion certificates (certificateNumber, templateData, pdfUrl)
- **Notification**: User notifications
- **Setting**: System settings (key-value)
- **EmailTemplate**: HTML email templates with slug
- **EmailLog**: Email delivery logs
- **FlashCardDeck**: Flash card decks per lesson
- **FlashCard**: Individual flash cards
- **FlashCardSession**: Study session tracking
- **Activity**: Lesson activities (quiz, flashcard, video, file, assignment)
- **Payment**: SePay payment records
- **ContactSyncLog**: Contact sync operation audit log

---

## 6. API Endpoints Overview

### Authentication
- `POST /auth/register` - Register (respects `auth.require_email_verification` setting)
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me/profile` - Update profile
- `PUT /users/me/avatar` - Upload avatar
- `GET /users/me/dashboard` - Student dashboard stats
- `GET /users/me/courses` - Enrolled courses
- `GET /users/me/quiz-history` - Quiz attempt history
- `GET /users/admin/all` - List all users (admin)
- `GET /users/admin/:id` - Get user by ID (admin)
- `PUT /users/admin/:id` - Update user role/status (admin)
- `DELETE /users/admin/:id` - Deactivate user (admin)

### Courses
- `GET /courses` - List courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Course Instructors
- `GET /courses/:id/instructors` - List course instructors (public)
- `POST /courses/:id/instructors/:userId` - Assign instructor
- `PUT /courses/:id/instructors/:userId` - Update instructor role
- `DELETE /courses/:id/instructors/:userId` - Remove instructor

### Course Reviews
- `GET /courses/:courseId/reviews` - List reviews (paginated)
- `GET /courses/:courseId/reviews/stats` - Rating stats (avg, count, distribution)
- `POST /courses/:courseId/reviews` - Create or update review (enrolled user)
- `DELETE /courses/:courseId/reviews/:id` - Delete review (owner or admin)

### Sections & Lessons
- `GET /courses/:id/sections` - Get sections
- `POST /courses/:id/sections` - Create section
- `PUT /sections/:id` - Update section
- `DELETE /sections/:id` - Delete section
- `PUT /courses/:id/sections/reorder` - Reorder sections
- `GET /sections/:id/lessons` - Get lessons
- `POST /sections/:id/lessons` - Create lesson
- `PUT /lessons/:id` - Update lesson
- `DELETE /lessons/:id` - Delete lesson

### SCORM
- `POST /scorm/upload/lesson/:lessonId` - Upload SCORM ZIP for a lesson
- `POST /scorm/upload/course/:courseId` - Upload SCORM ZIP for a course
- `GET /scorm/package/lesson/:lessonId` - Get package by lesson
- `GET /scorm/package/course/:courseId` - Get package by course
- `POST /scorm/attempts/init` - Initialize SCORM attempt
- `PUT /scorm/attempts/:id` - Update SCORM runtime data
- `POST /scorm/attempts/:id/finish` - Finish attempt (syncs to LessonProgress)

### Enrollments & Progress
- `POST /courses/:id/enroll` - Enroll in course
- `GET /courses/:id/enroll/check` - Check enrollment
- `GET /enrollments/my` - My enrollments
- `GET /courses/:id/enrollments` - Course enrollments
- `POST /enrollments/bulk` - Bulk enroll users (admin, CSV/Excel)
- `POST /lessons/:id/complete` - Mark lesson complete
- `PUT /lessons/:id/progress` - Save progress
- `GET /courses/:id/progress` - Course progress
- `GET /lessons/:id/progress` - Lesson progress

### Learning Paths
- `GET /learning-paths` - List learning paths
- `POST /learning-paths` - Create learning path
- `GET /learning-paths/:id` - Get learning path
- `PUT /learning-paths/:id` - Update learning path
- `DELETE /learning-paths/:id` - Delete learning path
- `POST /learning-paths/:id/courses` - Add course to path
- `DELETE /learning-paths/:id/courses/:courseId` - Remove course from path
- `PUT /learning-paths/:id/courses/reorder` - Reorder courses in path
- `GET /learning-paths/:id/progress` - Progress across path courses

### Quizzes & Attempts
- `GET /quizzes` - List quizzes
- `POST /quizzes` - Create quiz
- `GET /quizzes/:id` - Get quiz details
- `PUT /quizzes/:id` - Update quiz
- `DELETE /quizzes/:id` - Delete quiz
- `POST /quizzes/:id/attempt` - Start quiz attempt
- `GET /attempts/:id` - Get attempt details
- `PUT /attempts/:id/submit` - Submit attempt
- `PUT /attempts/:id/answer` - Save answer
- `PUT /attempts/:id/questions/:questionId/flag` - Toggle flag

### Grading
- `GET /grading/pending` - Get pending essay answers (optionally filtered by quizId)
- `POST /grading/attempts/:attemptId/answers/:answerId/grade` - Grade an answer

### Question Banks
- `GET /question-banks` - List question banks
- `POST /question-banks` - Create question bank
- `GET /question-banks/:id` - Get question bank
- `PUT /question-banks/:id` - Update question bank
- `DELETE /question-banks/:id` - Delete question bank
- `POST /question-banks/:id/import` - Import questions (CSV/Excel)

### Assignments
- `GET /activities/:activityId/assignments` - Get assignment for activity
- `POST /activities/:activityId/assignments` - Create assignment
- `PUT /assignments/:id` - Update assignment
- `GET /assignments/:id/submissions` - List submissions (instructor)
- `POST /assignments/:id/submit` - Student file submission
- `PUT /assignments/:id/submissions/:submissionId/grade` - Grade submission

### Certificates
- `POST /certificates/issue/:courseId` - Issue certificate
- `GET /certificates/my` - Get user certificates
- `GET /certificates/:id` - Get certificate details
- `GET /certificates/:id/pdf` - Download PDF

### Reports
- `GET /reports/courses/:id` - Course report
- `GET /reports/quizzes/:id` - Quiz report
- `GET /leaderboard/:quizId` - Quiz leaderboard

### Notifications
- `GET /notifications` - Get notifications
- `GET /notifications/unread` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read

### Settings (Admin)
- `GET /settings` - Get system settings
- `PUT /settings` - Update system settings
- `GET /settings/branding` - Get branding
- `PUT /settings/branding` - Update branding

### Emails (Admin)
- `GET /emails/config` - Get email configuration
- `PUT /emails/config` - Update email configuration
- `POST /emails/test` - Send test email
- `GET /emails/templates` - Get email templates
- `GET /emails/templates/:slug` - Get email template by slug
- `POST /emails/templates` - Create email template
- `PUT /emails/templates/:slug` - Update email template
- `DELETE /emails/templates/:slug` - Delete email template
- `POST /emails/templates/:slug/preview` - Preview template with variables
- `POST /emails/templates/:slug/test` - Send test email with template
- `GET /emails/logs` - Get email logs

### Contact Sync (Admin)
- `GET /contact-sync/status` - Get sync status and stats
- `POST /contact-sync/verify` - Verify provider connection
- `GET /contact-sync/logs` - Get sync logs (paginated, filterable)
- `GET /contact-sync/logs/stats` - Get sync log statistics
- `POST /contact-sync/sync-user/:userId` - Manually sync a user

### Flash Cards
- `GET /lessons/:lessonId/flash-cards` - Get deck for lesson
- `POST /lessons/:lessonId/flash-cards` - Create deck
- `PUT /lessons/:lessonId/flash-cards` - Update deck
- `DELETE /lessons/:lessonId/flash-cards` - Delete deck
- `GET /flash-cards-deck/:deckId/cards` - Get cards
- `POST /flash-cards-deck/:deckId/cards` - Add card
- `PUT /flash-cards-deck/cards/:cardId` - Update card
- `DELETE /flash-cards-deck/cards/:cardId` - Delete card
- `PUT /flash-cards-deck/:deckId/cards/reorder` - Reorder cards
- `POST /flash-cards-deck/:deckId/start` - Start study session
- `POST /flash-cards-sessions/:sessionId/complete` - Complete session
- `GET /flash-cards-deck/:deckId/history` - Study history

### Activities
- `GET /lessons/:lessonId/activities` - Get activities for lesson
- `POST /lessons/:lessonId/activities` - Create activity
- `PUT /lessons/:lessonId/activities/reorder` - Reorder activities
- `GET /activities/:id` - Get activity
- `PUT /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity

### Payments
- `POST /payments` - Create payment for a paid course
- `POST /payments/webhook` - SePay webhook handler
- `GET /payments/my` - Get current user payments
- `GET /payments/:id/status` - Check payment status

### Organization
- `GET /organization` - Get organization info (public)
- `PUT /organization` - Update organization (admin)
- `POST /organization/seed` - Seed default organization (admin)

### Departments
- `GET /departments` - List departments (tree or flat via `?flat=true`)
- `GET /departments/:id` - Get department
- `POST /departments` - Create department (admin)
- `PUT /departments/:id` - Update department (admin)
- `DELETE /departments/:id` - Delete department (admin)

---

## 7. User Roles & Permissions

### Student
- Browse and search courses
- Enroll in courses (free or via payment)
- View and complete lessons (including SCORM)
- Take quizzes, view results
- Study flash cards
- Submit assignments
- Write course reviews (enrolled courses only)
- View progress and history
- Download certificates
- Update profile, assign to department

### Instructor
- All Student permissions
- Create and manage courses (sections, lessons, SCORM)
- Manage course instructors (assign co-instructors)
- Create and manage quizzes, question banks
- Import questions from CSV/Excel
- Create flash card decks
- Create assignments and grade submissions
- Create and manage learning paths
- View course and quiz reports
- Grade quiz attempts (essays) via grading portal
- View leaderboard

### Admin
- All Instructor and Student permissions
- Manage system settings
- Configure white label branding
- Configure email providers and templates
- Toggle email verification requirement
- View email logs
- Configure and monitor contact sync (Mailchimp/Brevo)
- Manage organization profile
- Manage department hierarchy
- Assign roles to users
- Bulk enroll users
- Access admin portal (courses, quizzes, flash cards, question banks, reports)

---

## 8. Acceptance Criteria

### Authentication
- [x] Users can register with email/password
- [x] Email verification toggle works (admin can enable/disable)
- [x] Users can login and receive JWT token
- [x] Protected routes require valid token
- [x] Password reset flow works

### Courses
- [x] Instructors can create courses with sections and lessons
- [x] SCORM 1.2 and 2004 packages can be uploaded and played
- [x] Students can browse, enroll, and learn
- [x] Course progress tracked accurately
- [x] Students can review and rate courses
- [x] Lesson prerequisites block access until satisfied
- [x] Drip content availability enforced before lesson access

### Quizzes
- [x] Quizzes work with all 8 question types
- [x] Quiz UX enhancements (navigator, flags, timer, exit protection)
- [x] Question banks with CSV/Excel import
- [x] Manual grading for essay answers via grading portal

### Learning Paths & Assignments
- [x] Learning paths with ordered courses and required/optional flags
- [x] Assignment activity type with submission and grading workflow

### Payments
- [x] SePay QR code payment flow works
- [x] Webhook auto-enrolls on completion
- [x] Payment history tracked

### Flash Cards & Activities
- [x] Flash card decks with study sessions
- [x] Activity module with all types (quiz, flashcard, video, file, assignment)

### Organization & Departments
- [x] Organization profile editable by admin
- [x] Department tree CRUD works
- [x] Users assignable to departments

### Email
- [x] SMTP and Resend providers configurable
- [x] Templates customizable with preview and test-send
- [x] Email logs tracked

### Contact Sync
- [x] Mailchimp and Brevo providers configurable via Settings
- [x] Contacts synced on register/enroll/update/completion events
- [x] Admin can view logs and manually trigger sync

---

## 9. Project Structure

```
tiny-lms/
├── frontend/
│   ├── app/
│   │   ├── (auth)/               # Login, register
│   │   ├── (dashboard)/          # Student/instructor/admin dashboard, /dashboard/profile
│   │   ├── (public)/             # Course catalog, payment
│   │   ├── (student)/            # Lesson viewer, profile
│   │   ├── instructor/           # Instructor portal (courses, reports, quizzes, flash-cards)
│   │   ├── admin/                # Admin portal
│   │   │   ├── dashboard/        # Admin dashboard with charts
│   │   │   ├── users/            # User management
│   │   │   ├── courses/          # Course management
│   │   │   ├── quizzes/          # Quiz management + grading
│   │   │   ├── flash-cards/      # Flash card management
│   │   │   ├── question-banks/   # Question bank management
│   │   │   ├── reports/          # Reports
│   │   │   └── settings/         # Settings tabs (email, branding, auth, org, departments)
│   │   ├── quizzes/              # Quiz pages
│   │   └── certificates/         # Certificate pages
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── charts/               # Recharts wrappers (area, bar, line, pie, heatmap)
│   │   ├── quiz/                 # Quiz components (navigator, timer, flags)
│   │   ├── flash-card/           # Flash card components
│   │   ├── activity/             # Activity components
│   │   └── retroui/              # NeoBrutalism landing page
│   └── lib/                      # api.ts, auth-context.tsx, query-keys.ts, supabase.ts
│
├── backend/
│   ├── src/
│   │   ├── common/               # Guards, decorators, enums, shared services
│   │   └── modules/              # 27 feature modules
│   │       ├── auth/             # Authentication
│   │       ├── users/            # User management
│   │       ├── courses/          # Courses + reviews + instructors
│   │       ├── sections/         # Sections
│   │       ├── lessons/          # Lessons + prerequisites + drip content
│   │       ├── scorm/            # SCORM upload, serve, runtime
│   │       ├── enrollments/      # Enrollments + bulk enrollment
│   │       ├── progress/         # Progress tracking
│   │       ├── question-banks/   # Question banks + import
│   │       ├── questions/        # Questions
│   │       ├── quizzes/          # Quizzes
│   │       ├── attempts/         # Quiz attempts
│   │       ├── grading/          # Manual grading queue
│   │       ├── certificates/     # Certificates
│   │       ├── reports/          # Reports + leaderboard
│   │       ├── notifications/    # Notifications
│   │       ├── settings/         # System settings
│   │       ├── emails/           # Email (SMTP/Resend) + templates + logs
│   │       ├── flash-cards/      # Flash cards
│   │       ├── activities/       # Activities
│   │       ├── payments/         # SePay payments
│   │       ├── organization/     # Organization profile
│   │       ├── departments/      # Department hierarchy
│   │       ├── learning-paths/   # Learning paths
│   │       ├── assignments/      # Assignments + submissions + grading
│   │       └── contact-sync/     # Mailchimp/Brevo contact sync
│   └── prisma/schema.prisma
│
└── docs/                         # Project documentation
```

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-02-27 | Initial release with core LMS features |
| 1.1.0 | 2026-02-28 | Quiz UX enhancements, Certificates, Notifications |
| 1.2.0 | 2026-02-28 | Admin Dashboard, Settings, White Label, Email Notifications |
| 1.3.0 | 2026-02-28 | TanStack Query migration, Vitest infrastructure, SePay payment |
| 1.4.0 | 2026-02-28 | Flash Card module with study sessions |
| 1.5.0 | 2026-03-01 | Activity module (quiz/flashcard/video/file types) |
| 1.6.0 | 2026-03-03 | RBAC enhancements, dashboard routing fix, header/footer components |
| 1.7.0 | 2026-03-03 | SCORM 1.2 + 2004 support (5 phases complete) |
| 1.8.0 | 2026-03-04 | Course reviews & ratings, instructor management UI |
| 1.9.0 | 2026-03-04 | Email verification toggle, email template preview/test improvements |
| 1.10.0 | 2026-03-04 | Organization module, Department module (tree hierarchy) |
| 1.11.0 | 2026-03-08 | Architecture improvement: Prisma-first ORM, lesson prerequisites, drip content, learning paths, assignments, bulk enrollment, certificate enhancement |
| 1.12.0 | 2026-03-14 | Contact sync module (Mailchimp/Brevo), Grading module, Questions module, admin portal pages (courses/quizzes/flash-cards/question-banks/reports/dashboard), role-based dashboard, charts |

---

*Document Last Updated: 2026-03-14*
