# Component Folder Reorganization

**Date:** 2026-03-03
**Priority:** Medium
**Status:** ✅ Done

## Goal

Reorganize `frontend/components/` to group layout components into logical subdirectories with PascalCase filenames, delete orphaned legacy files, and update all import paths.

## Target Structure

```
components/
├── layout/
│   ├── public/
│   │   ├── PublicHeader.tsx
│   │   ├── PublicFooter.tsx
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardFooter.tsx
│   │   ├── NotificationBell.tsx   ← internal, not exported from index
│   │   └── index.ts               ← exports Header + Footer only
│   └── index.ts
├── auth/
│   ├── ProtectedRoute.tsx
│   └── index.ts
├── activity/     ← unchanged
├── flash-card/   ← unchanged
├── retroui/      ← unchanged
└── providers.tsx ← unchanged
```

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Move and rename components + create barrel exports](./phase-01-move-and-rename-components.md) | ✅ Done |
| 2 | [Update imports across 7 layout files](./phase-02-update-imports.md) | ✅ Done |
| 3 | [Delete orphaned files + verify build](./phase-03-cleanup.md) | ✅ Done |

## Key Dependencies

- Phase 2 depends on Phase 1 (new paths must exist before imports can reference them)
- Phase 3 depends on Phase 2 (must confirm no consumers remain before deleting)

## Files Affected

- **Move/rename:** 5 component files
- **Create:** 5 barrel `index.ts` files
- **Update imports:** 7 layout files
- **Delete:** 2 orphaned files (`header.tsx`, `footer.tsx`)

## Risks

- `DashboardHeader` imports `NotificationBell` via relative path `./notification-bell` — must update to `./NotificationBell` after rename
- `header.tsx` (legacy) also imports `./notification-bell` — safe to delete since no layout file imports it (confirmed via grep)
- Build must pass after each phase before proceeding
