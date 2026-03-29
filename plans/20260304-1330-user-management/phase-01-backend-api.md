# Phase 01 — Backend API Enhancements
**Date:** 2026-03-04 | **Priority:** High | **Status:** Pending

## Context Links
- [Plan overview](./plan.md)
- [users.controller.ts](../../backend/src/modules/users/users.controller.ts)
- [users.service.ts](../../backend/src/modules/users/users.service.ts)
- [users.module.ts](../../backend/src/modules/users/users.module.ts)
- [schema.prisma](../../backend/prisma/schema.prisma) — Profile model

## Overview
Enhance existing users module with: better list filters (role, isActive, sort), user creation via Supabase Admin API, stats endpoint, reactivation, and password reset. All new endpoints admin-only.

## Key Insights
- Existing `searchUsers()` already accepts `role` param but only from the `search` endpoint, not `admin/all`. The `getAllUsers` handler passes `searchUsers(query.q, page, limit)` without role — needs to forward role + new filters.
- `adminClient.auth.admin.createUser()` does NOT auto-create profile row. Manual insert required with rollback on failure.
- Static routes (`admin/stats`, `POST admin`) MUST be declared before `admin/:id` in controller to avoid NestJS route matching conflict.
- `isActive` arrives as string from query params — must parse to boolean before Prisma.
- Inline DTOs in controller file matches existing pattern (no `dto/` folder in users module).

## Requirements

### Functional
1. `GET /users/admin/all` — add `role`, `isActive`, `sortBy`, `sortOrder` query params
2. `GET /users/admin/stats` — `{ total, students, instructors, admins, inactive }`
3. `POST /users/admin` — create Supabase auth user + profile row; rollback auth on profile failure
4. `PUT /users/admin/:id/reactivate` — set `isActive: true`
5. `PUT /users/admin/:id/reset-password` — reset via Supabase admin API

### Non-functional
- All endpoints: `SupabaseAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)`
- Password validation: min 8 chars, uppercase, number, special char

## Architecture

### Enhanced `UserQueryDto`
```typescript
class UserQueryDto {
  page?: string;
  limit?: string;
  q?: string;
  role?: string;       // NEW: student | instructor | admin
  isActive?: string;   // NEW: 'true' | 'false'
  sortBy?: string;     // NEW: createdAt | fullName | email
  sortOrder?: string;  // NEW: asc | desc
}
```

### New `CreateAdminUserDto`
```typescript
class CreateAdminUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString() @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
  password: string;

  @IsString() @IsOptional() @MaxLength(100)
  fullName?: string;

  @IsIn(['student', 'instructor', 'admin']) @IsOptional()
  role?: string;
}
```

### New `ResetPasswordDto`
```typescript
class ResetPasswordDto {
  @IsString() @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
  newPassword: string;
}
```

### Service: enhanced `searchUsers`
```typescript
async searchUsers(query: string, page = 1, limit = 20, filters?: {
  role?: string; isActive?: boolean;
  sortBy?: 'createdAt' | 'fullName' | 'email'; sortOrder?: 'asc' | 'desc';
}) {
  const where: any = {};
  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (filters?.role) where.role = filters.role;
  if (filters?.isActive !== undefined) where.isActive = filters.isActive;

  const orderBy = filters?.sortBy
    ? { [filters.sortBy]: filters.sortOrder ?? 'asc' }
    : { createdAt: 'desc' as const };
  // ... existing findMany + count with updated where/orderBy
  // Add lastLoginAt to select
}
```

### Service: `createUser` (rollback pattern)
```typescript
async createUser(dto: { email: string; password: string; fullName?: string; role?: string }) {
  const { data: authData, error } =
    await this.supabase.adminClient.auth.admin.createUser({
      email: dto.email, password: dto.password, email_confirm: true,
    });
  if (error) throw new BadRequestException(error.message);
  try {
    return await this.prisma.profile.create({
      data: { id: authData.user.id, email: dto.email,
              fullName: dto.fullName, role: dto.role ?? 'student', isActive: true },
    });
  } catch {
    await this.supabase.adminClient.auth.admin.deleteUser(authData.user.id);
    throw new BadRequestException('Failed to create user profile');
  }
}
```

### Service: `getUserStats`
```typescript
async getUserStats() {
  const [total, students, instructors, admins, inactive] = await Promise.all([
    this.prisma.profile.count(),
    this.prisma.profile.count({ where: { role: 'student' } }),
    this.prisma.profile.count({ where: { role: 'instructor' } }),
    this.prisma.profile.count({ where: { role: 'admin' } }),
    this.prisma.profile.count({ where: { isActive: false } }),
  ]);
  return { total, students, instructors, admins, inactive };
}
```

### Service: `reactivateUser` and `resetUserPassword`
```typescript
async reactivateUser(id: string) {
  return this.prisma.profile.update({ where: { id }, data: { isActive: true } });
}

async resetUserPassword(id: string, newPassword: string) {
  const { error } = await this.supabase.adminClient.auth.admin.updateUserById(id, {
    password: newPassword,
  });
  if (error) throw new BadRequestException(error.message);
  return { success: true };
}
```

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `backend/src/modules/users/users.controller.ts` | MODIFY | Enhance `UserQueryDto`, add `CreateAdminUserDto`, `ResetPasswordDto`, 4 new endpoints |
| `backend/src/modules/users/users.service.ts` | MODIFY | Enhance `searchUsers`, add `createUser`, `getUserStats`, `reactivateUser`, `resetUserPassword` |

## Implementation Steps

1. **Controller imports** — add `Post` from `@nestjs/common`; `IsEmail`, `IsString`, `IsIn`, `IsOptional`, `MinLength`, `MaxLength`, `Matches` from `class-validator`; `Transform` from `class-transformer`
2. **Enhance `UserQueryDto`** — add `role?`, `isActive?`, `sortBy?`, `sortOrder?` fields
3. **Add `CreateAdminUserDto`** and **`ResetPasswordDto`** inline below `UpdateUserDto`
4. **Update `getAllUsers` handler** — parse `isActive` string to boolean, whitelist `sortBy`, pass filters object to `searchUsers`
5. **Add static endpoints BEFORE `admin/:id`** (route order matters):
   - `GET admin/stats` — calls `getUserStats()`
   - `POST admin` — calls `createUser(dto)`, use `@Body(new ValidationPipe())` for DTO validation
6. **Add parametric endpoints AFTER existing `admin/:id`**:
   - `PUT admin/:id/reactivate` — calls `reactivateUser(id)`
   - `PUT admin/:id/reset-password` — calls `resetUserPassword(id, dto.newPassword)`
7. **Service: enhance `searchUsers`** — accept filters object, build where/orderBy, add `lastLoginAt` to select
8. **Service: add `createUser`** — Supabase auth + profile with catch/rollback
9. **Service: add `getUserStats`** — 5 parallel counts
10. **Service: add `reactivateUser`** — update `isActive: true`
11. **Service: add `resetUserPassword`** — `adminClient.auth.admin.updateUserById`

## Todo List
- [ ] Add imports to controller (Post, class-validator decorators, class-transformer)
- [ ] Enhance `UserQueryDto` with role, isActive, sortBy, sortOrder
- [ ] Add `CreateAdminUserDto` and `ResetPasswordDto` inline classes
- [ ] Update `getAllUsers` to parse and forward filters
- [ ] Add `GET admin/stats` endpoint (before `admin/:id`)
- [ ] Add `POST admin` endpoint (before `admin/:id`)
- [ ] Add `PUT admin/:id/reactivate` endpoint
- [ ] Add `PUT admin/:id/reset-password` endpoint
- [ ] Service: enhance `searchUsers` with filters + sort + lastLoginAt
- [ ] Service: add `createUser` with rollback
- [ ] Service: add `getUserStats`, `reactivateUser`, `resetUserPassword`

## Success Criteria
- `GET /users/admin/all?role=student&isActive=true&sortBy=email&sortOrder=asc` returns filtered results
- `GET /users/admin/stats` returns `{ total, students, instructors, admins, inactive }`
- `POST /users/admin` creates both auth user and profile; orphan cleanup on failure
- `PUT /users/admin/:id/reactivate` sets `isActive: true`
- `PUT /users/admin/:id/reset-password` resets via Supabase
- All endpoints return 403 for non-admin callers

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Orphaned auth user if profile insert fails | Low | High | Catch block deletes auth user via `adminClient.auth.admin.deleteUser` |
| `admin/stats` matched as `admin/:id` | Medium | High | Declare static routes before parametric in controller |
| `isActive` string not coerced to boolean | Medium | Medium | Explicit `=== 'true'` parse in controller |
| `sortBy` injection into Prisma orderBy | Low | Medium | Whitelist: only `createdAt`, `fullName`, `email` |

## Security Considerations
- `email_confirm: true` skips verification for admin-created accounts
- Soft-delete only (no hard delete) prevents accidental data loss
- Double guard: `SupabaseAuthGuard` (JWT valid) + `RolesGuard` (role = admin)
- Password policy enforced via class-validator

## Next Steps
Proceed to Phase 2 — Frontend Admin UI.
