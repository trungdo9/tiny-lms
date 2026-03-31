# Phase 2: Role-based Redirect Logic

## Overview
- **Date**: 2026-03-02
- **Description**: Đảm bảo tất cả protected routes redirect đúng sau khi login
- **Priority**: Medium
- **Status**: ✅ Completed

## Context
- **Parent Plan**: plans/20260302-user-login-page/plan.md
- **Dependencies**: Phase 1

## Requirements
1. Kiểm tra protected routes có redirect sau login không
2. Đảm bảo instructor/admin có thể truy cập các routes tương ứng
3. Thêm middleware hoặc guard để bảo vệ routes theo role

## Architecture
```
Protected Routes:
- /dashboard, /courses, /quizzes, /profile -> student, instructor, admin
- /instructor/* -> instructor, admin
- /admin/* -> admin only
```

## Implementation Steps

### Step 1: Tạo role-based redirect utility
```typescript
// lib/redirect-by-role.ts
export function getRedirectPath(role: string): string {
  switch (role) {
    case 'admin': return '/admin';
    case 'instructor': return '/instructor/courses';
    default: return '/dashboard';
  }
}
```

### Step 2: Cập nhật các protected pages
Thêm check ở mỗi page để redirect nếu không có quyền

### Step 3: Tạo hoặc cập nhật middleware
Sử dụng Next.js middleware hoặc per-page guard

## Todo List
- [x] Create redirect utility
- [x] Update protected routes
- [x] Add role-based middleware

## Success Criteria
- [x] Redirect hoạt động đúng theo role
- [x] User không thể truy cập unauthorized routes

## Risk Assessment
- **Medium**: Cần test kỹ các redirect paths
