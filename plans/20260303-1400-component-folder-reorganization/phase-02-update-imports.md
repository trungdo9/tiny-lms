# Phase 02 — Update Imports Across Layout Files

## Context Links

- Plan overview: `./plan.md`
- Phase 1: `./phase-01-move-and-rename-components.md`
- Code standards: `/home/trung/workspace/project/private/tiny-lms/docs/code-standards.md`

## Overview

- **Date:** 2026-03-03
- **Priority:** High
- **Status:** Pending (blocked on Phase 1)
- Update import statements in 7 layout files to point to the new barrel paths

## Key Insights

- All 7 layout files follow the same 3-import pattern: `dashboard-header`, `dashboard-footer`, `protected-route` (or the public equivalents)
- After Phase 1, both old and new paths resolve — so the app stays functional during this phase
- Consolidating 3 named imports into 1 barrel import per group is valid TypeScript and reduces lines
- `app/(public)/layout.tsx` does NOT import `ProtectedRoute` — public routes are open
- `app/(student)/layout.tsx` uses `PublicHeader`/`PublicFooter` (not dashboard variants)

## Requirements

### Functional
- All 7 layout files must import from the new barrel paths after this phase
- Named exports remain identical (`DashboardHeader`, `DashboardFooter`, `ProtectedRoute`, etc.)
- No layout file should import from old flat paths after this phase

### Non-functional
- Each file's 2–3 old import lines collapse to 1–2 new import lines (DRY)
- TypeScript resolves all imports without error

## Architecture

### Import mapping

| File | Old imports | New imports |
|------|-------------|-------------|
| `app/(dashboard)/layout.tsx` | 3 lines | 2 lines |
| `app/(student)/layout.tsx` | 3 lines | 2 lines |
| `app/(public)/layout.tsx` | 2 lines | 1 line |
| `app/admin/layout.tsx` | 3 lines | 2 lines |
| `app/instructor/layout.tsx` | 3 lines | 2 lines |
| `app/certificates/layout.tsx` | 3 lines | 2 lines |
| `app/quizzes/layout.tsx` | 3 lines | 2 lines |

### New import patterns

**Dashboard-style layout (dashboard, admin, instructor, certificates, quizzes):**
```typescript
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';
```

**Student layout:**
```typescript
import { PublicHeader, PublicFooter } from '@/components/layout/public';
import { ProtectedRoute } from '@/components/auth';
```

**Public layout:**
```typescript
import { PublicHeader, PublicFooter } from '@/components/layout/public';
```

## Related Code Files

| Action | File |
|--------|------|
| Modify | `frontend/app/(dashboard)/layout.tsx` |
| Modify | `frontend/app/(student)/layout.tsx` |
| Modify | `frontend/app/(public)/layout.tsx` |
| Modify | `frontend/app/admin/layout.tsx` |
| Modify | `frontend/app/instructor/layout.tsx` |
| Modify | `frontend/app/certificates/layout.tsx` |
| Modify | `frontend/app/quizzes/layout.tsx` |

## Implementation Steps

### File 1 — `app/(dashboard)/layout.tsx`

Remove:
```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardFooter } from '@/components/dashboard-footer';
```

Add:
```typescript
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';
```

---

### File 2 — `app/(student)/layout.tsx`

Remove:
```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
```

Add:
```typescript
import { PublicHeader, PublicFooter } from '@/components/layout/public';
import { ProtectedRoute } from '@/components/auth';
```

---

### File 3 — `app/(public)/layout.tsx`

Remove:
```typescript
import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
```

Add:
```typescript
import { PublicHeader, PublicFooter } from '@/components/layout/public';
```

---

### File 4 — `app/admin/layout.tsx`

Remove:
```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardFooter } from '@/components/dashboard-footer';
```

Add:
```typescript
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';
```

---

### File 5 — `app/instructor/layout.tsx`

Remove:
```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardFooter } from '@/components/dashboard-footer';
```

Add:
```typescript
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';
```

---

### File 6 — `app/certificates/layout.tsx`

Remove:
```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardFooter } from '@/components/dashboard-footer';
```

Add:
```typescript
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';
```

---

### File 7 — `app/quizzes/layout.tsx`

Remove:
```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardFooter } from '@/components/dashboard-footer';
```

Add:
```typescript
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';
```

## Todo List

- [ ] Update `app/(dashboard)/layout.tsx` imports
- [ ] Update `app/(student)/layout.tsx` imports
- [ ] Update `app/(public)/layout.tsx` imports
- [ ] Update `app/admin/layout.tsx` imports
- [ ] Update `app/instructor/layout.tsx` imports
- [ ] Update `app/certificates/layout.tsx` imports
- [ ] Update `app/quizzes/layout.tsx` imports
- [ ] Run `npm run build` in `frontend/` — must complete without errors

## Success Criteria

- `grep -r "from '@/components/dashboard-header'" frontend/app` returns no matches
- `grep -r "from '@/components/dashboard-footer'" frontend/app` returns no matches
- `grep -r "from '@/components/public-header'" frontend/app` returns no matches
- `grep -r "from '@/components/public-footer'" frontend/app` returns no matches
- `grep -r "from '@/components/protected-route'" frontend/app` returns no matches
- `npm run build` in `frontend/` exits 0

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Phase 1 barrel `index.ts` has wrong export name | Low | Grep new barrel files before running build |
| Missing a layout file that also imports old paths | Low | Run grep checks listed in success criteria |
| `admin/layout.tsx` has extra imports (`useAuth`, etc.) — ensure only the 3 component imports are replaced | Medium | Apply targeted edits, not full file rewrites |

## Security Considerations

- Pure import path update — no auth logic or component behavior changes
- `ProtectedRoute` still wraps the same subtrees; only its import source changes

## Next Steps

- Proceed to Phase 3: delete orphaned flat files and do final build verification
