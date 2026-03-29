# Plan: Email Settings UI — Review & Fix

**Date:** 2026-03-04
**Directory:** `plans/20260304-1145-email-settings-ui-fix/`

---

## Summary

Audit + fix the `admin/settings/email` page. Core logic is correct (provider toggle, field visibility, onBlur save) but several UX issues exist. Main gaps: no way to test email settings; misleading labels for secret fields; design inconsistency with the rest of admin UI.

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Fix & Improve Email Settings Page | ✅ Completed | [phase-01-email-settings-fix.md](./phase-01-email-settings-fix.md) |

---

## Audit Results

### ✅ What works correctly
- Provider toggle (SMTP / Resend) saves via `updateSetting('email_provider', provider)`
- SMTP fields only show when `currentProvider === 'smtp'`
- Resend field only shows when `currentProvider === 'resend'`
- Fields save on `onBlur` (only if value changed)
- Secret fields are masked (`***`), show/hide toggle works
- Empty state with "Initialize" button works

### ❌ Bugs / Issues Found

| # | Issue | Severity |
|---|-------|----------|
| 1 | `email_smtp_pass` label shows "Pass" — should say "Password" | Low |
| 2 | `resend_api_key` label shows "Api Key" — should say "API Key" | Low |
| 3 | Secret fields show `***` as `defaultValue` — admin can't tell if a secret is configured or blank; tabbing through a secret field and blurring won't accidentally overwrite (logic is correct) but UX is confusing | Medium |
| 4 | No "Send Test Email" button — admin can't verify settings work after configuring | **High** |
| 5 | Design style is generic Tailwind (blue-500, rounded-lg) — doesn't match the neobrutalist admin UI style used elsewhere | Medium |
| 6 | No help text / placeholder hints for SMTP fields (e.g., "e.g. smtp.gmail.com", "typically 587 or 465") | Low |
| 7 | Missing `email_smtp_secure` (boolean TLS/SSL) setting — required for some SMTP configs (port 465) | Medium |

---

## Docs

- [codebase-summary.md](../../docs/codebase-summary.md)
- [code-standards.md](../../docs/code-standards.md)
