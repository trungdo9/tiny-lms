# Phase 01 — Backend: Complete Category CRUD API

**Date:** 2026-03-15
**Status:** Pending
**Priority:** High (blocks phases 2 & 3)

---

## Context Links

- Schema: `backend/prisma/schema.prisma` (model `Category` lines 50–63, `Course.categoryId` line 68)
- Service: `backend/src/modules/courses/courses.service.ts` (existing `getCategories`, `createCategory`)
- Controller: `backend/src/modules/courses/courses.controller.ts` (existing `GET /courses/categories`, `POST /courses/categories`)
- DTO: `backend/src/modules/courses/dto/course.dto.ts`
- Module: `backend/src/modules/courses/courses.module.ts`

---

## Overview

The `Category` Prisma model already exists with fields: `id`, `name`, `slug`, `parentId`, `createdAt`, plus relations `parent`, `children`, `courses`. The service has skeleton `getCategories()` and `createCategory()`. Missing: update, delete, get-by-id, proper admin auth guard on write routes, and returning hierarchy (parent/children).

---

## Key Insights

- `POST /courses/categories` has **no auth guard** — anyone can create categories. Must fix.
- `getCategories()` returns flat list without `_count: { select: { courses: true } }` — add course count for admin UI.
- Slug generation already exists via `generateSlug()` in `CoursesService`. Reuse it.
- `Category` has `parentId` (self-referential) — expose but keep flat list as default; hierarchy is optional.
- No `updatedAt` on `Category` model — do not add (avoid unnecessary migration).
- `SupabaseAuthGuard` + `RolesGuard` pattern used in `UsersController` for admin-only routes.

---

## Requirements

**Functional:**
- `GET /courses/categories` — public, returns all categories with course count
- `GET /courses/categories/:id` — public, returns single category
- `POST /courses/categories` — admin only, create with name + optional slug + optional parentId
- `PUT /courses/categories/:id` — admin only, update name/slug/parentId
- `DELETE /courses/categories/:id` — admin only, refuse if category has courses assigned

**Non-Functional:**
- Slug must be unique; return 409 on conflict
- Deleting a parent category with children: reject or re-parent (reject is simpler — KISS)

---

## Architecture

```
CoursesController
  GET  /courses/categories          → CoursesService.getCategories()
  GET  /courses/categories/:id      → CoursesService.getCategoryById(id)
  POST /courses/categories          → CoursesService.createCategory(dto)   [admin]
  PUT  /courses/categories/:id      → CoursesService.updateCategory(id,dto) [admin]
  DELETE /courses/categories/:id    → CoursesService.deleteCategory(id)    [admin]
```

All write routes: `@UseGuards(SupabaseAuthGuard)` + `@Roles('admin')` + `@UseGuards(RolesGuard)`.

---

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `backend/src/modules/courses/dto/course.dto.ts` | Modify | Add `CreateCategoryDto`, `UpdateCategoryDto` |
| `backend/src/modules/courses/courses.service.ts` | Modify | Add `getCategoryById`, `updateCategory`, `deleteCategory`; enhance `getCategories` |
| `backend/src/modules/courses/courses.controller.ts` | Modify | Add new routes; add guards to write routes |
| `backend/src/modules/courses/courses.module.ts` | Modify | Add `RolesGuard` to providers |

---

## Implementation Steps

### Step 1 — Add DTOs (`dto/course.dto.ts`)

Add after existing DTOs:

```typescript
export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
```

### Step 2 — Enhance `getCategories()` in service

Replace current implementation:

```typescript
async getCategories() {
  return this.prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { courses: true } },
      parent: { select: { id: true, name: true, slug: true } },
    },
  });
}
```

### Step 3 — Add `getCategoryById()` to service

```typescript
async getCategoryById(id: string) {
  const cat = await this.prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { courses: true } },
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!cat) throw new NotFoundException('Category not found');
  return cat;
}
```

### Step 4 — Add `updateCategory()` to service

```typescript
async updateCategory(id: string, dto: UpdateCategoryDto) {
  await this.getCategoryById(id); // throws 404 if not found
  const data: Prisma.CategoryUpdateInput = {};
  if (dto.name) {
    data.name = dto.name;
    if (!dto.slug) data.slug = this.generateSlug(dto.name);
  }
  if (dto.slug) data.slug = dto.slug;
  if (dto.parentId !== undefined) {
    data.parent = dto.parentId ? { connect: { id: dto.parentId } } : { disconnect: true };
  }
  try {
    return await this.prisma.category.update({ where: { id }, data });
  } catch (e: any) {
    if (e.code === 'P2002') throw new ConflictException('Slug already exists');
    throw e;
  }
}
```

### Step 5 — Add `deleteCategory()` to service

```typescript
async deleteCategory(id: string) {
  const cat = await this.prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { courses: true, children: true } } },
  });
  if (!cat) throw new NotFoundException('Category not found');
  if (cat._count.courses > 0)
    throw new BadRequestException(`Cannot delete: ${cat._count.courses} course(s) still assigned`);
  if (cat._count.children > 0)
    throw new BadRequestException(`Cannot delete: has ${cat._count.children} sub-category(ies)`);
  await this.prisma.category.delete({ where: { id } });
  return { success: true };
}
```

### Step 6 — Fix `createCategory()` — handle slug conflict

Wrap existing `prisma.category.create` in try/catch and throw `ConflictException` on P2002.

### Step 7 — Update `CoursesController` — add routes and guards

```typescript
// Add imports
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// New routes
@Get('categories/:id')
async getCategoryById(@Param('id') id: string) {
  return this.coursesService.getCategoryById(id);
}

// Fix existing POST /categories (add guards)
@Post('categories')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
async createCategory(@Body() dto: CreateCategoryDto) {
  return this.coursesService.createCategory(dto.name, dto.slug, dto.parentId);
}

@Put('categories/:id')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
  return this.coursesService.updateCategory(id, dto);
}

@Delete('categories/:id')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
async deleteCategory(@Param('id') id: string) {
  return this.coursesService.deleteCategory(id);
}
```

**Note:** Route `GET categories/:id` must come AFTER `GET categories` but BEFORE `GET :id` in controller to avoid conflicts with course ID routes. NestJS resolves by declaration order.

### Step 8 — Update `CoursesModule` — add RolesGuard

Add `RolesGuard` to `providers` array in `courses.module.ts`.

### Step 9 — Update `createCategory()` service signature

Extend to accept optional `parentId`:
```typescript
async createCategory(name: string, slug?: string, parentId?: string)
```
Add `parentId` to the `prisma.category.create` data.

---

## Todo List

- [ ] Add `CreateCategoryDto` and `UpdateCategoryDto` to `dto/course.dto.ts`
- [ ] Enhance `getCategories()` to include `_count.courses` and `parent`
- [ ] Add `getCategoryById()` to service
- [ ] Add `updateCategory()` to service
- [ ] Add `deleteCategory()` to service (with guard: reject if has courses or children)
- [ ] Fix `createCategory()` to handle slug conflict (P2002) and accept `parentId`
- [ ] Fix `POST /courses/categories` — add `SupabaseAuthGuard` + `RolesGuard` + `@Roles('admin')`
- [ ] Add `GET /courses/categories/:id` route
- [ ] Add `PUT /courses/categories/:id` route (admin)
- [ ] Add `DELETE /courses/categories/:id` route (admin)
- [ ] Add `RolesGuard` to `CoursesModule` providers
- [ ] Update `frontend/lib/api.ts` — add full `categoriesApi` object with all CRUD methods

---

## Success Criteria

- `GET /courses/categories` returns category list with `_count.courses`
- `POST /courses/categories` returns 401 for unauthenticated, 403 for non-admin
- `PUT /courses/categories/:id` updates name/slug/parentId correctly
- `DELETE /courses/categories/:id` returns 400 if courses assigned, 200 on success
- Slug uniqueness enforced (409 on duplicate)

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Route ordering conflict (`categories/:id` vs `:id` course route) | Medium | Place category routes before `@Get(':id')` in controller |
| Slug collision on rename | Low | Catch P2002, return ConflictException |
| Missing `RolesGuard` import in module | Low | Check `UsersModule` pattern for exact import path |

---

## Security Considerations

- All write operations require `admin` role — enforced via `RolesGuard` + `@Roles('admin')`
- `SupabaseAuthGuard` validates JWT before `RolesGuard` runs
- Slug is server-generated or sanitized via `generateSlug()` — no injection risk
- `parentId` is validated as UUID by DTO; Prisma enforces FK constraint

---

## Next Steps

- After this phase: Phase 2 (admin UI) and Phase 3 (public filter) can proceed in parallel
- Frontend `api.ts` needs a new `categoriesApi` object (document in phase 2/3)
