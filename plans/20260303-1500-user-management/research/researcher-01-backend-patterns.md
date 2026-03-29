# NestJS + Supabase User Management Patterns Research
**Date:** March 3, 2026 | **Max 150 lines** | **Focus: Practical implementation insights**

## Executive Summary
Supabase `admin.createUser()` requires only `email` + `password`; does NOT auto-create profile rows (manual trigger needed). Current codebase has transaction safety gap: profile creation can fail silently after auth user succeeds. Use soft-delete (isActive flag) for LMS—hard delete risks GDPR/audit issues. Pagination pattern already correct in codebase (OR search + AND filters via Prisma `where` clause).

## Key Findings

### 1. Supabase admin.createUser() Behavior
**Required parameters:**
- `email` (string, required)
- `password` (string, required)

**Optional but useful:**
- `email_confirm` (boolean) - skip verification email; default false
- `user_metadata` (object) - custom data stored in auth.users table
- `phone_confirm` (boolean) - auto-confirm phone if using phone auth

**Return type:** `{ data: { user: { id, email, ...metadata } }, error: null }` on success

**Critical: Does NOT auto-create profile row.** Must manually insert into `profiles` table or use PostgreSQL trigger (`AFTER INSERT on auth.users`).

Current code (auth.service.ts line 18-25) correctly implements this pattern but lacks transaction safety.

### 2. DTO Best Practices for Admin User Creation
**Current pattern in codebase uses inline DTOs.** Recommended upgrade:

```typescript
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdminUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain uppercase, number, special char'
  })
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @IsEnum(['admin', 'instructor', 'student'])
  role: string = 'student';

  @IsOptional()
  emailConfirm: boolean = true;
}
```

**Key decorators:** `@IsEmail()`, `@MinLength`, `@Matches` for regex validation, `@Transform` for normalization. Use `class-validator` + `class-transformer` (already in deps).

### 3. Transaction Safety: Auth User + Profile Mismatch
**Current risk:** If `admin.createUser()` succeeds but profile insert fails → orphaned auth user.

**Recommended pattern:**
```typescript
async createAdminUser(dto: CreateAdminUserDto) {
  const { data: authData, error: authError } =
    await this.supabase.adminClient.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: dto.emailConfirm,
      user_metadata: { full_name: dto.fullName }
    });

  if (authError) throw new BadRequestException(authError.message);

  try {
    await this.prisma.profile.create({
      data: {
        id: authData.user.id,
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        isActive: true
      }
    });
  } catch (profileError) {
    // Rollback: delete auth user if profile creation fails
    await this.supabase.adminClient.auth.admin.deleteUser(authData.user.id);
    throw new BadRequestException('User creation failed');
  }
  return { userId: authData.user.id, email: dto.email };
}
```

**Notes:** Prisma handles DB atomicity. If profile insert fails, catch block cleans up Supabase auth user. This prevents orphaned records.

### 4. Hard Delete vs Soft Delete for LMS
**Hard delete (auth.admin.deleteUser()):**
- Pros: Instant GDPR compliance, frees email for reuse
- Cons: Irreversible, loses enrollment history, breaks audit trails, breaks foreign keys if not cascade-configured

**Soft delete (isActive = false):**
- Pros: Audit trail, recover accounts, preserve course history/certificates, compliance with course records retention
- Cons: Email still reserved, requires WHERE isActive = true in queries

**Recommendation for LMS: Soft delete.** Mark `isActive: false` in profiles table. Keep auth user in Supabase (user exists but cannot log in). Preserves student work, completion records, certificates. Hard delete only after data retention period (e.g., 7 years).

Current code (users.controller.ts line 276, deactivateUser) uses soft delete—correct pattern.

### 5. Pagination + Combined Filters (OR + AND)
**Current working pattern in searchUsers (users.service.ts line 60-100):**

```typescript
const where = query ? {
  OR: [
    { fullName: { contains: query, mode: 'insensitive' } },
    { email: { contains: query, mode: 'insensitive' } }
  ]
} : {};

// Add AND constraints:
const whereWithRole = {
  ...where,
  role: 'student', // AND constraint
  isActive: true   // AND constraint
};

await this.prisma.profile.findMany({
  where: whereWithRole,
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

**Offset vs Cursor:** Use offset pagination for small sets (<10k rows). Cursor pagination better for large sets. Current code uses offset (correct for LMS user lists).

## Implementation Checklist
- [ ] Create `CreateAdminUserDto` with email/password validation
- [ ] Add transaction rollback in admin user creation (catch profile fail, delete auth user)
- [ ] Soft-delete only; update queries to filter `WHERE isActive = true`
- [ ] Audit log admin actions (who deleted user, when)
- [ ] Test email uniqueness across soft-deleted users (email_unique index may block reuse)

## Unresolved Questions
1. Should Supabase auth users auto-trigger profile creation via trigger or be manual responsibility?
2. What's data retention policy—how long before hard delete soft-deleted users?
3. Need to validate: can soft-deleted users' emails be reused in Supabase after profile restoration?
