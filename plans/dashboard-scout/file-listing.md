# Tiny LMS Dashboard - Complete File Listing

## Dashboard Pages (Route Handlers)

### Main Dashboard Routes
```
/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/dashboard/page.tsx
- Dual-purpose: Student & Instructor dashboard
- Route: /dashboard
- ~375 lines
```

### Progress & Analytics
```
/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/dashboard/progress/page.tsx
- Student progress analytics page
- Route: /dashboard/progress
- ~140 lines
```

### Profile Management
```
/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/dashboard/profile/page.tsx
- User profile edit page
- Route: /dashboard/profile
- ~203 lines
```

### Admin Dashboard
```
/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/dashboard/page.tsx
- Admin system statistics dashboard
- Route: /admin/dashboard
- ~149 lines
```

---

## Layout Components

### Dashboard Layout Wrapper
```
/home/trung/workspace/project/private/tiny-lms/frontend/app/(dashboard)/layout.tsx
- Wraps all /dashboard/* pages
- Provides DashboardHeader and DashboardFooter
- Authentication/protection enforcement
```

---

## Dashboard Components

### Header Component
```
/home/trung/workspace/project/private/tiny-lms/frontend/components/layout/dashboard/DashboardHeader.tsx
- Main navigation header
- Role-based menu rendering
- User dropdown with profile links
- Sticky positioning (z-50)
- ~177 lines
```

### Notification Bell Component
```
/home/trung/workspace/project/private/tiny-lms/frontend/components/layout/dashboard/NotificationBell.tsx
- Bell icon with unread count
- Notification dropdown panel
- Mark as read functionality
- Auto-routing based on notification type
- ~182 lines
```

### Footer Component
```
/home/trung/workspace/project/private/tiny-lms/frontend/components/layout/dashboard/DashboardFooter.tsx
- Footer with copyright and links
- Simple navigation links
- ~26 lines
```

### Dashboard Components Index
```
/home/trung/workspace/project/private/tiny-lms/frontend/components/layout/dashboard/index.ts
- Exports: DashboardHeader, DashboardFooter, NotificationBell
```

---

## Core API & Query Files

### API Client
```
/home/trung/workspace/project/private/tiny-lms/frontend/lib/api.ts
- Main API client for all endpoints
- Includes dashboard-specific endpoints
- ~479 lines
- Key exports:
  - reportsApi (admin, instructor reports)
  - usersApi (profile, dashboard data)
  - userActivityApi (activity tracking)
```

### Query Keys Configuration
```
/home/trung/workspace/project/private/tiny-lms/frontend/lib/query-keys.ts
- React Query key definitions
- Dashboard-related keys:
  - queryKeys.profile()
  - queryKeys.dashboard()
  - queryKeys.activity(months)
  - queryKeys.adminReports.*
  - queryKeys.instructorReports.*
- ~163 lines
```

---

## Chart Components (Used in Dashboards)

```
/home/trung/workspace/project/private/tiny-lms/frontend/components/charts/LineChartCard.tsx
- Line chart wrapper (user growth, enrollment trends)

/home/trung/workspace/project/private/tiny-lms/frontend/components/charts/AreaChartCard.tsx
- Area chart wrapper (quiz performance, activity trends)

/home/trung/workspace/project/private/tiny-lms/frontend/components/charts/BarChartCard.tsx
- Bar chart wrapper (revenue data)

/home/trung/workspace/project/private/tiny-lms/frontend/components/charts/ActivityHeatmap.tsx
- Activity heatmap visualization
```

---

## Supporting Components

### Export Button Component
```
/home/trung/workspace/project/private/tiny-lms/frontend/components/export-button.tsx
- Used in dashboard pages for CSV export
```

### Export CSV Utility
```
/home/trung/workspace/project/private/tiny-lms/frontend/lib/export-csv.ts
- CSV generation and download utility
```

---

## Supporting Files

### Authentication Context
```
/home/trung/workspace/project/private/tiny-lms/frontend/lib/auth-context.tsx
- AuthProvider wrapper
```

### Protected Route Component
```
/home/trung/workspace/project/private/tiny-lms/frontend/components/auth/ProtectedRoute.tsx
- Route protection for authenticated pages
```

### Supabase Configuration
```
/home/trung/workspace/project/private/tiny-lms/frontend/lib/supabase.ts
- Supabase client initialization
```

---

## Related Documentation

### Dashboard Analysis Report
```
/home/trung/workspace/project/private/tiny-lms/plans/20260224-0000-tiny-lms-complete/reports/dashboard-analysis.md
- Previous analysis of dashboard implementation
- Known gaps and improvements
```

---

## File Count Summary

| Category | Count |
|----------|-------|
| Dashboard Pages | 4 |
| Layout Components | 1 |
| Dashboard Components | 3 |
| Chart Components | 4 |
| Core Files (API, Query) | 2 |
| Supporting Files | 5 |
| **Total Source Files** | **19** |

---

## Key Data Structures

### Student Dashboard Data
```typescript
interface StudentDashboard {
  stats: {
    totalCourses: number;
    completedCourses: number;
    totalQuizzes: number;
  };
  enrolledCourses: Array<{
    courseId: string;
    courseTitle: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
  }>;
  recentActivity: Array<{
    id: string;
    quizTitle: string;
    score: number;
    isPassed: boolean;
    submittedAt: string;
  }>;
}
```

### Instructor Dashboard Data
```typescript
interface InstructorDashboard {
  stats: {
    totalCourses: number;
    totalEnrollments: number;
    totalAttempts: number;
    pendingGrading: number;
    averageScore: number;
    passRate: number;
  };
  courses: Array<{
    id: string;
    title: string;
    enrollments: number;
  }>;
  recentAttempts: Array<{
    id: string;
    studentName: string;
    quizTitle: string;
    score: number;
    status: string;
  }>;
}
```

### Admin Dashboard Stats
```typescript
interface AdminDashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers30d: number;
  totalRevenue: number;
  pendingPayments: number;
}
```

---

## API Endpoints by Category

### User Profile Endpoints
- `GET /users/me` - Current user profile
- `PUT /users/me/profile` - Update profile

### Dashboard Data Endpoints
- `GET /users/me/dashboard` - Student dashboard data
- `GET /reports/dashboard` - Instructor dashboard data
- `GET /reports/dashboard/trends?months=N` - Trend data

### Admin Reporting Endpoints
- `GET /reports/admin/dashboard` - Admin stats
- `GET /reports/admin/trends?months=N` - Growth trends
- `GET /reports/admin/top-courses?limit=N` - Top courses ranking
- `GET /reports/admin/revenue?months=N` - Revenue data

### User Activity Endpoints
- `GET /users/me/quiz-history` - User's quiz attempts
- `GET /users/me/activity?months=N` - Daily activity data

### Notification Endpoints
- `GET /notifications?limit=N` - List notifications
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read

---

## Primary Locations

Both locations contain identical structure:
- `/home/trung/workspace/project/private/tiny-lms/` (Primary)
- `/home/trung/Desktop/Projects/private/tiny-lms/` (Mirror)

All file paths reference the primary workspace location.
