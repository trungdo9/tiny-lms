# Plan: User Login Page

## Overview
Tạo trang login riêng biệt cho end user (student/instructor), tách biệt với admin login. Cập nhật routing logic để redirect theo role sau khi login.

## Status: ✅ COMPLETED (Phase 1 & 2)

## Phases
1. [Phase 1: Frontend Login Page Enhancement](phase-01-frontend-login.md) - ✅ Done
2. [Phase 2: Role-based Redirect Logic](phase-02-role-redirect.md) - ✅ Done
3. [Phase 3: Admin Login Separation](phase-03-admin-login.md) - N/A (Option A: single login + role redirect)

## Key Changes
- Frontend: Cập nhật `/login` page với role-based redirect
- Frontend: Cập nhật auth-context để lưu role và redirect sau login
- Backend: Đã có role trong JWT token (kiểm tra lại)

## Related Files
- `frontend/app/(auth)/login/page.tsx`
- `frontend/lib/auth-context.tsx`
- `backend/src/modules/auth/auth.service.ts`
