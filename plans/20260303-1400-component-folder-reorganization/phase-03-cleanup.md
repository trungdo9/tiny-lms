# Phase 03 — Delete Orphaned Files + Verify Build

## Context Links

- Plan overview: `./plan.md`
- Phase 1: `./phase-01-move-and-rename-components.md`
- Phase 2: `./phase-02-update-imports.md`

## Overview

- **Date:** 2026-03-03
- **Priority:** Medium
- **Status:** Pending (blocked on Phase 2)
- Delete 7 now-obsolete flat files from `frontend/components/`
- Verify no remaining references to old paths
- Confirm production build passes

## Key Insights

- Legacy `header.tsx` imports `./notification-bell` — safe to delete because no layout file references `@/components/header` (confirmed via grep: 0 matches)
- Legacy `footer.tsx` has no internal imports — straightforward delete
- The 5 component files being deleted all have replacements created in Phase 1
- `notification-bell.tsx` is only consumed by `header.tsx` (also deleted) and `dashboard-header.tsx` (which now imports from `./NotificationBell` in its new location)
- After deletion, `frontend/components/` root retains only: `activity/`, `flash-card/`, `retroui/`, `layout/`, `auth/`, `providers.tsx`

## Requirements

### Functional
- Zero references to old flat component paths remain anywhere in `frontend/`
- `npm run build` passes
- `npm run lint` passes

### Non-functional
- No dead files in `components/` root after cleanup

## Architecture

### Files to delete

| File | Reason |
|------|--------|
| `frontend/components/dashboard-header.tsx` | Replaced by `layout/dashboard/DashboardHeader.tsx` |
| `frontend/components/dashboard-footer.tsx` | Replaced by `layout/dashboard/DashboardFooter.tsx` |
| `frontend/components/notification-bell.tsx` | Replaced by `layout/dashboard/NotificationBell.tsx` |
| `frontend/components/public-header.tsx` | Replaced by `layout/public/PublicHeader.tsx` |
| `frontend/components/public-footer.tsx` | Replaced by `layout/public/PublicFooter.tsx` |
| `frontend/components/protected-route.tsx` | Replaced by `auth/ProtectedRoute.tsx` |
| `frontend/components/header.tsx` | Orphaned legacy — no active consumers |
| `frontend/components/footer.tsx` | Orphaned legacy — no active consumers |

### Final `components/` root

```
components/
├── layout/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardFooter.tsx
│   │   ├── NotificationBell.tsx
│   │   └── index.ts
│   ├── public/
│   │   ├── PublicHeader.tsx
│   │   ├── PublicFooter.tsx
│   │   └── index.ts
│   └── index.ts
├── auth/
│   ├── ProtectedRoute.tsx
│   └── index.ts
├── activity/
├── flash-card/
├── retroui/
└── providers.tsx
```

## Related Code Files

| Action | File |
|--------|------|
| Delete | `frontend/components/dashboard-header.tsx` |
| Delete | `frontend/components/dashboard-footer.tsx` |
| Delete | `frontend/components/notification-bell.tsx` |
| Delete | `frontend/components/public-header.tsx` |
| Delete | `frontend/components/public-footer.tsx` |
| Delete | `frontend/components/protected-route.tsx` |
| Delete | `frontend/components/header.tsx` |
| Delete | `frontend/components/footer.tsx` |

## Implementation Steps

### Step 1 — Pre-deletion verification (grep checks)

Run from `frontend/` to confirm no remaining consumers:

```bash
grep -r "components/dashboard-header" app/ --include="*.tsx" --include="*.ts"
grep -r "components/dashboard-footer" app/ --include="*.tsx" --include="*.ts"
grep -r "components/public-header" app/ --include="*.tsx" --include="*.ts"
grep -r "components/public-footer" app/ --include="*.tsx" --include="*.ts"
grep -r "components/protected-route" app/ --include="*.tsx" --include="*.ts"
grep -r "components/header" app/ --include="*.tsx" --include="*.ts"
grep -r "components/footer" app/ --include="*.tsx" --include="*.ts"
grep -r "components/notification-bell" app/ --include="*.tsx" --include="*.ts"
```

All must return **0 matches** before proceeding to deletions.

### Step 2 — Delete old component files

```bash
cd frontend/components
rm dashboard-header.tsx
rm dashboard-footer.tsx
rm notification-bell.tsx
rm public-header.tsx
rm public-footer.tsx
rm protected-route.tsx
rm header.tsx
rm footer.tsx
```

### Step 3 — Run TypeScript check

```bash
cd frontend
npx tsc --noEmit
```

Must exit 0 with no errors.

### Step 4 — Run lint

```bash
cd frontend
npm run lint
```

Must exit 0.

### Step 5 — Run build

```bash
cd frontend
npm run build
```

Must complete successfully.

## Todo List

- [ ] Run all 8 grep checks — confirm 0 matches each
- [ ] Delete `dashboard-header.tsx`
- [ ] Delete `dashboard-footer.tsx`
- [ ] Delete `notification-bell.tsx`
- [ ] Delete `public-header.tsx`
- [ ] Delete `public-footer.tsx`
- [ ] Delete `protected-route.tsx`
- [ ] Delete `header.tsx`
- [ ] Delete `footer.tsx`
- [ ] Run `tsc --noEmit` — 0 errors
- [ ] Run `npm run lint` — 0 errors
- [ ] Run `npm run build` — success

## Success Criteria

- `frontend/components/` root contains only: `layout/`, `auth/`, `activity/`, `flash-card/`, `retroui/`, `providers.tsx`
- `npm run build` exits 0
- No TypeScript errors
- No lint errors

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| A file was missed in Phase 2 and still imports old path | Low | Step 1 grep checks catch this before any deletion |
| `tsc` finds error in a new barrel file | Low | Fix the barrel file, re-run — do not proceed to delete if tsc fails |
| `header.tsx` has a consumer not found by grep (e.g., dynamic import string) | Very low | Manual search for `'header'` string imports if grep passes but build fails |

## Security Considerations

- Deleting files is irreversible without git — ensure the branch is committed before this phase
- Run `git status` to confirm all new files are staged before deleting old ones

## Next Steps

- After build passes, update `docs/codebase-summary.md` to reflect new component paths (optional housekeeping)
- Consider updating `docs/code-standards.md` section 5.1 to show the actual `layout/` + `auth/` structure
