# Plan: Department Module

**Date:** 2026-03-04
**Directory:** `plans/20260304-1300-department-module/`

---

## Summary

Add a `Department` model with tree structure (self-referencing `parentId`) linked to `Organization`. Backend CRUD with tree-building logic. Admin UI at `/admin/settings/departments` with hierarchical tree view, inline add/edit/delete. Optionally link users to departments via `departmentId` on `Profile`.

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Database Schema | ✅ Done | [phase-01-database-schema.md](./phase-01-database-schema.md) |
| 2 | Backend API | ✅ Done | [phase-02-backend-api.md](./phase-02-backend-api.md) |
| 3 | Frontend UI | ✅ Done | [phase-03-frontend-ui.md](./phase-03-frontend-ui.md) |

---

## Key Decisions

- **Self-referencing tree** via `parentId` FK (same pattern as `Category` model)
- **`organizationId` FK** stored but not filtered on (single-org context); ready for multi-tenant later
- **Slug** auto-generated from name (same `generateSlug()` pattern as courses)
- **`order` field** (`orderIndex`) for sibling sorting within same parent
- **Status**: `active` / `inactive` string field (matches codebase's string-based enum pattern)
- **Soft hierarchy**: no depth limit enforced; tree built in-memory from flat list
- **Profile.departmentId**: optional FK added to `profiles` table

---

## Docs

- [codebase-summary.md](../../docs/codebase-summary.md)
- [code-standards.md](../../docs/code-standards.md)
- [system-architecture.md](../../docs/system-architecture.md)
- [organization-module plan](../20260304-1200-organization-module/plan.md)
