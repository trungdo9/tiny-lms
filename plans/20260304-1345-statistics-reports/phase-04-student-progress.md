# Phase 04 -- Student Progress Page

**Ref:** [plan.md](./plan.md)
**Depends on:** Phase 01 (chart components)
**Blocks:** Phase 05 (CSV export)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | New student progress page with per-course breakdown, activity heatmap, and quiz stats |
| Priority | Medium |
| Status | Pending |

---

## Key Insights

- Student dashboard at `/dashboard` shows basic counts only -- no detailed progress view.
- `GET /users/me/dashboard` already returns `enrolledCourses` with per-course progress %. Enough for course breakdown cards.
- `GET /users/me/quiz-history` returns quiz attempts -- can derive avg score and monthly activity.
- For activity heatmap (GitHub-style), need a new endpoint returning daily activity counts (lesson completions + quiz submissions).
- Route: `/dashboard/progress` inside `(dashboard)` group -- same pattern as `/dashboard/profile`.
- Certificate count available via `GET /certificates/my`.
- No achievement/badge system exists -- defer badges to future (YAGNI). Show certificate count instead.

---

## Requirements

1. `GET /users/me/activity?months=6` -- daily activity counts for heatmap.
2. New page `/dashboard/progress` with:
   - Summary cards: courses enrolled, completed, avg quiz score, certificates earned.
   - Per-course progress cards with lesson completion bar.
   - Quiz performance area chart (scores over time).
   - Activity heatmap (contributions-style calendar).
3. Link from main dashboard to progress page.

---

## Architecture

### Backend: New Endpoint

```typescript
// users.controller.ts
@Get('me/activity')
@UseGuards(SupabaseAuthGuard)
getMyActivity(@Request() req: any, @Query('months') months: number = 6) {
  return this.usersService.getMyActivity(req.user.id, months);
}
```

```typescript
// Response shape
{
  daily: { date: string; count: number }[];  // "2026-01-15", count of actions
}
```

Service implementation: union of `lesson_progress` completions and `quiz_attempts` submissions grouped by date.

```typescript
// users.service.ts
async getMyActivity(userId: string, months: number) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const daily = await this.prisma.$queryRaw`
    SELECT d::date AS date, COALESCE(c.count, 0)::int AS count FROM
    generate_series(${since}::date, CURRENT_DATE, '1 day') d
    LEFT JOIN (
      SELECT completed_at::date AS day, COUNT(*)::int AS count FROM (
        SELECT completed_at FROM lesson_progress
        WHERE user_id = ${userId}::uuid AND is_completed = true AND completed_at >= ${since}
        UNION ALL
        SELECT submitted_at AS completed_at FROM quiz_attempts
        WHERE user_id = ${userId}::uuid AND status = 'submitted' AND submitted_at >= ${since}
      ) actions GROUP BY day
    ) c ON c.day = d::date
    ORDER BY date
  `;
  return { daily };
}
```

### Frontend Page

```
frontend/app/(dashboard)/dashboard/progress/page.tsx
```

Layout sections (top to bottom):
1. **Summary Cards** (4 across): Enrolled, Completed, Avg Quiz Score, Certificates
   - Data from existing `usersApi.getDashboard()` + `certificatesApi` (length of list)
2. **Per-Course Progress** -- card list with title, progress bar, lessons X/Y
   - Data from `usersApi.getDashboard()` `enrolledCourses` field
3. **Quiz Score Trend** -- `AreaChartCard` showing scores over time
   - Data from `usersApi.getQuizHistory()`, mapped to `{ date, score }`
4. **Activity Heatmap** -- custom component (not a recharts chart)
   - Grid of small squares, color-coded by daily count (0=gray, 1-2=light green, 3+=dark green)
   - Data from new `GET /users/me/activity`

### Heatmap Component

```typescript
// frontend/components/charts/activity-heatmap.tsx
interface ActivityHeatmapProps {
  data: { date: string; count: number }[];
  months?: number;
}
```

Simple CSS grid: 7 rows (days of week) x N columns (weeks). Each cell colored by count bracket. Not a recharts component -- custom lightweight implementation.

---

## Related Code Files

| File | Role |
|------|------|
| `backend/src/modules/users/users.controller.ts` | Add `me/activity` endpoint |
| `backend/src/modules/users/users.service.ts` | Add `getMyActivity()` method |
| `frontend/app/(dashboard)/dashboard/progress/page.tsx` | New progress page |
| `frontend/app/(dashboard)/dashboard/page.tsx` | Add link to progress page |
| `frontend/components/charts/activity-heatmap.tsx` | New heatmap component |
| `frontend/components/charts/index.ts` | Export heatmap |
| `frontend/lib/api.ts` | Add `usersApi.getMyActivity()` |
| `frontend/lib/query-keys.ts` | Add activity query key |

---

## Implementation Steps

### Backend
- [ ] Add `getMyActivity(userId, months)` to `users.service.ts`
- [ ] Add `GET me/activity` to `users.controller.ts`
- [ ] Test with raw SQL: verify `generate_series` + left join produces correct daily counts

### Frontend
- [ ] Add `usersApi.getMyActivity(months)` to `api.ts`
- [ ] Add `queryKeys.activity` to `query-keys.ts`
- [ ] Create `components/charts/activity-heatmap.tsx`
- [ ] Export from `components/charts/index.ts`
- [ ] Create `app/(dashboard)/dashboard/progress/page.tsx`
- [ ] Implement summary cards (reuse existing dashboard + certificates queries)
- [ ] Implement per-course progress cards
- [ ] Implement quiz score trend `AreaChartCard`
- [ ] Implement activity heatmap section
- [ ] Add "View Progress" link on main dashboard page

---

## Todo

```
- [ ] Backend: activity endpoint with raw SQL
- [ ] Frontend: activity heatmap component
- [ ] Frontend: progress page with 4 sections
- [ ] Frontend: api + query-keys additions
- [ ] Frontend: link from dashboard
```

---

## Success Criteria

- `/dashboard/progress` loads for authenticated students.
- Summary cards show correct counts matching dashboard data.
- Per-course progress bars match existing dashboard progress values.
- Quiz score trend chart renders with actual quiz history.
- Activity heatmap shows last 6 months of daily activity.
- Empty states handled gracefully (no courses, no quizzes, no activity).

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `generate_series` not available on Supabase | Very Low | High | Supabase uses standard PostgreSQL; function is built-in |
| Raw SQL perf on large activity history | Low | Low | Limited to 6 months; small dataset per user |
| Heatmap rendering with many cells | Low | Low | Max ~180 cells (6 months) -- trivial |

---

## Security Considerations

- Activity endpoint scoped to `req.user.id` -- users only see their own data.
- No PII exposed beyond what the user already has access to.
- Raw SQL uses parameterized `$queryRaw` template literals.

---

## Next Steps

Phase 05 adds "Export My Progress" CSV button to this page.
