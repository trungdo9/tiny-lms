# Plan: Email Verification Toggle (Tùy chọn xác thực tài khoản khi đăng ký)

**Date:** 2026-03-04
**Directory:** `plans/20260304-1130-email-verification-toggle/`

---

## Summary

Add a system setting `auth.require_email_verification` (boolean, default `false`).
When `false` (default): new users can login immediately after registration — current behavior.
When `true`: Supabase sends a verification email; user must verify before accessing the system.

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Backend Logic | ✅ Completed | [phase-01-backend.md](./phase-01-backend.md) |
| 2 | Admin UI | ✅ Completed | [phase-02-admin-ui.md](./phase-02-admin-ui.md) |

---

## Key Decisions

- **No DB migration**: Setting stored in existing `settings` table — just seed a new key
- **Supabase controls verification**: `email_confirm: true` in `adminClient.auth.admin.createUser()` = auto-confirm (current); `email_confirm: false` = Supabase sends verification email
- **Default = false**: matches current behavior, zero risk for existing deployments
- **Register response change**: when verification required, return `{ requiresVerification: true, message: '...' }` instead of tokens
- **Frontend register page**: show "check your email" UI when response has `requiresVerification: true`

---

## Docs

- [codebase-summary.md](../../docs/codebase-summary.md)
- [code-standards.md](../../docs/code-standards.md)
