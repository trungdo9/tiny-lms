# Tiny LMS Dashboard Scout Report

**Date:** March 8, 2026  
**Scope:** Frontend dashboard pages, components, and API calls  
**Locations Searched:**
- `/home/trung/workspace/project/private/tiny-lms/`
- `/home/trung/Desktop/Projects/private/tiny-lms/`

---

## Executive Summary

The Tiny LMS frontend implements a role-based dashboard system with separation between Student, Instructor, and Admin dashboards. All dashboard implementations are found in the same codebase location but render different content based on user role.

**Total Dashboard Files Found:** 11 core source files + 3 dashboard components

---

## Dashboard Pages & Routes

### 1. Student Dashboard
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/dashboard/page.tsx`

**Route:** `/dashboard`

**Key Features:**
- Enrolled courses overview with progress bars
- Continue learning section (first incomplete course)
- Stats cards: Enrolled, Completed, Quizzes Taken
- Recent quiz activity with scores and pass/fail status
- Quick links to courses and quiz history

**API Calls:**
- `GET /users/me` - Fetch user profile & role
- `GET /users/me/dashboard` - Student dashboard data
- `GET /reports/dashboard/trends?months=6` - Instructor trends (dual-role display)

**Data Structure:**
```typescript
interface StudentData {
  stats: { totalCourses; completedCourses; totalQuizzes };
  enrolledCourses: { courseId; courseTitle; progress; totalLessons; completedLessons }[];
  recentActivity: { id; quizTitle; score; isPassed; submittedAt }[];
}
```

---

### 2. Instructor Dashboard
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/dashboard/page.tsx` (same file, role-based rendering)

**Route:** `/dashboard`

**Key Features:**
- Stats cards: Total Courses, Enrollments, Attempts, Pending Grading, Avg Score, Pass Rate
- Enrollment trends chart (6-month line chart)
- Quiz performance chart (6-month area chart with attempts & scores)
- My Courses section with enrollment counts
- Recent submissions list with student name, quiz title, and scores
- Quick Actions section: Grading Queue, Question Banks

**API Calls:**
- `GET /users/me` - Fetch user profile & role
- `GET /reports/dashboard` - Instructor dashboard data
- `GET /reports/dashboard/trends?months=6` - Enrollment & quiz attempt trends

**Data Structure:**
```typescript
interface InstructorData {
  stats: { totalCourses; totalEnrollments; totalAttempts; pendingGrading; averageScore; passRate };
  courses: { id; title; enrollments }[];
  recentAttempts: { id; studentName; quizTitle; score; status }[];
}
```

---

### 3. Admin Dashboard
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/dashboard/page.tsx`

**Route:** `/admin/dashboard`

**Key Features:**
- System-wide stats: Total Users, Courses, Enrollments, Active Users (30d), Revenue, Pending Payments
- Time period selector: 3/6/12 months
- User growth trend chart (line chart)
- Enrollment trends chart (line chart)
- Revenue chart (bar chart)
- Top courses by enrollment (table with rankings)
- CSV export functionality for top courses

**API Calls:**
- `GET /reports/admin/dashboard` - Admin stats
- `GET /reports/admin/trends?months={3|6|12}` - User growth & enrollment trends
- `GET /reports/admin/top-courses?limit=10` - Top courses list
- `GET /reports/admin/revenue?months={3|6|12}` - Revenue data

**Data Structure:**
```typescript
interface AdminStats {
  totalUsers; totalCourses; totalEnrollments; activeUsers30d; totalRevenue; pendingPayments
}

interface Trends {
  userGrowth: { month; count }[];
  enrollmentTrends: { month; count }[];
}
```

---

### 4. Student Progress/Analytics Page
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/dashboard/progress/page.tsx`

**Route:** `/dashboard/progress`

**Key Features:**
- Summary stats: Enrolled, Completed, Avg Quiz Score, Quizzes Taken
- Per-course progress with completion indicators
- Quiz score trend chart (6-month area chart)
- Activity heatmap showing daily engagement
- CSV export for course progress

**API Calls:**
- `GET /users/me/dashboard` - Student dashboard data
- `GET /users/me/quiz-history` - Quiz history list
- `GET /users/me/activity?months=6` - Daily activity heatmap data

**Data Structure:**
```typescript
interface QuizHistory {
  id; submittedAt; score; isPassed
}

interface Activity {
  daily: { date; count }[]
}
```

---

### 5. Student Profile Page
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/dashboard/profile/page.tsx`

**Route:** `/dashboard/profile`

**Key Features:**
- User profile card with avatar and role badge
- Edit form for personal info (Full Name, Bio, Phone)
- Profile sync with authentication system
- Success/error messaging
- Form validation and submission handling

**API Calls:**
- `GET /users/me` - Fetch current profile
- `PUT /users/me/profile` - Update profile information

---

## Dashboard Layout Component

**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/layout.tsx`

**Purpose:** Shared layout for all dashboard pages under the `(dashboard)` route group

**Features:**
- Authentication provider wrapper
- Protected route enforcement
- DashboardHeader component
- DashboardFooter component
- Flex layout with dynamic main content

**Children Routes:**
- `/dashboard` - Main dashboard
- `/dashboard/profile` - Profile settings
- `/dashboard/progress` - Progress analytics

---

## Dashboard Components

### 1. DashboardHeader Component
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/components/layout/dashboard/DashboardHeader.tsx`

**Features:**
- Dark header with Tiny LMS branding
- Sticky positioning (z-50)
- Navigation links based on user role:
  - **Students:** Explore Courses, Quizzes, Certificates
  - **Instructors:** Courses, Quizzes, Banks, Flash Cards, Grading, Reports
  - **Admins:** Admin Dashboard, Users, Settings (in addition to instructor links)
- User profile dropdown with avatar
- Notification bell component integration
- Mobile-responsive navigation

**API Calls:**
- `GET /users/me` - Fetch profile for role detection

---

### 2. NotificationBell Component
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/components/layout/dashboard/NotificationBell.tsx`

**Features:**
- Bell icon with unread count badge
- Dropdown panel with notification list (max 10)
- Notifications support types: quiz_result, grading_complete, enrollment, course_published
- Mark as read (individual & bulk)
- Auto-routing to relevant pages based on notification type
- Click-outside detection to close dropdown

**API Calls:**
- `GET /notifications?limit=10` - Fetch notifications
- `PUT /notifications/{id}/read` - Mark single notification as read
- `PUT /notifications/read-all` - Mark all as read

**Notification Types & Routes:**
| Type | Route |
|------|-------|
| quiz_result | /profile/history |
| grading_complete | /profile/history |
| enrollment | /instructor/courses |
| course_published | /courses |
| default | /dashboard |

---

### 3. DashboardFooter Component
**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/components/layout/dashboard/DashboardFooter.tsx`

**Features:**
- Copyright year auto-update
- Links: Dashboard, My Profile
- Custom font styling (Space Grotesk)
- Simple footer with minimal navigation

---

## API Endpoints Summary

### Dashboard Data APIs
| Endpoint | Method | Role | Purpose |
|----------|--------|------|---------|
| `/users/me` | GET | All | User profile & role detection |
| `/users/me/dashboard` | GET | Student | Student dashboard data |
| `/reports/dashboard` | GET | Instructor | Instructor dashboard data |
| `/reports/dashboard/trends?months={n}` | GET | Instructor | Enrollment & quiz trends |
| `/users/me/quiz-history` | GET | Student | Historical quiz attempts |
| `/users/me/activity?months={n}` | GET | Student | Daily activity data |
| `/reports/admin/dashboard` | GET | Admin | System-wide stats |
| `/reports/admin/trends?months={n}` | GET | Admin | User & enrollment growth |
| `/reports/admin/top-courses?limit={n}` | GET | Admin | Top courses ranking |
| `/reports/admin/revenue?months={n}` | GET | Admin | Revenue statistics |

### User Management APIs (Header/Profile)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users/me/profile` | PUT | Update profile info |
| `/notifications?limit={n}` | GET | List notifications |
| `/notifications/{id}/read` | PUT | Mark notification as read |
| `/notifications/read-all` | PUT | Mark all notifications as read |

---

## Query Keys Configuration

**File:** `/home/trung/workspace/project/private/tiny-lms/frontend/lib/query-keys.ts`

Dashboard-related query keys:
```typescript
queryKeys.profile() // ['profile']
queryKeys.dashboard() // ['dashboard']
queryKeys.quizHistory() // ['quiz-history']
queryKeys.activity(months) // ['activity', months]
queryKeys.adminReports.dashboard() // ['admin', 'reports', 'dashboard']
queryKeys.adminReports.trends(months) // ['admin', 'reports', 'trends', months]
queryKeys.adminReports.topCourses(limit) // ['admin', 'reports', 'top-courses', limit]
queryKeys.adminReports.revenue(months) // ['admin', 'reports', 'revenue', months]
queryKeys.instructorReports.trends(months) // ['instructor', 'reports', 'trends', months]
queryKeys.notifications.list() // ['notifications']
```

---

## Role-Based Access Control

**Dashboard Rendering Flow:**
1. Fetch user profile from `/users/me`
2. Extract `role` field (student, instructor, or admin)
3. Conditionally render dashboard:
   - **admin** or **instructor**: Instructor dashboard with admin-specific nav
   - **student**: Student dashboard with student-specific nav
4. Admin-only features appear in DashboardHeader when role === 'admin'

**Navigation Separation:**
- Header component detects role and renders appropriate links
- Admin users see additional "Admin Dashboard" and "Settings" links
- Instructor-only features hidden for students
- Each dashboard page fetches role-specific data

---

## Data Flow Architecture

```
User Login → /users/me → Profile + Role
                            ↓
                    Is Admin? → /admin/dashboard
                    Is Instructor? → /dashboard (instructor view)
                    Is Student? → /dashboard (student view)
                            ↓
                    Fetch Role-Specific Data
                            ↓
                    Render Dashboard with Charts/Stats
```

---

## Charts & Visualization Components Used

**Library:** Recharts (via custom chart card wrappers)

**Chart Types:**
- LineChartCard: User growth, enrollment trends
- AreaChartCard: Quiz performance, scores over time
- BarChartCard: Revenue data
- ActivityHeatmap: Daily engagement heatmap

**Component Files:**
- `/frontend/components/charts/LineChartCard.tsx`
- `/frontend/components/charts/AreaChartCard.tsx`
- `/frontend/components/charts/BarChartCard.tsx`
- `/frontend/components/charts/ActivityHeatmap.tsx`

---

## Authentication & Session Management

**Method:** Supabase Auth with JWT tokens

**Flow:**
1. Get session from Supabase: `supabase.auth.getSession()`
2. Extract access token from session
3. Include in Authorization header: `Bearer {access_token}`
4. All API calls pass token to backend for validation

**Sign Out:**
```typescript
await supabase.auth.signOut();
router.push('/login');
```

---

## Critical Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `/frontend/app/(dashboard)/dashboard/page.tsx` | Student/Instructor dual dashboard | 375 |
| `/frontend/app/admin/dashboard/page.tsx` | Admin system stats dashboard | 149 |
| `/frontend/app/(dashboard)/dashboard/progress/page.tsx` | Student progress analytics | 140 |
| `/frontend/app/(dashboard)/dashboard/profile/page.tsx` | Profile settings | 203 |
| `/frontend/components/layout/dashboard/DashboardHeader.tsx` | Main navigation header | 177 |
| `/frontend/components/layout/dashboard/NotificationBell.tsx` | Notification system | 182 |
| `/frontend/lib/api.ts` | API client with all endpoints | 479 |
| `/frontend/lib/query-keys.ts` | React Query key definitions | 163 |

---

## Known Limitations & Gaps

1. **No real-time updates** - Dashboards don't update on data changes
2. **Limited error handling** - No error boundaries on chart failures
3. **No data refresh button** - Users must reload page for fresh data
4. **Hardcoded API URL** - Uses env var `NEXT_PUBLIC_API_URL`
5. **No caching strategy** - Relies on React Query defaults
6. **Missing accessibility** - Limited ARIA labels on charts
7. **No offline support** - All data fetch required
8. **CSV export limited** - Only available on admin & progress pages

---

## Search Coverage

✅ Searched in both primary and secondary locations
✅ All dashboard pages identified
✅ All components and layouts mapped
✅ API integration documented
✅ Query key configuration captured

**Note:** Desktop location mirrors workspace location with identical file structure.

