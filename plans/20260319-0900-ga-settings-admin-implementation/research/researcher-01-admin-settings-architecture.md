# Research: Admin Settings Architecture

**Date:** 2026-03-19
**Focus:** Understand how settings are managed, stored, and exposed via API/UI

---

## Current Settings Infrastructure

### Backend Database Model

**Location:** `backend/prisma/schema.prisma:489–502`

```prisma
model Setting {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique
  value     String?  @db.Text
  type      String   @default("string")
  category  String   @default("general")
  isSecret  Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@schema("public")
  @@map("settings")
}
```

**Key Insights:**
- Key-value store with flexible type system (string, number, boolean, json)
- `category` column enables filtering settings by group
- `isSecret` flag masks values in API responses (shown as `***`)
- Indexed on `category` for fast queries
- No migrations needed to add new settings

### Backend Service & Controller

**Service Location:** `backend/src/modules/settings/settings.service.ts`

**API Methods:**
- `get(key)` — fetch single setting, returns parsed value
- `set(key, value, type, isSecret)` — create/update via upsert
- `getByCategory(category)` — fetch all settings in a category
- `getPublic()` — returns only branding category, non-secret values (used by frontend)
- `getAll()` — admin-only, returns all settings with secrets masked
- `delete(key)` — remove a setting
- `seedDefaults()` — populate with default values

**Type Conversion:**
- `parseValue(setting)` converts stored string to proper JS type
- Supports: `string`, `number`, `boolean`, `json`

**Controller Location:** `backend/src/modules/settings/settings.controller.ts`

**Routes:**
- `GET /settings/public` — unauthenticated, returns branding settings
- `GET /settings` — admin only, all settings
- `GET /settings/category/:category` — admin only, filtered by category
- `GET /settings/:key` — admin only, single setting
- `PUT /settings/:key` — admin only, update
- `DELETE /settings/:key` — admin only, delete
- `POST /settings/seed` — admin only, seed defaults

**Authorization:** `JwtAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)`

---

## Existing Settings Categories

From `seedDefaults()` in service:

1. **general** — site_name, site_url, site_description
2. **branding** — brand colors, logos, social links, custom CSS (27 settings)
3. **email** — SMTP config, email sender, resend API
4. **contact_sync** — Mailchimp/Brevo API keys, toggle
5. **auth** — email verification requirement flag

---

## Admin UI Patterns

**Base Layout:** `frontend/app/admin/settings/layout.tsx`

**Current Tabs:**
- General, Email, Templates, Logs, Branding, Auth, Organization, Departments, Categories, Contact Sync

**Pattern Example:** Contact Sync settings page
Location: `frontend/app/admin/settings/contact-sync/page.tsx`

**UI Flow:**
1. `useEffect` loads settings by category via `settingsApi.getByCategory()`
2. State: `settings` (array), `loading`, `saving`, `message`
3. Iterate over settings array → render `EmailSettingField` component
4. Each field calls `settingsApi.update(key, {value, type})` on change
5. Success/error toast message shown

**Form Components:**
- `EmailSettingField` component handles rendering individual setting inputs
- Conditional rendering based on selected provider (none, mailchimp, brevo)
- Special fields for booleans (toggles), strings (text/email/password), numbers

---

## Key Patterns to Reuse

### Frontend API Wrapper
**Location:** `frontend/lib/api.ts:217–232`

```typescript
export const settingsApi = {
  getAll: () => fetchApi('/settings'),
  getPublic: () => fetchApi('/settings/public'),
  getByCategory: (category: string) => fetchApi(`/settings/category/${category}`),
  get: (key: string) => fetchApi(`/settings/${key}`),
  update: (key: string, data: { value: unknown; type?: string }) =>
    fetchApi(`/settings/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (key: string) => fetchApi(`/settings/${key}`, { method: 'DELETE' }),
  seed: () => fetchApi('/settings/seed', { method: 'POST' }),
};
```

**Pattern:** Simple object with method per API endpoint, uses `fetchApi` wrapper

### Default Seeding
**Where:** `SettingsService.seedDefaults()` called from `POST /settings/seed` endpoint

**Structure:** Array of objects with key, value, type, category, isSecret

---

## Security Model

- `JwtAuthGuard` validates token before any admin route
- `RolesGuard` checks user role from JWT payload
- `@Roles('admin')` decorator marks protected routes
- `isSecret` flag prevents accidental exposure of API keys via `getAll()` (shows `***`)
- `/settings/public` endpoint is public (no auth), filters to branding category + non-secret only

---

## Frontend Layout Integration

**Current:** `frontend/app/layout.tsx:140–159` checks `process.env.NEXT_PUBLIC_GA_ID`

**Issue:** GA ID is hardcoded to env var, can't be changed without redeploy

**Goal:** Fetch from database at runtime, fallback to env var

---

## Decisions for GA Code

1. **Category:** New `analytics` category (cleaner, extensible for future tools)
2. **Admin-only:** YES — GA code is not sensitive but managed by admins
3. **Public endpoint:** NO — not included in `getPublic()` response
4. **Caching:** Short cache (30s) in `SettingsService.get()` optional, but KISS: no cache initially
5. **Validation:** Regex to match GA4 format `G-XXXXXXXXXX`
6. **Fallback:** Always check env var first for backward compatibility

---

## Files Summary

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | Setting model definition (no change needed) |
| `backend/src/modules/settings/settings.service.ts` | Service for CRUD + parsing |
| `backend/src/modules/settings/settings.controller.ts` | API routes + auth guards |
| `frontend/lib/api.ts` | Settings API client |
| `frontend/app/admin/settings/layout.tsx` | Navigation tabs |
| `frontend/app/admin/settings/page.tsx` | General/default page |
| `frontend/app/layout.tsx` | Root layout with GA script |

---

## Data Flow Summary

**Admin saves GA code:**
1. User enters GA ID in UI
2. `PUT /settings/analytics_ga_code` (admin only)
3. Service stores in DB with `category='analytics'`, `type='string'`
4. Frontend gets success toast

**Frontend fetches and initializes:**
1. Layout component on first render calls `settingsApi.getByCategory('analytics')`
2. Extracts `analytics_ga_code` value
3. Falls back to `process.env.NEXT_PUBLIC_GA_ID` if not set
4. Renders GA4 script with effective GA ID

---

## Next Steps

1. Define DTO validation for GA code format
2. Add default seed entry for analytics category
3. Implement admin UI page
4. Modify layout.tsx to fetch from API
