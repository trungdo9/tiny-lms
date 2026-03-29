# Plan: Organization Module (Tổ chức)

**Date:** 2026-03-04
**Directory:** `plans/20260304-1200-organization-module/`

---

## Summary

Create a dedicated `Organization` model to store the LMS instance's organizational profile (name, address, phone, email, logo, social links, etc.). By default, 1 organization is auto-seeded. Admin can edit all fields via a dedicated settings page. Organization data is exposed via a public API (for footer, about page, contact info).

Architecture is designed to support multi-org later (table + foreign keys) without requiring it now.

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Database Schema | ✅ Completed | [phase-01-database-schema.md](./phase-01-database-schema.md) |
| 2 | Backend API | ✅ Completed | [phase-02-backend-api.md](./phase-02-backend-api.md) |
| 3 | Admin UI | ✅ Completed | [phase-03-admin-ui.md](./phase-03-admin-ui.md) |

---

## Key Decisions

- **Dedicated table** (`organizations`), not stored in `settings` KV — structured, type-safe, queryable
- **Single record** seeded at startup: `id = fixed UUID` (or just take `first()`) — no multi-tenant routing needed now
- **Public GET** endpoint: `GET /organization` (no auth) — for frontend footer/contact display
- **Admin PUT** endpoint: `PUT /organization` (admin only)
- **Logo/favicon upload**: store URL only (upload via Supabase storage, same pattern as avatar)
- **Future multi-org**: table is already in place; just add `organizationId` FK to `Course`, `Profile`, etc. when needed

---

## Fields

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | String | Required — org/company name |
| shortName | String? | Abbreviation |
| email | String? | Contact email |
| phone | String? | Contact phone |
| address | String? | Street address |
| city | String? | City/Province |
| country | String? | Country (default "Vietnam") |
| website | String? | Homepage URL |
| description | Text? | Short description |
| logoUrl | String? | Logo image URL |
| faviconUrl | String? | Favicon URL |
| taxCode | String? | Tax/business registration number |
| foundedYear | Int? | Year founded |
| facebookUrl | String? | Social links |
| linkedinUrl | String? | Social links |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

---

## Docs

- [codebase-summary.md](../../docs/codebase-summary.md)
- [code-standards.md](../../docs/code-standards.md)
- [system-architecture.md](../../docs/system-architecture.md)
