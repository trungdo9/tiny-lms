# Phase 02 -- Admin Dashboard

**Ref:** [plan.md](./plan.md)
**Depends on:** Phase 01 (chart components)
**Blocks:** Phase 05 (CSV export)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | New admin stats backend endpoints + `/admin/dashboard` page with system-level charts |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Admin currently only has settings pages -- no system overview at all.
- All needed data exists in DB: `profiles`, `enrollments`, `courses`, `quiz_attempts`, `payments`.
- Time-series aggregation via Prisma `$queryRaw` with `date_trunc('month', ...)` -- Prisma doesn't natively support groupBy on date functions.
- Payment revenue stats use `payments` table with `status = 'completed'`.
- Active users = profiles with `last_login_at` within last 30 days.
- Existing `ReportsController` uses `SupabaseAuthGuard`; admin endpoints add `RolesGuard` + `@Roles(Role.ADMIN)`.
- Admin layout already has `AdminGuard` that checks `role === 'admin'`.

---

## Requirements

1. `GET /reports/admin/dashboard` -- system overview stats.
2. `GET /reports/admin/trends?months=12` -- monthly user growth + enrollment trends.
3. `GET /reports/admin/top-courses?limit=10` -- top courses by enrollment count.
4. `GET /reports/admin/revenue?months=12` -- monthly revenue totals.
5. Frontend `/admin/dashboard` page with stat cards, charts, top courses table.
6. Date range filter (last 3/6/12 months selector).

---

## Architecture

### Backend Endpoints

All endpoints in existing `ReportsController`, guarded with `@Roles(Role.ADMIN)`.

```typescript
// reports.controller.ts additions

@Get('admin/dashboard')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
getAdminDashboard() {
  return this.service.getAdminDashboard();
}

@Get('admin/trends')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
getAdminTrends(@Query('months') months: number = 12) {
  return this.service.getAdminTrends(months);
}

@Get('admin/top-courses')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
getTopCourses(@Query('limit') limit: number = 10) {
  return this.service.getTopCourses(limit);
}

@Get('admin/revenue')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
getRevenueStats(@Query('months') months: number = 12) {
  return this.service.getRevenueStats(months);
}
```

### Response Shapes

```typescript
// GET /reports/admin/dashboard
{
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers30d: number;
  totalRevenue: number;
  pendingPayments: number;
}

// GET /reports/admin/trends?months=12
{
  userGrowth: { month: string; count: number }[];       // "2025-04", "2025-05"...
  enrollmentTrends: { month: string; count: number }[];
}

// GET /reports/admin/top-courses?limit=10
{
  courses: { id: string; title: string; enrollments: number; completionRate: number }[];
}

// GET /reports/admin/revenue?months=12
{
  monthly: { month: string; revenue: number }[];
  total: number;
}
```

### Service Implementation (key query patterns)

```typescript
// Time-series: monthly user growth
const userGrowth = await this.prisma.$queryRaw`
  SELECT date_trunc('month', created_at) AS month, COUNT(*)::int AS count
  FROM profiles
  WHERE created_at >= NOW() - INTERVAL '${months} months'
  GROUP BY month ORDER BY month
`;

// Active users (30d)
const activeUsers = await this.prisma.profile.count({
  where: { lastLoginAt: { gte: new Date(Date.now() - 30 * 86400000) } },
});

// Revenue
const revenue = await this.prisma.$queryRaw`
  SELECT date_trunc('month', completed_at) AS month, SUM(amount)::float AS revenue
  FROM payments WHERE status = 'completed'
  AND completed_at >= NOW() - INTERVAL '${months} months'
  GROUP BY month ORDER BY month
`;
```

### Frontend Page

```
frontend/app/admin/dashboard/page.tsx    # New page
```

Page structure:
1. Date range selector (3m/6m/12m buttons)
2. Stat cards row: Total Users, Courses, Enrollments, Active Users (30d), Revenue, Pending Payments
3. Line chart: User Growth (monthly)
4. Line chart: Enrollment Trends (monthly)
5. Bar chart: Revenue by Month
6. Table: Top Courses by Enrollment

Uses `useQuery` with `queryKeys.reports.adminDashboard()`, etc.

---

## Related Code Files

| File | Role |
|------|------|
| `backend/src/modules/reports/reports.controller.ts` | Add admin endpoints |
| `backend/src/modules/reports/reports.service.ts` | Add admin service methods |
| `backend/src/modules/reports/reports.module.ts` | May need RolesGuard import |
| `frontend/app/admin/dashboard/page.tsx` | New admin dashboard page |
| `frontend/app/admin/layout.tsx` | Existing admin layout with AdminGuard |
| `frontend/lib/api.ts` | Add `reportsApi.adminDashboard()` etc. |
| `frontend/lib/query-keys.ts` | Add admin report query keys |
| `frontend/components/charts/` | Chart wrapper components from Phase 01 |

---

## Implementation Steps

### Backend
- [ ] Import `RolesGuard`, `Roles`, `Role` in `reports.controller.ts`
- [ ] Add `getAdminDashboard()` endpoint + service method
- [ ] Add `getAdminTrends(months)` endpoint + service method with raw SQL
- [ ] Add `getTopCourses(limit)` endpoint + service method
- [ ] Add `getRevenueStats(months)` endpoint + service method
- [ ] Update `reports.module.ts` if needed (RolesGuard provider)

### Frontend
- [ ] Add `reportsApi` section to `frontend/lib/api.ts`
- [ ] Add admin report keys to `frontend/lib/query-keys.ts`
- [ ] Create `frontend/app/admin/dashboard/page.tsx`
- [ ] Implement stat cards with `useQuery` for dashboard stats
- [ ] Add User Growth line chart
- [ ] Add Enrollment Trends line chart
- [ ] Add Revenue bar chart
- [ ] Add Top Courses table
- [ ] Add date range filter (3m/6m/12m)

---

## Todo

```
- [ ] Backend: admin dashboard endpoint
- [ ] Backend: admin trends endpoint (raw SQL)
- [ ] Backend: top courses endpoint
- [ ] Backend: revenue endpoint
- [ ] Frontend: api.ts + query-keys.ts additions
- [ ] Frontend: admin dashboard page
- [ ] Frontend: stat cards
- [ ] Frontend: user growth chart
- [ ] Frontend: enrollment trends chart
- [ ] Frontend: revenue chart
- [ ] Frontend: top courses table
- [ ] Frontend: date range filter
```

---

## Success Criteria

- `/admin/dashboard` loads for admin users, redirects non-admins.
- 4 stat cards show correct system-level counts.
- Charts render with real data; filter changes update charts.
- Top courses table sorted by enrollment count.
- Revenue stats reflect completed payments only.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Raw SQL injection via months param | Medium | High | Validate input as integer, use parameterized query |
| Slow aggregation on large tables | Low | Medium | Indexes on `created_at`, `enrolled_at`, `completed_at` already exist |
| No payments data in dev | Medium | Low | Show "No data" state gracefully |

---

## Security Considerations

- All admin endpoints require both `SupabaseAuthGuard` AND `RolesGuard` with `@Roles(Role.ADMIN)`.
- Raw SQL must use parameterized queries (`$queryRaw` with template literals) to prevent SQL injection.
- Revenue data is sensitive -- admin-only access enforced at both controller and frontend guard levels.
- Validate `months` query param as positive integer (1-24 range).

---

## Next Steps

Phase 05 adds CSV export buttons to this dashboard.
