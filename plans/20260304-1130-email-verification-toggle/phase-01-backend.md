# Phase 01 — Backend Logic

**Ref:** [plan.md](./plan.md)
**Blocks:** [phase-02-admin-ui.md](./phase-02-admin-ui.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Inject SettingsService into AuthService; toggle `email_confirm` flag based on setting; seed default setting |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Current registration in `auth.service.ts`:
  ```typescript
  await supabase.adminClient.auth.admin.createUser({
    email, password, email_confirm: true,  // ← auto-confirm
    user_metadata: { full_name: fullName }
  });
  ```
  `email_confirm: true` = skip verification, user logs in immediately.

- To require verification: pass `email_confirm: false` → Supabase sends a verification email automatically (configured in Supabase dashboard email templates).

- When verification required: cannot generate JWT tokens at registration time (user not yet verified). Return `{ requiresVerification: true }` instead.

- `SettingsService` already has `get(key)` method that returns a typed value. Inject into `AuthService` by importing `SettingsModule` in `AuthModule`.

- Setting seed: add to `SettingsService.seedDefaults()` in the `auth` category.

---

## Requirements

1. Add `auth.require_email_verification` to `SettingsService.seedDefaults()` — boolean, default `false`, category `auth`
2. Inject `SettingsService` into `AuthService`
3. Modify `register()`:
   - Read setting value
   - If `true`: `email_confirm: false`, skip token generation, return `{ requiresVerification: true, message: 'Please verify your email' }`
   - If `false`: keep `email_confirm: true`, current behavior unchanged

---

## Architecture

### `settings.service.ts` — add to `seedDefaults()`

```typescript
{
  key: 'auth.require_email_verification',
  value: 'false',
  type: 'boolean',
  category: 'auth',
  isPublic: true,         // frontend needs to read it
  description: 'Require users to verify email after registration',
}
```

### `auth.module.ts` — import SettingsModule

```typescript
imports: [SettingsModule],   // add
```

### `auth.service.ts` — updated `register()`

```typescript
async register(email: string, password: string, fullName?: string) {
  // Check setting
  const requireVerification = await this.settingsService
    .get('auth.require_email_verification')
    .then(s => s?.value === true)
    .catch(() => false);   // default false if setting not found

  const { data, error } = await this.supabase.adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: !requireVerification,   // ← key change
    user_metadata: { full_name: fullName },
  });

  if (error) throw new BadRequestException(error.message);

  // Create profile (always)
  await this.prisma.profile.create({...});

  if (requireVerification) {
    return { requiresVerification: true, message: 'Please check your email to verify your account.' };
  }

  // Existing token generation path (unchanged)
  return { user: data.user, session: ... };
}
```

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/src/modules/settings/settings.service.ts` | Add `auth.require_email_verification` to `seedDefaults()` |
| `backend/src/modules/auth/auth.module.ts` | Import `SettingsModule` |
| `backend/src/modules/auth/auth.service.ts` | Inject `SettingsService`, modify `register()` |

---

## Implementation Steps

1. Open `settings.service.ts` → add new setting to `seedDefaults()` array
2. Open `auth.module.ts` → add `SettingsModule` to `imports`
3. Open `auth.service.ts`:
   - Add `settingsService: SettingsService` to constructor
   - Update `register()` as above
4. Run `npm run build` to verify no TS errors
5. Call `POST /settings/seed` to seed the new setting into DB

---

## Todo List

- [ ] Add setting to `seedDefaults()` in `settings.service.ts`
- [ ] Import `SettingsModule` in `auth.module.ts`
- [ ] Inject `SettingsService` in `auth.service.ts`
- [ ] Update `register()` logic
- [ ] `npm run build` passes
- [ ] Call `POST /settings/seed` to add new key to DB

---

## Success Criteria

- `POST /auth/register` with setting `false` (default): returns `{ user, session }` — identical to current behavior
- `POST /auth/register` with setting `true`: returns `{ requiresVerification: true, message: '...' }`, user receives verification email from Supabase
- Build passes with no TS errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `SettingsService.get()` throws if key not found | Medium | Low | Wrap in try/catch with `false` default |
| Supabase not configured to send emails | Medium | Medium | Document: admin must configure Supabase email in dashboard; the toggle only works when Supabase email is set up |
| Circular dependency `AuthModule` ↔ `SettingsModule` | Low | Medium | `SettingsModule` has no dependency on `AuthModule` — no circular risk |

---

## Security Considerations

- This setting is `isPublic: true` so frontend can read it (needed to show/hide "verify email" UI hint on register page)
- `email_confirm` flag is set server-side — client cannot bypass

---

## Unresolved Questions

1. Should `isPublic: true` on this setting? Frontend register page benefits from knowing if verification is required to show correct UI. Recommendation: yes, expose it.
2. Does `SettingsService.get()` return `null` or throw when key not found? Check implementation — currently returns `null` if not found (safe to use `?.value`).

---

## Next Steps

→ Phase 02: Admin UI toggle
