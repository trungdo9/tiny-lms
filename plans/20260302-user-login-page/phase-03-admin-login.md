# Phase 3: Admin Login Separation

## Overview
- **Date**: 2026-03-02
- **Description**: Tạo trang login riêng cho admin (tùy chọn)
- **Priority**: Low
- **Status**: Pending

## Context
- **Parent Plan**: plans/20260302-user-login-page/plan.md
- **Dependencies**: Phase 1 & 2
- **Note**: Có thể không cần thiết nếu Phase 1 đã hoạt động tốt

## Requirements (Optional)
1. Tạo `/admin/login` page riêng
2. Admin có thể login qua route riêng biệt
3. Hoặc giữ nguyên như hiện tại (một login page, redirect theo role)

## Decision Point
- **Option A**: Giữ nguyên một login page, redirect theo role (recommended)
- **Option B**: Tạo admin login riêng

**Recommendation**: Option A - đơn giản hơn và UX tốt hơn cho user

## Implementation (nếu chọn Option B)

### Step 1: Tạo admin login page
```
frontend/app/admin/login/page.tsx
```

### Step 2: Cập nhật routes
- `/login` -> user login (student/instructor)
- `/admin/login` -> admin login

### Step 3: Cập nhật auth flow
- Admin login redirect về `/admin`
- User login redirect theo role

## Todo List
- [ ] Create admin login page (if needed)
- [ ] Update routes
- [ ] Test auth flow

## Success Criteria
- [ ] Admin có thể login riêng (nếu implement)
- [ ] Hoặc role-based redirect hoạt động tốt (nếu không implement)

## Risk Assessment
- **Low**: Tùy chọn, có thể bỏ qua nếu Phase 1 đã đủ
