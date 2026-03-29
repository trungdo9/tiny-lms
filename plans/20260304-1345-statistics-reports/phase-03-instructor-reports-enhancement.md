# Phase 03 -- Instructor Reports Enhancement

**Ref:** [plan.md](./plan.md)
**Depends on:** Phase 01 (chart components)
**Blocks:** Phase 05 (CSV export)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Add visual charts to existing instructor reports; enhance endpoints with trend data |
| Priority | Medium |
| Status | Pending |

---

## Key Insights

- Instructor dashboard already shows 6 stat cards + courses list + recent attempts -- needs charts added.
- Quiz report page has manual CSS bar chart for score distribution -- replace with recharts `BarChart`.
- Course report page shows stats + students table -- add enrollment trend line chart.
- Backend `getInstructorDashboard()` fetches all attempts into memory -- inefficient but functional. Add lightweight trend query alongside.
- `getCourseReport()` verifies `course.instructorId === instructorId` -- should also check `course_instructors` table for co-instructors. However, that's a separate concern (instructor-management plan); skip for now.
- Date range filtering: add optional `startDate`/`endDate` query params to existing endpoints.

---

## Requirements

1. `GET /reports/dashboard/trends?months=6` -- instructor enrollment + quiz trends over time.
2. Enhance instructor dashboard page with enrollment trend line chart and quiz performance area chart.
3. Replace manual CSS bar chart in quiz report with recharts `BarChartCard`.
4. Add enrollment timeline chart to course report page.
5. Optional date range filter on instructor dashboard.

---

## Architecture

### Backend: New Endpoint

```typescript
// reports.controller.ts
@Get('dashboard/trends')
getInstructorTrends(@Request() req: any, @Query('months') months: number = 6) {
  return this.service.getInstructorTrends(req.user.id, months);
}
```

```typescript
// Response shape
{
  enrollmentTrends: { month: string; count: number }[];
  quizAttemptTrends: { month: string; count: number; avgScore: number }[];
}
```

Service uses raw SQL grouping enrollments by month for instructor's courses.

### Frontend Changes

**Instructor Dashboard (`/dashboard` when role=instructor):**
- Below stat cards, add 2-column chart row:
  - Left: `LineChartCard` -- enrollment trends
  - Right: `AreaChartCard` -- quiz attempts + avg score

**Course Report (`/instructor/reports/courses/[id]`):**
- No backend change needed; frontend can derive enrollment timeline from existing students list `enrolledAt` field (group by month client-side).
- Add `BarChartCard` showing quiz attempts per quiz (from `quizSummary`).

**Quiz Report (`/instructor/reports/quizzes/[id]`):**
- Replace manual CSS bars with `BarChartCard` using existing `scoreDistribution` data.
- Add pass/fail `PieChartCard` using existing `passedAttempts`/`failedAttempts`.

---

## Related Code Files

| File | Role |
|------|------|
| `backend/src/modules/reports/reports.controller.ts` | Add trends endpoint |
| `backend/src/modules/reports/reports.service.ts` | Add trends service method |
| `frontend/app/(dashboard)/dashboard/page.tsx` | Enhance instructor view with charts |
| `frontend/app/instructor/reports/courses/[id]/page.tsx` | Add enrollment chart |
| `frontend/app/instructor/reports/quizzes/[id]/page.tsx` | Replace CSS bars with recharts |
| `frontend/lib/api.ts` | Add `reportsApi.instructorTrends()` |
| `frontend/lib/query-keys.ts` | Add instructor trends key |
| `frontend/components/charts/` | Chart components from Phase 01 |

---

## Implementation Steps

### Backend
- [ ] Add `getInstructorTrends(instructorId, months)` to `reports.service.ts`
- [ ] Add `GET reports/dashboard/trends` to controller
- [ ] Raw SQL: group enrollments by month for instructor's courses
- [ ] Raw SQL: group quiz attempts by month with avg score

### Frontend
- [ ] Add `reportsApi.instructorTrends()` to `api.ts`
- [ ] Add `reports.instructorTrends` to `query-keys.ts`
- [ ] Update instructor dashboard section in `dashboard/page.tsx`:
  - Add `useQuery` for trends data
  - Add `LineChartCard` for enrollment trends
  - Add `AreaChartCard` for quiz performance
- [ ] Update `instructor/reports/courses/[id]/page.tsx`:
  - Derive enrollment timeline from students `enrolledAt` (client-side grouping)
  - Add `BarChartCard` for quiz attempts
- [ ] Update `instructor/reports/quizzes/[id]/page.tsx`:
  - Replace manual CSS bar chart with `BarChartCard`
  - Add `PieChartCard` for pass/fail ratio

---

## Todo

```
- [ ] Backend: instructor trends endpoint
- [ ] Frontend: api.ts + query-keys additions
- [ ] Frontend: instructor dashboard charts
- [ ] Frontend: course report enrollment chart
- [ ] Frontend: course report quiz attempts chart
- [ ] Frontend: quiz report recharts migration
- [ ] Frontend: quiz report pass/fail pie chart
```

---

## Success Criteria

- Instructor dashboard shows 2 charts below stat cards with real trend data.
- Course report page has enrollment timeline + quiz attempts bar chart.
- Quiz report uses recharts instead of CSS bars; pie chart shows pass/fail.
- No regressions to existing stat cards or tables.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Instructor with many courses = slow trend query | Low | Medium | Limit to last 6 months default; index on `enrolled_at` exists |
| Client-side date grouping inaccurate | Low | Low | Use `toISOString().slice(0,7)` for consistent month keys |

---

## Security Considerations

- Trends endpoint uses `req.user.id` to scope data -- instructor only sees own courses.
- No elevation: same `SupabaseAuthGuard` as existing report endpoints.

---

## Next Steps

Phase 05 adds export buttons to these enhanced pages.
