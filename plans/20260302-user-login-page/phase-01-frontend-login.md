# Phase 1: Frontend Login Page Enhancement

## Overview
- **Date**: 2026-03-02
- **Description**: Cập nhật login page với role-based redirect và UI phù hợp cho end user
- **Priority**: High
- **Status**: Pending

## Context
- **Parent Plan**: plans/20260302-user-login-page/plan.md
- **Dependencies**: None
- **Docs**: docs/codebase-summary.md

## Requirements
1. Cập nhật `/login` page tại `frontend/app/(auth)/login/page.tsx`
2. Sau khi login thành công, kiểm tra role và redirect tới:
   - `admin` -> `/admin` hoặc trang admin dashboard
   - `instructor` -> `/instructor/courses`
   - `student` -> `/dashboard`
3. Giữ nguyên form login hiện tại
4. Thêm social login buttons (Google, GitHub) nếu configured

## Architecture
```
Frontend Flow:
1. User enters email/password
2. Call supabase.auth.signInWithPassword()
3. Fetch user profile to get role
4. Redirect based on role
```

## Implementation Steps

### Step 1: Cập nhật auth-context.tsx
Thêm hàm để lấy role từ profile:
```typescript
const fetchUserRole = async (userId: string): Promise<string> => {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return data?.role || 'student';
}
```

### Step 2: Cập nhật login page
Thêm redirect logic sau khi login:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... login logic
  if (!error) {
    const role = await fetchUserRole(user.id);
    switch (role) {
      case 'admin': router.push('/admin'); break;
      case 'instructor': router.push('/instructor/courses'); break;
      default: router.push('/dashboard');
    }
  }
}
```

### Step 3: Cập nhật UI (optional)
- Thêm logo/brand
- Thêm "Quên mật khẩu" link
- Thêm social login buttons

## Todo List
- [ ] Update auth-context with role fetching
- [ ] Update login page with redirect logic
- [ ] Update UI if needed

## Success Criteria
- [ ] User login thành công
- [ ] Redirect đúng theo role (admin/instructor/student)
- [ ] UI vẫn hoạt động tốt

## Risk Assessment
- **Low**: Thay đổi nhỏ, chỉ ảnh hưởng login flow

## Security Considerations
- Đảm bảo role được fetch từ database, không tin tưởng client-side role
