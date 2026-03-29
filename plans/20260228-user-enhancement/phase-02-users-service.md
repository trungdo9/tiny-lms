# Phase 2: UsersService Refactor

## Overview

**Date:** 2026-02-28
**Priority:** High
**Status:** Pending

Create separate UsersService and fix duplicate endpoints.

## Context

- Related: `backend/src/modules/users/users.controller.ts`
- Related: `backend/src/modules/auth/auth.service.ts`
- Dependencies: Phase 1 (Database)

## Key Insights

- Current UsersController uses AuthService for profile operations
- Duplicate `/auth/me` and `/users/me` endpoints
- Need proper separation of concerns

## Requirements

1. Create UsersService with profile operations
2. Remove duplicate endpoints from UsersController
3. Keep auth-related operations in AuthService

## Architecture

```
backend/src/modules/users/
├── users.module.ts          # Update module
├── users.service.ts        # NEW - profile operations
├── users.controller.ts     # Update - remove duplicate
├── dto/
│   ├── update-profile.dto.ts
│   └── user-query.dto.ts
```

## Related Files

- `backend/src/modules/users/users.controller.ts` - Duplicate endpoints at lines 35-43
- `backend/src/modules/auth/auth.service.ts` - Profile operations
- `backend/src/modules/auth/auth.controller.ts` - /auth/me at lines 82-91

## Implementation Steps

1. Create `users.service.ts` with methods:
   - `findById(id)` - Get user by ID
   - `updateProfile(id, dto)` - Update profile
   - `updateAvatar(id, url)` - Update avatar
   - `searchUsers(query, pagination)` - Search users
   - `recordLogin(profileId, loginData)` - Record login

2. Update `users.controller.ts`:
   - Remove GET /users/me (keep only for current user)
   - Add GET /users/:id (get by ID)
   - Add pagination support

3. Update `users.module.ts`:
   - Add UsersService to providers

4. Remove duplicate from `auth.controller.ts`:
   - Keep /auth/me for auth context
   - Or redirect to /users/me

## Todo List

- [ ] Create users.service.ts
- [ ] Update users.controller.ts
- [ ] Update users.module.ts
- [ ] Fix duplicate endpoints
- [ ] Add recordLogin method

## Success Criteria

- [ ] UsersService handles all profile operations
- [ ] No duplicate endpoints
- [ ] Login history recorded on auth

## Risk Assessment

- Breaking change if frontend uses specific endpoint
- Need to update frontend API calls
