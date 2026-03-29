# Phase 01 -- Database Schema

**Ref:** [plan.md](./plan.md)
**Blocks:** [phase-02-backend-api.md](./phase-02-backend-api.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Add `Department` model + `departmentId` on `Profile` |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Use `npx prisma db push` (no migration history in this project)
- Self-referencing `parentId` pattern mirrors existing `Category` model exactly
- `organizationId` is required FK but single-org context means we always use the default org
- `slug` must be unique within an organization; use `@@unique([organizationId, slug])`
- `orderIndex` for sibling ordering (same pattern as `Section`, `Lesson`)
- `Profile.departmentId` is optional -- users may not belong to any department

---

## Context Links

- `backend/prisma/schema.prisma` -- existing schema with `Category` self-relation pattern
- `plans/20260304-1200-organization-module/phase-01-database-schema.md` -- Organization model (dependency)

---

## Requirements

- Department model with: name, description, slug, parentId, organizationId, status, orderIndex
- Tree hierarchy via self-referencing parentId
- Optional departmentId FK on Profile
- Indexes on organizationId, parentId, slug

---

## Architecture

### `backend/prisma/schema.prisma` -- new Department model

```prisma
model Department {
  id              String    @id @default(uuid()) @db.Uuid
  organizationId  String    @map("organization_id") @db.Uuid
  parentId        String?   @map("parent_id") @db.Uuid
  name            String
  slug            String
  description     String?   @db.Text
  status          String    @default("active") // active, inactive
  orderIndex      Int       @default(0) @map("order_index")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id])
  parent          Department?  @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children        Department[] @relation("DepartmentHierarchy")
  profiles        Profile[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([parentId])
  @@schema("public")
  @@map("departments")
}
```

### Modify `Organization` model -- add relation

```prisma
// Add to Organization model:
departments   Department[]
```

### Modify `Profile` model -- add departmentId

```prisma
// Add fields to Profile:
departmentId  String?    @map("department_id") @db.Uuid
department    Department? @relation(fields: [departmentId], references: [id], onDelete: SetNull)
```

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add `Department` model, update `Organization` + `Profile` |

---

## Implementation Steps

1. **Prerequisite**: Organization model must exist (Phase 01 of organization-module plan)
2. Add `Department` model to `schema.prisma`
3. Add `departments` relation to `Organization` model
4. Add `departmentId` + `department` relation to `Profile` model
5. Run `npx prisma db push`
6. Run `npx prisma generate`
7. Verify `prisma.department.*` methods available

---

## Todo List

- [ ] Ensure Organization model exists in schema
- [ ] Add `Department` model to schema.prisma
- [ ] Add `departments` relation to Organization
- [ ] Add `departmentId` to Profile
- [ ] `npx prisma db push`
- [ ] `npx prisma generate`
- [ ] Verify Prisma client types

---

## Success Criteria

- `departments` table exists with all columns
- Self-referencing FK `parent_id` works
- `profiles.department_id` nullable FK exists
- Prisma client generates without errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Organization model not yet created | Medium | High | Must implement org module Phase 01 first |
| `db push` conflict with existing data | Low | Low | Additive-only; nullable fields |

---

## Security Considerations

- Department data is organizational metadata, not sensitive
- `departmentId` on Profile is internal; not exposed in public APIs

---

## Next Steps

Phase 02: Backend API
