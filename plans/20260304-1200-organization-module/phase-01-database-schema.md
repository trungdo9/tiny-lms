# Phase 01 — Database Schema

**Ref:** [plan.md](./plan.md)
**Blocks:** [phase-02-backend-api.md](./phase-02-backend-api.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Add `Organization` model to Prisma schema + seed default record |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Use `npx prisma db push` (no migration history in this project)
- Single-record pattern: seed one row with a fixed slug `"default"` or use `findFirst()` anywhere
- All fields nullable (except `id`, `name`) so the record can be created with just a name and filled in later
- No FK references to other tables yet — org is standalone for now; easy to add `organizationId` to `Profile`/`Course` in a future phase

---

## Architecture

### `backend/prisma/schema.prisma` — new model

```prisma
model Organization {
  id           String   @id @default(uuid()) @db.Uuid
  slug         String   @unique @default("default")
  name         String
  shortName    String?  @map("short_name")
  email        String?
  phone        String?
  address      String?
  city         String?
  country      String?  @default("Vietnam")
  website      String?
  description  String?  @db.Text
  logoUrl      String?  @map("logo_url")
  faviconUrl   String?  @map("favicon_url")
  taxCode      String?  @map("tax_code")
  foundedYear  Int?     @map("founded_year")
  facebookUrl  String?  @map("facebook_url")
  linkedinUrl  String?  @map("linkedin_url")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@schema("public")
  @@map("organizations")
}
```

### Seed default record

In `backend/prisma/seed.ts`, add (or create a `backend/scripts/seed-organization.ts`):

```typescript
await prisma.organization.upsert({
  where: { slug: 'default' },
  update: {},
  create: {
    slug: 'default',
    name: 'Tiny LMS',
    country: 'Vietnam',
  },
});
```

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add `Organization` model |
| `backend/prisma/seed.ts` | Upsert default organization record |

---

## Implementation Steps

1. Add `Organization` model to `schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`
4. Add upsert to seed script and run it

---

## Todo List

- [ ] Add `Organization` model to schema.prisma
- [ ] `npx prisma db push`
- [ ] `npx prisma generate`
- [ ] Add default org seed + run

---

## Success Criteria

- `organizations` table exists in DB with all columns
- 1 row with `slug = 'default'` seeded
- Prisma client has `prisma.organization.*` methods

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `db push` fails due to drift | Low | Low | Additive-only changes; safe |

---

## Security Considerations

- No sensitive data in org fields (logo URL, address are public info)

---

## Next Steps

→ Phase 02: Backend API
