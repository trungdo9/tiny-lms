# Phase 01 — Move and Rename Components + Barrel Exports

## Context Links

- Plan overview: `./plan.md`
- Code standards: `/home/trung/workspace/project/private/tiny-lms/docs/code-standards.md`
- Existing barrel pattern: `frontend/components/flash-card/index.ts`, `frontend/components/activity/index.ts`

## Overview

- **Date:** 2026-03-03
- **Priority:** High (Phase 2 and 3 are blocked on this)
- **Status:** Pending
- Move 5 flat kebab-case files into subdirectories with PascalCase names
- Create 5 `index.ts` barrel files to expose public API

## Key Insights

- `DashboardHeader.tsx` imports `NotificationBell` via `./notification-bell` — this relative path **must be updated** to `./NotificationBell` when both files move into `layout/dashboard/`
- `NotificationBell` is an implementation detail of `DashboardHeader` only — do NOT export it from `layout/dashboard/index.ts`
- `header.tsx` (legacy) also imports `./notification-bell` — it will be deleted in Phase 3; no action needed here
- Existing subdirectories (`flash-card/`, `activity/`) use PascalCase filenames + `index.ts` barrel — follow same pattern
- `providers.tsx` stays at root (app-level singleton, not layout-specific)

## Requirements

### Functional
- All component logic is preserved unchanged (copy, do not edit logic)
- `NotificationBell` remains importable by `DashboardHeader` after the move
- `DashboardHeader` and `DashboardFooter` are the only exports from `layout/dashboard/index.ts`
- `PublicHeader` and `PublicFooter` are the only exports from `layout/public/index.ts`
- `ProtectedRoute` is the only export from `auth/index.ts`
- `layout/index.ts` re-exports all public layout components

### Non-functional
- Files use PascalCase naming (matches code-standards.md: "React Components → PascalCase")
- No logic changes in this phase — pure structural move

## Architecture

```
frontend/components/
├── layout/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx   ← was: components/dashboard-header.tsx
│   │   ├── DashboardFooter.tsx   ← was: components/dashboard-footer.tsx
│   │   ├── NotificationBell.tsx  ← was: components/notification-bell.tsx
│   │   └── index.ts              ← exports: DashboardHeader, DashboardFooter
│   ├── public/
│   │   ├── PublicHeader.tsx      ← was: components/public-header.tsx
│   │   ├── PublicFooter.tsx      ← was: components/public-footer.tsx
│   │   └── index.ts              ← exports: PublicHeader, PublicFooter
│   └── index.ts                  ← re-exports from ./dashboard + ./public
└── auth/
    ├── ProtectedRoute.tsx        ← was: components/protected-route.tsx
    └── index.ts                  ← exports: ProtectedRoute
```

## Related Code Files

| Action | File |
|--------|------|
| Create (copy + fix internal import) | `frontend/components/layout/dashboard/DashboardHeader.tsx` |
| Create (copy) | `frontend/components/layout/dashboard/DashboardFooter.tsx` |
| Create (copy) | `frontend/components/layout/dashboard/NotificationBell.tsx` |
| Create | `frontend/components/layout/dashboard/index.ts` |
| Create (copy) | `frontend/components/layout/public/PublicHeader.tsx` |
| Create (copy) | `frontend/components/layout/public/PublicFooter.tsx` |
| Create | `frontend/components/layout/public/index.ts` |
| Create | `frontend/components/layout/index.ts` |
| Create (copy) | `frontend/components/auth/ProtectedRoute.tsx` |
| Create | `frontend/components/auth/index.ts` |
| Keep (old files) | All original flat files — deleted in Phase 3 |

## Implementation Steps

### Step 1 — Create directory structure

```bash
mkdir -p frontend/components/layout/dashboard
mkdir -p frontend/components/layout/public
mkdir -p frontend/components/auth
```

### Step 2 — Copy NotificationBell (no changes needed)

Copy `frontend/components/notification-bell.tsx` to `frontend/components/layout/dashboard/NotificationBell.tsx`.

File content is unchanged. No internal imports to update.

### Step 3 — Copy and fix DashboardHeader

Copy `frontend/components/dashboard-header.tsx` to `frontend/components/layout/dashboard/DashboardHeader.tsx`.

Update the internal import at line 9 (the only change):

```typescript
// Before:
import { NotificationBell } from './notification-bell';

// After:
import { NotificationBell } from './NotificationBell';
```

No other changes.

### Step 4 — Copy DashboardFooter (no changes needed)

Copy `frontend/components/dashboard-footer.tsx` to `frontend/components/layout/dashboard/DashboardFooter.tsx`.

No internal imports to update.

### Step 5 — Create `layout/dashboard/index.ts`

```typescript
export { DashboardHeader } from './DashboardHeader';
export { DashboardFooter } from './DashboardFooter';
// NotificationBell is intentionally NOT exported (internal to DashboardHeader)
```

### Step 6 — Copy PublicHeader (no changes needed)

Copy `frontend/components/public-header.tsx` to `frontend/components/layout/public/PublicHeader.tsx`.

The existing import `@/components/retroui/Button` is an absolute alias — unchanged and still valid.

### Step 7 — Copy PublicFooter (no changes needed)

Copy `frontend/components/public-footer.tsx` to `frontend/components/layout/public/PublicFooter.tsx`.

No internal imports to update.

### Step 8 — Create `layout/public/index.ts`

```typescript
export { PublicHeader } from './PublicHeader';
export { PublicFooter } from './PublicFooter';
```

### Step 9 — Create `layout/index.ts`

```typescript
export { DashboardHeader, DashboardFooter } from './dashboard';
export { PublicHeader, PublicFooter } from './public';
```

### Step 10 — Copy ProtectedRoute (no changes needed)

Copy `frontend/components/protected-route.tsx` to `frontend/components/auth/ProtectedRoute.tsx`.

No internal imports to update.

### Step 11 — Create `auth/index.ts`

```typescript
export { ProtectedRoute } from './ProtectedRoute';
```

## Todo List

- [ ] Create directory `frontend/components/layout/dashboard/`
- [ ] Create directory `frontend/components/layout/public/`
- [ ] Create directory `frontend/components/auth/`
- [ ] Create `NotificationBell.tsx` (copy of `notification-bell.tsx`)
- [ ] Create `DashboardHeader.tsx` (copy, fix `./notification-bell` → `./NotificationBell`)
- [ ] Create `DashboardFooter.tsx` (copy of `dashboard-footer.tsx`)
- [ ] Create `layout/dashboard/index.ts` (exports Header + Footer only)
- [ ] Create `PublicHeader.tsx` (copy of `public-header.tsx`)
- [ ] Create `PublicFooter.tsx` (copy of `public-footer.tsx`)
- [ ] Create `layout/public/index.ts`
- [ ] Create `layout/index.ts`
- [ ] Create `ProtectedRoute.tsx` (copy of `protected-route.tsx`)
- [ ] Create `auth/index.ts`

## Success Criteria

- All new files exist at their target paths
- `DashboardHeader.tsx` successfully imports `NotificationBell` from `./NotificationBell`
- TypeScript compiler finds no errors in the new files in isolation (`tsc --noEmit` on new files)
- Barrel exports expose exactly the intended public surface (Header + Footer per group)
- Original flat files still exist (not yet deleted — that is Phase 3)

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Forgot to update `./notification-bell` → `./NotificationBell` in DashboardHeader | Medium | Explicit step 3 above; grep after copy to verify |
| Accidentally exporting NotificationBell from barrel | Low | index.ts template in step 5 is explicit |
| `@/components/retroui/Button` path breaks | None | Absolute alias, unaffected by file location |

## Security Considerations

- Pure structural refactor — no logic, no auth, no data handling changes
- No new dependencies introduced

## Next Steps

- Proceed to Phase 2: update all import paths in layout files
- Do NOT delete old flat files yet (needed until Phase 2 layout imports are updated)
