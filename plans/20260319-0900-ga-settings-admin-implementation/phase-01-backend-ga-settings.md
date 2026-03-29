# Phase 01 — Backend: Seed GA Code Setting & Add Validation

**Date:** 2026-03-19
**Status:** Pending
**Priority:** High (blocks phases 2 & 3)

---

## Context Links

- Settings Service: `backend/src/modules/settings/settings.service.ts`
- Settings Controller: `backend/src/modules/settings/settings.controller.ts`
- Schema: `backend/prisma/schema.prisma:489–502` (Setting model)

---

## Overview

The Setting Prisma model already exists with support for category, type, and secret flagging. Current seedDefaults() has settings for general, branding, email, contact_sync, and auth categories. We add a new `analytics` category with a single `analytics_ga_code` entry. No database migration needed. Optional: add regex validation to accept only valid GA4 IDs (G-XXXXXXXXXX) or empty string.

---

## Key Insights

- seedDefaults() uses upsert — multiple calls are idempotent, safe
- SettingsService.set() stores all values as strings, parseValue() converts on retrieval
- GA code is not secret (isSecret=false) unlike API keys
- Validation can be lenient (accept any string) or strict (GA4 regex only)
- No DTO/controller changes needed — reuse existing PUT /settings/:key endpoint

---

## Requirements

**Functional:**
- `POST /settings/seed` includes new entry: `{ key: 'analytics_ga_code', category: 'analytics', type: 'string', value: '', isSecret: false }`
- `GET /settings/category/analytics` returns GA code entry
- `PUT /settings/analytics_ga_code` updates value (admin only, existing endpoint)
- GA code accepts GA4 format (G-XXXXXXXXXX) or empty string

**Non-Functional:**
- No database migration
- No new controller routes (reuse existing API)
- Backward compatible with existing seedDefaults()
- Validation optional but recommended

---

## Architecture

```
seedDefaults() in SettingsService
  └─ Add to defaults array:
      {
        key: 'analytics_ga_code',
        value: '',
        type: 'string',
        category: 'analytics',
        isSecret: false
      }

SettingsService.set(key, value, type)
  └─ Optional: Validate GA code format
      └─ If invalid, throw BadRequestException
      └─ Store in DB via Prisma upsert

Frontend: settingsApi.getByCategory('analytics')
  └─ Calls existing GET /settings/category/:category
  └─ Returns array with GA code entry
```

---

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `backend/src/modules/settings/settings.service.ts` | Modify | Add GA code to seedDefaults(); optionally add validation method |
| `backend/src/modules/settings/settings.controller.ts` | No change | Reuse existing PUT /settings/:key, GET /settings/category/:category |

---

## Implementation Steps

### Step 1 — Add GA Code to seedDefaults()

**File:** `backend/src/modules/settings/settings.service.ts`

**Location:** In seedDefaults(), after auth settings, before the loop

```typescript
async seedDefaults() {
  const defaults = [
    // ... existing settings (general, branding, email, contact_sync, auth)
    
    // Analytics
    { key: 'analytics_ga_code', value: '', type: 'string', category: 'analytics', isSecret: false },
  ];

  for (const s of defaults) {
    await this.prisma.setting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: s.value, type: s.type, category: s.category, isSecret: s.isSecret || false },
      update: {},
    });
  }

  return { seeded: defaults.length };
}
```

### Step 2 — Optional: Add GA Code Validation Method

**Rationale:** Prevent typos, but allow empty string (not configured yet)

```typescript
// In SettingsService class, add method:

private validateGACode(value: string): void {
  // Allow empty string (not configured yet)
  if (!value) return;
  
  // GA4 format: G-XXXXXXXXXX (G- prefix + 10 alphanumeric)
  const gaIdRegex = /^G-[A-Z0-9]{10}$/;
  if (!gaIdRegex.test(value)) {
    throw new BadRequestException('Invalid GA code format. Expected: G-XXXXXXXXXX');
  }
}
```

### Step 3 — Optional: Call Validation in set() Method

**File:** `backend/src/modules/settings/settings.service.ts`

**Modify the existing set() method:**

```typescript
async set(key: string, value: unknown, type = 'string', isSecret = false) {
  // Add validation for analytics_ga_code
  if (key === 'analytics_ga_code' && type === 'string') {
    this.validateGACode(value as string);
  }

  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  return this.prisma.setting.upsert({
    where: { key },
    create: { key, value: stringValue, type, isSecret },
    update: { value: stringValue, type, isSecret },
  });
}
```

**Alternative (lenient):** Skip validation. Store any string, let frontend handle display.

### Step 4 — Add Necessary Imports

If using BadRequestException in validation:

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
```

(Likely already imported, check existing file)

---

## Todo List

- [ ] Modify `backend/src/modules/settings/settings.service.ts`
  - [ ] Add GA code entry to seedDefaults() array
  - [ ] Add optional validateGACode() method with GA4 regex
  - [ ] Modify set() to call validation for analytics_ga_code
- [ ] Test: `POST /settings/seed` creates analytics_ga_code entry
- [ ] Test: `GET /settings/category/analytics` returns GA code
- [ ] Test: `PUT /settings/analytics_ga_code` with valid GA code (if validation added)
- [ ] Test: `PUT /settings/analytics_ga_code` with invalid GA code throws 400 (if validation added)
- [ ] Test: `PUT /settings/analytics_ga_code` with empty string succeeds

---

## Success Criteria

- [ ] After `POST /settings/seed`, `GET /settings/category/analytics` returns `{ key: 'analytics_ga_code', value: '', type: 'string', category: 'analytics' }`
- [ ] `PUT /settings/analytics_ga_code` with `{ value: 'G-1234567890' }` succeeds (200)
- [ ] If validation enabled: `PUT /settings/analytics_ga_code` with `{ value: 'invalid' }` returns 400
- [ ] `PUT /settings/analytics_ga_code` with `{ value: '' }` succeeds (resets to empty)
- [ ] Multiple `POST /settings/seed` calls are idempotent (no duplicates)

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Validation regex too strict, blocks valid GA IDs | Low | Test with real GA4 IDs; allow empty string as bypass |
| seedDefaults() fails if defaults array is malformed | Very Low | Follow existing array structure exactly |
| Type mismatch (value is not string) | Very Low | Always store GA code as string type in defaults |

---

## Security Considerations

- GA code is not secret (isSecret=false) — OK, it's public tracking ID
- No API key exposure risk
- Validation regex has no injection vectors (only GA4 format check)
- Existing JwtAuthGuard + RolesGuard on PUT endpoint ensures only admins can update

---

## Next Steps

- After this phase: Phase 2 can start (frontend admin UI)
- Phase 2 will call `settingsApi.getByCategory('analytics')` to load GA code for editing
- Phase 3 will fetch GA code at layout initialization time
