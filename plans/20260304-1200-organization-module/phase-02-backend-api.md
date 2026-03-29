# Phase 02 — Backend API

**Ref:** [plan.md](./plan.md)
**Depends on:** [phase-01-database-schema.md](./phase-01-database-schema.md)
**Blocks:** [phase-03-admin-ui.md](./phase-03-admin-ui.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | NestJS `organization` module with GET (public) + PUT (admin) endpoints |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Two endpoints only: `GET /organization` (public) + `PUT /organization` (admin)
- Single-record pattern: always query by `slug = 'default'` or `findFirst()`
- Logo/favicon upload NOT handled here — admin pastes a URL (same pattern as `thumbnailUrl` on courses); media upload is a separate concern
- DTO uses `class-validator` partial decorators — all fields optional on update
- Follow existing module pattern: controller + service + DTO in `src/modules/organization/`
- Register in `AppModule`

---

## Architecture

### File structure

```
backend/src/modules/organization/
├── organization.module.ts
├── organization.controller.ts
├── organization.service.ts
└── dto/
    └── update-organization.dto.ts
```

### DTO: `dto/update-organization.dto.ts`

```typescript
import { IsString, IsOptional, IsInt, IsUrl, Min, Max } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() shortName?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() logoUrl?: string;
  @IsString() @IsOptional() faviconUrl?: string;
  @IsString() @IsOptional() taxCode?: string;
  @IsInt() @Min(1900) @Max(2100) @IsOptional() foundedYear?: number;
  @IsString() @IsOptional() facebookUrl?: string;
  @IsString() @IsOptional() linkedinUrl?: string;
}
```

### Service: `organization.service.ts`

```typescript
@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async get() {
    return this.prisma.organization.findFirst();
  }

  async update(dto: UpdateOrganizationDto) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new NotFoundException('Organization not found');
    return this.prisma.organization.update({
      where: { id: org.id },
      data: dto,
    });
  }
}
```

### Controller: `organization.controller.ts`

```typescript
@Controller('organization')
export class OrganizationController {
  constructor(private orgService: OrganizationService) {}

  @Get()                          // PUBLIC — no guard
  get() {
    return this.orgService.get();
  }

  @Put()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Body() dto: UpdateOrganizationDto) {
    return this.orgService.update(dto);
  }
}
```

### Module: `organization.module.ts`

```typescript
@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, PrismaService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
```

Register in `app.module.ts` imports array.

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/src/modules/organization/organization.module.ts` | NEW |
| `backend/src/modules/organization/organization.controller.ts` | NEW |
| `backend/src/modules/organization/organization.service.ts` | NEW |
| `backend/src/modules/organization/dto/update-organization.dto.ts` | NEW |
| `backend/src/app.module.ts` | Import `OrganizationModule` |

---

## Implementation Steps

1. Create `src/modules/organization/` directory + 4 files
2. Import `OrganizationModule` in `app.module.ts`
3. `npm run build` — verify no errors

---

## Todo List

- [ ] Create `update-organization.dto.ts`
- [ ] Create `organization.service.ts`
- [ ] Create `organization.controller.ts`
- [ ] Create `organization.module.ts`
- [ ] Import in `app.module.ts`
- [ ] `npm run build` passes

---

## Success Criteria

- `GET /organization` returns the org record (200, no auth needed)
- `PUT /organization` with admin JWT updates and returns updated record
- `PUT /organization` without auth returns 401
- `PUT /organization` with non-admin role returns 403
- Build passes with no TS errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `findFirst()` returns null if seed didn't run | Low | Low | Return `{}` or 404 gracefully; frontend handles null |
| `RolesGuard` requires `SupabaseAuthGuard` first | None | None | Both guards already used this way in existing admin endpoints |

---

## Security Considerations

- GET is public (org name, address, phone, email are public info)
- PUT restricted to admin role via `RolesGuard` + `@Roles(Role.ADMIN)`
- No file upload handling here — URL-only for logo/favicon

---

## Next Steps

→ Phase 03: Admin UI
