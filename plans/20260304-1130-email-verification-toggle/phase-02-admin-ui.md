# Phase 02 — Admin UI

**Ref:** [plan.md](./plan.md)
**Depends on:** [phase-01-backend.md](./phase-01-backend.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Add toggle in admin settings; update frontend register page to handle verification response |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Admin settings pages pattern: `frontend/app/admin/settings/page.tsx` (general) and `branding/page.tsx` — both use `settingsApi.getByCategory()` + `settingsApi.update()` with TanStack Query
- No new page needed — add an "Auth" section inside the existing `admin/settings/page.tsx` (or create `admin/settings/auth/page.tsx` if page is already large)
- Neobrutalist design: match existing settings page style (white card, black border, thick shadow)
- Toggle component: use a simple `<input type="checkbox">` styled as a toggle — or a `<label>` + `<input type="checkbox">` — matching existing form patterns
- Register page (`frontend/app/(auth)/register/page.tsx`): already shows a success state. Add a new `requiresVerification` boolean state; when `true`, show "Check your email" message instead of immediate redirect

---

## Requirements

1. **Admin settings UI**: Add "Auth Settings" section with `require_email_verification` toggle
2. **Register page**: Handle `{ requiresVerification: true }` response — show email verification pending message

---

## Architecture

### Admin Settings — where to add

Option A (recommended): Add a new route `frontend/app/admin/settings/auth/page.tsx` — dedicated auth settings page, following the same pattern as `branding/page.tsx`.

Add link in `admin/settings/layout.tsx` sidebar.

### `frontend/app/admin/settings/auth/page.tsx`

```typescript
'use client';
// Fetch: settingsApi.getByCategory('auth')
// Render: toggle for auth.require_email_verification

// Toggle JSX (neobrutalist):
<div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_#000]">
  <h2 className="font-black text-xl mb-4">Authentication Settings</h2>
  <div className="flex items-center justify-between py-3 border-b-2 border-black">
    <div>
      <p className="font-bold">Require Email Verification</p>
      <p className="text-sm text-gray-600">
        When enabled, new users must verify their email before accessing the system.
        Default: disabled.
      </p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={requireVerification}
        onChange={handleToggle}
        className="sr-only peer"
      />
      {/* Neobrutalist toggle: thick border, yellow when on */}
      <div className="w-14 h-8 border-[3px] border-black bg-gray-200 peer-checked:bg-[#ffdb33]
                      shadow-[2px_2px_0px_0px_#000] relative after:absolute after:top-0.5
                      after:left-0.5 after:w-5 after:h-5 after:border-2 after:border-black
                      after:bg-white peer-checked:after:translate-x-6 after:transition-transform" />
    </label>
  </div>
</div>
```

Save via `settingsApi.update('auth.require_email_verification', { value: !requireVerification, type: 'boolean' })`.

### Register page update

```typescript
// Add to state:
const [requiresVerification, setRequiresVerification] = useState(false);

// In handleSubmit, after signUp:
const result = await signUp(email, password, fullName);
if ((result as any).requiresVerification) {
  setRequiresVerification(true);
  return;
}
// ... existing redirect logic

// In JSX — replace/extend the success state:
if (requiresVerification) {
  return (
    <div className="...neobrutalist success card...">
      <div className="text-4xl mb-4">📧</div>
      <h2 className="font-black text-2xl">Kiểm tra email của bạn!</h2>
      <p>Chúng tôi đã gửi email xác thực đến <strong>{email}</strong>.</p>
      <p>Vui lòng kiểm tra hộp thư và nhấn vào liên kết xác thực.</p>
    </div>
  );
}
```

Note: `useAuth().signUp()` currently wraps Supabase `signUp()`. Need to check if `auth.service.ts` is called via API or directly via Supabase client. Looking at the register page — it uses `useAuth().signUp()` which calls Supabase directly (client-side), NOT the NestJS backend `POST /auth/register`.

**Key architectural question**: The register page calls `supabase.auth.signUp()` client-side, which always sends a verification email based on Supabase project settings (not the NestJS setting). The NestJS `POST /auth/register` uses admin API with `email_confirm`.

**Decision**: Need to check which path the frontend register page uses. If client-side Supabase `signUp()`, then:
- Option A: Change frontend to call `POST /auth/register` (NestJS) instead of client-side Supabase → NestJS controls the flow
- Option B: Sync the Supabase project "email confirmation" setting via Supabase Management API — complex, not recommended
- **Recommendation: Option A** — change register page to call `POST /auth/register` via `authApi.register()` and handle the response

### `frontend/lib/api.ts` — add `authApi`

```typescript
export const authApi = {
  register: (data: { email: string; password: string; fullName?: string }) =>
    fetchApi<{ user?: object; session?: object; requiresVerification?: boolean; message?: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) }
    ),
};
```

### Updated register flow

```typescript
// Instead of: const result = await signUp(email, password, fullName)
// Use: const result = await authApi.register({ email, password, fullName })
// Then: if (result.requiresVerification) → show verification pending UI
// Else: call supabase.auth.signInWithPassword() to get session, then redirect
```

---

## Related Code Files

| File | Change |
|------|--------|
| `frontend/app/admin/settings/auth/page.tsx` | NEW — auth settings page with toggle |
| `frontend/app/admin/settings/layout.tsx` | Add "Auth" link to sidebar |
| `frontend/app/(auth)/register/page.tsx` | Call NestJS API instead of Supabase directly; handle `requiresVerification` |
| `frontend/lib/api.ts` | Add `authApi.register()` |

---

## Implementation Steps

1. Create `frontend/app/admin/settings/auth/page.tsx` with toggle
2. Update `admin/settings/layout.tsx` to add Auth nav link
3. Add `authApi.register()` to `frontend/lib/api.ts`
4. Update `frontend/app/(auth)/register/page.tsx`:
   - Replace `signUp()` call with `authApi.register()`
   - After successful registration (no verification): call `supabase.auth.signInWithPassword()` to get session
   - Handle `requiresVerification: true` → show pending UI
5. Run `npx tsc --noEmit` in frontend

---

## Todo List

- [ ] Create `admin/settings/auth/page.tsx`
- [ ] Add Auth link in `admin/settings/layout.tsx`
- [ ] Add `authApi.register()` to `api.ts`
- [ ] Update `register/page.tsx` to call NestJS API
- [ ] Handle `requiresVerification` state in register page
- [ ] `npx tsc --noEmit` passes

---

## Success Criteria

- Admin can toggle "Require Email Verification" in settings
- Default `false`: registration works exactly as before (immediate login)
- When `true`: new registrants see "Check your email" message; Supabase sends verification email
- After verifying, user can log in via normal login page
- Build passes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Register page currently uses client-side `supabase.signUp()` — migration to NestJS API changes auth flow | High | Medium | Auto-login after NestJS register: call `signInWithPassword()` with credentials after API returns session-less success |
| Supabase email not configured in project → verification email never arrives | Medium | High | Admin UI warning: "Make sure Supabase email is configured before enabling this" |
| `fetchApi` adds Auth header — register is unauthenticated | Low | Low | `fetchApi` only adds header if session exists; no session → no header added |

---

## Unresolved Questions

1. Does `frontend/app/(auth)/register/page.tsx` call `useAuth().signUp()` (Supabase client-side) or `POST /auth/register` (NestJS)? **Answer from explore: it calls `useAuth().signUp()` which is client-side Supabase.** → Must migrate to NestJS API call.
2. How does `auth.service.ts` `register()` currently auto-login the user? Check if it returns a session token from Supabase admin create → if yes, frontend can store it. Otherwise frontend calls `signInWithPassword()` after registration.

---

## Next Steps

Feature is complete after this phase. Consider:
- Adding `auth.require_email_verification` display in public settings (`isPublic: true`) so register page can show a hint before submitting
