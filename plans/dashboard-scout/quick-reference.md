# Dashboard Quick Reference Guide

## Dashboard Pages Overview

| Route | File | User Role | Purpose |
|-------|------|-----------|---------|
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Student/Instructor | Main dashboard (role-based rendering) |
| `/dashboard/progress` | `app/(dashboard)/dashboard/progress/page.tsx` | Student | Progress analytics & heatmap |
| `/dashboard/profile` | `app/(dashboard)/dashboard/profile/page.tsx` | All | Profile edit & settings |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Admin | System statistics & reporting |

---

## Component Hierarchy

```
App Layout
└── (dashboard) group
    ├── layout.tsx (DashboardHeader + DashboardFooter)
    │   ├── DashboardHeader
    │   │   └── NotificationBell
    │   ├── main (children)
    │   └── DashboardFooter
    │
    ├── dashboard/page.tsx
    ├── dashboard/progress/page.tsx
    └── dashboard/profile/page.tsx

/admin
└── dashboard/page.tsx
```

---

## API Call Quick Reference

### Get User Profile & Role Detection
```typescript
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const { data: { session } } = await supabase.auth.getSession();
const res = await fetch(`${API}/users/me`, {
  headers: { Authorization: `Bearer ${session?.access_token}` }
});
```

### Get Student Dashboard
```typescript
const res = await fetch(`${API}/users/me/dashboard`, {
  headers: { Authorization: `Bearer ${session?.access_token}` }
});
// Returns: { stats, enrolledCourses, recentActivity }
```

### Get Instructor Dashboard
```typescript
const res = await fetch(`${API}/reports/dashboard`, {
  headers: { Authorization: `Bearer ${session?.access_token}` }
});
// Returns: { stats, courses, recentAttempts }
```

### Get Admin Stats
```typescript
const res = await fetch(`${API}/reports/admin/dashboard`, {
  headers: { Authorization: `Bearer ${session?.access_token}` }
});
// Returns: { totalUsers, totalCourses, totalEnrollments, ... }
```

### Get Activity Data
```typescript
const res = await fetch(`${API}/users/me/activity?months=6`, {
  headers: { Authorization: `Bearer ${session?.access_token}` }
});
// Returns: { daily: [{ date, count }, ...] }
```

### Get Notifications
```typescript
const res = await fetch(`${API}/notifications?limit=10`, {
  headers: { Authorization: `Bearer ${session?.access_token}` }
});
// Returns: { notifications: [...], unread count }
```

---

## React Query Usage

### Dashboard Queries
```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

// Profile
const { data: profile } = useQuery({
  queryKey: queryKeys.profile(),
  queryFn: fetchProfile
});

// Student dashboard
const { data: studentData } = useQuery({
  queryKey: ['dashboard', 'student'],
  queryFn: fetchStudentDashboard,
  enabled: profile?.role === 'student'
});

// Admin dashboard
const { data: stats } = useQuery({
  queryKey: queryKeys.adminReports.dashboard(),
  queryFn: () => reportsApi.adminDashboard()
});

// Activity heatmap
const { data: activity } = useQuery({
  queryKey: queryKeys.activity(6),
  queryFn: () => userActivityApi.getMyActivity(6)
});
```

---

## Navigation Links by Role

### Student Navigation
```
- Explore Courses
- Quizzes
- Certificates
```

### Instructor Navigation
```
- Courses
- Quizzes
- Banks
- Flash Cards
- Grading
- Reports
```

### Admin Navigation (in addition to Instructor)
```
- Admin Dashboard
- Users
- Settings
```

---

## Data Fetching Flow

### Student Dashboard Page
1. Fetch profile → Determine user is "student"
2. Fetch `/users/me/dashboard` → Get enrolledCourses, stats, recentActivity
3. Fetch `/users/me/quiz-history` → Get quiz score trend
4. Fetch `/users/me/activity?months=6` → Get heatmap data
5. Render student dashboard with all data

### Instructor Dashboard Page
1. Fetch profile → Determine user is "instructor" or "admin"
2. Fetch `/reports/dashboard` → Get courses, stats, recentAttempts
3. Fetch `/reports/dashboard/trends?months=6` → Get enrollment & quiz trends
4. Render instructor dashboard with charts

### Admin Dashboard Page
1. Always accessible at `/admin/dashboard` (check on backend)
2. Fetch `/reports/admin/dashboard` → Stats
3. Fetch `/reports/admin/trends?months=12` → Growth trends
4. Fetch `/reports/admin/top-courses?limit=10` → Top courses
5. Fetch `/reports/admin/revenue?months=12` → Revenue data
6. Render admin dashboard with all charts

---

## Common Patterns

### Protected Route Pattern
```typescript
<AuthProvider>
  <ProtectedRoute>
    {/* Dashboard content */}
  </ProtectedRoute>
</AuthProvider>
```

### Role-Based Rendering
```typescript
const userRole = profile?.role || 'student';

if (userRole === 'instructor' && instructorData) {
  return <InstructorDashboard data={instructorData} />;
}

return <StudentDashboard data={studentData} />;
```

### User Dropdown Menu
```typescript
const dropdownOpen = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### Sign Out Handler
```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};
```

---

## Styling & Classes

### Dashboard Header
- `bg-slate-900` - Dark background
- `sticky top-0 z-50` - Sticky positioning
- `border-b border-slate-800` - Bottom border

### Dashboard Main
- `min-h-screen bg-gray-50` - Full height with light background
- `max-w-7xl mx-auto` - Max width container
- `p-8` - Padding

### Stats Cards
- `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4` - Responsive grid
- `bg-white rounded-xl shadow-sm border border-gray-100` - Card styling

### Charts
- `grid grid-cols-1 lg:grid-cols-2 gap-6` - 2-column on desktop

---

## Component Files To Modify

If you need to:

**Add dashboard features:**
- `/frontend/app/(dashboard)/dashboard/page.tsx`
- `/frontend/app/admin/dashboard/page.tsx`

**Change header/nav:**
- `/frontend/components/layout/dashboard/DashboardHeader.tsx`

**Add notifications:**
- `/frontend/components/layout/dashboard/NotificationBell.tsx`

**Modify API calls:**
- `/frontend/lib/api.ts`

**Update query keys:**
- `/frontend/lib/query-keys.ts`

**Change layout:**
- `/frontend/app/(dashboard)/layout.tsx`

---

## Testing Dashboard Data

### API Testing
```bash
# Get your access token from Supabase
export TOKEN="your_access_token_here"

# Test student dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/users/me/dashboard

# Test instructor dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/reports/dashboard

# Test admin dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/reports/admin/dashboard
```

### Frontend Testing
1. Navigate to `/dashboard` → Should auto-route based on role
2. Check browser DevTools Network tab → Verify API calls
3. Check React DevTools → Inspect query state
4. Change time period (Admin) → Should refetch trends

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Dashboard blank | Check role detection in `/users/me` response |
| Charts not showing | Verify data returned from `/reports/*` endpoints |
| Notifications not loading | Check `/notifications` endpoint & token validity |
| Header nav links broken | Verify user role detection in DashboardHeader |
| Profile update fails | Ensure `/users/me/profile` PUT endpoint exists |

---

## Performance Tips

1. **Lazy load charts** - Use Suspense/dynamic imports for chart components
2. **Optimize queries** - Set appropriate `staleTime` and `cacheTime`
3. **Debounce API calls** - Add debouncing to time period selector
4. **Paginate lists** - Add pagination to recent activity & submissions
5. **Memoize components** - Use `React.memo` for chart cards

---

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Data refresh button on dashboard
- [ ] Export to PDF functionality
- [ ] Customizable dashboard widgets
- [ ] Dark mode toggle
- [ ] Mobile-optimized layout
- [ ] Accessibility improvements (ARIA labels)
- [ ] Error boundary for charts
