# Phase 3: RBAC (Roles & Permissions)

## Overview

**Date:** 2026-02-28
**Priority:** High
**Status:** Pending

Implement role-based access control with guards and decorators.

## Context

- Related: `backend/src/common/guards/supabase-auth.guard.ts`
- Dependencies: Phase 1, Phase 2

## Key Insights

- Current: role stored as String in Profile
- No enforcement of roles in endpoints
- Need: @Roles() decorator, RolesGuard

## Requirements

1. Create role constants/enums
2. Create @Roles() decorator
3. Create RolesGuard
4. Update auth guard to include role in request
5. Apply to existing endpoints

## Architecture

```typescript
// Role enum
export enum Role {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

// Roles decorator
@Roles(Role.ADMIN, Role.INSTRUCTOR)
@Get('users')
getAllUsers() {}

// Guard checks role from JWT or database
```

## Related Files

- `backend/src/common/guards/supabase-auth.guard.ts`
- `backend/src/modules/auth/auth.service.ts` - JWT payload

## Implementation Steps

1. Create `backend/src/common/enums/role.enum.ts`:
   ```typescript
   export enum Role {
     ADMIN = 'admin',
     INSTRUCTOR = 'instructor',
     STUDENT = 'student',
   }
   ```

2. Create `backend/src/common/decorators/roles.decorator.ts`:
   ```typescript
   export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
   ```

3. Create `backend/src/common/guards/roles.guard.ts`:
   - Get roles from decorator
   - Get user role from JWT or DB
   - Check if user has required role

4. Update `supabase-auth.guard.ts`:
   - Add user role to request object

5. Apply to controllers:
   - Instructor courses: @Roles(Role.INSTRUCTOR, Role.ADMIN)
   - User management: @Roles(Role.ADMIN)
   - Student endpoints: default (authenticated)

## Todo List

- [ ] Create role enum
- [ ] Create @Roles decorator
- [ ] Create RolesGuard
- [ ] Update auth guard
- [ ] Apply to endpoints

## Success Criteria

- [ ] @Roles() decorator works
- [ ] RolesGuard enforces roles
- [ ] 403 for unauthorized access

## Security Considerations

- Validate role in JWT, not just trust header
- Admin endpoints properly protected
- No privilege escalation possible
