# Phase 03 — Frontend Layout: Fetch and Use GA Code at Runtime

**Date:** 2026-03-19
**Status:** Pending (depends on Phase 1 + 2)
**Priority:** High

---

## Context Links

- Root Layout: `frontend/app/layout.tsx:140–159` (current GA script)
- Settings API: `frontend/lib/api.ts:217–232`
- Analytics Utilities: `frontend/lib/analytics.ts` (tracking functions)

---

## Overview

Modify the root layout component to fetch GA code from database at runtime instead of relying only on environment variable. Implement a client component that loads settings asynchronously, extracts the GA code, falls back to `NEXT_PUBLIC_GA_ID` env var, and renders the GA4 script. Handle loading states and errors gracefully.

---

## Key Insights

- Layout.tsx is a server component by default, but Providers wraps children (client boundary)
- GA script rendering must happen in browser (client-side)
- Need separate client component for GA initialization
- Settings API call is async, so must be in useEffect
- Fallback to env var ensures backward compatibility
- GA script loading is non-blocking (async attribute)
- Window global `dataLayer` is auto-initialized by GA script

---

## Requirements

**Functional:**
- On first page load, fetch GA code from `settingsApi.getByCategory('analytics')`
- Extract `analytics_ga_code` value from response
- Use database GA code if present and non-empty
- Fall back to `NEXT_PUBLIC_GA_ID` env var if database value is empty
- Render GA4 script tag with effective GA ID
- If both are empty, don't render script (GA not configured)
- Handle API fetch errors gracefully (don't break page)

**Non-Functional:**
- No blocking delays (async script tag)
- Performance: fetch GA code early, cache result (window-level)
- Error logging: console.warn if fetch fails
- Backward compatible: existing NEXT_PUBLIC_GA_ID env var still works
- Minimal code duplication

---

## Architecture

```
RootLayout (server component)
└─ Providers (client boundary)
   └─ GAInitializer (new client component)
      ├─ useEffect: fetch GA code on mount
      │  └─ settingsApi.getByCategory('analytics')
      │     └─ Extract analytics_ga_code
      ├─ useEffect: render GA script when gaCode is set
      │  └─ Render <script> tag dynamically OR in HTML
      └─ State: gaCode, loading, error
```

**Alternative: Inline script in layout.tsx**
- Simpler: no separate component
- Less flexible but more direct

**Recommended: Separate GAInitializer component**
- Cleaner separation of concerns
- Easier to test and modify
- Can add future analytics providers

---

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/app/layout.tsx` | Modify | Remove hardcoded GA script, add GAInitializer component |
| `frontend/components/ga-initializer.tsx` | Create | New client component to fetch and init GA |
| `frontend/lib/api.ts` | No change | Existing settingsApi works as-is |

---

## Implementation Steps

### Step 1 — Create GA Initializer Component

**File:** `frontend/components/ga-initializer.tsx`

**Full implementation:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';

interface Setting {
  key: string;
  value: unknown;
  type: string;
}

export function GAInitializer() {
  const [gaCode, setGaCode] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch GA code from database on mount
    const fetchGACode = async () => {
      try {
        const settings = await settingsApi.getByCategory('analytics') as Setting[];
        const gaSetting = settings.find((s) => s.key === 'analytics_ga_code');
        const dbGaCode = (gaSetting?.value as string) || '';
        
        // Use DB code if present, else fall back to env var
        const effectiveGaCode = dbGaCode || process.env.NEXT_PUBLIC_GA_ID || '';
        
        if (effectiveGaCode) {
          setGaCode(effectiveGaCode);
        }
      } catch (err) {
        // Log error but don't break page
        console.warn('[GA] Failed to fetch GA code from database:', err);
        
        // Fall back to env var
        const envGaCode = process.env.NEXT_PUBLIC_GA_ID || '';
        if (envGaCode) {
          setGaCode(envGaCode);
        }
        
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    };

    fetchGACode();
  }, []);

  // Only render script if we have a valid GA code
  if (!gaCode) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaCode}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaCode}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
```

### Step 2 — Update Root Layout

**File:** `frontend/app/layout.tsx`

**Replace the hardcoded GA script section (lines 140–159) with:**

```typescript
import { GAInitializer } from '@/components/ga-initializer';

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* existing head content */}
      </head>
      <body {...bodyProps}>
        <Providers>{children}</Providers>
        
        {/* Google Analytics 4 - Fetched at runtime */}
        <GAInitializer />
      </body>
    </html>
  );
}
```

**Before:**
```typescript
{/* Google Analytics 4 */}
{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
    <script dangerouslySetInnerHTML={{
      __html: `...`
    }} />
  </>
)}
```

**After:**
```typescript
{/* Google Analytics 4 - Fetched at runtime */}
<GAInitializer />
```

### Step 3 — Handle Directory Structure

Ensure components directory exists:
```bash
mkdir -p frontend/components
```

---

## Data Flow

1. **Page Load (Browser)**
   - RootLayout renders
   - GAInitializer component mounts

2. **useEffect (Async)**
   - `settingsApi.getByCategory('analytics')` called
   - API request to backend: `GET /settings/category/analytics`
   - Backend returns settings array or error

3. **Success Path**
   - Extract `analytics_ga_code` from response
   - If value exists and non-empty, use it
   - Else use `NEXT_PUBLIC_GA_ID` from env
   - Set state: `gaCode = 'G-XXXXXXXXXX'`

4. **Error Path**
   - Log warning to console
   - Fall back to `NEXT_PUBLIC_GA_ID` from env
   - Set state: `gaCode = env var or null`

5. **Render Phase**
   - If gaCode is set, render GA script tags
   - Google Tag Manager script loads async
   - gtag() function initializes
   - GA4 events tracking enabled

6. **User Interaction**
   - Frontend tracking via `trackEvent()` from analytics.ts
   - gtag() calls ga servers with events

---

## Edge Cases & Error Handling

| Scenario | Behavior | Result |
|----------|----------|--------|
| DB GA code set, API succeeds | Use DB code | GA initialized with DB code |
| DB GA code empty, API succeeds | Use env var | GA initialized with env var (if set) |
| API fails, env var set | Fall back to env var | GA initialized with env var |
| API fails, env var not set | No GA script | Page loads fine, tracking disabled |
| GA script fails to load | No data collected | Page loads fine, functions still available |
| Admin changes GA code | Applies on next page load | No hot reload needed |

---

## Todo List

- [ ] Create `frontend/components/ga-initializer.tsx` — client component with fetch logic
- [ ] Update `frontend/app/layout.tsx` — replace hardcoded GA script with GAInitializer
- [ ] Add import: `import { GAInitializer } from '@/components/ga-initializer'`
- [ ] Remove old GA script section (lines 140–159)
- [ ] Test: Page loads with GA initialized from database
- [ ] Test: Page loads with GA initialized from env var (if DB empty)
- [ ] Test: Page loads fine if both DB and env var are empty
- [ ] Test: API error doesn't break page load
- [ ] Test: Changing GA code in admin UI takes effect on next page load
- [ ] Test: GA tracking events still work (check console.log in development)

---

## Success Criteria

- [ ] GAInitializer component renders without errors
- [ ] `settingsApi.getByCategory('analytics')` called on page load
- [ ] GA code fetched from database and used if present
- [ ] Falls back to `NEXT_PUBLIC_GA_ID` env var if DB empty
- [ ] GA script tag renders with correct measurement ID
- [ ] Page loads fine even if API call fails
- [ ] Console shows no errors, only optional warnings
- [ ] `window.gtag` function is available for event tracking
- [ ] Changing GA code in admin UI updates tracking on next page load
- [ ] Existing GA tracking functions (trackEvent, etc.) still work

---

## Performance Considerations

- **Non-blocking:** GA script has `async` attribute, won't delay page load
- **Network:** Single API call to `/settings/category/analytics` (small response)
- **Caching:** Settings cached in browser (5min default HTTP cache)
  - If immediate update needed, admin can hard-refresh or clear cache
- **No blocking JavaScript:** useEffect is async, doesn't block render
- **Client-only:** No server-side penalty

**Potential Optimization (future):**
- Cache GA code in localStorage with TTL
- Pre-fetch in Providers component
- Add stale-while-revalidate caching

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| API call delays page load | Low | Script is async, response cached |
| API fails, no GA tracking | Very Low | Graceful fallback to env var |
| Wrong GA code breaks events | Low | Validation in Phase 2 prevents typos |
| Memory leak from useEffect | Very Low | No cleanup needed (single fetch) |
| Hydration mismatch | Low | GAInitializer is client-only, no SSR |

---

## Testing Checklist

**Manual:**
- [ ] Set DB GA code to a test value, verify script uses it
- [ ] Clear DB GA code, verify fallback to env var
- [ ] Unset both, verify no script error
- [ ] Check Network tab: GA script loads
- [ ] Check Console: `gtag` function available
- [ ] Simulate API failure: page still loads
- [ ] Admin changes GA code, refresh page, verify new code used

**Automated (if applicable):**
- [ ] Unit test: GAInitializer component renders
- [ ] Unit test: settingsApi.getByCategory called
- [ ] Unit test: Fallback to env var logic
- [ ] E2E test: Full flow from admin setting GA code to it being used

---

## Next Steps

- After all phases complete: full GA configuration flow is live
- Monitor GA script load in production (Google Analytics real-time)
- Document the feature for admins (help/wiki page)
- Consider adding GA code validation/test button to admin UI (future enhancement)
