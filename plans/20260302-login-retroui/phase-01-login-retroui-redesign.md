# Phase 01: Login Page RetroUI Redesign

## Context Links
- **Parent Plan**: [plan.md](plan.md)
- **Codebase Summary**: [docs/codebase-summary.md](../../docs/codebase-summary.md)
- **Code Standards**: [docs/code-standards.md](../../docs/code-standards.md)
- **System Architecture**: [docs/system-architecture.md](../../docs/system-architecture.md)

---

## Overview
- **Date**: 2026-03-02
- **Priority**: Medium
- **Implementation Status**: Completed
- **Review Status**: Completed
- **Description**: Redesign the login page with RetroUI NeoBrutalism style and add role-based redirect after successful authentication.

---

## Key Insights

### RetroUI Components Available
Only one RetroUI component installed:
- `frontend/components/retroui/Button.tsx` — CVA-based button, variants: `default`, `secondary`, `outline`, `link`, `ghost`; sizes: `sm`, `md`, `lg`, `icon`

CSS variables already defined in `globals.css`:
```css
--primary-retro: #ffdb33;
--shadow-brutal: 4px 4px 0px 0px #000000;
--shadow-brutal-sm: 2px 2px 0px 0px #000000;
--shadow-brutal-lg: 6px 6px 0px 0px #000000;
--border-brutal: 3px solid #000000;
```

Style patterns from `app/page.tsx` (the reference):
- Background: `bg-[#ffdb33]`
- Card: `bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000]`
- Button: `bg-[#ffdb33] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]`
- Fonts: `style={{ fontFamily: 'var(--font-archivo-black)' }}` for headings

### Current Login Page (`frontend/app/(auth)/login/page.tsx`)
- Architecture: `LoginForm` (inner, uses `useAuth`) + `LoginPage` (outer, wraps with `<AuthProvider>`)
- Form fields: `email`, `password`
- On success: **hardcoded** `router.push('/dashboard')` — no role check
- Style: plain Tailwind (`bg-gray-50`, `bg-white rounded-lg shadow-md`, `bg-blue-600` button) — no RetroUI

### Auth & Role Pattern
- `auth-context.tsx` exposes: `user`, `session`, `loading`, `signIn`, `signOut`
- `signIn()` calls `supabase.auth.signInWithPassword()` → returns `{ error }`
- **Role is NOT on the Supabase user object** — stored in backend DB
- Fetch role: `GET /users/me` returns `{ id, role, ... }` (protected by JWT)
- Pattern used in `dashboard/page.tsx`: after session, call `/users/me` to get `profile.role`
- `supabase` client importable from `@/lib/supabase`

### Role-Based Redirect Rules
| Role | Redirect |
|------|----------|
| `student` | `/profile` |
| `admin` | `/dashboard` |
| `instructor` | `/dashboard` |
| unknown/error | `/profile` (safe fallback) |

---

## Requirements

1. Redesign `frontend/app/(auth)/login/page.tsx` with RetroUI NeoBrutalism style
2. Use existing `Button` from `@/components/retroui/Button`
3. Style inputs: `border-[2px] border-black` + `focus:ring-[3px] focus:ring-black`
4. Style error box: `bg-red-400 text-black border-[2px] border-black shadow-[2px_2px_0px_0px_#000]`
5. After login, fetch role via `GET /users/me` and redirect per rules above
6. Show loading/disabled state during auth + role fetch
7. Preserve `<AuthProvider>` wrapping pattern (outer/inner component split)
8. Keep sign-up link at bottom
9. Do NOT modify `auth-context.tsx`

---

## Architecture

### Component Structure
```
LoginPage (default export)
└── AuthProvider                    ← keep unchanged
    └── LoginForm                   ← all logic + UI here
        ├── State: email, password, error, loading
        ├── handleSubmit()
        │   ├── signIn(email, password)     ← from useAuth()
        │   ├── fetchUserRole(accessToken)  ← new helper
        │   └── router.push(redirectPath)   ← role-based
        └── JSX (RetroUI styled)
            ├── Outer: min-h-screen bg-[#ffdb33] flex center
            ├── Dot pattern overlay (absolute, opacity-10)
            ├── Brand badge: bg-black text-white font-mono
            ├── Card: bg-white border-[3px] border-black
            │         shadow-[6px_6px_0px_0px_#000] p-8 max-w-md
            ├── Heading: Archivo Black font
            ├── Error box: bg-red-400 border-[2px] border-black shadow-[2px_2px_0px_0px_#000]
            ├── Input[email]: border-[2px] border-black focus:ring-[3px] focus:ring-black
            ├── Input[password]: same
            ├── Button (RetroUI): yellow, full-width
            └── Link to /register
```

### Helper Functions
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchUserRole(accessToken: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return 'student';
    const profile = await res.json();
    return (profile.role as string) || 'student';
  } catch {
    return 'student';
  }
}

function getRedirectPath(role: string): string {
  if (role === 'admin' || role === 'instructor') return '/dashboard';
  return '/profile';
}
```

---

## Related Code Files

| File | Role |
|------|------|
| `frontend/app/(auth)/login/page.tsx` | **Primary file to modify** |
| `frontend/components/retroui/Button.tsx` | RetroUI Button — import and use |
| `frontend/lib/auth-context.tsx` | Auth context — read-only, use `signIn` |
| `frontend/lib/supabase.ts` | Supabase client for `getSession()` |
| `frontend/lib/api.ts` | Reference for API call pattern |
| `frontend/app/page.tsx` | RetroUI style reference |
| `frontend/app/globals.css` | RetroUI CSS variables |

---

## Implementation Steps

### Step 1: Update imports
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/retroui/Button';
```

### Step 2: Add helpers above `LoginForm`
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchUserRole(accessToken: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return 'student';
    const profile = await res.json();
    return (profile.role as string) || 'student';
  } catch {
    return 'student';
  }
}

function getRedirectPath(role: string): string {
  if (role === 'admin' || role === 'instructor') return '/dashboard';
  return '/profile';
}
```

### Step 3: Update `handleSubmit`
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const { error } = await signIn(email, password);

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const role = await fetchUserRole(session?.access_token ?? '');
    router.push(getRedirectPath(role));
  } catch {
    router.push('/profile');
  }
  // No setLoading(false) — navigating away unmounts the component
};
```

### Step 4: Replace JSX with RetroUI styled version
```tsx
return (
  <div className="relative min-h-screen flex items-center justify-center bg-[#ffdb33]">
    {/* Dot pattern background */}
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, black 2px, transparent 2px),
                          radial-gradient(circle at 75% 75%, black 2px, transparent 2px)`,
        backgroundSize: '40px 40px',
      }}
    />

    <div className="relative z-10 max-w-md w-full mx-4">
      {/* Brand badge */}
      <div className="inline-block bg-black text-white px-4 py-1 mb-4 font-mono text-sm">
        Tiny LMS • Sign In
      </div>

      {/* Card */}
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-8">
        <h1
          className="text-3xl font-black mb-6 text-black"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Welcome Back
        </h1>

        {/* Error box */}
        {error && (
          <div className="mb-4 p-3 bg-red-400 text-black border-[2px] border-black shadow-[2px_2px_0px_0px_#000] text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border-[2px] border-black focus:outline-none focus:ring-[3px] focus:ring-black bg-white text-black placeholder:text-gray-400"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-black mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border-[2px] border-black focus:outline-none focus:ring-[3px] focus:ring-black bg-white text-black"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full bg-[#ffdb33] text-black border-[3px] border-black
                       shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]
                       hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all font-bold justify-center
                       disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:hover:translate-x-0 disabled:hover:translate-y-0
                       disabled:hover:shadow-[4px_4px_0px_0px_#000]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign-up link */}
        <p className="mt-6 text-center text-sm text-gray-700">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-black underline hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
);
```

### Step 5: Keep `LoginPage` export unchanged
```typescript
export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
```

---

## Todo List

- [ ] Add imports: `Button` from retroui, `supabase` from lib
- [ ] Add `fetchUserRole()` helper above `LoginForm`
- [ ] Add `getRedirectPath()` helper above `LoginForm`
- [ ] Update `handleSubmit` to call `getSession` + `fetchUserRole` + redirect
- [ ] Replace JSX with RetroUI NeoBrutalism layout
- [ ] Verify: background `bg-[#ffdb33]` with dot pattern overlay
- [ ] Verify: card `border-[3px] border-black shadow-[6px_6px_0px_0px_#000]`
- [ ] Verify: inputs `border-[2px] border-black` with black focus ring
- [ ] Verify: error box `bg-red-400 border-[2px] border-black shadow-[2px_2px_0px_0px_#000]`
- [ ] Verify: Button uses yellow RetroUI style
- [ ] Manual test: student login → `/profile`
- [ ] Manual test: instructor login → `/dashboard`
- [ ] Manual test: admin login → `/dashboard`
- [ ] Manual test: wrong credentials → error shown, no redirect

---

## Success Criteria

- [ ] Page background is `#ffdb33` yellow matching landing page
- [ ] Card has `3px` black border + `6px 6px` offset shadow
- [ ] Inputs have `2px` black border + black focus ring (no blue)
- [ ] Submit button uses RetroUI `Button` with yellow fill
- [ ] Error messages shown in `bg-red-400` box with black border/shadow
- [ ] Heading uses Archivo Black font
- [ ] Student login redirects to `/profile`
- [ ] Admin/instructor login redirects to `/dashboard`
- [ ] Invalid credentials show error, no redirect
- [ ] No TypeScript errors
- [ ] `AuthProvider` wrapper preserved

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| `GET /users/me` fails (network/backend down) | Medium | `try/catch` in `fetchUserRole()` returns `'student'` as fallback |
| Session not yet set when `getSession()` called | Low | `signIn` resolves after session is established in Supabase state |
| RetroUI Button disabled state styling conflicts | Low | Explicit disabled overrides in className |
| Loading stuck if navigation fails | Low | `router.push` error caught by outer `try/catch` → fallback to `/profile` |
| Dot pattern z-index conflicts | Low | Card uses `relative z-10`, overlay has `pointer-events-none` |

---

## Security Considerations

1. **Role fetched from backend**, not Supabase user object — prevents client-side spoofing
2. Backend `/users/me` protected by `JwtAuthGuard` — role comes from DB
3. Fallback role is `'student'` (least-privileged) — correct fail-safe
4. No role data stored in `localStorage` or cookies
5. Access token obtained fresh via `supabase.auth.getSession()` after sign-in
6. TypeScript typing used throughout; backend validates role enum

---

## Next Steps

After implementation:
1. Run the dev server and manually test all three role scenarios
2. Check console for any TypeScript errors
3. Visual comparison with landing page RetroUI style
