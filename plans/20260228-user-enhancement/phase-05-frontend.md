# Phase 5: Frontend Updates

## Overview

**Date:** 2026-02-28
**Priority:** Medium
**Status:** Pending

Update frontend for new user features.

## Context

- Related: `frontend/app/`
- Dependencies: Phase 2, Phase 3, Phase 4

## Key Insights

- Need admin pages for user management
- Update profile page with new fields

## Requirements

1. Create admin user management pages
2. Enhance profile page
3. Add password change functionality

## Files to Create/Modify

```
frontend/
├── app/
│   ├── (admin)/             # NEW - admin routes
│   │   └── admin/
│   │       └── users/
│   │           ├── page.tsx         # User list
│   │           └── [id]/page.tsx    # User detail
│   └── (student)/
│       └── profile/
│           ├── page.tsx     # Enhanced profile
│           └── security/    # NEW - password & security
│               └── page.tsx
├── components/
│   └── user-table.tsx       # NEW - admin table
```

## Implementation Steps

1. **Profile Page** (`frontend/app/(student)/profile/page.tsx`):
   - Add new profile fields (bio, phone, etc.)
   - Show login history link

2. **Security Page** (`frontend/app/(student)/profile/security/page.tsx`):
   - NEW - Password change
   - Show login history
   - Display device info, IP, location

3. **Admin Users Page** (`frontend/app/(admin)/admin/users/page.tsx`):
   - NEW - User listing with filters
   - Pagination controls
   - Search functionality

4. **Admin User Detail** (`frontend/app/(admin)/admin/users/[id]/page.tsx`):
   - NEW - User details view
   - Edit role dropdown
   - Deactivate button
   - Login history

5. **API Updates** (`frontend/lib/api.ts`):
   - Add usersApi.admin.* methods
   - Add loginHistoryApi

## Todo List

- [ ] Enhance profile page
- [ ] Create admin users list
- [ ] Create admin user detail
- [ ] Add password change

## Success Criteria

- [ ] Profile shows all fields
- [ ] Admin can manage users

## Risk Assessment

- New routes need protection (role check)
- Admin pages hidden from non-admins
