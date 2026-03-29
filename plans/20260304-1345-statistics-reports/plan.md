# Statistics & Reports Enhancement -- Implementation Plan

**Date:** 2026-03-04
**Status:** Done
**Priority:** Medium-High

## Description

Add visual charts (recharts), admin dashboard with system-level stats, enhance instructor reports with charts, create student progress page, and add CSV export across all dashboards.

## Phases

| # | Phase | File | Status |
|---|-------|------|--------|
| 1 | Chart Library Setup | [phase-01-chart-library-setup.md](./phase-01-chart-library-setup.md) | ✅ Done |
| 2 | Admin Dashboard | [phase-02-admin-dashboard.md](./phase-02-admin-dashboard.md) | ✅ Done |
| 3 | Instructor Reports Enhancement | [phase-03-instructor-reports-enhancement.md](./phase-03-instructor-reports-enhancement.md) | ✅ Done |
| 4 | Student Progress | [phase-04-student-progress.md](./phase-04-student-progress.md) | ✅ Done |
| 5 | CSV Export | [phase-05-csv-export.md](./phase-05-csv-export.md) | ✅ Done |

## Key Decisions

**recharts** for charts -- lightweight, React-native, composable, tree-shakeable. No SSR issues since all chart pages are `'use client'`.

**Frontend-only CSV generation** using `papaparse` -- avoids new backend endpoints for export; reuses existing API data. Backend `xlsx` package reserved for large datasets (>10K rows) if needed later.

**No new DB tables** -- all stats derived from existing models via aggregation queries. Time-series data uses `GROUP BY date_trunc()` on `created_at`/`enrolled_at` columns.

**Reusable chart wrappers** in `components/charts/` -- thin wrappers around recharts primitives matching shadcn/ui aesthetic. All dashboards share them.

**Admin stats endpoints** added to existing `reports` module -- new controller methods with `@Roles(Role.ADMIN)` guard. No separate module needed (KISS).

**Student progress page** at `/dashboard/progress` inside `(dashboard)` route group -- consistent with existing `/dashboard/profile` pattern, avoids routing conflicts.

## Dependencies Between Phases

Phase 1 is standalone (chart library install + wrapper components).
Phases 2, 3, 4 all depend on Phase 1 (use chart components).
Phase 5 depends on Phases 2, 3, 4 (export buttons placed on their pages).
Phases 2, 3, 4 are independent of each other.

```
Phase 1 --> Phase 2 (admin dashboard)
        --> Phase 3 (instructor charts)  --> Phase 5 (CSV export)
        --> Phase 4 (student progress)
```
