# Phase 1: Database Schema Changes

## Overview

**Date:** 2026-02-28
**Priority:** High
**Status:** Pending

Add fields and enums for enhanced user management.

## Context

- Related: Prisma schema at `backend/prisma/schema.prisma`
- Dependencies: None

## Key Insights

- Profile model already has basic fields
- Need to add role enum/constants
- Supabase Auth handles authentication, not in our DB

## Requirements

1. Add role enum/constants
2. Add profile enhancement fields (optional)

## Architecture

```typescript
// Role enum (TypeScript)
export enum Role {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

// Optional: Enhanced Profile fields
model Profile {
  // ... existing fields

  // Optional enhancement fields
  lastLoginAt   DateTime? @map("last_login_at")
  emailVerified Boolean?  @map("email_verified")
}
```

## Related Files

- `backend/prisma/schema.prisma` - Profile model (lines 13-35)

## Implementation Steps

1. Create role enum in backend/src/common/enums/
2. Add optional lastLoginAt, emailVerified to Profile
3. Generate Prisma migration
4. Update types

## Success Criteria

- [ ] Role enum created
- [ ] Migration runs without errors

## Security Considerations

- Role changes should be admin-only
