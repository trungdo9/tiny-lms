# Phase 03 — Admin UI

**Ref:** [plan.md](./plan.md)
**Depends on:** [phase-02-backend-api.md](./phase-02-backend-api.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Admin settings page for organization profile + API client methods + query key |
| Priority | High |
| Status | Pending |

---

## Key Insights

- New page: `frontend/app/admin/settings/organization/page.tsx` — follows same pattern as `branding/page.tsx`
- Add "Organization" tab to `admin/settings/layout.tsx` sidebar
- Form pattern: fetch on mount, edit inline, save all fields at once via "Save" button (not onBlur like email settings)
- Fields grouped into sections: Basic Info, Contact, Social Links, Identity
- Logo/favicon: URL input only (no file upload in MVP) — same as `thumbnailUrl` on courses
- Add `organizationApi` to `frontend/lib/api.ts`
- Add `organization` key to `frontend/lib/query-keys.ts`
- Design: match existing admin pages style (check `branding/page.tsx` for reference)

---

## Architecture

### `frontend/lib/api.ts` — additions

```typescript
export interface Organization {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  taxCode: string | null;
  foundedYear: number | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
}

export const organizationApi = {
  get: () => fetchApi<Organization>('/organization'),

  update: (data: Partial<Omit<Organization, 'id' | 'slug'>>) =>
    fetchApi<Organization>('/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
```

### `frontend/lib/query-keys.ts` — addition

```typescript
organization: () => ['organization'] as const,
```

### `frontend/app/admin/settings/organization/page.tsx`

```
'use client';

State:
  - form: Partial<Organization>  (all fields)
  - loading, saving, error, success

On mount: fetch organizationApi.get() → populate form

Sections:
  1. Basic Info: name*, shortName, description, logoUrl, faviconUrl, foundedYear, taxCode
  2. Contact:    email, phone, address, city, country, website
  3. Social:     facebookUrl, linkedinUrl

Footer: [Save Changes] button → calls organizationApi.update(form)

No onBlur auto-save — user clicks Save explicitly (better for org profile with many fields)
```

### Layout update

In `frontend/app/admin/settings/layout.tsx`, add navigation link:

```typescript
{ href: '/admin/settings/organization', label: 'Organization' }
```

---

## Form Field Groups

### Basic Info
| Field | Input Type | Required |
|-------|-----------|---------|
| Organization Name | text | ✅ |
| Short Name | text | — |
| Description | textarea | — |
| Logo URL | text | — |
| Favicon URL | text | — |
| Founded Year | number | — |
| Tax / Business Code | text | — |

### Contact Information
| Field | Input Type |
|-------|-----------|
| Contact Email | email |
| Phone | tel |
| Address | text |
| City / Province | text |
| Country | text |

### Social Links
| Field | Input Type |
|-------|-----------|
| Website | url |
| Facebook | url |
| LinkedIn | url |

---

## Related Code Files

| File | Change |
|------|--------|
| `frontend/lib/api.ts` | Add `Organization` type + `organizationApi` |
| `frontend/lib/query-keys.ts` | Add `organization` key |
| `frontend/app/admin/settings/organization/page.tsx` | NEW |
| `frontend/app/admin/settings/layout.tsx` | Add Organization nav tab |

---

## Implementation Steps

1. Add `Organization` type + `organizationApi` to `api.ts`
2. Add `organization` key to `query-keys.ts`
3. Create `admin/settings/organization/page.tsx` with form
4. Update `admin/settings/layout.tsx` to add nav tab
5. `npx tsc --noEmit` in frontend

---

## Todo List

- [ ] Add `Organization` type + `organizationApi` to `api.ts`
- [ ] Add `organization` query key
- [ ] Create admin organization settings page
- [ ] Add Organization tab in admin settings layout
- [ ] TypeScript check passes

---

## Success Criteria

- Admin navigates to Settings → Organization → sees form pre-filled with current org data
- Admin edits name, phone, address, etc. and clicks Save → data persists
- `GET /organization` returns updated data (verifiable in browser network tab)
- Logo URL field: admin pastes URL → saves → URL stored correctly
- All form fields have appropriate labels and input types

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `GET /organization` returns null (seed not run) | Low | Low | Show empty form with placeholder values; Save creates/updates correctly |
| Admin settings layout hard-coded navigation list | Medium | Low | Just add another item to the nav array |

---

## Security Considerations

- Page is under `/admin/` route — protected by admin layout guard
- `organizationApi.update()` uses auth token automatically (via `fetchApi`)
- Backend `PUT /organization` enforces `Role.ADMIN`

---

## Unresolved Questions

1. Should `GET /organization` be used on the **public site** (e.g., footer showing org contact info)? If yes, call it in the public layout — easy add-on after this phase.
2. Should logo/favicon from this module override the `brand_logo`/`brand_favicon` from branding settings? Recommendation: keep them separate for now (org profile ≠ site branding).

---

## Next Steps

Optional follow-ups:
- Display org info in public footer/about section
- Add logo/favicon upload (Supabase storage)
- When adding multi-org later: add `organizationId` FK to `Profile` + `Course`, add org selection to admin user management
