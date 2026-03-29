# Phase 04 — Nav Integration
**Date:** 2026-03-03 | **Priority:** Medium | **Status:** Pending (independent of phases 2–3)

## Context Links
- [Plan overview](./plan.md)
- [frontend/components/dashboard-header.tsx](../../frontend/components/dashboard-header.tsx)
- [frontend/app/admin/layout.tsx](../../frontend/app/admin/layout.tsx)

## Overview
Add a "Users" nav link in `DashboardHeader` visible only when `profile.role === 'admin'`. The link points to `/admin/users`.

## Key Insights
- `DashboardHeader` already conditionally renders a "Settings" link for admin (`profile?.role === 'admin'`)
- The "Users" link should appear alongside "Settings" in the same conditional block
- No new component needed — single `<Link>` addition inside existing JSX
- `isInstructor` flag (`role === 'instructor' || role === 'admin'`) already gates the instructor nav block; admin-only links sit inside that block guarded by the inner `profile?.role === 'admin'` check

## Requirements
- "Users" link visible only when `profile?.role === 'admin'`
- Points to `/admin/users`
- Matches existing nav link style: `text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md transition-colors`
- Appears before the existing "Settings" link (logical order: content management links → admin tools)

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/components/dashboard-header.tsx` | MODIFY | Add "Users" `<Link>` before "Settings" inside `profile?.role === 'admin'` guard |

## Implementation Steps

1. **Open `frontend/components/dashboard-header.tsx`**
2. **Locate** the existing admin-only block (around line 93):
   ```tsx
   {profile?.role === 'admin' && (
     <Link href="/admin/settings" className="...">Settings</Link>
   )}
   ```
3. **Replace** that block with:
   ```tsx
   {profile?.role === 'admin' && (
     <>
       <Link
         href="/admin/users"
         className="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md transition-colors"
       >
         Users
       </Link>
       <Link
         href="/admin/settings"
         className="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md transition-colors"
       >
         Settings
       </Link>
     </>
   )}
   ```

## Todo List
- [ ] Open `dashboard-header.tsx`
- [ ] Add "Users" `<Link href="/admin/users">` before "Settings" link inside admin guard

## Success Criteria
- Admin users see "Users" link in nav between "Reports" and "Settings"
- Non-admin users (instructor, student) do not see the "Users" link
- Clicking "Users" navigates to `/admin/users`
- Existing "Settings" link still works and renders correctly

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| JSX fragment wrapper missing around two sibling `<Link>` elements | Low | Low | Wrap both links in `<>...</>` fragment |
| Link appears for instructors (not just admins) | Low | Medium | Confirm inner guard is `profile?.role === 'admin'`, not `isInstructor` |

## Security Considerations
- Nav link is display-only — `AdminGuard` in `admin/layout.tsx` enforces actual access control
- Hiding the link for non-admins is UX polish, not a security boundary

## Next Steps
All four phases complete. Full feature ready for QA:
1. Backend API: filters, create, reactivate, stats
2. Frontend page: stats bar, filter table, pagination, optimistic mutations
3. Modals: create user, edit user
4. Nav: Users link for admin role
