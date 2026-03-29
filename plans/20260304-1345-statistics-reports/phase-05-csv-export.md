# Phase 05 -- CSV Export

**Ref:** [plan.md](./plan.md)
**Depends on:** Phase 02, Phase 03, Phase 04
**Blocks:** nothing

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Frontend CSV generation utility + export buttons on admin, instructor, and student dashboards |
| Priority | Low-Medium |
| Status | Pending |

---

## Key Insights

- Backend already has `xlsx` and `csv-parse` packages (used for question bank import). However, for export we prefer frontend-only CSV generation -- simpler, no new backend endpoints needed.
- `papaparse` is the standard for CSV in JS (~7KB gzipped). Supports `unparse()` for array-to-CSV.
- All exportable data is already fetched by existing `useQuery` hooks on each page -- just transform and download.
- For datasets <10K rows, frontend generation is fast. All current datasets fit this (users, enrollments, students per course).
- If future datasets exceed 10K, add backend streaming endpoint then. YAGNI for now.
- Export triggers: button click -> transform query data -> generate CSV string -> create Blob -> trigger download via `<a>` click.

---

## Requirements

1. Install `papaparse` + `@types/papaparse` in frontend.
2. Create shared `lib/export-csv.ts` utility.
3. Export buttons on:
   - Admin dashboard: users list, enrollment stats, top courses.
   - Instructor course report: student progress list.
   - Instructor quiz report: attempts list, question analysis.
   - Student progress: personal progress summary.
4. Button UI: secondary/outline button with download icon, consistent placement.

---

## Architecture

### Utility Function

```typescript
// frontend/lib/export-csv.ts
import Papa from 'papaparse';

interface ExportOptions {
  filename: string;
  columns?: { key: string; header: string }[];
}

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions
): void {
  const { filename, columns } = options;

  let exportData = data;
  let fields: string[] | undefined;

  if (columns) {
    fields = columns.map(c => c.header);
    exportData = data.map(row =>
      Object.fromEntries(columns.map(c => [c.header, row[c.key]]))
    ) as T[];
  }

  const csv = Papa.unparse(exportData, { columns: fields });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Export Button Component

```typescript
// frontend/components/export-button.tsx
'use client';

import { Download } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function ExportButton({ onClick, label = 'Export CSV', disabled }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
        text-gray-700 bg-white border border-gray-300 rounded-lg
        hover:bg-gray-50 disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
```

### Export Placements

| Page | Data Source | Columns |
|------|-----------|---------|
| Admin dashboard | Top courses query | title, enrollments, completionRate |
| Admin dashboard | `adminUsersApi.getAll()` (separate fetch) | fullName, email, role, createdAt |
| Course report | `data.students` from existing query | name, progress%, enrolledAt |
| Quiz report (attempts tab) | `data.recentAttempts` | studentName, score, isPassed, submittedAt |
| Quiz report (analysis tab) | `questionAnalysis` | content, type, totalAnswers, correctAnswers, failureRate |
| Student progress | `enrolledCourses` from dashboard query | courseTitle, progress, completedLessons, totalLessons |

---

## Related Code Files

| File | Role |
|------|------|
| `frontend/package.json` | Add papaparse dependency |
| `frontend/lib/export-csv.ts` | New CSV utility |
| `frontend/components/export-button.tsx` | New export button component |
| `frontend/app/admin/dashboard/page.tsx` | Add export buttons (Phase 02 page) |
| `frontend/app/instructor/reports/courses/[id]/page.tsx` | Add export button |
| `frontend/app/instructor/reports/quizzes/[id]/page.tsx` | Add export buttons |
| `frontend/app/(dashboard)/dashboard/progress/page.tsx` | Add export button (Phase 04 page) |

---

## Implementation Steps

- [ ] `cd frontend && npm install papaparse @types/papaparse`
- [ ] Create `frontend/lib/export-csv.ts`
- [ ] Create `frontend/components/export-button.tsx`
- [ ] Admin dashboard: add export buttons for top courses + users
- [ ] Course report: add export button for students table
- [ ] Quiz report: add export buttons for attempts + question analysis tabs
- [ ] Student progress: add export button for personal progress

---

## Todo

```
- [ ] Install papaparse
- [ ] Create export-csv.ts utility
- [ ] Create ExportButton component
- [ ] Add exports to admin dashboard
- [ ] Add exports to course report
- [ ] Add exports to quiz report
- [ ] Add exports to student progress
```

---

## Success Criteria

- Clicking export downloads a valid `.csv` file with correct headers.
- CSV filename includes date (e.g., `students-2026-03-04.csv`).
- Export uses data already in memory -- no additional API calls.
- Button disabled when no data available.
- Works in all major browsers (Chrome, Firefox, Safari).

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Large dataset freezes browser | Very Low | Medium | Current max is ~hundreds of rows; add row limit warning if >5K |
| Unicode characters in CSV | Low | Low | papaparse handles UTF-8 by default |
| Safari Blob download quirk | Low | Low | Use `link.click()` pattern which works cross-browser |

---

## Security Considerations

- CSV contains only data the user already has access to (rendered on their page).
- No server-side export endpoint = no new attack surface.
- Admin user export includes emails -- acceptable since admin already sees this data in the users management page.
- No PII leakage beyond current role permissions.

---

## Next Steps

This is the final phase. After completion, the Statistics & Reports enhancement is feature-complete.
