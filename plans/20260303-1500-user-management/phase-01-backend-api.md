# Phase 01 — Backend API Enhancements
**Date:** 2026-03-03 | **Priority:** High | **Status:** Pending

## Context Links
- [Plan overview](./plan.md)
- [Backend patterns research](./research/researcher-01-backend-patterns.md)
- [users.service.ts](../../backend/src/modules/users/users.service.ts)
- [users.controller.ts](../../backend/src/modules/users/users.controller.ts)

## Overview
Enhance `searchUsers` with role/status/sort filters, add `createUser` (Supabase auth + profile with rollback), `reactivateUser`, and `getUserStats`, then expose new endpoints on the controller.

## Key Insights
- `adminClient.auth.admin.createUser()` does NOT auto-create profile row — manual insert required
- Profile insert failure must trigger `adminClient.auth.admin.deleteUser(authUserId)` to prevent orphan
- Inline DTOs in controller file is the existing pattern (no `dto/` folder in users module)
- Route ordering critical: static routes (`admin/stats`, `POST admin`) must precede `admin/:id`
- `isActive` arrives as string from URL params — parse `=== 'true'` before passing to service
- Whitelist `sortBy` values to prevent injection: only `createdAt`, `fullName`, `email`

## Requirements

### Functional
1. `GET /users/admin/all` — add `role`, `isActive`, `sortBy`, `sortOrder` query params; include `lastLoginAt` in response
2. `GET /users/admin/stats` — return `{ total, students, instructors, admins, inactive }`
3. `POST /users/admin` — create Supabase auth user + profile row; rollback auth user on profile failure
4. `PUT /users/admin/:id/reactivate` — set `isActive: true`
5. `PUT /users/admin/:id/reset-password` — reset user password via Supabase admin API (no old password required)

### Non-functional
- All new endpoints: `SupabaseAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)`
- Password: min 8 chars, at least one uppercase, one number, one special char
- `email_confirm: true` on all admin-created users — no email verification required
- Deactivation is **app-level only** (`isActive: false`) — no Supabase auth-level ban needed

## Architecture

### DTOs to add (inline in controller, below existing `UpdateUserDto`)

**`UserQueryDto`** — add 4 new optional string fields: `role?`, `isActive?`, `sortBy?`, `sortOrder?`

**`CreateAdminUserDto`:**
```typescript
class CreateAdminUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString() @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password needs uppercase, number, and special character',
  })
  password: string;

  @IsString() @IsOptional() @MaxLength(100)
  fullName?: string;

  @IsEnum(['student', 'instructor', 'admin']) @IsOptional()
  role?: string;
}
```

### `searchUsers` — enhanced filter logic
```typescript
// users.service.ts — updated signature
async searchUsers(query: string, page = 1, limit = 20, filters?: {
  role?: string; isActive?: boolean;
  sortBy?: 'createdAt' | 'fullName' | 'email'; sortOrder?: 'asc' | 'desc';
})

// WHERE construction
const baseWhere = query
  ? { OR: [
      { fullName: { contains: query, mode: 'insensitive' } },
      { email:    { contains: query, mode: 'insensitive' } },
    ]}
  : {};
const where = {
  ...baseWhere,
  ...(filters?.role !== undefined       ? { role: filters.role }           : {}),
  ...(filters?.isActive !== undefined   ? { isActive: filters.isActive }   : {}),
};
const orderBy = filters?.sortBy
  ? { [filters.sortBy]: filters.sortOrder ?? 'asc' }
  : { createdAt: 'desc' };
```

### `createUser` — rollback pattern
```typescript
async createUser(dto: CreateAdminUserDto) {
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

### `getUserStats` — 5 parallel counts
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

### `resetUserPassword`
```typescript
async resetUserPassword(id: string, newPassword: string) {
  const { error } = await this.supabase.adminClient.auth.admin.updateUserById(id, {
    password: newPassword,
  });
  if (error) throw new BadRequestException(error.message);
  return { success: true };
}
```

**DTO inline in controller:**
```typescript
class ResetPasswordDto {
  @IsString() @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password needs uppercase, number, and special character',
  })
  newPassword: string;
}
```

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `backend/src/modules/users/users.service.ts` | MODIFY | Add `createUser`, `reactivateUser`, `getUserStats`; enhance `searchUsers` |
| `backend/src/modules/users/users.controller.ts` | MODIFY | Add `CreateAdminUserDto`, enhance `UserQueryDto`, add 3 endpoints, add new imports |

## Implementation Steps

1. **`users.controller.ts`** — add imports: `Post` from `@nestjs/common`; `IsEmail`, `IsString`, `IsEnum`, `IsOptional`, `MinLength`, `MaxLength`, `Matches` from `class-validator`; `Transform` from `class-transformer`
2. **Enhance `UserQueryDto`** — add `role?`, `isActive?`, `sortBy?`, `sortOrder?` as optional `string` fields
3. **Add `CreateAdminUserDto`** class inline below `UpdateUserDto`
4. **Update `getAllUsers` handler** — parse new params; convert `isActive` string to boolean; pass `filters` to `searchUsers`
5. **Add endpoints** (in order, BEFORE `admin/:id`): `GET admin/stats`, `POST admin`, then after `:id` endpoints: `PUT admin/:id/reactivate`
6. **`users.service.ts`** — update `searchUsers` with new signature, where/orderBy construction, add `lastLoginAt` to `select`
7. **Add `createUser`** with try/catch rollback (`email_confirm: true`)
8. **Add `reactivateUser`** — `prisma.profile.update({ where: { id }, data: { isActive: true } })`
9. **Add `getUserStats`** — 5 parallel counts
10. **Add `resetUserPassword`** — `adminClient.auth.admin.updateUserById(id, { password: newPassword })`

## Todo List
- [ ] Controller: add imports, enhance `UserQueryDto`, add `CreateAdminUserDto` + `ResetPasswordDto`
- [ ] Controller: add `GET admin/stats`, `POST admin` (before `admin/:id`), `PUT admin/:id/reactivate`, `PUT admin/:id/reset-password`
- [ ] Controller: update `getAllUsers` to pass filters (isActive string→boolean coercion)
- [ ] Service: enhance `searchUsers` (filters, sortBy, lastLoginAt in select)
- [ ] Service: add `createUser`, `reactivateUser`, `getUserStats`, `resetUserPassword`

## Success Criteria
- `GET /users/admin/all?role=student&isActive=true&sortBy=email&sortOrder=asc` returns correct filtered list
- `GET /users/admin/stats` returns `{ total, students, instructors, admins, inactive }`
- `POST /users/admin` with valid payload creates both auth user and profile; on profile failure, auth user deleted
- `PUT /users/admin/:id/reactivate` sets `isActive: true`
- All endpoints return 403 for non-admin callers

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Orphaned auth user if profile insert fails | Low | High | Catch block deletes auth user |
| `admin/stats` matched as `admin/:id` | Medium | High | Declare static routes before parametric in controller |
| `isActive` string not coerced to boolean | Medium | Medium | Explicit `=== 'true'` parse in controller |
| `sortBy` field injection into Prisma orderBy | Low | Medium | Whitelist: only `createdAt`, `fullName`, `email` allowed |

## Security Considerations
- `email_confirm: true` skips verification — admin-created accounts activate immediately; acceptable for internal admin tool
- Soft-delete only — no hard delete endpoint prevents accidental data loss
- Double guard on all admin routes: `SupabaseAuthGuard` (JWT valid) + `RolesGuard` (role = admin)

## Next Steps
- Extend `adminUsersApi` in `frontend/lib/api.ts` with `createUser`, `reactivateUser`, `getStats`
- Proceed to Phase 2 (frontend page)
