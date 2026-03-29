# Plan: Google Analytics Code Configuration in Admin Settings

**Date:** 2026-03-19
**Status:** ✅ Completed
**Priority:** Medium
**Goal:** Enable non-technical admins to configure GA code via database instead of env vars

---

## Key Finding

Settings infrastructure already exists with full CRUD API, type conversion, and admin UI patterns. No database migration needed. Only need to:
1. Add GA code entry to seedDefaults()
2. Add simple admin settings page
3. Modify root layout to fetch from API with env var fallback

---

## Phases

| # | Phase | Status | File | Dependencies |
|---|-------|--------|------|--------------|
| 1 | Backend: Seed GA code setting, add validation | ✅ Done | [phase-01-backend-ga-settings.md](./phase-01-backend-ga-settings.md) | None |
| 2 | Frontend Admin: Create analytics settings page | ✅ Done | [phase-02-frontend-admin-ga-ui.md](./phase-02-frontend-admin-ga-ui.md) | Phase 1 (API ready) |
| 3 | Frontend Layout: Fetch and use GA code at runtime | ✅ Done | [phase-03-frontend-layout-ga-integration.md](./phase-03-frontend-layout-ga-integration.md) | Phase 1 + 2 |

---

## Scope Summary

**Backend:**
- Add `analytics_ga_code` to seedDefaults() with empty string default
- Optional: Add regex validation for GA4 format (G-XXXXXXXXXX)
- No schema changes needed

**Frontend Admin:**
- Add "Analytics" tab to `/admin/settings` layout
- Create `/admin/settings/analytics` page
- UI shows GA code input field with help text, validation feedback
- Save triggers `PUT /settings/analytics_ga_code`

**Frontend Layout:**
- Root layout (`app/layout.tsx`) fetches GA code from API on first load
- Falls back to `NEXT_PUBLIC_GA_ID` env var if not set
- Injects GA4 script with effective GA ID
- Handles loading state / errors gracefully

---

## Key Decisions

1. **Category:** `analytics` (new, extensible for future analytics tools)
2. **Setting key:** `analytics_ga_code` (clear, follows pattern)
3. **Type:** `string` (GA ID is always a string)
4. **Admin-only:** YES (not in public endpoint)
5. **Default:** Empty string (admin must configure)
6. **Validation:** Regex pattern `^(G-[A-Z0-9]{10})?$` (optional, allow empty)
7. **Fallback:** Always check env var first for backward compatibility
8. **Caching:** No caching initially (KISS)

---

## Files Modified

| File | Phase | Action | Purpose |
|------|-------|--------|---------|
| `backend/src/modules/settings/settings.service.ts` | 1 | Modify | Add GA code to seedDefaults() |
| `frontend/app/admin/settings/layout.tsx` | 2 | Modify | Add "Analytics" tab |
| `frontend/app/admin/settings/analytics/page.tsx` | 2 | Create | New analytics settings page |
| `frontend/app/layout.tsx` | 3 | Modify | Fetch GA code from API at runtime |
| `frontend/lib/api.ts` | (already has settingsApi) | No change | Reuse existing settingsApi |

---

## Success Criteria

- [ ] Admin can view GA code input field in `/admin/settings/analytics`
- [ ] Admin can enter GA code (e.g., `G-1234567890`) and save
- [ ] GA code is stored in database under `analytics` category
- [ ] Frontend layout fetches GA code on page load
- [ ] GA4 script loads with database GA code (or env var fallback)
- [ ] Validation error shown if GA code format is invalid
- [ ] env var `NEXT_PUBLIC_GA_ID` still works if database is empty
- [ ] Changing GA code in admin UI updates script on next page load

---

## Timeline Estimate

| Phase | Complexity | Est. Time |
|-------|------------|-----------|
| 1 | Low | 15 min (seed + optional validation) |
| 2 | Low | 30 min (UI form, follow contact-sync pattern) |
| 3 | Medium | 45 min (async fetch, error handling, testing) |
| **Total** | **Low-Medium** | **~90 min** |

---

## Dependencies

- Phase 1 must complete before Phase 2 (API endpoint ready)
- Phase 2 should complete before Phase 3 (UI exists)
- No external dependencies (uses existing settings API)

---

## Out of Scope

- Analytics dashboard / reporting
- GA data sync to database
- Multiple GA accounts
- GA4 property-level configuration
- Heat map tracking tools
- Session replay tools
- Cache busting strategy (rely on browser cache, ~5 min default)

---

## Questions to Address in Phases

1. Should validation be strict (reject invalid) or lenient (accept anything)?
   → Answer in Phase 1 (recommend lenient for flexibility)

2. Should GA code input show current value during page load?
   → Answer in Phase 2 (follow contact-sync pattern: load on mount)

3. What if API fetch fails during layout render?
   → Answer in Phase 3 (graceful fallback to env var + console log)

4. Should we show "No GA code configured" banner if empty?
   → Answer in Phase 2 (defer to admin UX preference)

5. Should GA code changes clear browser GA data?
   → Not in scope (unlikely, GA handles multiple IDs)

---

## Research Files

- [researcher-01-admin-settings-architecture.md](./research/researcher-01-admin-settings-architecture.md) — Settings infrastructure, patterns, security
- [researcher-02-backend-settings-api.md](./research/researcher-02-backend-settings-api.md) — Backend implementation details, validation, database

---

## Notes

- **KISS:** Leverage existing settings infrastructure, minimal new code
- **Backward Compatible:** Env var fallback ensures no breaking changes
- **Extensible:** New `analytics` category can host future analytics features
- **Admin-Friendly:** No code deployment needed, live configuration
- **Type-Safe:** Settings API handles string/number/boolean/json conversions
