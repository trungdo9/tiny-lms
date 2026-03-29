# Phase 02 -- Backend API

**Ref:** [plan.md](./plan.md)
**Blocked by:** [phase-01-database-schema.md](./phase-01-database-schema.md)
**Blocks:** [phase-03-frontend-ui.md](./phase-03-frontend-ui.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | NestJS departments module with CRUD + tree structure |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Follow exact module pattern from `courses.module.ts` (PrismaService + SupabaseService injection)
- Use `SupabaseAuthGuard` for auth (matches existing controllers)
- Admin-only write operations; GET endpoints public or auth-required
- Tree building: fetch all departments flat, build tree in-memory in service
- Use Prisma directly (not Supabase client) for all operations -- simpler for tree queries
- Slug auto-generated from name using same `generateSlug()` pattern

---

## Context Links

- `backend/src/modules/courses/courses.module.ts` -- module pattern
- `backend/src/modules/courses/courses.controller.ts` -- controller pattern
- `backend/src/modules/courses/courses.service.ts` -- service pattern
- `backend/src/common/guards/supabase-auth.guard.ts` -- auth guard

---

## Requirements

- `GET /departments` -- list all, return as tree structure
- `GET /departments/:id` -- single department with children
- `POST /departments` -- create (admin only)
- `PUT /departments/:id` -- update (admin only)
- `DELETE /departments/:id` -- delete (admin only, fail if has children)

---

## Architecture

### File Structure

```
backend/src/modules/departments/
  departments.module.ts
  departments.controller.ts
  departments.service.ts
  dto/
    department.dto.ts
```

### `departments.module.ts`

```typescript
@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsService, PrismaService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
```

### `departments.controller.ts`

```typescript
@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  async findAll(@Query('flat') flat?: string) {
    // flat=true returns flat list; default returns tree
    return this.departmentsService.findAll(flat === 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  async create(@Body() dto: CreateDepartmentDto, @Request() req: any) {
    // Admin check in service or via RolesGuard
    return this.departmentsService.create(dto);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async delete(@Param('id') id: string) {
    return this.departmentsService.delete(id);
  }
}
```

### `departments.service.ts` -- key methods

```typescript
@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(flat = false) {
    const departments = await this.prisma.department.findMany({
      where: { status: 'active' },
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    });
    return flat ? departments : this.buildTree(departments);
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { children: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException('No organization found');

    const slug = this.generateSlug(dto.name);
    return this.prisma.department.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId,
        organizationId: org.id,
        status: dto.status || 'active',
        orderIndex: dto.orderIndex ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    // Prevent circular parent reference
    if (dto.parentId === id) {
      throw new BadRequestException('Department cannot be its own parent');
    }
    const data: any = { ...dto };
    if (dto.name) data.slug = this.generateSlug(dto.name);
    return this.prisma.department.update({ where: { id }, data });
  }

  async delete(id: string) {
    const children = await this.prisma.department.count({ where: { parentId: id } });
    if (children > 0) {
      throw new BadRequestException('Cannot delete department with sub-departments');
    }
    // Unlink profiles before deleting
    await this.prisma.profile.updateMany({
      where: { departmentId: id },
      data: { departmentId: null },
    });
    return this.prisma.department.delete({ where: { id } });
  }

  private buildTree(departments: Department[]): DepartmentTreeNode[] {
    const map = new Map<string, DepartmentTreeNode>();
    const roots: DepartmentTreeNode[] = [];
    departments.forEach(d => map.set(d.id, { ...d, children: [] }));
    departments.forEach(d => {
      const node = map.get(d.id)!;
      if (d.parentId && map.has(d.parentId)) {
        map.get(d.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
}
```

### `dto/department.dto.ts`

```typescript
export class CreateDepartmentDto {
  @IsString() @MinLength(1) @MaxLength(200)
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString() @IsOptional() @IsUUID()
  parentId?: string;

  @IsString() @IsOptional()
  status?: string;

  @IsNumber() @IsOptional()
  orderIndex?: number;
}

export class UpdateDepartmentDto {
  @IsString() @IsOptional() @MinLength(1) @MaxLength(200)
  name?: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString() @IsOptional() @IsUUID()
  parentId?: string;

  @IsString() @IsOptional()
  status?: string;

  @IsNumber() @IsOptional()
  orderIndex?: number;
}
```

### Register module in `app.module.ts`

```typescript
import { DepartmentsModule } from './modules/departments/departments.module';
// Add to imports array
```

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/src/modules/departments/departments.module.ts` | New |
| `backend/src/modules/departments/departments.controller.ts` | New |
| `backend/src/modules/departments/departments.service.ts` | New |
| `backend/src/modules/departments/dto/department.dto.ts` | New |
| `backend/src/app.module.ts` | Register DepartmentsModule |

---

## Implementation Steps

1. Create `backend/src/modules/departments/` directory
2. Create `dto/department.dto.ts` with CreateDepartmentDto + UpdateDepartmentDto
3. Create `departments.service.ts` with CRUD + tree building
4. Create `departments.controller.ts` with REST endpoints
5. Create `departments.module.ts`
6. Register in `app.module.ts`
7. Test endpoints with curl/Postman

---

## Todo List

- [ ] Create departments directory structure
- [ ] Implement DTOs with class-validator
- [ ] Implement DepartmentsService (CRUD + buildTree + generateSlug)
- [ ] Implement DepartmentsController (5 endpoints)
- [ ] Create DepartmentsModule
- [ ] Register in app.module.ts
- [ ] Test: create root dept, create child dept, list as tree, update, delete

---

## Success Criteria

- All 5 endpoints respond correctly
- Tree structure returned from `GET /departments`
- Circular parent reference prevented
- Delete blocked when children exist
- Admin-only enforcement on CUD operations

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Circular parent references | Medium | Medium | Validate parentId != id; deep cycle check optional (YAGNI for now) |
| Large trees performance | Low | Low | In-memory tree build is O(n); fine for <1000 departments |
| Organization not seeded | Medium | High | Phase 01 dependency; service throws clear error |

---

## Security Considerations

- CUD operations require `SupabaseAuthGuard` + admin role check
- GET can be public or auth-required (admin settings page requires auth anyway)
- No user PII in department data

---

## Next Steps

Phase 03: Frontend UI
